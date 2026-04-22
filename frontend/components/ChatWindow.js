import { useEffect, useRef, useState, useMemo } from "react";
import { useChat, experimental_useObject as useObject } from "@ai-sdk/react";
import { flashcardDeckSchema, quizDeckSchema } from "../lib/schemaObjects";
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
import GraphContainer from "./GraphContainer";
import ProgressDashboard from "./ProgressDashboard";
import { MODE_MAP, getSubModeLabel } from "../lib/modeMap";
import { useSupabasePersistence } from "../hooks/useSupabasePersistence";
import {  ZapIcon,
  BarChart3,
  Bookmark,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Camera,
  Paperclip,
  Loader2
} from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { supabase } from "../lib/supabaseClient";
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

const SunIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

const OpenverseRenderer = dynamic(() => import("./OpenverseRenderer"), {
  ssr: false,
  loading: () => <Skeleton variant="media" className="h-48 w-full" />,
});

// Modern Placeholders
const MatplotlibPlaceholder = ({ query }) => (
  <div className="my-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 p-6 shadow-sm ring-1 ring-inset ring-blue-500/10 overflow-hidden">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Rendering Visual Concept</span>
    </div>
    <Skeleton variant="text" lines={2} className="mb-4" />
    <Skeleton variant="media" className="h-48" />
  </div>
);

