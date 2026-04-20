import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { RoughNotation } from "react-rough-notation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { buildMediumTermSummary, buildShortTermMemory } from "../lib/sessionMemoryService";
import ErrorBoundary from "./ErrorBoundary";
import { Renderer, StateProvider, VisibilityProvider, ActionProvider } from "@json-render/react";
import { registry } from "./ComponentRegistry";
import { QuickActions } from "./QuickActions";
import FlashcardDeck from "./learning/FlashcardDeck";
import AdaptiveMCQ from "./learning/AdaptiveMCQ";
import QuizRunner from "./learning/QuizRunner";
import { MODE_MAP, getSubModeLabel } from "../lib/modeMap";
import { compilePatchesToSpec, isJSONLPatch } from "../lib/specCompiler";
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



// Complete token — both delimiters present
const GRAPH_TOKEN_RE = /%%GRAPH%%[\s\S]*?%%END_GRAPH%%/g;

// Partial token — opening delimiter present but closing not yet arrived (strips during streaming)
const GRAPH_PARTIAL_RE = /%%GRAPH%%[\s\S]*$/;

/**
 * Split a message string into alternating text/graph segments so graphs
 * can be rendered inline at the exact position the token appeared.
 * Returns an array of { type: 'text'|'graph', content: string, graphIndex: number }
 */
/**
 * Split a message string into alternating text/component segments.
 * Now handles both old %%TOKEN%% format and new json-render specs.
 */
