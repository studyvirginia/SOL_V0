import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { RoughNotation } from "react-rough-notation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { buildMediumTermSummary, buildShortTermMemory } from "../lib/sessionMemoryService";
import ErrorBoundary from "./ErrorBoundary";
import FlashcardDeck from "./learning/FlashcardDeck";
import AdaptiveMCQ from "./learning/AdaptiveMCQ";
import QuizRunner from "./learning/QuizRunner";
import { MODE_MAP, getSubModeLabel } from "../lib/modeMap";
// Advanced formatting utilities for proper display capitalization
export const formatName = (str) => {
  if (!str) return "";

  const dictionary = {
    "va": "VA",
    "us": "US",
    "eoc": "EOC",
    "i": "I",
    "ii": "II",
    "iii": "III",
    "iv": "IV"
  };

  return str.split('_').map(word => {
    const lower = word.toLowerCase();
    if (dictionary[lower]) return dictionary[lower];
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const SendIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const GeoGebraRenderer = dynamic(() => import("./GeoGebraRenderer"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500 italic p-4">Loading graph...</div>,
});

const DesmosRenderer = dynamic(() => import("./DesmosRenderer"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500 italic p-4">Loading graph...</div>,
});

const OpenverseRenderer = dynamic(() => import("./OpenverseRenderer"), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500 italic p-4 opacity-50 font-bold uppercase tracking-widest text-[0.6rem]">Loading media...</div>,
});

// Complete token — both delimiters present
const GRAPH_TOKEN_RE = /%%GRAPH%%[\s\S]*?%%END_GRAPH%%/g;
const IMAGE_TOKEN_RE = /%%IMAGE%%[\s\S]*?%%END_IMAGE%%/g;

// Partial token — opening delimiter present but closing not yet arrived (strips during streaming)
const GRAPH_PARTIAL_RE = /%%GRAPH%%[\s\S]*$/;
const IMAGE_PARTIAL_RE = /%%IMAGE%%[\s\S]*$/;

/**
 * Split a message string into alternating text/graph segments so graphs
 * can be rendered inline at the exact position the token appeared.
 * Returns an array of { type: 'text'|'graph', content: string, graphIndex: number }
 */
function splitMessageSegments(content) {
  const segments = [];
  const ACTION_TOKEN_RE = /%%ACTIONS%%([\s\S]*?)%%END_ACTIONS%%/g;
  const GRAPH_RE = new RegExp(GRAPH_TOKEN_RE.source, 'g');
  const FLASHCARDS_RE = /%%FLASHCARDS%%([\s\S]*?)%%END_FLASHCARDS%%/g;
  const MCQ_RE = /%%MCQ%%([\s\S]*?)%%END_MCQ%%/g;
  const QUIZ_RE = /%%QUIZ%%([\s\S]*?)%%END_QUIZ%%/g;

  let lastIndex = 0;
  const matches = [
    ...content.matchAll(ACTION_TOKEN_RE),
    ...content.matchAll(GRAPH_RE),
    ...content.matchAll(FLASHCARDS_RE),
    ...content.matchAll(MCQ_RE),
    ...content.matchAll(QUIZ_RE),
    ...content.matchAll(IMAGE_TOKEN_RE)
  ].sort((a, b) => a.index - b.index);

  let graphCounter = 0;
  let imageCounter = 0;
  matches.forEach((m) => {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, m.index) });
    }
    if (m[0].startsWith('%%ACTIONS%%')) {
      segments.push({ type: 'actions', data: m[1] });
    } else if (m[0].startsWith('%%GRAPH%%')) {
      segments.push({ type: 'graph', data: m[1] || m[0], graphIndex: graphCounter++ });
    } else if (m[0].startsWith('%%FLASHCARDS%%')) {
      segments.push({ type: 'flashcards', data: m[1] });
    } else if (m[0].startsWith('%%MCQ%%')) {
      segments.push({ type: 'mcq', data: m[1] });
    } else if (m[0].startsWith('%%QUIZ%%')) {
      segments.push({ type: 'quiz', data: m[1] });
    } else if (m[0].startsWith('%%IMAGE%%')) {
      segments.push({ type: 'image', data: m[0], imageIndex: imageCounter++ });
    }
    lastIndex = m.index + m[0].length;
  });

  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', content });
  }

  return segments;
}

