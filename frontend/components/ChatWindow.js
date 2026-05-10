import React, { useEffect, useRef, useState, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import { RoughNotation } from "react-rough-notation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { buildMediumTermSummary, buildShortTermMemory } from "../lib/sessionMemoryService";
import ErrorBoundary from "./ErrorBoundary";
import { useChat } from "@ai-sdk/react";
import { MODE_MAP, getSubModeLabel } from "../lib/modeMap";
import { QuickActions } from "./QuickActions";
import FlashcardDeck from "./learning/FlashcardDeck";
import AdaptiveMCQ from "./learning/AdaptiveMCQ";
import QuizRunner from "./learning/QuizRunner";
import ValidatedImage from "./learning/ValidatedImage";

import PythonExecutor from "./learning/PythonExecutor";
import PythonVisual from "./learning/PythonVisual";

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






// ── Annotation colour palette the AI can pick from ──────────────────────────
const ANNOTATION_COLORS = {
  yellow:  "rgba(251, 191, 36, 0.45)",
  amber:   "rgba(245, 158, 11, 0.45)",
  orange:  "rgba(249, 115, 22, 0.45)",
  green:   "rgba(34, 197, 94, 0.4)",
  teal:    "rgba(20, 184, 166, 0.45)",
  cyan:    "rgba(6, 182, 212, 0.45)",
  blue:    "rgba(59, 130, 246, 0.5)",
  indigo:  "rgba(99, 102, 241, 0.45)",
  violet:  "rgba(139, 92, 246, 0.45)",
  purple:  "rgba(168, 85, 247, 0.4)",
  pink:    "rgba(236, 72, 153, 0.45)",
  rose:    "rgba(244, 63, 94, 0.45)",
  red:     "rgba(239, 68, 68, 0.5)",
  gray:    "rgba(107, 114, 128, 0.4)",
};

const DEFAULT_ANNOTATION_COLORS = {
  highlight:         ANNOTATION_COLORS.yellow,
  circle:            ANNOTATION_COLORS.rose,
  underline:         ANNOTATION_COLORS.blue,
  box:               ANNOTATION_COLORS.teal,
  "strike-through":  ANNOTATION_COLORS.gray,
  "crossed-off":     ANNOTATION_COLORS.red,
  bracket:           ANNOTATION_COLORS.indigo,
};

// ── Text colour palette for [t:color]text[/t] tags ───────────────────────
const TEXT_COLORS = {
  blue:    "text-blue-600 dark:text-blue-400",
  cyan:    "text-cyan-600 dark:text-cyan-400",
  teal:    "text-teal-600 dark:text-teal-400",
  green:   "text-emerald-600 dark:text-emerald-400",
  amber:   "text-amber-600 dark:text-amber-400",
  orange:  "text-orange-600 dark:text-orange-400",
  red:     "text-red-600 dark:text-red-400",
  rose:    "text-rose-600 dark:text-rose-400",
  pink:    "text-pink-600 dark:text-pink-400",
  purple:  "text-purple-600 dark:text-purple-400",
  violet:  "text-violet-600 dark:text-violet-400",
  indigo:  "text-indigo-600 dark:text-indigo-400",
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
    .replace(/\[s(?::([a-z]+))?\](.*?)\[\/s\]/gs, (_, col, t) => `<span data-rough="strike-through"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[x(?::([a-z]+))?\](.*?)\[\/x\]/gs, (_, col, t) => `<span data-rough="crossed-off"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[br(?::([a-z]+))?\](.*?)\[\/br\]/gs,(_, col, t) => `<span data-rough="bracket"${col ? ` data-rough-color="${col}"` : ""}>${t}</span>`)
    .replace(/\[blur\](.*?)\[\/blur\]/gs,          (_,      t) => `<span data-blur="true">${t}</span>`)
    .replace(/\[t:([a-z]+)\](.*?)\[\/t\]/gs,      (_, col, t) => `<span data-text-color="${col}">${t}</span>`);
}

// ── Blur / reveal component for [blur]...[/blur] tags ────────────────────────
function BlurReveal({ children }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={() => setRevealed((v) => !v)}
      title={revealed ? "Click to hide" : "Click to reveal"}
      className={`cursor-pointer select-none transition-all duration-300 inline-block rounded px-0.5
        ${revealed
          ? "blur-none opacity-100"
          : "blur-sm opacity-70 hover:opacity-90 bg-gray-200/40 dark:bg-gray-700/40"
        }`}
    >
      {children}
    </span>
  );
}

