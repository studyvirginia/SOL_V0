/**
 * /api/tool-test
 *
 * Calls OpenRouter directly (no AI SDK provider) so tool schemas
 * are never mangled by @ai-sdk/openai-compatible's broken serializer.
 * Supports: showFlashcards | showMCQ | showQuiz | showActions
 */

const TOOLS = [
  {
    type: "function",
    function: {
      name: "showFlashcards",
      description:
        "Render an interactive flashcard deck for vocabulary or concept memorization.",
      parameters: {
        type: "object",
        properties: {
          cards: {
            type: "array",
            description: "Array of flashcard objects (min 3, max 20)",
            minItems: 3,
            maxItems: 20,
            items: {
              type: "object",
              properties: {
                front: { type: "string", description: "Term or question on the front" },
                back:  { type: "string", description: "Definition or answer on the back" },
              },
              required: ["front", "back"],
            },
          },
        },
        required: ["cards"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showMCQ",
      description:
        "Render a single multiple-choice practice question with answer feedback.",
      parameters: {
        type: "object",
        properties: {
          question:    { type: "string", description: "The question text" },
          options:     { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5, description: "Answer choices" },
          answer:      { type: "integer", minimum: 0, description: "0-indexed position of the correct answer" },
          explanation: { type: "string", description: "Explanation shown after the student answers" },
          mode:        { type: "string", enum: ["diagnostic", "practice"], description: "Feedback mode" },
        },
        required: ["question", "options", "answer", "explanation"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showQuiz",
      description:
        "Render a multi-question quiz for assessment.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Quiz title" },
          mode:  { type: "string", enum: ["diagnostic", "practice"], description: "Feedback mode" },
          questions: {
            type: "array",
            minItems: 3,
            maxItems: 15,
            items: {
              type: "object",
              properties: {
                question:    { type: "string" },
                options:     { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
                answer:      { type: "integer", minimum: 0 },
                explanation: { type: "string" },
              },
              required: ["question", "options", "answer", "explanation"],
            },
          },
        },
        required: ["title", "questions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showActions",
      description:
        "Render a row of recommended next-step navigation buttons for the student. Call this at the end of every response to suggest what to do next.",
      parameters: {
        type: "object",
        properties: {
          actions: {
            type: "array",
            description: "2–4 recommended next steps",
            minItems: 1,
            maxItems: 4,
            items: {
              type: "object",
              properties: {
                label:      { type: "string", description: "Short button label (3–5 words max)" },
                prompt:     { type: "string", description: "The message to send when the student clicks this button" },
                targetMode: { type: "string", description: "Optional: the learning mode to switch to (e.g. 'flashcards', 'quiz', 'practice', 'notes')" },
                reason:     { type: "string", description: "One sentence explaining why this is recommended" },
              },
              required: ["label", "prompt"],
            },
          },
        },
        required: ["actions"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are a helpful study assistant.
Use the available tools to deliver interactive learning components:
- showFlashcards: when the user asks for flashcards, vocab, or term definitions
- showMCQ: when the user asks for a single practice question or quick check
- showQuiz: when the user asks for a quiz, test, or multiple questions
- showActions: always call this at the end of your response with 2-3 recommended next steps

Always call a tool when the user's request matches one of these. Do not write plain text components.`;

function sse(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing OPENROUTER_API_KEY" });

  const { messages = [] } = req.body || {};
  const modelId = process.env.CHAT_MODEL || "google/gemini-2.0-flash-lite-001";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  sse(res, { type: "start" });
  sse(res, { type: "start-step" });

  try {
    const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        stream: false,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!orRes.ok) {
      const body = await orRes.text();
      sse(res, { type: "error", message: `OpenRouter ${orRes.status}: ${body}` });
      sse(res, { type: "finish", finishReason: "error" });
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    const data = await orRes.json();
    const choice = data.choices?.[0];
    const finishReason = choice?.finish_reason || "unknown";
    const message = choice?.message;

    if (message?.content && !message?.tool_calls?.length) {
      sse(res, { type: "text-delta", textDelta: message.content });
    }

    if (message?.tool_calls?.length) {
      for (const tc of message.tool_calls) {
        const toolCallId = tc.id;
        const toolName = tc.function.name;
        const argsStr = tc.function.arguments;

        sse(res, { type: "tool-input-start", toolCallId, toolName });
        sse(res, { type: "tool-input-delta", toolCallId, inputTextDelta: argsStr });

        let parsedInput = {};
        try { parsedInput = JSON.parse(argsStr); } catch {}
        sse(res, { type: "tool-input-available", toolCallId, toolName, input: parsedInput });
      }
    }

    sse(res, { type: "finish-step" });
    sse(res, { type: "finish", finishReason });
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    sse(res, { type: "error", message: String(err) });
    sse(res, { type: "finish", finishReason: "error" });
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
