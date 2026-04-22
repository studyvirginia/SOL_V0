import fs from "fs";
import path from "path";
import { streamText, streamObject } from "ai";
import { flashcardDeckSchema, quizDeckSchema } from "../../lib/schemaObjects";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  loadCourseRow,
  buildCurriculumModeContext,
} from "../../lib/curriculumService";
import {
  buildLangChainSystemPrompt,
  buildMediumTermSummary,
} from "../../lib/sessionMemoryService";
import { readSession, writeSession } from "../../lib/sessionStore";
import { solveMCQ, validateMCQ } from "../../lib/criticAgentService";
import { getEmbedding } from "../../lib/embeddingsService";
import { supabase } from "../../lib/supabaseClient";

/**
 * Validates the Supabase JWT from the Authorization header.
 * Returns the user object if valid.
 */
async function getAuthenticatedUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

function loadOpenRouterKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
  const candidatePaths = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "frontend", ".env.local"),
  ];
  try {
    for (const envPath of candidatePaths) {
      if (fs.existsSync(envPath)) {
        const contents = fs.readFileSync(envPath, "utf8");
        for (const line of contents.split(/\r?\n/)) {
          const [k, ...rest] = line.trim().split("=");
          if (k?.trim() === "OPENROUTER_API_KEY") {
            return rest.join("=").trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  } catch (err) {}
  return undefined;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const {
      messages = [], subject, course, sessionId, sessionSummary = "",
      userFacts = {}, retrievalMode, visualState = {}, format = "text"
    } = req.body || {};
    
    const apiKey = loadOpenRouterKey();
    if (!apiKey) return res.status(500).json({ error: "Missing API Key" });

    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : "";
    if (!subject || !course || messages.length === 0) {
      return res.status(400).json({ error: "Missing required chat fields" });
    }

    const authenticatedUser = await getAuthenticatedUser(req);
    // Phase 21 Bypass: Support Mock Student for Dev Audits/Fast Access
    const isMockBypass = req.headers['x-sol-mock-user'] === 'true' || authenticatedUser?.email === 'test@example.com';
    
    if (!authenticatedUser && !isMockBypass) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const targetUserId = authenticatedUser?.id || "00000000-0000-0000-0000-000000000000";

    let storedSession = null;
    if (sessionId) {
      if (isMockBypass && sessionId.length < 15) {
         // Mock sessions are short random strings, assume valid for dev
         storedSession = { id: sessionId, user_id: targetUserId, subject, course };
      } else {
        try { 
          const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', targetUserId)
            .single();
          
          if (error || !data) throw new Error("Session not found or forbidden");
          storedSession = data;
        } catch (err) {
          return res.status(403).json({ error: "Forbidden: You do not own this session." });
        }
      }
    }

    const normalizedMessages = messages.map(msg => ({
      role: String(msg.role || "user").toLowerCase() === "assistant" ? "assistant" : "user",
      content: String(msg.content || "").trim()
    })).filter(m => m.content);

    const effectiveRetrievalMode = retrievalMode || "notes";
    const courseData = await loadCourseRow(subject, course);
    const curriculumContext = buildCurriculumModeContext(courseData, effectiveRetrievalMode, lastMessage, { scores: userFacts.scores || {} });

    // Phase 15: Deep Curriculum RAG (Semantic Search)
    let semanticMemories = [];
    try {
      const queryEmbedding = await getEmbedding(lastMessage, apiKey);
      if (queryEmbedding) {
        const { data: matches, error: memoryError } = await supabase.rpc('match_memories', {
          query_embedding: queryEmbedding,
          match_threshold: 0.65, // Higher precision for academic grounding
          match_count: 5,
          p_user_id: targetUserId
        });
        
        if (!memoryError && matches && matches.length > 0) {
          // Phase 17: Fetch real-time student mastery for these standards to "Dial" rigor
          const standardCodes = matches.map(m => m.metadata?.code).filter(Boolean);
          const { data: masteryRecords } = await supabase
            .from('curriculum_mastery')
            .select('standard_code, mastery_score')
            .eq('user_id', targetUserId)
            .in('standard_code', standardCodes);
          
          const masteryMap = (masteryRecords || []).reduce((acc, mc) => ({ ...acc, [mc.standard_code]: mc.mastery_score }), {});

          // Flatten matches with their standard codes and current mastery data
          semanticMemories = matches.map(m => {
            const mastery = masteryMap[m.metadata?.code];
            const masteryLabel = mastery !== undefined ? ` (Student Mastery: ${mastery}%)` : " (Untested)";
            return `[${m.metadata?.code || 'PRACTICE'}] ${m.content}${masteryLabel}`;
          });
        } else {
          // Phase 15 Fallback: Trigger Open Verse routing if no standard is found
          console.log("[RAG] No direct standard match. Routing to Open Verse...");
          semanticMemories = ["%%OPEN_VERSE_ROUTING%%: No specific SOL standard was found for this query. Use general pedagogical knowledge from Open Verse Elite sources to assist the student while maintaining high rigor."];
        }
      }
    } catch (err) {
      console.error("[RAG Engine Error]", err);
    }

    const systemPrompt = buildLangChainSystemPrompt({
      messages: normalizedMessages,
      sessionSummary: sessionSummary || "",
      userFacts,
      curriculumContext,
      visualState,
      semanticMemories, 
    });

    // Validated stability model ID from git history
    const modelId = process.env.CHAT_MODEL || "google/gemini-2.0-flash-lite-001";
    const openrouter = createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey });
    const modelInstance = openrouter(modelId);

    // 3. GENERATION
    if (format === "quiz" || format === "flashcards") {
      const schema = format === "quiz" ? quizDeckSchema : flashcardDeckSchema;
      const result = await streamObject({
        model: modelInstance,
        schema,
        system: systemPrompt + "\n\nCRITICAL: You are generating structured academic data. Follow the schema exactly. Provide curriculum evidence before answers to prevent hallucinations. ADAPTIVE: Dial rigor based on the Student Mastery scores provided in context.",
        messages: normalizedMessages,
      });
      return result.toTextStreamResponse();
    }

    const result = await streamText({
      model: modelInstance,
      system: systemPrompt,
      messages: normalizedMessages,
      maxTokens: 4000,
      temperature: 0.15,
      onFinish: async ({ text }) => {
        if (sessionId) {
          const updatedMessages = [...normalizedMessages, { role: "assistant", content: text }];
          const updatedSummary = buildMediumTermSummary(updatedMessages, effectiveRetrievalMode, userFacts);
          try {
             await writeSession(sessionId, {
                id: sessionId, subject, course, retrievalMode: effectiveRetrievalMode,
                userFacts, sessionSummary: updatedSummary, messages: updatedMessages,
             });
             // Save summary to cognitive memory if it contains meaningful data
             if (updatedSummary && updatedSummary.length > 50 && targetUserId) {
                 try {
                   const summaryEmbedding = await getEmbedding(updatedSummary, apiKey);
                   if (summaryEmbedding) {
                     await supabase.from('cognitive_memory').insert({
                       user_id: targetUserId, session_id: sessionId, content: updatedSummary, embedding: summaryEmbedding
                     });
                   }
                 } catch (memErr) {}
             }
          } catch (err) {}
        }
      }
    });

    // 2. STABLE MANUAL STREAMING LAYER
    // Using manual loop to bypass Node.js/Edge Response object conflicts in v6 AI SDK
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let mcqBuffer = "";
    let isBufferingMCQ = false;

    try {
      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          const text = part.text;
          
          if (text.includes("%%MCQ%%")) isBufferingMCQ = true;

          if (isBufferingMCQ) {
            mcqBuffer += text;
            if (mcqBuffer.includes("%%END_MCQ%%")) {
              isBufferingMCQ = false;
              let finalMCQText = mcqBuffer;
              mcqBuffer = "";
              try {
                const match = finalMCQText.match(/%%MCQ%%(\{.*\})%%END_MCQ%%/s);
                if (match) {
                  const rawMCQ = JSON.parse(match[1]);
                  const criticSolution = await solveMCQ(rawMCQ.question, rawMCQ.options, apiKey);
                  const validation = validateMCQ(rawMCQ, criticSolution);
                  if (!validation.valid) {
                    rawMCQ.answer = validation.criticAnswer;
                    rawMCQ.explanation = `(Critic Verified) ${rawMCQ.explanation}\n\nNote: SOL Peer-reviewer corrected the answer key.`;
                  }
                  rawMCQ.metadata = { ...rawMCQ.metadata, criticVerified: true };
                  finalMCQText = `%%MCQ%%${JSON.stringify(rawMCQ)}%%END_MCQ%%`;
                }
              } catch (criticErr) {}
              res.write(finalMCQText);
            }
          } else {
            res.write(text);
          }
        }
      }
      res.end();
    } catch (streamLoopErr) {
      console.error("Stream loop critical failure:", streamLoopErr);
      if (!res.headersSent) res.status(500).end();
      else res.end();
    }

  } catch (err) {
    console.error("CHAT API HANDLER CRASH:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Streaming initialization failed", details: err.message });
    }
  }
}
