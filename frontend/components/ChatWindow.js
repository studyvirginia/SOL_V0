import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { RoughNotation } from "react-rough-notation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { buildMediumTermSummary, buildShortTermMemory } from "../lib/sessionMemoryService";
import { MODE_MAP } from "../lib/modeMap";
import ErrorBoundary from "./ErrorBoundary";

const FlashcardDeck = dynamic(() => import("./learning/FlashcardDeck"), { ssr: false });
const AdaptiveMCQ = dynamic(() => import("./learning/AdaptiveMCQ"), { ssr: false });
const QuizRunner = dynamic(() => import("./learning/QuizRunner"), { ssr: false });


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

function getModeKeyFromSubMode(subModeId) {
  return Object.entries(MODE_MAP).find(([, mode]) => mode.subModes.some((sub) => sub.id === subModeId))?.[0] || "review";
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
  const currentModeKey = getModeKeyFromSubMode(currentSubMode);
  const modeOrder = Object.keys(MODE_MAP);
  const currentMode = MODE_MAP[currentModeKey] || MODE_MAP.review;

  const inCurrentMode = currentMode.subModes.find((sub) => !completedMap[sub.id] && sub.id !== currentSubMode);
  if (inCurrentMode) {
    return { subModeId: inCurrentMode.id, modeKey: currentModeKey, reason: "Continue in current mode" };
  }

  const currentIndex = modeOrder.indexOf(currentModeKey);
  for (let offset = 1; offset <= modeOrder.length; offset++) {
    const modeKey = modeOrder[(currentIndex + offset) % modeOrder.length];
    const mode = MODE_MAP[modeKey];
    const nextIncomplete = mode.subModes.find((sub) => !completedMap[sub.id]);
    if (nextIncomplete) {
      return { subModeId: nextIncomplete.id, modeKey, reason: "Recommended next step" };
    }
  }

  return null;
}

function getSubModeLabel(subModeId) {
  for (const mode of Object.values(MODE_MAP)) {
    const found = mode.subModes.find((sub) => sub.id === subModeId);
    if (found) return found.label;
  }
  return subModeId;
}

function splitMessageSegments(content) {
  const segments = [];
  const ACTION_TOKEN_RE = /%%ACTIONS%%([\s\S]*?)%%END_ACTIONS%%/g;
  const GRAPH_RE = /%%GRAPH%%[\s\n]*({[\s\S]*?})[\s\n]*%%END_GRAPH%%/g;
  const FLASHCARDS_RE = /%%FLASHCARDS%%([\s\S]*?)%%END_FLASHCARDS%%/g;
  const MCQ_RE = /%%MCQ%%([\s\S]*?)%%END_MCQ%%/g;
  const QUIZ_RE = /%%QUIZ%%([\s\S]*?)%%END_QUIZ%%/g;


  let lastIndex = 0;
  const matches = [
    ...content.matchAll(ACTION_TOKEN_RE),
    ...content.matchAll(GRAPH_RE),
    ...content.matchAll(FLASHCARDS_RE),
    ...content.matchAll(MCQ_RE),
    ...content.matchAll(QUIZ_RE)
  ].sort((a, b) => a.index - b.index);

  let graphCounter = 0;
  matches.forEach((m) => {
    if (m.index > lastIndex) {
      segments.push({ type: 'text', content: content.slice(lastIndex, m.index) });
    }
    if (m[0].startsWith('%%ACTIONS%%')) {
      segments.push({ type: 'actions', data: m[1] });
    } else if (m[0].startsWith('%%GRAPH%%')) {
      segments.push({ type: 'graph', data: m[1], graphIndex: graphCounter++ });
    } else if (m[0].startsWith('%%FLASHCARDS%%')) {
      segments.push({ type: 'flashcards', data: m[1] });
    } else if (m[0].startsWith('%%MCQ%%')) {
      segments.push({ type: 'mcq', data: m[1] });
    } else if (m[0].startsWith('%%QUIZ%%')) {
      segments.push({ type: 'quiz', data: m[1] });
    }
    lastIndex = m.index + m[0].length;
  });

  if (lastIndex < content.length) {
    segments.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return segments;
}

const preprocessMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\[h\]([\s\S]*?)\[\/h\]/g, '[$1](#annotation-h)')
    .replace(/\[c\]([\s\S]*?)\[\/c\]/g, '[$1](#annotation-c)')
    .replace(/\[u\]([\s\S]*?)\[\/u\]/g, '[$1](#annotation-u)')
    .replace(/\[b\]([\s\S]*?)\[\/b\]/g, '[$1](#annotation-b)');
};