const QuickActions = ({ actions, onSwitch, onSend, currentSubMode }) => {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-[700px]">
      {actions.map((act, i) => {
        const isObject = typeof act === "object" && act !== null;
        if (isObject) {
          return (
            <button
              key={i}
              onClick={() => {
                if (act.targetMode) onSwitch(act.targetMode, false);
                onSend(act.prompt);
              }}
              className="group flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-700 hover:shadow-md dark:bg-indigo-700 dark:ring-indigo-600 dark:hover:bg-indigo-600"
            >
              {act.label}
            </button>
          );
        }

        const isPillar = MODE_MAP[act];
        const label = isPillar ? `Next: ${isPillar.label}` : getSubModeLabel(act);
        const subModeId = isPillar ? isPillar.subModes[0].id : act;
        const isRecommended = !isPillar;

        return (
          <button
            key={act}
            onClick={() => onSwitch(subModeId, true)}
            className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 ${
              isRecommended 
                ? "bg-blue-600 text-white ring-blue-500 hover:bg-blue-700 hover:shadow-md" 
                : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
            }`}
          >
            {label} {isRecommended && "★"}
          </button>
        );
      })}
    </div>
  );
};

const MarkdownMessage = ({ content, isUser }) => {
  // Strip TIKZ_GRAPH tokens — handled outside this component.
  // Also strip partial tokens (incomplete during streaming) so they never reach
  // the KaTeX / remarkMath pipeline and cause parse interference.
  const formattedContent = String(content || "")
    .replace(new RegExp(GRAPH_TOKEN_RE.source, 'g'), "")  // complete tokens
    .replace(GRAPH_PARTIAL_RE, "")                        // partial tokens (streaming)
    .replace(IMAGE_TOKEN_RE, "")
    .replace(IMAGE_PARTIAL_RE, "")
    .replace(/\[h\](.*?)\[\/h\]/g, "[$1](#highlight)")
    .replace(/\[c\](.*?)\[\/c\]/g, "[$1](#circle)")
    .replace(/\[u\](.*?)\[\/u\]/g, "[$1](#underline)")
    .replace(/\[b\](.*?)\[\/b\]/g, "[$1](#box)")
    .replace(/\[s\](.*?)\[\/s\]/g, "[$1](#strike)");

  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const text = String(children).replace(/\n$/, "");
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1]?.toLowerCase() || "";

      if (inline) {
        return (
          <code className={className} {...props}>
            {text}
          </code>
        );
      }

      return (
        <div className="rounded-md bg-black/10 dark:bg-white/10 px-1.5 py-1 font-mono text-[0.85em] overflow-x-auto" {...props}>
          <code className={className}>{text}</code>
        </div>
      );
    },
    pre({ children }) { return <>{children}</>; },
    table({ children, ...props }) {
      return (
        <div className="my-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-left text-sm" {...props}>{children}</table>
        </div>
      );
    },
    th({ children, ...props }) {
      return (
        <th className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 font-semibold border-b border-gray-200 dark:border-gray-700" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/50" {...props}>
          {children}
        </td>
      );
    },
    p({ children, ...props }) {
      return (
        <p className="mb-5 last:mb-0 leading-relaxed" {...props}>
          {children}
        </p>
      );
    },
    a({ children, href, ...props }) {
      if (href === "#highlight") {
        return <RoughNotation type="highlight" show={true} color="rgba(253, 224, 71, 0.4)" animationDuration={700} padding={3} {...props}>{children}</RoughNotation>;
      }
      if (href === "#circle") {
        return <RoughNotation type="circle" show={true} color="rgba(239, 68, 68, 0.7)" animationDuration={900} padding={5} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      if (href === "#underline") {
        return <RoughNotation type="underline" show={true} color="rgba(59, 130, 246, 0.8)" animationDuration={600} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      if (href === "#box") {
        return <RoughNotation type="box" show={true} color="rgba(16, 185, 129, 0.7)" animationDuration={800} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      if (href === "#strike") {
        return <RoughNotation type="strike-through" show={true} color="rgba(239, 68, 68, 0.6)" animationDuration={500} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      return (
        <a href={href} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 underline underline-offset-4 decoration-2 decoration-blue-500/30" {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className={`prose max-w-none break-words ${isUser ? "prose-sm text-gray-800 dark:text-gray-200" : "prose-base dark:prose-invert font-sans selection:bg-blue-100 selection:text-blue-900"} 
      prose-headings:font-display prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
      prose-h1:text-5xl prose-h1:mt-16 prose-h1:mb-10 prose-h1:leading-tight
      prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-8 prose-h2:border-b-2 prose-h2:border-slate-100 dark:prose-h2:border-slate-800 prose-h2:pb-3
      prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-5 prose-h3:font-bold
      prose-p:text-[1.1rem] prose-p:leading-relaxed prose-p:mb-8 prose-p:text-slate-700 dark:prose-p:text-slate-300
      prose-li:text-[1.1rem] prose-li:leading-relaxed prose-li:mb-3
      prose-strong:text-blue-700 dark:prose-strong:text-blue-400 prose-strong:font-black
      prose-code:text-pink-600 prose-code:bg-pink-50/80 dark:prose-code:bg-pink-900/40 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none
      prose-blockquote:border-l-8 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/40 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:py-6 prose-blockquote:px-10 prose-blockquote:rounded-r-[2.5rem] prose-blockquote:italic prose-blockquote:text-blue-950 dark:prose-blockquote:text-blue-100
      prose-img:rounded-[2.5rem] prose-img:shadow-2xl
      prose-hr:my-16 prose-hr:border-slate-100 dark:prose-hr:border-slate-800
    `}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, errorColor: "#cc0000" }]]}
        components={renderers}
        skipHtml
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}

function buildEmptyCompletionMap() {
  const completed = {};
  Object.values(MODE_MAP).forEach((mode) => {
    mode.subModes.forEach((sub) => {
      completed[sub.id] = false;
    });
  });
  return completed;
}

function normalizeJourney(session, fallbackSubMode) {
  const existing = session?.journey || {};
  const completed = { ...buildEmptyCompletionMap(), ...(existing.completed || {}) };
  return {
    completed,
    currentSubMode: fallbackSubMode || existing.currentSubMode || "notes",
    completedAt: existing.completedAt || {},
  };
}

function getModeCompletionStats(completedMap = {}) {
  return Object.entries(MODE_MAP).map(([modeKey, mode]) => {
    const total = mode.subModes.length;
    const done = mode.subModes.filter((sub) => Boolean(completedMap[sub.id])).length;
    return {
      modeKey,
      done,
      total,
      isDone: done === total,
    };
  });
}

function getRecommendedSubMode(currentSubMode, completedMap = {}) {
  const modeKeyPairs = Object.entries(MODE_MAP);
  const currentModeKey = modeKeyPairs.find(([, mode]) => mode.subModes.some(sub => sub.id === currentSubMode))?.[0] || "review";
  const modeOrder = Object.keys(MODE_MAP);
  const currentMode = MODE_MAP[currentModeKey];

  const inCurrentMode = currentMode.subModes.find((sub) => !completedMap[sub.id] && sub.id !== currentSubMode);
  if (inCurrentMode) return { subModeId: inCurrentMode.id, modeKey: currentModeKey };

  const currentIndex = modeOrder.indexOf(currentModeKey);
  for (let offset = 1; offset <= modeOrder.length; offset++) {
    const modeKey = modeOrder[(currentIndex + offset) % modeOrder.length];
    const mode = MODE_MAP[modeKey];
    const nextIncomplete = mode.subModes.find((sub) => !completedMap[sub.id]);
    if (nextIncomplete) return { subModeId: nextIncomplete.id, modeKey };
  }
  return null;
}

export default function ChatWindow({ session, onUpdateSession, graphEngine = "geogebra" }) {
  const bottomRef = useRef(null);

  const subject = session.subject || "";
  const course = session.course || "";
  const journey = normalizeJourney(session, session.retrievalMode || "notes");
  const currentMode = journey.currentSubMode || "notes";
  const completionStats = getModeCompletionStats(journey.completed);
  const recommended = getRecommendedSubMode(currentMode, journey.completed);

  const [messages, setMessages] = useState(session.messages || []);
  const [draftInput, setDraftInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // graphs: { [messageId]: [{ status: 'pending'|'done'|'error', ggbState?, desmosState? }] }
  // Seeded from session.graphs so graphs survive reload and session switches.
  const [graphs, setGraphs] = useState(session.graphs || {});
  const [images, setImages] = useState({});

  // Refs so the persistence effect below can read latest values without
  // being a dependency (which would cause an infinite loop).
  const sessionRef = useRef(session);
  const messagesRef = useRef(messages);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    if (session.id && session.messages) {
      setMessages(session.messages);
      // Restore persisted graph states for this session
      setGraphs(session.graphs || {});
      setError(null);
    }
  }, [session.id]);

  // Persist completed graphs back into the session so they survive reload.
  // Only writes when there is at least one 'done' graph and the serialized
  // state has actually changed (avoids spurious re-renders).
  useEffect(() => {
    const doneGraphs = {};
    let hasDone = false;
    for (const [msgId, arr] of Object.entries(graphs)) {
      const done = (arr || []).filter(g => g.status === "done");
      if (done.length) { doneGraphs[msgId] = done; hasDone = true; }
    }
    if (!hasDone) return;
    const s = sessionRef.current;
    if (JSON.stringify(doneGraphs) === JSON.stringify(s.graphs || {})) return;
    onUpdateSession({ ...s, messages: messagesRef.current, graphs: doneGraphs });
  }, [graphs]); // intentionally omitting session/messages to break the loop

  const handleInput = (e) => setDraftInput(e.target.value);

  const handleFormSubmit = async (e, overrideText = null) => {
    e?.preventDefault?.();
    const text = typeof overrideText === "string" ? overrideText.trim() : draftInput.trim();
    if (!text || isLoading) return;

    setDraftInput("");
    setIsLoading(true);
    setError(null);

    const userMsg = { id: Date.now().toString(), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s safety timeout

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages,
          sessionId: session.id,
          subject,
          course,
          retrievalMode: currentMode,
          shortTermMemory: buildShortTermMemory(newMessages),
          sessionSummary: session.sessionSummary || "",
          userFacts: session.userFacts || {},
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error("The server responded without a message body.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let aiContent = "";
      const aiId = Date.now().toString() + "_ai";
      setMessages(prev => [...prev, { id: aiId, role: "assistant", content: "" }]);

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          aiContent += chunk;

          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], content: aiContent };
            }
            return updated;
          });
        }
      } catch (readErr) {
        if (readErr.name === "AbortError") {
          throw new Error("The connection timed out while receiving the response.");
        }
        throw readErr;
      }

      // --- Phase 2: detect embedded GRAPH tokens and generate GeoGebra diagrams ---
      // Sanitise first: strip any markdown code-fence wrappers the LLM may have
      // added around the token (e.g. ```%%GRAPH%%...%%END_GRAPH%%```).
      const sanitizedContent = aiContent
        .replace(/```[^\n]*\n(%%GRAPH%%[\s\S]*?%%END_GRAPH%%)\n?```/g, "$1")
        .replace(/`(%%GRAPH%%[\s\S]*?%%END_GRAPH%%)`/g, "$1");

      // Tolerate optional whitespace and newlines between %%GRAPH%% and the JSON.
      const GRAPH_RE = /%%GRAPH%%[\s\n]*({[\s\S]*?})[\s\n]*%%END_GRAPH%%/g;
      const graphMatches = [...sanitizedContent.matchAll(GRAPH_RE)];
      if (graphMatches.length > 0) {
        // Initialise all entries as pending
        const pending = graphMatches.map(() => ({ status: "pending", ggbState: null }));
        setGraphs(prev => ({ ...prev, [aiId]: pending }));

        // ── Board state: find the most recent completed graph in this session ──
        // This implements the Axiom-Canvas "visual working memory" pattern:
        // pass what was already graphed so the LLM avoids duplicate objects/IDs.
        const currentGraphs = graphs; // snapshot of state at submission time
        let boardExpressions = [];
        let boardCmds = [];
        const allGraphEntries = Object.values(currentGraphs).flat();
        const lastDone = [...allGraphEntries].reverse().find(g => g.status === "done");
        if (lastDone?.engine === "desmos" && lastDone.desmosState?.expressions) {
          boardExpressions = lastDone.desmosState.expressions
            .filter(e => e.latex && !e.hidden)
            .map(e => ({ id: e.id, latex: e.latex }))
            .slice(0, 12); // cap at 12 to avoid bloating the prompt
        } else if (lastDone?.engine === "geogebra" && lastDone.ggbState?.cmds) {
          boardCmds = lastDone.ggbState.cmds.slice(0, 15);
        }

        graphMatches.forEach((m, idx) => {
          let graphRequest;
          try { graphRequest = JSON.parse(m[1]); } catch { return; }

          // Capture question/mode from Phase 1 token so we can render them with the graph
          const graphQuestion = graphRequest.question || "";
          const graphMode = graphRequest.mode || "illustration";

          const endpoint = graphEngine === "desmos"
            ? "/api/desmos-generate"
            : "/api/geogebra-generate";

          const body = graphEngine === "desmos"
            ? { ...graphRequest, boardExpressions }
            : { ...graphRequest, boardCmds };

          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
            .then(r => r.json())
            .then(data => {
              setGraphs(prev => {
                const arr = [...(prev[aiId] || [])];
                if (graphEngine === "desmos") {
                  arr[idx] = data.desmosState
                    ? { status: "done", engine: "desmos", desmosState: data.desmosState, question: graphQuestion, mode: graphMode }
                    : { status: "error" };
                } else {
                  arr[idx] = data.ggbState
                    ? { status: "done", engine: "geogebra", ggbState: data.ggbState, question: graphQuestion, mode: graphMode }
                    : { status: "error" };
                }
                return { ...prev, [aiId]: arr };
              });
            })
            .catch(() => {
              setGraphs(prev => {
                const arr = [...(prev[aiId] || [])];
                arr[idx] = { status: "error" };
                return { ...prev, [aiId]: arr };
              });
            });
        });
      }
      // Step 2: Extract Image Tokens (Openverse)
      const imageMatches = [...rawText.matchAll(IMAGE_TOKEN_RE)];
      if (imageMatches.length > 0) {
        const pending = imageMatches.map(() => ({ status: "pending", url: null }));
        setImages(prev => ({ ...prev, [aiId]: pending }));

        imageMatches.forEach((m, idx) => {
          let imageRequest;
          try {
            const rawJson = m[0].replace('%%IMAGE%%', '').replace('%%END_IMAGE%%', '').trim();
            imageRequest = JSON.parse(rawJson);
          } catch (e) { return; }

          fetch("/api/image-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              visual_search_term: imageRequest.visual_search_term || imageRequest.query,
              preferred_extension: imageRequest.extension,
              source_priority: imageRequest.source,
              standardContext: session.userFacts?.focusTopic || session.course
            }),
          })
            .then(r => r.json())
            .then(data => {
               setImages(prev => {
                  const arr = [...(prev[aiId] || [])];
                  arr[idx] = { status: "done", ...data, caption: imageRequest.caption };
                  return { ...prev, [aiId]: arr };
               });
            })
            .catch(() => {
               setImages(prev => {
                  const arr = [...(prev[aiId] || [])];
                  arr[idx] = { status: "error" };
                  return { ...prev, [aiId]: arr };
               });
            });
        });
      }
    } catch (err) {
      console.error("Chat fetch failure:", err);
      // Simplify "TypeError: Load failed" into something more user-friendly
      const friendlyMessage = err.message === "Load failed" || err.name === "TypeError"
        ? "Connection to the SOL server was interrupted. Please check your network or try again."
        : err.message;
      setError({ message: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const switchSubMode = (newSubMode, shouldPrompt = false) => {
    onUpdateSession({
      ...sessionRef.current,
      retrievalMode: newSubMode,
      journey: { ...journey, currentSubMode: newSubMode },
    });
    if (shouldPrompt) {
      setTimeout(() => {
         handleFormSubmit(null, `Start ${getSubModeLabel(newSubMode)} mode`);
      }, 50);
    }
  };

  const markCurrentSubModeComplete = () => {
    const now = new Date().toISOString();
    const subModeLabel = getSubModeLabel(currentMode);
    const nextRecommended = getRecommendedSubMode(currentMode, { ...journey.completed, [currentMode]: true });

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}_nav_complete`,
        role: "assistant",
        content: nextRecommended
          ? `You completed **${subModeLabel}**. Recommended next: **${getSubModeLabel(nextRecommended.subModeId)}**. Use the navigation buttons below to continue.`
          : `You completed **${subModeLabel}**. Nice work. You can review any mode or continue practicing.`,
      },
    ]);

    onUpdateSession({
      ...sessionRef.current,
      journey: {
        ...journey,
        completed: { ...journey.completed, [currentMode]: true },
        completedAt: { ...(journey.completedAt || {}), [currentMode]: now },
      }
    });
  };

  useEffect(() => {
    if (isLoading || messages.length < 2) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant" || !lastMsg.content || journey.completed[currentMode]) return;
    
    let shouldComplete = false;
    if ((currentMode === "notes" || currentMode === "study-guide") && lastMsg.content.length > 500) shouldComplete = true;
    if (currentMode === "map" && lastMsg.content.includes("%%GRAPH%%")) shouldComplete = true;
    if (currentMode === "flashcards" && messages.filter(m => m.role === 'user' || typeof m.subMode === 'string').length >= 4) shouldComplete = true;

    if (shouldComplete) markCurrentSubModeComplete();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const sessLast = session.messages?.[session.messages?.length - 1];
      if (!sessLast || lastMsg.id !== sessLast.id || lastMsg.content !== sessLast.content) {
        onUpdateSession({ ...session, messages });
      }
    }
  }, [messages, session.id]);

  useEffect(() => {
    if (session.name === "New Session" || session.name === "Start Session") {
      const updatedName = formatName(course) || formatName(subject) || "Session";
      onUpdateSession({ ...session, name: updatedName });
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const activePillar = Object.entries(MODE_MAP).find(([key, pillar]) => pillar.subModes.some(sub => sub.id === currentMode))?.[0] || "review";

  return (
    <div className="flex h-full w-full gap-4 md:gap-8">
      <div className="w-[140px] hidden lg:flex flex-col shrink-0 space-y-1 h-full py-6 text-gray-800 dark:text-gray-300">
        <h2 className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 px-1">Learning Path</h2>
        {Object.entries(MODE_MAP).map(([pillarKey, pillarData]) => {
          const isActivePillar = activePillar === pillarKey;
          const stat = completionStats.find(s => s.modeKey === pillarKey);
          return (
            <div key={pillarKey} className="flex flex-col">
              <div
                className={`flex items-center justify-between px-2 py-2 rounded-xl cursor-pointer transition-colors ${isActivePillar ? "text-blue-600 dark:text-blue-400 font-extrabold" : "font-semibold hover:bg-gray-100 dark:hover:bg-gray-800/50"}`}
                onClick={() => { if (!isActivePillar && pillarData.subModes.length > 0) onUpdateSession({ ...session, retrievalMode: pillarData.subModes[0].id }); }}
              >
                <span className={`text-[0.65rem] uppercase tracking-widest ${isActivePillar ? "text-blue-600 dark:text-blue-400 font-black" : "text-gray-400 dark:text-gray-500 font-bold opacity-70"}`}>{pillarData.label}</span>
                {stat && pillarKey !== "progress" && <span className="text-[0.62rem] font-bold opacity-80">{stat.done}/{stat.total}</span>}
              </div>
              <div className={`flex flex-col space-y-0.5 ml-2 transition-all overflow-hidden ${isActivePillar ? "max-h-[500px] mt-1 mb-3 opacity-100" : "max-h-0 opacity-0"}`}>
                {isActivePillar && pillarData.subModes.map((sub) => (
                  <button key={sub.id} onClick={() => onUpdateSession({ ...session, retrievalMode: sub.id })} className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-[0.7rem] transition-colors ${currentMode === sub.id ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20" : "font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"}`}>
                    <span className="truncate pr-2">{sub.label}</span>
                    <span className="flex-shrink-0 text-[0.65rem] font-black">{journey.completed[sub.id] ? "✓" : recommended?.subModeId === sub.id ? "★" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative flex h-full flex-col flex-1 overflow-hidden bg-transparent">
        <div className="custom-scrollbar flex-1 space-y-12 overflow-y-auto px-4 pt-24 pb-12 sm:px-6 lg:px-12 flex flex-col items-center">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            const isStreaming = isLoading && idx === messages.length - 1 && !isUser;
            return (
              <div key={idx} className={`w-full max-w-[900px] animate-in fade-in flex ${isUser ? "justify-end" : "justify-center"}`}>
                {isUser ? (
                  <div className="max-w-[75%] rounded-[2rem] rounded-br-[0.5rem] border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 px-8 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-black/20">
                    <div className="whitespace-pre-wrap text-[1.05rem] font-medium leading-relaxed text-gray-800 dark:text-gray-100">{String(m.content || "")}</div>
                  </div>
                ) : (
                  <div className={`w-full max-w-[850px] px-8 md:px-12 py-10 transition-all duration-500 relative ${isStreaming ? "rounded-[3rem] border border-blue-200/60 dark:border-blue-900/40 shadow-[0_15px_50px_rgba(59,130,246,0.05)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl" : "bg-transparent"}`}>
                    {isStreaming && (
                      <div className="flex items-center gap-3 mb-8 text-[0.75rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] opacity-70">
                        <div className="relative h-5 w-5">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                        </div>
                        <span>SOL Synchronizing Stream</span>
                      </div>
                    )}
                    {splitMessageSegments(String(m.content || "")).map((seg, segIdx) => {
                      if (seg.type === 'text') {
                        return seg.content.trim()
                          ? <MarkdownMessage key={segIdx} content={seg.content} isUser={false} />
                          : null;
                      }
                      if (seg.type === 'actions') {
                        return <QuickActions 
                          key={segIdx} 
                          actions={(() => { try { return JSON.parse(seg.data); } catch { return []; } })()} 
                          onSwitch={(target) => onUpdateSession({ ...session, retrievalMode: target })} 
                          onSend={(prompt) => {
                            const handlerFormSubmit = handleFormSubmit; // using closure
                            handlerFormSubmit(null, prompt);
                          }} 
                          currentSubMode={currentMode} 
                        />;
                      }
                      if (seg.type === 'flashcards') {
                        return <FlashcardDeck key={segIdx} cards={(() => { try { return JSON.parse(seg.data); } catch { return []; } })()} />;
                      }
                      if (seg.type === 'mcq') {
                        const data = (() => { try { return JSON.parse(seg.data); } catch { return null; } })();
                        if (!data) return null;
                        return <AdaptiveMCQ key={segIdx} {...data} />;
                      }
                      if (seg.type === 'quiz') {
                        const data = (() => { try { return JSON.parse(seg.data); } catch { return null; } })();
                        if (!data) return null;
                        return <QuizRunner key={segIdx} {...data} />;
                      }
                      
                      if (seg.type === 'graph') {
                        const g = (graphs[m.id] || [])[seg.graphIndex];
                        if (!g) return null;
                        return (
                        <div key={segIdx}>
                          {g.status === "pending" && (
                            <div className="flex items-center gap-2 my-6 text-xs font-semibold text-blue-500 uppercase tracking-widest opacity-60">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                              Generating diagram…
                            </div>
                          )}
                          {g.status === "done" && g.engine === "desmos" && <DesmosRenderer state={g.desmosState} />}
                          {g.status === "done" && g.engine !== "desmos" && <GeoGebraRenderer state={g.ggbState} />}
                          {g.status === "done" && g.mode === "question" && g.question && (
                            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-semibold text-amber-800 dark:text-amber-300 shadow-sm">
                              <span className="mt-0.5 text-base leading-none">❓</span>
                              <span>{g.question}</span>
                            </div>
                          )}
                          {g.status === "error" && (
                            <p className="text-xs text-red-400 italic my-4">Diagram could not be generated.</p>
                          )}
                        </div>
                      );
                    }

                    if (seg.type === 'image') {
                      const img = (images[m.id] || [])[seg.imageIndex];
                      if (!img) return null;
                      return (
                        <div key={segIdx}>
                          {img.status === "pending" && (
                            <div className="flex items-center gap-3 my-8 text-[0.65rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] opacity-50">
                               <div className="relative h-4 w-4">
                                 <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                               </div>
                               <span>Retrieving Educational Media</span>
                            </div>
                          )}
                          {img.status === "done" && (
                            <OpenverseRenderer image={img} caption={img.caption} />
                          )}
                          {img.status === "error" && (
                            <p className="text-xs text-red-400 italic my-4 opacity-50">Contextual search returned no results.</p>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>
          );
        })}
          <div ref={bottomRef} className="h-4" />
          {!isLoading && journey.completed[currentMode] && messages.length > 0 && messages[messages.length-1].role === "assistant" && (
            <QuickActions actions={(() => {
              const lastMsg = messages[messages.length - 1];
              const actionsSeg = splitMessageSegments(lastMsg.content).find(s => s.type === 'actions');
              if (actionsSeg) { try { return JSON.parse(actionsSeg.data); } catch { return []; } }
              const pk = Object.entries(MODE_MAP).find(([, mode]) => mode.subModes.some(sub => sub.id === currentMode))?.[0] || "review";
              const lat = MODE_MAP[pk].subModes.filter(s => s.id !== currentMode && !journey.completed[s.id]).map(s => s.id);
              const pks = Object.keys(MODE_MAP);
              const nk = pks[pks.indexOf(pk) + 1];
              return [...lat, nk].filter(Boolean);
            })()} currentSubMode={currentMode} onSwitch={switchSubMode} onSend={(prompt) => handleFormSubmit(null, prompt)} />
          )}
          <div className="h-24" />
        </div>

        <form onSubmit={handleFormSubmit} className="absolute bottom-4 inset-x-0 flex justify-center px-4 pointer-events-none w-full">
          <div className="w-full max-w-[850px] pointer-events-auto flex items-center gap-2 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-1 transition-shadow focus-within:ring-4 focus-within:ring-blue-500/10">
            <input
              className="flex-1 bg-transparent py-3.5 pl-6 pr-16 text-[1.05rem] font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              value={draftInput}
              onChange={handleInput}
              placeholder="Ask a mathematical question..."
            />
            <button type="submit" className="absolute right-2 top-2 flex h-[3rem] w-[3rem] items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50" disabled={isLoading || !draftInput.trim()}>
              <SendIcon className="h-5 w-5" />
            </button>
          </div>
        </form>

        {error && (
          <div className="absolute top-12 inset-x-0 flex justify-center">
            <p className="rounded-full bg-red-100 dark:bg-red-900/50 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 backdrop-blur-md shadow-lg">{error.message || "Connection lost"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