const MarkdownMessage = memo(({ content, isUser }) => {
  const formattedContent = useMemo(() => preprocessAnnotations(
    String(content || "")
  ), [content]);

  const renderers = useMemo(() => ({
    // ── RoughNotation span renderer ──────────────────────────────────────
    span({ node, children, ...props }) {
      const roughType  = node?.properties?.dataRough;
      const textColor  = node?.properties?.dataTextColor;

      // ── Blur / reveal tag: [blur]spoiler[/blur] ──────────────────────
      if (node?.properties?.dataBlur) {
        return <BlurReveal>{children}</BlurReveal>;
      }

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
            strokeWidth={roughType === "bracket" ? 2.5 : 1.7}
            padding={roughType === "highlight" ? 3 : roughType === "bracket" ? 8 : 4}
            multiline={true}
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
    strong({ children, ...props }) {
      return <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>{children}</strong>;
    },
    em({ children, ...props }) {
      return <em className="italic text-gray-600 dark:text-gray-400" {...props}>{children}</em>;
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote className="my-3 pl-3.5 border-l-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 italic text-[0.95rem]" {...props}>
          {children}
        </blockquote>
      );
    },
  }), []);

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
});

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

export default function ChatWindow({ session, onUpdateSession, onAwardPoints }) {
  const bottomRef = useRef(null);

  const subject = session.subject || "";
  const course = session.course || "";
  const journey = normalizeJourney(session, session.retrievalMode || "notes");
  const currentMode = journey.currentSubMode || "notes";
  const completionStats = getModeCompletionStats(journey.completed);
  const recommended = getRecommendedSubMode(currentMode, journey.completed);

  const [draftInput, setDraftInput] = useState("");
  const [localError, setLocalError] = useState(null);
  const [interactionLogs, setInteractionLogs] = useState(session.interactionLogs || []);

  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const initialMessages = useMemo(() => {
    return (session.messages || []).map((msg, idx) => ({
      ...msg,
      id: msg.id || `stable-id-${idx}`,
      content: typeof msg.content === 'string' ? msg.content : getMessageContent(msg)
    }));
  }, [session.id, session.messages?.length]); // Re-run if ID or count changes

  const { 
    messages, 
    setMessages, 
    sendMessage, 
    status, 
    error: sdkError 
  } = useChat({
    api: "/api/chat",
    id: session.id,
    initialMessages: initialMessages,
    maxSteps: 10,
    body: {
      sessionId: session.id,
      subject,
      course,
      retrievalMode: currentMode,
      sessionSummary: session.sessionSummary || "",
      userFacts: session.userFacts || {},
      journey: session.journey || {},
    },
    onFinish: () => {
      onUpdateSession({ 
        ...sessionRef.current, 
        interactionLogs: []
      });
    },
    onError: (err) => {
      setLocalError(err.message);
    }
  });

  const isChatLoading = status === 'submitted' || status === 'streaming';

  const handleInput = (e) => setDraftInput(e.target.value);

  const handleAction = (type, data) => {
    if (type === 'FINISH_QUIZ' || type === 'LOG_INTERACTION') {
      const newLog = { timestamp: new Date().toISOString(), ...data };
      const nextLogs = [...interactionLogs, newLog];
      
      setInteractionLogs(nextLogs);
      onUpdateSession({ ...sessionRef.current, interactionLogs: nextLogs });

      if (type === 'FINISH_QUIZ') {
        const prompt = `I have finished the ${data.title || 'quiz'} (Score: ${data.score}/${data.total}). Here are my results. Please review them and recommend the next step.`;
        setTimeout(() => handleFormSubmit(null, prompt, nextLogs), 50);
      } else if (type === 'LOG_INTERACTION' && data.type === 'Flashcards' && data.percentReviewed !== undefined) {
        const prompt = `I have finished reviewing the flashcards. Please review my progress and recommend the next step.`;
        setTimeout(() => handleFormSubmit(null, prompt, nextLogs), 50);
      }
    }
  };

  const getMessageContent = (m) => {
    if (typeof m.content === "string" && m.content.length > 0) return m.content;
    if (Array.isArray(m.parts) && m.parts.length > 0) {
      return m.parts
        .map((part) => (part.type === "text" ? part.text : ""))
        .join("");
    }
    return typeof m.content === "string" ? m.content : "";
  };

  const handleFormSubmit = async (e, overrideText = null, overrideLogs = null) => {
    e?.preventDefault?.();
    const promptValue = typeof overrideText === "string" ? overrideText.trim() : draftInput.trim();
    if (!promptValue || isChatLoading) return;

    setLocalError(null);
    if (!overrideText) setDraftInput("");

    const logsToUse = overrideLogs || interactionLogs;
    const interactionContext = logsToUse.length > 0 
      ? `\n\n[USER_INTERACTION_HISTORY]:\n${JSON.stringify(logsToUse, null, 2)}\n(End of interaction history.)`
      : "";

    setInteractionLogs([]); 

    sendMessage({ 
      text: (promptValue + interactionContext).trim()
    }, {
      body: {
        sessionId: session.id,
        subject,
        course,
        retrievalMode: currentMode,
        sessionSummary: session.sessionSummary || "",
        userFacts: session.userFacts || {},
      }
    });
  };

  const switchSubMode = (newSubMode, shouldPrompt = false) => {
    const blocks = sessionRef.current.journey?.blocks || [];
    const newIndex = blocks.indexOf(newSubMode);

    onUpdateSession({
      ...sessionRef.current,
      retrievalMode: newSubMode,
      journey: { 
        ...journey, 
        currentSubMode: newSubMode,
        currentIndex: newIndex >= 0 ? newIndex : journey.currentIndex
      },
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

    if (onAwardPoints) onAwardPoints(50); // Award points!

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}_nav_complete`,
        role: "assistant",
        content: `You completed **${subModeLabel}**. Great job! +50 Mastery Points.`,
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
    if (isChatLoading || !Array.isArray(messages) || messages.length < 2) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant" || !lastMsg.content || journey.completed[currentMode]) return;
    
    let shouldComplete = false;
    if (currentMode === "flashcards" && messages.filter(m => m.role === 'user' || typeof m.subMode === 'string').length >= 4) shouldComplete = true;

    if (shouldComplete) markCurrentSubModeComplete();
  }, [messages, isChatLoading]);


  useEffect(() => {
    if (session.name === "New Session" || session.name === "Start Session") {
      const updatedName = formatName(course) || formatName(subject) || "Session";
      onUpdateSession({ ...session, name: updatedName });
    }
  }, []);

  // Ensure streaming messages and state are continually saved to local storage
  useEffect(() => {
    if (messages && messages.length > 0) {
      const safeMessages = messages.map((msg, idx) => ({
        ...msg,
        id: msg.id || `msg-${idx}`,
        content: typeof msg.content === 'string' ? msg.content : getMessageContent(msg)
      }));
      
      const stringifiedCurrent = JSON.stringify(session.messages || []);
      const stringifiedNew = JSON.stringify(safeMessages);
      if (stringifiedCurrent !== stringifiedNew) {
         onUpdateSession({
           ...sessionRef.current,
           messages: safeMessages
         });
      }
    }
  }, [messages, onUpdateSession, session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const activePillar = Object.entries(MODE_MAP).find(([key, pillar]) => pillar.subModes.some(sub => sub.id === currentMode))?.[0] || "review";

  const journeyBlocks = session.journey?.blocks || [];
  const currentBlockIndex = session.journey?.currentIndex || 0;
  const isPauseScreen = session.journey?.completed?.[currentMode] === true;

  const handleNextBlock = () => {
    const nextIndex = currentBlockIndex + 1;
    if (nextIndex < journeyBlocks.length) {
      const nextMode = journeyBlocks[nextIndex];
      onUpdateSession({
        ...sessionRef.current,
        retrievalMode: nextMode,
        journey: {
          ...journey,
          currentIndex: nextIndex,
          currentSubMode: nextMode
        }
      });
      setTimeout(() => {
        handleFormSubmit(null, `Start ${getSubModeLabel(nextMode)} mode`);
      }, 50);
    } else {
      if (onAwardPoints) onAwardPoints(100);
      alert("Session fully completed! +100 Bonus Points");
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Journey Bar */}
      {journeyBlocks.length > 0 && (
        <div className="w-full flex items-center justify-center gap-2 py-4 px-6 border-b border-gray-100 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
          {journeyBlocks.map((block, idx) => {
            const isCompleted = session.journey?.completed?.[block];
            const isActive = currentMode === block;
            return (
              <React.Fragment key={idx}>
                <div 
                  onClick={() => switchSubMode(block, false)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer hover:opacity-80 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                   {isCompleted ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> : <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-current opacity-20">{idx + 1}</span>}
                   {getSubModeLabel(block)}
                </div>
                {idx < journeyBlocks.length - 1 && <div className={`w-6 h-0.5 rounded-full ${isCompleted ? 'bg-green-400/50' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="relative flex h-full flex-col flex-1 overflow-hidden bg-transparent">
        <div className="custom-scrollbar flex-1 space-y-12 overflow-y-auto px-4 pt-12 pb-12 sm:px-6 lg:px-12 flex flex-col items-center">
          
          {messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button 
                  onClick={() => handleFormSubmit(null, `Start ${getSubModeLabel(currentMode)} mode`)}
                  className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[1.1rem] shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Start {getSubModeLabel(currentMode)}
                </button>
             </div>
          ) : (
             <>
                {messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  const isStreaming = isChatLoading && idx === messages.length - 1 && !isUser;
                  const content = getMessageContent(m);
                  return (
                    <div key={idx} className={`w-full max-w-[900px] animate-in fade-in flex ${isUser ? "justify-end" : "justify-center"}`}>
                      {isUser ? (
                        <div className="max-w-[75%] rounded-[2rem] rounded-br-[0.5rem] border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 px-8 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-black/20">
                          <div className="whitespace-pre-wrap text-[1.05rem] font-medium leading-relaxed text-gray-800 dark:text-gray-100">
                            {(() => {
                              const historyTag = "[USER_INTERACTION_HISTORY]";
                              if (content.includes(historyTag)) {
                                return content.split(historyTag)[0].trim();
                              }
                              return content;
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div className={`w-full max-w-[850px] px-8 md:px-12 py-10 transition-all duration-500 relative ${isStreaming ? "rounded-[3rem] border border-blue-200/60 dark:border-blue-900/40 shadow-[0_15px_50px_rgba(59,130,246,0.05)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl" : "bg-transparent"}`}>
                          {isStreaming && (
                            <div className="flex items-center gap-3 mb-8 text-[0.75rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] animate-in fade-in slide-in-from-left-2 duration-500">
                              <div className="relative h-5 w-5">
                                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping"></div>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                              <span className="flex items-center gap-1.5">
                                SOL Curating Intelligence
                                <span className="flex gap-0.5">
                                  <span className="w-0.5 h-0.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                  <span className="w-0.5 h-0.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                  <span className="w-0.5 h-0.5 bg-current rounded-full animate-bounce"></span>
                                </span>
                              </span>
                            </div>
                          )}
                          {(() => {
                            // ── SDK parts path: handles tool-invocations + text ────────────
                            // Activated when the message has typed SDK stream parts
                            // (i.e. messages produced via native tool calling).
                            const sdkParts = Array.isArray(m.parts) ? m.parts : [];
                            // AI SDK v6 UI stream: tool parts use type "tool-{toolName}"
                            // (not "tool-invocation" which was the v4/v5 format)
                            const hasToolInvocations = sdkParts.some(p =>
                              typeof p.type === "string" && p.type.startsWith("tool-")
                            );

                            if (hasToolInvocations) {
                              return sdkParts.map((part, partIdx) => {
                                // Text parts: still run through splitMessageSegments so
                                // json-render blocks (MCQ, Quiz, Actions) continue to work.
                                if (part.type === "text") {
                                  return part.text?.trim() ? (
                                    <div key={`text-${partIdx}`} className="mb-2 last:mb-0">
                                      <MarkdownMessage content={part.text} isUser={false} />
                                    </div>
                                  ) : null;
                                }

                                // ── Native tool dispatch (AI SDK v6 UI stream format) ─────────
                                // v6: part.type === "tool-{toolName}", state === "input-available"
                                //     args are at part.input (not part.args)
                                if (typeof part.type === "string" &&
                                    part.type.startsWith("tool-") &&
                                    part.type !== "tool-invocation") {
                                  const toolName = part.type.slice(5); // strip "tool-" prefix
                                  const args = part.input || {};
                                  // Be permissive with states (call, result, input-available, output-available)
                                  const isAvailable = part.state !== "partial-call";

                                  if (!isAvailable) return null;

                                  if (toolName === "showImage") return (
                                    <ValidatedImage key={`tool-${partIdx}`} toolInvocation={part} />
                                  );



                                  if (toolName === "showPython") {
                                    // result/output is set after server-side E2B execution
                                    const pyResult = part.output || part.result || {};
                                    const { chartData, title: pyTitle, caption, code } = pyResult;

                                    // Still loading (call state, no result yet)
                                    if (part.state !== "result" && !chartData && !pyResult.error) {
                                      return (
                                        <div key={`tool-${partIdx}`} className="my-8 w-full max-w-4xl mx-auto">
                                          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-amber-400/20 p-10 flex items-center gap-5 shadow-xl">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-400/20 animate-pulse">
                                              <span className="text-white text-xs font-black">PY</span>
                                            </div>
                                            <div>
                                              <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">E2B Sandbox</p>
                                              <p className="text-sm text-slate-500">Executing Python · Generating chart...</p>
                                            </div>
                                            <div className="ml-auto flex gap-1">
                                              {[0, 150, 300].map(d => (
                                                <div key={d} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }

                                    if (pyResult.error || (part.state === "result" && !chartData)) {
                                      return (
                                        <div key={`tool-${partIdx}`} className="my-8 w-full max-w-4xl mx-auto p-6 bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-500/30">
                                          <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-2">Python Error</p>
                                          <pre className="text-xs font-mono text-rose-500 whitespace-pre-wrap">{pyResult.error || "Execution finished, but no visual was generated. The Python code may have timed out or failed silently without calling plt.show()."}</pre>
                                        </div>
                                      );
                                    }

                                    return (
                                      <PythonVisual
                                        key={`tool-${partIdx}`}
                                        chartData={chartData}
                                        title={pyTitle || args.title}
                                        caption={caption || args.caption}
                                        code={code || args.code}
                                      />
                                    );
                                  }

                                  if (toolName === "showFlashcards") {
                                    if (!args.cards || args.cards.length === 0) {
                                      return (
                                        <div key={`tool-${partIdx}`} className="my-6 w-full max-w-2xl mx-auto">
                                          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-indigo-400/20 p-8 flex items-center gap-5 shadow-xl animate-pulse">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                              <div className="w-5 h-5 bg-indigo-500 rounded-sm"></div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                              <div className="h-2 w-24 bg-indigo-400/30 rounded"></div>
                                              <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={`tool-${partIdx}`} className="w-full my-4">
                                        <FlashcardDeck 
                                          cards={args.cards || []} 
                                          actions={args.actions}
                                          onSwitch={switchSubMode}
                                          onSend={(p) => handleFormSubmit(null, p)}
                                          currentSubMode={currentMode}
                                          onAction={handleAction} 
                                        />
                                      </div>
                                    );
                                  }

                                  if (toolName === "showMCQ") {
                                    if (!args.options || args.options.length === 0) {
                                      return (
                                        <div key={`tool-${partIdx}`} className="my-6 w-full max-w-2xl mx-auto">
                                          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-emerald-400/20 p-8 flex items-center gap-5 shadow-xl animate-pulse">
                                            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                                              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                              <div className="h-2 w-32 bg-emerald-400/30 rounded"></div>
                                              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                              <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={`tool-${partIdx}`} className="w-full my-4">
                                        <AdaptiveMCQ
                                          question={args.question}
                                          options={args.options}
                                          answer={args.answer}
                                          explanation={args.explanation}
                                          mode={args.mode || ((currentMode === 'diagnostic' || currentMode === 'quiz') ? 'diagnostic' : 'practice')}
                                          actions={args.actions}
                                          onSwitch={switchSubMode}
                                          onSend={(p) => handleFormSubmit(null, p)}
                                          currentSubMode={currentMode}
                                          onAction={handleAction}
                                        />
                                      </div>
                                    );
                                  }

                                  if (toolName === "showQuiz") {
                                    if (!args.questions || args.questions.length === 0) {
                                      return (
                                        <div key={`tool-${partIdx}`} className="my-8 w-full max-w-3xl mx-auto">
                                          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-violet-400/20 p-10 flex flex-col gap-6 shadow-2xl animate-pulse">
                                            <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="3"><path d="M12 2v20M2 12h20"/></svg>
                                              </div>
                                              <div className="h-4 w-48 bg-violet-500/20 rounded"></div>
                                            </div>
                                            <div className="space-y-4">
                                              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded"></div>
                                              <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={`tool-${partIdx}`} className="w-full my-4">
                                        <QuizRunner
                                          title={args.title}
                                          questions={args.questions || []}
                                          mode={args.mode || ((currentMode === 'diagnostic' || currentMode === 'quiz') ? 'diagnostic' : 'practice')}
                                          actions={args.actions}
                                          onSwitch={switchSubMode}
                                          onSend={(p) => handleFormSubmit(null, p)}
                                          currentSubMode={currentMode}
                                          onAction={handleAction}
                                        />
                                      </div>
                                    );
                                  }

                                  if (toolName === "showActions" && args.actions) return (
                                    <div key={`tool-${partIdx}`} className="w-full my-2">
                                      <QuickActions
                                        actions={args.actions}
                                        onSwitch={switchSubMode}
                                        onSend={(p) => handleFormSubmit(null, p)}
                                        currentSubMode={currentMode}
                                      />
                                    </div>
                                  );
                                }

                                return null;
                              });
                            }

                            return content?.trim()
                              ? <MarkdownMessage key="fallback" content={content} isUser={false} />
                              : null;
                          })()}
                      </div>
                    )}
                  </div>
                );
              })}
              {isPauseScreen && (
                <div className="w-full max-w-3xl flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500 bg-green-50/50 dark:bg-green-900/10 rounded-3xl border border-green-100 dark:border-green-900/30 mt-8 shadow-sm">
                   <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 text-white mb-3">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Block Completed!</h2>
                   <p className="text-gray-500 dark:text-gray-400 font-medium">+50 Mastery Points added to your course score.</p>
                   <button 
                      onClick={handleNextBlock}
                      className="mt-6 px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                   >
                      {currentBlockIndex < journeyBlocks.length - 1 ? `Start ${getSubModeLabel(journeyBlocks[currentBlockIndex + 1])}` : "Finish Session"}
                   </button>
                </div>
              )}
              {!isChatLoading && isPauseScreen && Array.isArray(messages) && messages.length > 0 && messages[messages.length-1]?.role === "assistant" && (
                <QuickActions 
                  actions={(() => {
                     const pk = Object.entries(MODE_MAP).find(([, mode]) => mode.subModes.some(sub => sub.id === currentMode))?.[0] || "review";
                     const lat = MODE_MAP[pk].subModes.filter(s => s.id !== currentMode && !journey.completed[s.id]).map(s => s.id);
                     const pks = Object.keys(MODE_MAP);
                     const nk = pks[pks.indexOf(pk) + 1];
                     return [...lat, nk].filter(Boolean);
                  })()} 
                  currentSubMode={currentMode} 
                  onSwitch={switchSubMode} 
                  onSend={(prompt) => handleFormSubmit(null, prompt)} 
                />
              )}
              </>
            )}
            <div ref={bottomRef} className="h-4" />
            <div className="h-24" />
          </div>

          {messages.length > 0 && (
            <form onSubmit={handleFormSubmit} className="absolute bottom-4 inset-x-0 flex justify-center px-4 pointer-events-none w-full">
              <div className="w-full max-w-[850px] pointer-events-auto flex items-center gap-2 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-1 transition-shadow focus-within:ring-4 focus-within:ring-blue-500/10">
                <input
                  className="flex-1 bg-transparent py-3.5 pl-6 pr-16 text-[1.05rem] font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                  value={draftInput}
                  onChange={handleInput}
                  placeholder="Ask a mathematical question..."
                />
                <button type="submit" className="absolute right-2 top-2 flex h-[3rem] w-[3rem] items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50" disabled={isChatLoading || !draftInput.trim()}>
                  <SendIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {localError && (
            <div className="absolute top-12 inset-x-0 flex justify-center">
              <p className="rounded-full bg-red-100 dark:bg-red-900/50 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 backdrop-blur-md shadow-lg">{localError || "Connection lost"}</p>
            </div>
          )}
        </div>
    </div>
  );
}