const MarkdownMessage = ({ content, isUser }) => (
  <div className={`prose prose-sm dark:prose-invert max-w-none ${isUser ? "text-white" : "text-gray-800 dark:text-gray-200"}`}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <p className="leading-relaxed mb-4 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ inline, className, children }) => {
          if (inline) return <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-blue-600 dark:text-blue-400">{children}</code>;
          return <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto my-4">{children}</pre>;
        },
        a: ({ href, children }) => {
          if (href?.startsWith('#annotation-')) {
            const type = href.split('-')[1];
            const notationType = type === 'h' ? 'highlight' : type === 'c' ? 'circle' : type === 'u' ? 'underline' : 'box';
            const color = type === 'h' ? '#fef08a' : type === 'c' ? '#f87171' : type === 'u' ? '#60a5fa' : '#4ade80';
            return (
              <RoughNotation 
                type={notationType} 
                show={true} 
                color={color} 
                strokeWidth={2}
                animationDuration={1500}
                multiline={true}
              >
                <span>{children}</span>
              </RoughNotation>
            );
          }
          return <a href={href} className="text-blue-500 hover:text-blue-600 underline font-semibold" target="_blank" rel="noopener noreferrer">{children}</a>;
        }
      }}
    >
      {preprocessMarkdown(content)}
    </ReactMarkdown>
  </div>
);


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