const OpenversePlaceholder = ({ image }) => (
  <div className="my-6 group relative overflow-hidden rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-800 shadow-xl transition-all hover:shadow-2xl">
    <div className="flex items-center justify-between border-b border-indigo-50 dark:border-indigo-900/20 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-indigo-500" />
        <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Openverse Visual Insight</span>
      </div>
      <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 text-[0.6rem] font-black text-indigo-600 dark:text-indigo-300">Active Pipeline</span>
    </div>
    <div className="p-2">
      <OpenverseRenderer image={image} caption={image.caption} />
    </div>
  </div>
);

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
  const [activeDrill, setActiveDrill] = useState(null);

  if (!actions || actions.length === 0) return null;

  if (activeDrill) {
     const drillPillar = MODE_MAP[activeDrill];
     if (drillPillar) {
         return (
            <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in zoom-in-95 duration-300 w-full max-w-[700px]">
               <button onClick={() => setActiveDrill(null)} className="group flex items-center gap-1.5 rounded-lg px-3 py-2 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 bg-gray-100 text-gray-600 ring-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Back
               </button>
               {drillPillar.subModes.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                        setActiveDrill(null);
                        onSwitch(sub.id, true);
                    }}
                    className="group flex items-center gap-2 rounded-lg px-4 py-2 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-800"
                  >
                    Start {sub.label}
                  </button>
               ))}
            </div>
         );
     }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full max-w-[700px]">
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
              className="group flex items-center gap-2 rounded-lg px-4 py-2 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-700 hover:shadow-md dark:bg-indigo-700 dark:ring-indigo-600 dark:hover:bg-indigo-600"
            >
              {act.label}
            </button>
          );
        }

        const isPillar = MODE_MAP[act];
        const label = isPillar ? `Move to ${isPillar.label} Mode` : `Continue with ${getSubModeLabel(act)}`;
        const subModeId = isPillar ? isPillar.subModes[0].id : act;
        const isRecommended = !isPillar;

        return (
          <button
            key={act}
            onClick={() => {
              if (isPillar) {
                setActiveDrill(act);
              } else {
                onSwitch(subModeId, true);
              }
            }}
            className={`group flex items-center gap-2 rounded-lg px-4 py-2 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 ${
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

const MarkdownMessage = ({ content, isUser, isStreaming = false }) => {
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
    a({ children, href, ...props }) {
      if (href === "#highlight") {
        return isStreaming ? <span className="bg-yellow-200/40 px-1">{children}</span> : <RoughNotation type="highlight" show={true} color="rgba(253, 224, 71, 0.4)" animationDuration={700} padding={3} {...props}>{children}</RoughNotation>;
      }
      if (href === "#circle") {
        return isStreaming ? <span className="text-red-500 font-bold">{children}</span> : <RoughNotation type="circle" show={true} color="rgba(239, 68, 68, 0.7)" animationDuration={900} padding={5} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      if (href === "#underline") {
        return isStreaming ? <span className="border-b-[3px] border-blue-500/70">{children}</span> : <RoughNotation type="underline" show={true} color="rgba(59, 130, 246, 0.8)" animationDuration={600} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      if (href === "#box") {
        return isStreaming ? <span className="border-[3px] border-emerald-500/70 px-1">{children}</span> : <RoughNotation type="box" show={true} color="rgba(16, 185, 129, 0.7)" animationDuration={800} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      if (href === "#strike") {
        return isStreaming ? <span className="line-through decoration-red-500">{children}</span> : <RoughNotation type="strike-through" show={true} color="rgba(239, 68, 68, 0.6)" animationDuration={500} strokeWidth={2} {...props}>{children}</RoughNotation>;
      }
      return (
        <a href={href} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 underline underline-offset-4 decoration-2 decoration-blue-500/30" {...props}>
          {children}
        </a>
      );
    },
  };

  return (
    <div className={`prose break-words max-w-none ${isUser ? "text-gray-800 dark:text-gray-200" : "font-sans selection:bg-blue-100 selection:text-blue-900"}`}>
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

export default function ChatWindow({ 
  session, 
  onUpdateSession, 
  graphEngine = "geogebra", 
  isMinimalMode = false,
  isDyslexic = false,
  setIsDyslexic,
  isFocusMode = false,
  setIsFocusMode,
  theme,
  toggleTheme
}) {
  const { messages: rawMessages = [], id: sessionId, subject, course, currentSubMode: savedMode } = session || {};
  const [messages, setMessages] = useState(session.messages || []);
  const [draftInput, setDraftInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMode, setCurrentMode] = useState(savedMode || "diagnostic");
  const [courseStandards, setCourseStandards] = useState([]);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Local state for media generation
  const [graphs, setGraphs] = useState(session.graphs || {}); // { messageId: [ {status, pngBase64, ...} ] }
  const [images, setImages] = useState({}); // { messageId: [ {status, url, ...} ] }

  const chatContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const sessionRef = useRef(session);
  const messagesRef = useRef(messages);
  
  // Phase 21.4: Visual Deduplication
  const processedVisualsRef = useRef(new Set()); 

  const journey = normalizeJourney(session, session.retrievalMode || "notes");
  const completionStats = getModeCompletionStats(journey.completed);
  const recommended = getRecommendedSubMode(currentMode, journey.completed);

  const { saveMessageToDB, updateMasteryScore } = useSupabasePersistence(session);

  // Phase 12: Structured Data Generation Hooks
  // Phase 14 Update: Use Authorization Headers
  const { object: streamedQuiz, submit: generateQuiz, isLoading: isQuizLoading } = useObject({
    api: "/api/chat",
    schema: quizDeckSchema,
    headers: async () => {
      const { data } = await supabase.auth.getSession();
      return { Authorization: `Bearer ${data.session?.access_token}` };
    }
  });

  const { object: streamedFlashcards, submit: generateFlashcards, isLoading: isFlashcardLoading } = useObject({
    api: "/api/chat",
    schema: flashcardDeckSchema,
    headers: async () => {
      const { data } = await supabase.auth.getSession();
      return { Authorization: `Bearer ${data.session?.access_token}` };
    }
  });

  const isAnyStructuredLoading = isQuizLoading || isFlashcardLoading;

  const SettingsToolbar = () => (
    <div className="flex items-center justify-between px-6 py-3 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800/80 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarDrawerOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{course.replace('-', ' ')}</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-800" />
        <span className="hidden sm:block text-[0.65rem] font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">
          {getSubModeLabel(currentMode)} System
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsDyslexic(!isDyslexic)}
          className={`px-3 py-1.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest transition-all border ${isDyslexic ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20" : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-700 hover:border-purple-400/50"}`}
        >
          Dyslexia: {isDyslexic ? 'ON' : 'OFF'}
        </button>
        <button 
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`hidden sm:block px-3 py-1.5 rounded-full text-[0.6rem] font-bold uppercase tracking-widest transition-all border ${isFocusMode ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-700 hover:border-emerald-400/50"}`}
        >
          Focus: {isFocusMode ? 'ON' : 'OFF'}
        </button>
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-full bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 transition-colors"
        >
          {theme === "light" ? <MoonIcon width={14} height={14} /> : <SunIcon width={14} height={14} />}
        </button>
      </div>
    </div>
  );

  // Refs so the persistence effect below can read latest values without
  // being a dependency (which would cause an infinite loop).
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

  useEffect(() => {
    if (subject && course) {
       const fetchStandards = async () => {
         const { data: { session } } = await supabase.auth.getSession();
         fetch("/api/course-standards", {
           method: "POST",
           headers: { 
             "Content-Type": "application/json",
             "Authorization": `Bearer ${session?.access_token}`
           },
           body: JSON.stringify({ subject, course })
         })
         .then(res => res.json())
         .then(data => setCourseStandards(data.standards || []))
         .catch(console.error);
       };
       fetchStandards();
    }
  }, [subject, course]);

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

  const handlePinNote = async (content, title = "Pinned Note", standardCode = null) => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return;

      const res = await fetch("/api/save-note", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ title, content, standard_code: standardCode }),
      });

      if (res.ok) {
        // Show a success state or toast (future toggle)
        console.log("Note pinned successfully!");
      }
    } catch (e) {
      console.error("Failed to pin note:", e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInput = (e) => setDraftInput(e.target.value);

  const handleFormSubmit = async (e, overrideText = null) => {
    e?.preventDefault?.();
    const text = typeof overrideText === "string" ? overrideText.trim() : draftInput.trim();
    if (!text || isLoading) return;

    setDraftInput("");
    setIsLoading(true);
    setError(null);

    const userMsg = { id: Date.now().toString(), role: "user", content: text, subMode: currentMode };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    // Cloud Persistence: User message with mode context
    saveMessageToDB(session.id, "user", text, currentMode);

    const getPayload = (formatType) => ({
      messages: newMessages,
      sessionId: session.id,
      subject,
      course,
      retrievalMode: currentMode,
      shortTermMemory: buildShortTermMemory(newMessages),
      sessionSummary: session.sessionSummary || "",
      userFacts: session.userFacts || {},
      visualState: session.visualState || {},
      format: formatType
    });

    // Phase 12: Structured Generation Interceptor
    if (text.includes("[QUIZ_V2]") || text.includes("Generate a quiz")) {
      generateQuiz(getPayload("quiz"));
      setDraftInput("");
      setIsLoading(false); // Reset loading for the regular channel
      return;
    }
    if (text.includes("[FLASHCARDS_V2]") || text.includes("Generate flashcards")) {
      generateFlashcards(getPayload("flashcards"));
      setDraftInput("");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s safety timeout

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const isMockUser = localStorage.getItem('sol_mock_user') === 'true' || session.user_id === '00000000-0000-0000-0000-000000000000' || !authSession;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authSession?.access_token}`,
          "x-sol-mock-user": isMockUser ? "true" : "false"
        },
        signal: controller.signal,
        body: JSON.stringify(getPayload("text"))
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const userFriendlyMsg = errorData.details || errorData.error || `API Error: ${res.statusText}`;
        throw new Error(userFriendlyMsg);
      }

      if (!res.body) {
        throw new Error("The server responded without a message body.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      const aiId = Date.now().toString() + "_ai";

      // Final visual reasoner — triggers fetches for %%GRAPH%% and %%IMAGE%% tokens
      const dispatchVisualReasoning = (content) => {
          // Sanitise: strip any markdown code-fence wrappers the LLM may have
          const sanitizedContent = content
            .replace(/```[^\n]*\n(%%GRAPH%%[\s\S]*?%%END_GRAPH%%)\n?```/g, "$1")
            .replace(/`(%%GRAPH%%[\s\S]*?%%END_GRAPH%%)`/g, "$1");

          // Step 1: Detect embedded GRAPH tokens
          const GRAPH_RE = /%%GRAPH%%[\s\n]*({[\s\S]*?})[\s\n]*%%END_GRAPH%%/g;
          const graphMatches = [...sanitizedContent.matchAll(GRAPH_RE)]
            .filter(m => !processedVisualsRef.current.has(`${aiId}_graph_${m[0]}`));

          if (graphMatches.length > 0) {
            const pending = graphMatches.map(() => ({ status: "pending", ggbState: null }));
            setGraphs(prev => {
              const current = prev[aiId] || [];
              return { ...prev, [aiId]: [...current, ...pending] };
            });
            graphMatches.forEach(m => processedVisualsRef.current.add(`${aiId}_graph_${m[0]}`));

            graphMatches.forEach((m, idx) => {
              let graphRequest;
              try { graphRequest = JSON.parse(m[1]); } catch { return; }
              const graphQuestion = graphRequest.question || "";
              const graphNotes = graphRequest.notes || "";
              fetch("/api/matplotlib-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: graphRequest.type || "function",
                  equations: graphRequest.equations || [],
                  label_points: graphRequest.label_points || [],
                  find: graphRequest.find || [],
                  course: graphRequest.course || course,
                  notes: graphNotes,
                  description: graphRequest.description || "",
                }),
              })
                .then(r => r.json())
                .then(data => {
                  setGraphs(prev => {
                    const arr = [...(prev[aiId] || [])];
                    if (arr[idx]) {
                      arr[idx] = data.pngBase64
                        ? { status: "done", engine: "matplotlib", pngBase64: data.pngBase64, title: data.title || graphNotes, question: graphQuestion, source: data.source, pythonCode: data.pythonCode }
                        : { status: "error" };
                    }
                    if (data.pngBase64) {
                       onUpdateSession({ ...sessionRef.current, visualState: { ...sessionRef.current.visualState, lastGraphNotes: data.title || graphNotes } });
                    }
                    return { ...prev, [aiId]: arr };
                  });
                })
                .catch(() => {
                  setGraphs(prev => {
                    const arr = [...(prev[aiId] || [])];
                    if (arr[idx]) arr[idx] = { status: "error" };
                    return { ...prev, [aiId]: arr };
                  });
                });
            });
          }

          // Step 2: Extract Image Tokens (Openverse)
          const imageMatches = [...sanitizedContent.matchAll(IMAGE_TOKEN_RE)]
            .filter(m => !processedVisualsRef.current.has(`${aiId}_image_${m[0]}`));

          if (imageMatches.length > 0) {
            const pending = imageMatches.map(() => ({ status: "pending", url: null }));
            setImages(prev => {
               const current = prev[aiId] || [];
               return { ...prev, [aiId]: [...current, ...pending] };
            });
            imageMatches.forEach(m => processedVisualsRef.current.add(`${aiId}_image_${m[0]}`));

            imageMatches.forEach(async (m, idx) => {
              let imageRequest;
              try {
                const rawJson = m[0].replace('%%IMAGE%%', '').replace('%%END_IMAGE%%', '').trim();
                imageRequest = JSON.parse(rawJson);
              } catch (e) { return; }

              const { data: { session: authSession } } = await supabase.auth.getSession();
              fetch("/api/image-search", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authSession?.access_token}` },
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
                      if (arr[idx]) arr[idx] = { status: "done", ...data, caption: imageRequest.caption };
                      return { ...prev, [aiId]: arr };
                   });
                })
                .catch(() => {
                   setImages(prev => {
                      const arr = [...(prev[aiId] || [])];
                      if (arr[idx]) arr[idx] = { status: "error" };
                      return { ...prev, [aiId]: arr };
                   });
                });
            });
          }
      };

      setMessages(prev => [...prev, { id: aiId, role: "assistant", content: "" }]);
      
      // Clear processed tokens for the new message to allow fresh visuals
      processedVisualsRef.current = new Set();

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

          // Phase 21.4: Real-time visual trigger (incremental check)
          if (aiContent.includes("%%END_GRAPH%%") || aiContent.includes("%%END_IMAGE%%")) {
              dispatchVisualReasoning(aiContent);
          }
        }
      } catch (readErr) {
        if (readErr.name === "AbortError") {
          throw new Error("The connection timed out while receiving the response.");
        }
        throw readErr;
      }

      // Detect token cutoff based on mandatory format trailer
      if (aiContent.length > 500 && !aiContent.includes("%%END_ACTIONS%%")) {
          // The string was truncated due to maxTokens limitation. Automatic Continuation.
          setTimeout(() => handleFormSubmit(null, "[ACTION: CONTINUE_GENERATION] The previous response was truncated due to token limits. Please continue exactly from where you left off, without starting a new sentence or introduction."), 1500);
      }

      // Cloud Persistence: AI message finalized with mode context
      saveMessageToDB(session.id, "assistant", aiContent, currentMode);

      // AI-Driven Navigation Parser
      const NAV_RE = /%%NAVIGATE:\s*([a-zA-Z0-9_-]+)%%/;
      const navMatch = aiContent.match(NAV_RE);
      if (navMatch && navMatch[1]) {
        const targetMode = navMatch[1].trim();
        console.log(`[AI Pilot] Automatically navigating to: ${targetMode}`);
        setCurrentMode(targetMode);
      }

      // Final visual reasoning check for any missed tokens during stream lag
      dispatchVisualReasoning(aiContent);
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

  const handleAnswer = (standardCode, isCorrect) => {
    if (!standardCode || standardCode === "unknown") return;
    
    // Cloud Persistence: Standard performance
    updateMasteryScore(standardCode, isCorrect);

    const s = sessionRef.current;
    const scores = { ...(s.userFacts?.scores || {}) };
    const current = scores[standardCode] || { correct: 0, total: 0 };
    
    scores[standardCode] = {
      correct: current.correct + (isCorrect ? 1 : 0),
      total: current.total + 1
    };

    onUpdateSession({
      ...s,
      userFacts: {
        ...s.userFacts,
        scores
      }
    });

    console.log(`[Score Tracking] Standard: ${standardCode} | Correct: ${isCorrect} | Total: ${scores[standardCode].total}`);
  };

  const activePillar = Object.entries(MODE_MAP).find(([key, pillar]) => pillar.subModes.some(sub => sub.id === currentMode))?.[0] || "review";

  return (
    <div className="flex h-full w-full gap-0 lg:gap-8 overflow-hidden bg-white dark:bg-gray-900 md:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 relative">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarDrawerOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[40] bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSidebarDrawerOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR: Learning Path (Drawer on Mobile, Flex on Large) */}
      <div className={`sidebar flex flex-col shrink-0 space-y-1 h-full py-6 px-4 border-r border-gray-100 dark:border-gray-800 overflow-y-auto custom-scrollbar transition-all duration-500 z-[45] bg-white dark:bg-gray-900
        ${isSidebarDrawerOpen ? "fixed inset-y-0 left-0 w-[240px] shadow-2xl translate-x-0" : "fixed inset-y-0 -left-64 lg:static lg:translate-x-0 lg:w-[180px] lg:flex"}
      `}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            SOL Journey
          </h2>
          <button onClick={() => setIsSidebarDrawerOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        {Object.entries(MODE_MAP).map(([pillarKey, pillarData]) => {
          const isActivePillar = activePillar === pillarKey;
          const stat = completionStats.find(s => s.modeKey === pillarKey);
          const hasSubModes = pillarKey !== 'diagnostic' && pillarKey !== 'progress';

          return (
            <div key={pillarKey} className="flex flex-col">
              {pillarKey === 'progress' && <hr className="my-4 border-gray-100 dark:border-gray-800" />}
              <div
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActivePillar ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black shadow-sm" : "font-bold text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                onClick={() => { 
                   if (!isActivePillar && pillarData.subModes.length > 0) {
                      switchSubMode(pillarData.subModes[0].id, true);
                   } 
                }}
              >
                <span className="text-[0.65rem] uppercase tracking-widest">{pillarData.label}</span>
                {stat && pillarKey !== "progress" && pillarKey !== 'diagnostic' && (
                  <span className="text-[0.6rem] font-bold opacity-60 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">
                    {stat.done}/{stat.total}
                  </span>
                )}
              </div>
              
              {hasSubModes && (
                <div className={`flex flex-col space-y-0.5 mt-1 ml-1 transition-all overflow-hidden ${isActivePillar ? "max-h-[500px] mb-4 opacity-100" : "max-h-0 opacity-0"}`}>
                  {isActivePillar && pillarData.subModes.map((sub) => (
                    <button 
                      key={sub.id} 
                      onClick={() => switchSubMode(sub.id, true)} 
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-[0.7rem] transition-all ${currentMode === sub.id ? "bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20" : "font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/40"}`}
                    >
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

      {/* MAIN CANVAS */}
      <div className={`relative flex h-full flex-col flex-1 overflow-hidden bg-white/50 dark:bg-gray-900/40 backdrop-blur-3xl ${isDyslexic ? 'dyslexia-mode' : ''}`}>
        <SettingsToolbar />
        <div className="custom-scrollbar flex-1 space-y-12 overflow-y-auto px-4 pt-12 pb-32 sm:px-6 lg:px-12" ref={chatContainerRef}>
          
          {currentMode === 'progress' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <ProgressDashboard session={session} standards={courseStandards} />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {messages.filter(m => !m.subMode || m.subMode === currentMode).map((m, idx) => {
                const isUser = m.role === "user";
                const isStreaming = isLoading && idx === messages.length - 1 && !isUser;
                
                return (
                  <div key={idx} className={`w-full max-w-[850px] animate-in fade-in flex flex-col ${isUser ? "items-end mb-10" : "items-center mb-16"}`}>
                    {isUser ? (
                      <div className="max-w-[80%] rounded-3xl rounded-br-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 shadow-sm">
                        <div className="whitespace-pre-wrap text-[0.95rem] font-semibold leading-relaxed text-gray-800 dark:text-gray-200">{String(m.content || "")}</div>
                      </div>
                    ) : (
                      <div className={`w-full transition-all duration-500 relative ${isStreaming ? "p-8 rounded-[3rem] border border-blue-100/50 dark:border-blue-900/30 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl shadow-2xl" : "bg-transparent"}`}>
                        {isStreaming && (
                          <div className="flex items-center gap-3 mb-8 text-[0.7rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] opacity-80 animate-pulse">
                            <div className="relative h-4 w-4">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                            <span>SOL Synchronizing</span>
                          </div>
                        )}
                        
                        <div className="space-y-8">
                          {splitMessageSegments(String(m.content || "")).map((seg, segIdx) => {
                            if (seg.type === 'text') {
                              if (isStreaming && seg.content.length < 5 && segIdx === 0) {
                                return <Skeleton key={segIdx} variant="text" lines={2} className="my-2" />;
                              }
                              return seg.content.trim() 
                                ? <MarkdownMessage key={segIdx} content={seg.content} isUser={false} isStreaming={isStreaming} />
                                : null;
                            }
                            if (seg.type === 'actions') {
                              if (idx !== messages.length - 1) return null;
                              return null;
                            }
                            if (seg.type === 'flashcards') {
                              return <FlashcardDeck key={segIdx} cards={(() => { try { return JSON.parse(seg.data); } catch { return []; } })()} onAnswer={handleAnswer} onNextRequested={() => handleFormSubmit(null, "[ACTION: NEXT_BATCH] Generate the next batch.")} />;
                            }
                            if (seg.type === 'mcq') {
                              const data = (() => { try { return JSON.parse(seg.data); } catch { return null; } })();
                              if (!data) return null;
                              return <AdaptiveMCQ key={segIdx} {...data} onAnswer={handleAnswer} onNextRequested={() => handleFormSubmit(null, "[ACTION: NEXT_MCQ_ADAPTIVE] Generate the next adaptive question in this loop.")} />;
                            }
                            if (seg.type === 'quiz') {
                              const data = (() => { try { return JSON.parse(seg.data); } catch { return null; } })();
                              if (!data) return null;
                              return <QuizRunner key={segIdx} {...data} onAnswer={handleAnswer} onNextRequested={() => handleFormSubmit(null, "[ACTION: NEXT_BATCH] Generate the next batch of quiz questions.")} />;
                            }
                            if (seg.type === 'graph') {
                              const g = (graphs[m.id] || [])[seg.graphIndex];
                              if (!g) return null;
                              if (g.status === "pending") return <Skeleton key={segIdx} variant="media" className="h-64 w-full rounded-2xl my-4" />;
                              if (g.status === "done") return <GraphContainer key={segIdx} {...g} />;
                              return <div key={segIdx} className="text-xs text-red-400 italic my-4">Render error.</div>;
                            }
                            if (seg.type === 'image') {
                              const img = (images[m.id] || [])[seg.imageIndex];
                              if (!img) return null;
                              return (
                                <div key={segIdx}>
                                  {img.status === "pending" && <Skeleton variant="media" className="h-64 w-full rounded-2xl my-4" />}
                                  {img.status === "done" && <OpenversePlaceholder image={img} />}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div ref={bottomRef} className="h-4 w-full" />
              
              {/* PHASE 12: ACTIVE STRUCTURED STREAMS */}
              {isQuizLoading && streamedQuiz && (
                <div className="w-full max-w-[850px] mb-16 animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[0.6rem] font-black uppercase tracking-widest text-blue-600">Syncing Structured Assessment</span>
                   </div>
                   <QuizRunner {...streamedQuiz} onAnswer={handleAnswer} onNextRequested={() => handleFormSubmit(null, "[QUIZ_V2] Generate more questions.")} />
                </div>
              )}

              {isFlashcardLoading && streamedFlashcards && (
                <div className="w-full max-w-[850px] mb-16 animate-in fade-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[0.6rem] font-black uppercase tracking-widest text-indigo-600">Assembling Knowledge Deck</span>
                   </div>
                   <FlashcardDeck cards={streamedFlashcards.cards || []} onAnswer={handleAnswer} onNextRequested={() => handleFormSubmit(null, "[FLASHCARDS_V2] Generate more cards.")} />
                </div>
              )}

            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pt-20 pb-10 px-4 flex justify-center pointer-events-none">
          <form onSubmit={handleFormSubmit} className="w-full max-w-[800px] pointer-events-auto relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                const reader = new FileReader();
                reader.onload = async (rev) => {
                  const base64 = rev.target.result;
                  try {
                    const { data: { session: authSession } } = await supabase.auth.getSession();
                    const isMockUser = localStorage.getItem('sol_mock_user') === 'true' || session.user_id === '00000000-0000-0000-0000-000000000000';
                    const res = await fetch("/api/library/upload", {
                      method: "POST",
                      headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authSession?.access_token}`,
                        "x-sol-mock-user": isMockUser ? "true" : "false"
                      },
                      body: JSON.stringify({ base64, fileName: file.name, fileType: file.type, sessionId })
                    });
                    const result = await res.json();
                    if (result.success) {
                      handleFormSubmit(null, `[ACTION: LIBRARY_SYNC] I just uploaded "${file.name}" to my library. Please analyze the concepts and index them for our session.`);
                    }
                  } catch (err) {
                    console.error("Upload failed:", err);
                  } finally {
                    setIsUploading(false);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            <button
               type="button"
               disabled={isUploading || isLoading}
               onClick={() => fileInputRef.current?.click()}
               className="absolute left-2 top-2 h-[3.1rem] w-[3.1rem] flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95 disabled:opacity-50 z-10"
               title="Librarian: Vision Support"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            </button>
            <input
              className="w-full rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-800/90 py-4 pl-16 pr-16 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-xl backdrop-blur-xl focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all"
              value={draftInput}
              onChange={handleInput}
              placeholder={isUploading ? "Reading document..." : `Ask about ${currentMode.replace('-', ' ')}...`}
            />
            <button 
              type="submit" 
              className="absolute right-2 top-2 h-[3.1rem] w-[3.1rem] flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50" 
              disabled={isLoading || !draftInput.trim()}
            >
              <SendIcon size={20} />
            </button>
          </form>
        </div>

        {error && (
          <div className="absolute top-8 inset-x-0 flex justify-center animate-in slide-in-from-top-4">
            <p className="rounded-full bg-red-100 dark:bg-red-900/50 px-5 py-2 text-[0.7rem] font-bold text-red-600 dark:text-red-400 backdrop-blur-lg shadow-xl border border-red-200 dark:border-red-800">
              {error.message || "Connection lost"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