function splitMessageSegments(content) {
  const segments = [];
  
  // Regex for json-render specs (expecting valid JSON objects that look like specs)
  // We look for { "root": ... "elements": ... } or similar patterns if the AI outputs them directly.
  // Alternatively, we can just look for any JSON block.
  const JSON_BLOCK_RE = /```json\n([\s\S]*?)\n```|({[\s\s]*?"root"[\s\s]*?"elements"[\s\S]*?})/g;

  const ACTION_TOKEN_RE = /%%ACTIONS%%([\s\S]*?)%%END_ACTIONS%%/g;
  const GRAPH_RE = /%%GRAPH%%[\s\n]*({[\s\S]*?})[\s\n]*%%END_GRAPH%%/g;
  const FLASHCARDS_RE = /%%FLASHCARDS%%([\s\S]*?)%%END_FLASHCARDS%%/g;
  const MCQ_RE = /%%MCQ%%([\s\S]*?)%%END_MCQ%%/g;
  const QUIZ_RE = /%%QUIZ%%([\s\S]*?)%%END_QUIZ%%/g;

  let lastIndex = 0;
  const matches = [
    ...content.matchAll(JSON_BLOCK_RE),
    ...content.matchAll(ACTION_TOKEN_RE),
    ...content.matchAll(GRAPH_RE),
    ...content.matchAll(FLASHCARDS_RE),
    ...content.matchAll(MCQ_RE),
    ...content.matchAll(QUIZ_RE),
  ].sort((a, b) => a.index - b.index);

  matches.forEach((m) => {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, m.index) });
    }
    
    if (m[0].startsWith('%%ACTIONS%%')) {
      segments.push({ type: 'actions', data: m[1] });
    } else if (m[0].startsWith('%%GRAPH%%')) {
      segments.push({ type: 'graph', data: m[1] || m[0] });
    } else if (m[0].startsWith('%%FLASHCARDS%%')) {
      segments.push({ type: 'flashcards', data: m[1] });
    } else if (m[0].startsWith('%%MCQ%%')) {
      segments.push({ type: 'mcq', data: m[1] });
    } else if (m[0].startsWith('%%QUIZ%%')) {
      segments.push({ type: 'quiz', data: m[1] });
    } else {
      // It's a json-render spec or a sequence of JSONL patches
      const raw = m[1] || m[0];
      if (isJSONLPatch(raw)) {
        const lines = raw.split('\n').filter(l => l.trim().startsWith('{"op":'));
        const spec = compilePatchesToSpec(lines);
        if (spec.root) {
          segments.push({ type: 'json-render', spec });
        } else {
          segments.push({ type: 'text', content: raw });
        }
      } else {
        try {
          const spec = JSON.parse(raw);
          if (spec.root && spec.elements) {
            segments.push({ type: 'json-render', spec });
          } else {
            segments.push({ type: 'text', content: raw });
          }
        } catch (e) {
          segments.push({ type: 'text', content: raw });
        }
      }
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


// ── Annotation colour palette the AI can pick from ──────────────────────────
const ANNOTATION_COLORS = {
  yellow:  "rgba(251, 191, 36, 0.45)",
  amber:   "rgba(245, 158, 11, 0.45)",
  green:   "rgba(34, 197, 94, 0.4)",
  teal:    "rgba(20, 184, 166, 0.45)",
  blue:    "rgba(59, 130, 246, 0.5)",
  indigo:  "rgba(99, 102, 241, 0.45)",
  purple:  "rgba(168, 85, 247, 0.4)",
  rose:    "rgba(244, 63, 94, 0.45)",
  red:     "rgba(239, 68, 68, 0.5)",
  gray:    "rgba(107, 114, 128, 0.4)",
};

const DEFAULT_ANNOTATION_COLORS = {
  highlight:       ANNOTATION_COLORS.yellow,
  circle:          ANNOTATION_COLORS.rose,
  underline:       ANNOTATION_COLORS.blue,
  box:             ANNOTATION_COLORS.teal,
  "strike-through": ANNOTATION_COLORS.gray,
};

// ── Text colour palette for [t:color]text[/t] tags ───────────────────────
const TEXT_COLORS = {
  blue:    "text-blue-600 dark:text-blue-400",
  indigo:  "text-indigo-600 dark:text-indigo-400",
  purple:  "text-purple-600 dark:text-purple-400",
  rose:    "text-rose-600 dark:text-rose-400",
  red:     "text-red-600 dark:text-red-400",
  amber:   "text-amber-600 dark:text-amber-400",
  green:   "text-emerald-600 dark:text-emerald-400",
  teal:    "text-teal-600 dark:text-teal-400",
  gray:    "text-gray-500 dark:text-gray-400",
  muted:   "text-gray-400 dark:text-gray-500",
};

/**
 * Convert [h]text[/h], [h:blue]text[/h], and [t:blue]text[/t] into safe HTML span tags
 * so react-markdown's AST stays intact.
 */
function preprocessAnnotations(text) {
  if (!text) return "";
  return text
    .replace(/\[h(?::([a-z]+))?\](.*?)\[\/h\]/gs, (_, col, t) => `<span data-rough="highlight"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[c(?::([a-z]+))?\](.*?)\[\/c\]/gs, (_, col, t) => `<span data-rough="circle"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[u(?::([a-z]+))?\](.*?)\[\/u\]/gs, (_, col, t) => `<span data-rough="underline"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[b(?::([a-z]+))?\](.*?)\[\/b\]/gs, (_, col, t) => `<span data-rough="box"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[t:([a-z]+)\](.*?)\[\/t\]/gs,      (_, col, t) => `<span data-text-color="${col}">${t}</span>`);
}

const MarkdownMessage = ({ content, isUser }) => {
  const formattedContent = preprocessAnnotations(
    String(content || "")
      .replace(new RegExp(GRAPH_TOKEN_RE.source, 'g'), "")
      .replace(GRAPH_PARTIAL_RE, "")
  );

  const renderers = {
    // ── RoughNotation span renderer ──────────────────────────────────────
    span({ node, children, ...props }) {
      const roughType  = node?.properties?.dataRough;
      const textColor  = node?.properties?.dataTextColor;

      // ── Text colour tag: [t:blue]text[/t] ───────────────────────────
      if (textColor) {
        const cls = TEXT_COLORS[textColor] || "";
        return <span className={`${cls} font-medium`}>{children}</span>;
      }

      // ── RoughNotation annotation tag ─────────────────────────────────
      if (roughType) {
        const colorKey = node?.properties?.dataRoughColor;
        const color = (colorKey && ANNOTATION_COLORS[colorKey])
          ? ANNOTATION_COLORS[colorKey]
          : DEFAULT_ANNOTATION_COLORS[roughType] || ANNOTATION_COLORS.yellow;
        return (
          <RoughNotation
            type={roughType}
            show={true}
            color={color}
            animationDuration={roughType === "circle" ? 800 : 600}
            strokeWidth={1.5}
            padding={roughType === "highlight" ? 2 : 4}
          >
            {children}
          </RoughNotation>
        );
      }
      return <span {...props}>{children}</span>;
    },

    // ── Normal hyperlinks ─────────────────────────────────────────────────
    a({ children, href, ...props }) {
      return (
        <a href={href} target="_blank" rel="noreferrer"
          className="text-blue-500 hover:text-blue-600 underline underline-offset-2 decoration-blue-400/40 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },

    // ── Code ──────────────────────────────────────────────────────────────
    code({ node, inline, className, children, ...props }) {
      const text = String(children).replace(/\n$/, "");
      if (inline) {
        return <code className="text-pink-600 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-900/30 px-1.5 py-0.5 rounded text-[0.88em] font-mono font-medium" {...props}>{text}</code>;
      }
      return (
        <div className="rounded-lg bg-gray-900/5 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 px-4 py-3 font-mono text-[0.85em] overflow-x-auto my-4" {...props}>
          <code className={className}>{text}</code>
        </div>
      );
    },
    pre({ children }) { return <>{children}</>; },

    // ── Tables ───────────────────────────────────────────────────────────
    table({ children, ...props }) {
      return (
        <div className="my-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-left text-sm" {...props}>{children}</table>
        </div>
      );
    },
    th({ children, ...props }) {
      return <th className="bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5 font-semibold text-[0.78rem] uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700" {...props}>{children}</th>;
    },
    td({ children, ...props }) {
      return <td className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800/60 text-[0.95rem] text-gray-700 dark:text-gray-300" {...props}>{children}</td>;
    },

    // ── Headings — tasteful, well-breathed ───────────────────────────────────────
    h1({ children, ...props }) {
      return <h1 className="text-[1.45rem] font-bold tracking-tight text-gray-900 dark:text-white mt-10 mb-4" {...props}>{children}</h1>;
    },
    h2({ children, ...props }) {
      return <h2 className="text-[1.2rem] font-semibold text-gray-800 dark:text-gray-100 mt-9 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800" {...props}>{children}</h2>;
    },
    h3({ children, ...props }) {
      return <h3 className="text-[1.05rem] font-semibold text-gray-700 dark:text-gray-200 mt-7 mb-2" {...props}>{children}</h3>;
    },
    h4({ children, ...props }) {
      return <h4 className="text-[0.82rem] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-1.5" {...props}>{children}</h4>;
    },

    // ── Paragraphs — open, breathable ───────────────────────────────────────
    p({ children, ...props }) {
      return <p className="mb-6 last:mb-0 leading-[1.85] text-gray-700 dark:text-gray-300 text-[1.02rem]" {...props}>{children}</p>;
    },

    // ── Lists — more gap, easier to scan ─────────────────────────────────────
    ul({ children, ...props }) {
      return <ul className="my-4 space-y-2 pl-6 list-disc" {...props}>{children}</ul>;
    },
    ol({ children, ...props }) {
      return <ol className="my-4 space-y-2 pl-6 list-decimal" {...props}>{children}</ol>;
    },
    li({ children, ...props }) {
      return <li className="leading-[1.75] text-[1rem] text-gray-700 dark:text-gray-300 marker:text-gray-400 dark:marker:text-gray-600 pl-1" {...props}>{children}</li>;
    },

    // ── Strong / em ───────────────────────────────────────────────────────
    strong({ children, ...props }) {
      return <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>{children}</strong>;
    },
    em({ children, ...props }) {
      return <em className="italic text-gray-600 dark:text-gray-400" {...props}>{children}</em>;
    },

    // ── Blockquote — minimal, barely-there ────────────────────────────────
    blockquote({ children, ...props }) {
      return (
        <blockquote className="my-3 pl-3.5 border-l-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 italic text-[0.95rem]" {...props}>
          {children}
        </blockquote>
      );
    },
  };

  return (
    <div className={`max-w-none break-words font-sans ${
      isUser
        ? "text-sm text-gray-800 dark:text-gray-200"
        : "text-[1rem] text-gray-800 dark:text-gray-200"
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeKatex, { strict: false, throwOnError: false, errorColor: "#cc0000" }],
        ]}
        components={renderers}
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
  const [graphs, setGraphs] = useState(session.graphs || {});
  const [interactionLogs, setInteractionLogs] = useState([]);

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

  /**
   * Captures results from interactive components to ensure continuity with the AI.
   */
  const handleAction = (type, data) => {
    if (type === 'FINISH_QUIZ' || type === 'LOG_INTERACTION') {
      setInteractionLogs(prev => [...prev, { timestamp: new Date().toISOString(), ...data }]);
    }
  };

  const handleFormSubmit = async (e, overrideText = null) => {
    e?.preventDefault?.();
    const promptValue = typeof overrideText === "string" ? overrideText.trim() : draftInput.trim();
    if (!promptValue || isLoading) return;

    setDraftInput("");
    setIsLoading(true);
    setError(null);

    const interactionContext = interactionLogs.length > 0 
      ? `\n\n[USER_INTERACTION_HISTORY]:\n${JSON.stringify(interactionLogs, null, 2)}\n(End of interaction history. Use this context to personalize your next response.)`
      : "";

    const userMessage = { id: Date.now().toString(), role: "user", content: (promptValue + interactionContext).trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInteractionLogs([]); // Clear logs after sending them to the AI to prevent bloat

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
    <StateProvider initialState={{}}>
      <VisibilityProvider>
        <ActionProvider>
          <div className="flex h-full w-full gap-4 md:gap-8">
            <div className="w-[140px] hidden lg:flex flex-col shrink-0 space-y-1 h-full py-6 text-gray-800 dark:text-gray-300">
              <h2 className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 px-1">Learning Path</h2>
              {Object.entries(MODE_MAP).map(([pillarKey, pillarData]) => {
                const isActivePillar = activePillar === pillarKey;
                const stat = completionStats.find(s => s.modeKey === pillarKey);
                // Show submodes only if NOT diagnostic or progress pillar
                const hasSubModes = pillarKey !== 'diagnostic' && pillarKey !== 'progress';

                return (
                  <div key={pillarKey} className="flex flex-col">
                    {pillarKey === 'progress' && <hr className="my-2 border-gray-100 dark:border-gray-800" />}
                    <div
                      className={`flex items-center justify-between px-2 py-2 rounded-xl cursor-pointer transition-colors ${isActivePillar ? "text-blue-600 dark:text-blue-400 font-extrabold" : "font-semibold hover:bg-gray-100 dark:hover:bg-gray-800/50"}`}
                      onClick={() => { 
                         if (!isActivePillar && pillarData.subModes.length > 0) {
                            onUpdateSession({ ...session, retrievalMode: pillarData.subModes[0].id });
                         } 
                      }}
                    >
                      <span className={`text-[0.65rem] uppercase tracking-widest ${isActivePillar ? "text-blue-600 dark:text-blue-400 font-black" : "text-gray-400 dark:text-gray-500 font-bold opacity-70"}`}>{pillarData.label}</span>
                      {stat && pillarKey !== "progress" && pillarKey !== 'diagnostic' && <span className="text-[0.62rem] font-bold opacity-80">{stat.done}/{stat.total}</span>}
                    </div>
                    
                    {hasSubModes && (
                      <div className={`flex flex-col space-y-0.5 ml-2 transition-all overflow-hidden ${isActivePillar ? "max-h-[500px] mt-1 mb-3 opacity-100" : "max-h-0 opacity-0"}`}>
                        {isActivePillar && pillarData.subModes.map((sub) => (
                          <button key={sub.id} onClick={() => onUpdateSession({ ...session, retrievalMode: sub.id })} className={`group relative flex items-center justify-between px-2 py-1.5 rounded-lg text-[0.7rem] transition-colors ${currentMode === sub.id ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20" : "font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"}`}>
                            <span className="truncate pr-2">{sub.label}</span>
                            <span className="flex-shrink-0 text-[0.65rem] font-black">{journey.completed[sub.id] ? "✓" : recommended?.subModeId === sub.id ? "★" : ""}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
                               return <FlashcardDeck 
                                 key={segIdx} 
                                 cards={(() => { try { return JSON.parse(seg.data); } catch { return []; } })()} 
                                 onAction={handleAction}
                               />;
                             }
                            if (seg.type === 'mcq') {
                              const data = (() => { try { return JSON.parse(seg.data); } catch { return null; } })();
                              if (!data) return null;
                              return (
                                <AdaptiveMCQ 
                                  key={segIdx}
                                  mode={(currentMode === 'diagnostic' || currentMode === 'quiz') ? 'diagnostic' : 'practice'}
                                  {...data} 
                                  onAction={handleAction}
                                />
                              );
                            }
                            if (seg.type === 'quiz') {
                              const data = (() => { try { return JSON.parse(seg.data); } catch { return null; } })();
                              if (!data) return null;
                              return (
                                <QuizRunner 
                                  key={segIdx}
                                  mode={(currentMode === 'diagnostic' || currentMode === 'quiz') ? 'diagnostic' : 'practice'}
                                  {...data} 
                                  onAction={handleAction}
                                />
                              );
                            }
                            if (seg.type === 'json-render') {
                              return (
                                <div key={segIdx} className="w-full my-4">
                                  <ActionProvider onAction={handleAction}>
                                    <Renderer 
                                      spec={{
                                        ...seg.spec,
                                        state: {
                                          ...seg.spec.state,
                                          mode: (currentMode === 'diagnostic' || currentMode === 'quiz') ? 'diagnostic' : 'practice'
                                        }
                                      }} 
                                      registry={registry} 
                                      onSwitch={switchSubMode}
                                      onSend={(prompt) => handleFormSubmit(null, prompt)}
                                      currentSubMode={currentMode}
                                    />
                                  </ActionProvider>
                                </div>
                              );
                            }
                            if (seg.type === 'graph') {
                              return null;
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
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