export default function ChatWindow({ session, onUpdateSession, graphEngine = "geogebra", isMinimalMode = false }) {
  const bottomRef = useRef(null);

  const subject = session.subject || "";
  const course = session.course || "";
  const sessionFocus = session.sessionFocus || "";
  const journey = normalizeJourney(session, session.retrievalMode || "notes");
  const currentMode = journey.currentSubMode || "notes";
  const completionStats = getModeCompletionStats(journey.completed);
  const recommended = getRecommendedSubMode(currentMode, journey.completed);

  const [messages, setMessages] = useState(session.messages || []);
  const [draftInput, setDraftInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphs, setGraphs] = useState(session.graphs || {});

  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  const sendMessage = async (text, targetSubMode = currentMode) => {
    if (!text || isLoading) return;
    
    setDraftInput("");
    setIsLoading(true);
    setError(null);

    const userMsg = { 
      id: Date.now().toString(), 
      role: "user", 
      content: text, 
      subMode: targetSubMode 
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); 

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
          retrievalMode: targetSubMode,
          shortTermMemory: buildShortTermMemory(newMessages),
          sessionSummary: session.sessionSummary || "",
          userFacts: { ...session.userFacts, completedMap: journey.completed },
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      const aiId = Date.now().toString() + "_ai";
      setMessages(prev => [...prev, { id: aiId, role: "assistant", content: "", subMode: targetSubMode }]);

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

      const GRAPH_RE = /%%GRAPH%%[\s\n]*({[\s\S]*?})[\s\n]*%%END_GRAPH%%/g;
      const graphMatches = [...aiContent.matchAll(GRAPH_RE)];
      if (graphMatches.length > 0) {
        setGraphs(prev => ({ ...prev, [aiId]: graphMatches.map(() => ({ status: "pending" })) }));
        graphMatches.forEach((m, idx) => {
          let graphRequest;
          try { graphRequest = JSON.parse(m[1]); } catch { return; }
          const endpoint = graphEngine === "desmos" ? "/api/desmos-generate" : "/api/geogebra-generate";
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(graphRequest),
          })
          .then(r => r.json())
          .then(data => {
            setGraphs(prev => {
              const arr = [...(prev[aiId] || [])];
              arr[idx] = graphEngine === "desmos"
                ? { status: "done", engine: "desmos", desmosState: data.desmosState, question: graphRequest.question, mode: graphRequest.mode }
                : { status: "done", engine: "geogebra", ggbState: data.ggbState, question: graphRequest.question, mode: graphRequest.mode };
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
      setError({ message: err.message });
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
       sendMessage(`Start ${getSubModeLabel(newSubMode)} mode`, newSubMode);
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
    if (messages && messages.length > 0) {
       onUpdateSession({ ...sessionRef.current, messages, graphs });
    }
  }, [messages, graphs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isLoading || messages.length < 2) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== "assistant" || !lastMsg.content || journey.completed[currentMode]) return;
    
    let shouldComplete = false;
    if ((currentMode === "notes" || currentMode === "study-guide") && lastMsg.content.length > 500) shouldComplete = true;
    if (currentMode === "map" && lastMsg.content.includes("%%GRAPH%%")) shouldComplete = true;
    if (currentMode === "flashcards" && messages.filter(m => m.subMode === "flashcards").length >= 4) shouldComplete = true;

    if (shouldComplete) markCurrentSubModeComplete();
  }, [messages, isLoading]);

  return (
    <div className="flex h-full w-full gap-4 md:gap-6">
      <div className="w-[140px] hidden lg:flex flex-col shrink-0 h-full py-4 text-gray-800 dark:text-gray-300 gap-0.5">
         <div className="flex flex-col mb-4 px-1">
           <div className="text-[0.95rem] font-black text-blue-800 dark:text-blue-200 leading-tight truncate">{formatName(course) || formatName(subject)}</div>
           <div className="text-[0.7rem] font-bold uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70 mt-1">{sessionFocus} Prep</div>
         </div>
         <h2 className="text-[0.6rem] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4 px-1">Learning Path</h2>
         {Object.entries(MODE_MAP).map(([pillarKey, pillarData]) => {
           const active = getModeKeyFromSubMode(currentMode) === pillarKey;
           const stat = completionStats.find(s => s.modeKey === pillarKey);
           const showSubModes = pillarData.subModes.length > 1;
           const showStat = pillarKey !== "progress";

           return (
             <div key={pillarKey} className="flex flex-col">
               {pillarKey === "progress" && <div className="h-px bg-gray-200 dark:bg-gray-700/60 mt-4 mb-2 mx-1" />}
               <div 
                 className={`flex items-center justify-between py-1.5 px-1 border-b border-gray-100 dark:border-gray-800/50 mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md transition-colors`}
                 onClick={() => { if (!active && pillarData.subModes.length > 0) switchSubMode(pillarData.subModes[0].id, false); }}
               >
                 <span className={`text-[0.65rem] font-black uppercase tracking-widest ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 opacity-60"}`}>{pillarData.label}</span>
                 {stat && showStat && <span className="text-[0.62rem] font-bold opacity-80">{stat.done}/{stat.total}</span>}
               </div>
               {active && showSubModes && (
                 <div className="flex flex-col space-y-0.5 mb-2 animate-in slide-in-from-top-1 duration-300">
                   {pillarData.subModes.map((sub) => (
                     <button key={sub.id} onClick={() => switchSubMode(sub.id, true)} className={`group relative flex items-center justify-between rounded-md px-2 py-1.5 text-[0.7rem] transition-all ${currentMode === sub.id ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20" : "font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50"}`}>
                       <span className="truncate pr-4">{sub.label}</span>
                       <span className="flex-shrink-0 text-[0.65rem]">{journey.completed[sub.id] ? "✓" : recommended?.subModeId === sub.id ? "★" : ""}</span>
                     </button>
                   ))}
                 </div>
               )}
             </div>
           );
         })}
      </div>

      <div className="relative flex h-full flex-col flex-1 overflow-hidden bg-transparent">
        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8 flex flex-col items-center">
          {messages.filter(m => m.subMode === currentMode || (!m.subMode && (m.role === 'user' || currentMode === 'diagnostic' || currentMode === 'notes'))).map((m, idx, filteredMsgs) => {
            const isUser = m.role === "user";
            const isStreaming = isLoading && idx === filteredMsgs.length - 1 && !isUser;
            return (
              <div key={idx} className={`w-full max-w-[800px] animate-in fade-in flex ${isUser ? "justify-end" : "justify-center"}`}>
                 {isUser ? (
                   <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 px-5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:shadow-black/20">
                     <div className="whitespace-pre-wrap text-[0.95rem] font-medium leading-relaxed text-gray-800 dark:text-gray-100">{String(m.content || "")}</div>
                   </div>
                 ) : (
                   <div className={`w-full max-w-[750px] px-4 md:px-6 py-4 transition-all duration-500 relative ${isStreaming ? "rounded-xl border border-blue-200/60 dark:border-blue-900/40 shadow-[0_15px_50px_rgba(59,130,246,0.05)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl" : "bg-transparent"}`}>
                     {isStreaming && (
                       <div className="flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400"><svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
                     )}
                     {splitMessageSegments(String(m.content || "")).map((seg, segIdx) => {
                       if (seg.type === 'text') return <MarkdownMessage key={segIdx} content={seg.content} isUser={false} isMinimalMode={isMinimalMode} />;
                       if (seg.type === 'actions') return <QuickActions key={segIdx} actions={(() => { try { return JSON.parse(seg.data); } catch { return []; } })()} onSwitch={switchSubMode} onSend={sendMessage} currentSubMode={currentMode} />;
                       if (seg.type === 'flashcards') return <FlashcardDeck key={segIdx} cards={(() => { try { return JSON.parse(seg.data); } catch { return []; } })()} />;
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
                       const g = (graphs[m.id] || [])[seg.graphIndex];
                       if (!g || isMinimalMode) return null;
                       return (
                         <div key={segIdx}>
                           {g.status === "pending" && <div className="text-xs text-blue-500 uppercase tracking-widest opacity-60 my-4 animate-pulse">Generating diagram…</div>}
                           {g.status === "done" && (g.engine === "desmos" ? <DesmosRenderer state={g.desmosState} /> : <GeoGebraRenderer state={g.ggbState} />)}
                           {g.status === "error" && <p className="text-xs text-red-400 italic my-4">Diagram failed.</p>}
                         </div>
                       );
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
              const pk = getModeKeyFromSubMode(currentMode);
              const lat = MODE_MAP[pk].subModes.filter(s => s.id !== currentMode && !journey.completed[s.id]).map(s => s.id);
              const pks = Object.keys(MODE_MAP);
              const nk = pks[pks.indexOf(pk) + 1];
              return [...lat, nk].filter(Boolean);
            })()} currentSubMode={currentMode} onSwitch={switchSubMode} onSend={sendMessage} />
          )}
          <div className="h-24" />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(draftInput.trim()); }} className="absolute bottom-4 inset-x-0 flex justify-center px-4 pointer-events-none w-full">
          <div className="w-full max-w-[850px] pointer-events-auto flex items-center gap-2 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-1 transition-shadow focus-within:ring-4 focus-within:ring-blue-500/10">
            <input
              className="flex-1 bg-transparent py-2.5 pl-5 pr-14 text-[0.95rem] font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              value={draftInput}
              onChange={(e) => setDraftInput(e.target.value)}
              placeholder="Ask a mathematical question..."
            />
            <button type="submit" className="flex h-[2.5rem] w-[2.5rem] items-center justify-center rounded-lg bg-blue-600 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50" disabled={isLoading || !draftInput.trim()}>
              <SendIcon className="h-4 w-4" />
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
