import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { RoughNotation } from "react-rough-notation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { buildMediumTermSummary, buildShortTermMemory } from "../lib/sessionMemoryService";
import ErrorBoundary from "./ErrorBoundary";

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

// Complete token — both delimiters present
const GRAPH_TOKEN_RE = /%%GRAPH%%[\s\S]*?%%END_GRAPH%%/g;
// Partial token — opening delimiter present but closing not yet arrived (strips during streaming)
const GRAPH_PARTIAL_RE = /%%GRAPH%%[\s\S]*$/;

const MODE_MAP = {
  diagnostic: { label: "Diagnostic", subModes: [{ id: "placement", label: "Placement Quiz" }, { id: "concept", label: "Concept Check" }] },
  review: { label: "Review", subModes: [{ id: "notes", label: "Guided Notes" }, { id: "study-guide", label: "Study Guide" }, { id: "mnemonics", label: "Mnemonics" }] },
  mastery: { label: "Mastery", subModes: [{ id: "map", label: "Knowledge Map" }, { id: "analogies", label: "Analogies" }, { id: "deep-dive", label: "Deep Dive" }] },
  practice: { label: "Practice", subModes: [{ id: "flashcards", label: "Flashcards" }, { id: "quiz", label: "Interactive Quiz" }, { id: "worksheet", label: "Worksheet" }] },
  progress: { label: "Progress", subModes: [{ id: "stats", label: "Statistics" }, { id: "achievements", label: "Achievements" }] },
};

function buildEmptyCompletionMap() {
  const completed = {};
  Object.values(MODE_MAP).forEach((mode) => {
    mode.subModes.forEach((sub) => {
      completed[sub.id] = false;
    });
  });
  return completed;
}
// End of ChatWindow component

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

/**
 * Split a message string into alternating text/graph segments so graphs
 * can be rendered inline at the exact position the token appeared.
 * Returns an array of { type: 'text'|'graph', content: string, graphIndex: number }
 */
function splitMessageSegments(content) {
  const segments = [];
  let lastIndex = 0;
  // ...function logic here...
  // (Restore splitMessageSegments to only handle splitting message content)
  return segments;
  // ...existing code...
}

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
  // graphs: { [messageId]: [{ status: 'pending'|'done'|'error', ggbState?, desmosState? }] }
  // Seeded from session.graphs so graphs survive reload and session switches.
  const [graphs, setGraphs] = useState(session.graphs || {});

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

  const updateJourney = (nextSubMode, updater) => {
    const nextJourneyBase = normalizeJourney(session, nextSubMode || currentMode);
    const nextJourney = updater ? updater(nextJourneyBase) : nextJourneyBase;
    const resolvedSubMode = nextSubMode || nextJourney.currentSubMode || currentMode;
    onUpdateSession({
      ...session,
      retrievalMode: resolvedSubMode,
      journey: {
        ...nextJourney,
        currentSubMode: resolvedSubMode,
      },
      messages,
    });
  };

  const switchSubMode = (subModeId) => {
    updateJourney(subModeId, (base) => ({ ...base, currentSubMode: subModeId }));
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

    updateJourney(currentMode, (base) => ({
      ...base,
      completed: {
        ...base.completed,
        [currentMode]: true,
      },
      completedAt: {
        ...(base.completedAt || {}),
        [currentMode]: now,
      },
    }));
  };

  const resetCurrentSubMode = () => {
    updateJourney(currentMode, (base) => ({
      ...base,
      completed: {
        ...base.completed,
        [currentMode]: false,
      },
      completedAt: {
        ...(base.completedAt || {}),
        [currentMode]: null,
      },
    }));
  };

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

  const handleFormSubmit = async (e) => {
    e?.preventDefault?.();
    const text = draftInput.trim();
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
        console.error("[ChatWindow] API Error:", errorData.error || res.statusText);
        throw new Error(errorData.error || `API Error: ${res.statusText}`);
      }

      if (!res.body) {
        console.error("[ChatWindow] The server responded without a message body.");
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

          console.log("[ChatWindow] Received chunk:", chunk);

          setMessages(prev => {
             const updated = [...prev];
             const lastIdx = updated.length - 1;
             if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                updated[lastIdx] = { ...updated[lastIdx], content: aiContent };
             }
             return updated;
          });
        }
        console.log("[ChatWindow] Finished streaming AI response.");
      } catch (readErr) {
        console.error("[ChatWindow] Streaming error:", readErr);
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
        e.preventDefault();
        if (isLoading || !draftInput.trim()) return;
        setIsLoading(true);
        setError(null);
        const userMsg = { id: Date.now().toString(), role: "user", content: draftInput };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setDraftInput("");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        let didError = false;
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
            didError = true;
            throw new Error(errorData.error || `API Error: ${res.statusText}`);
          }
          if (!res.body) {
            didError = true;
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
            didError = true;
            if (readErr.name === "AbortError") {
              setError({ message: "The connection timed out while receiving the response." });
            } else {
              setError({ message: readErr.message });
            }
          }
        } catch (err) {
          didError = true;
          e.preventDefault();
          if (isLoading || !draftInput.trim()) return;
          setIsLoading(true);
          setError(null);
          const userMsg = { id: Date.now().toString(), role: "user", content: draftInput };
          const newMessages = [...messages, userMsg];
          setMessages(newMessages);
          setDraftInput("");
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);
          let didError = false;
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
              didError = true;
              throw new Error(errorData.error || `API Error: ${res.statusText}`);
            }
            if (!res.body) {
              didError = true;
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
              didError = true;
              if (readErr.name === "AbortError") {
                setError({ message: "The connection timed out while receiving the response." });
              } else {
                setError({ message: readErr.message });
              }
            }
          } catch (err) {
            didError = true;
            setError({ message: err.message });
          } finally {
            setIsLoading(false);
            if (didError) {
              // Optionally, focus the input or take other recovery actions here
            }
          }
        };
        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8 flex flex-col items-center">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            const isStreaming = isLoading && idx === messages.length - 1 && !isUser; 
          </div>
          <div className="relative flex h-full flex-col flex-1 overflow-hidden bg-transparent">
            return (
              <div key={idx} className={`w-full max-w-[800px] animate-in fade-in flex ${isUser ? "justify-end" : "justify-center"}`}>
                 {isUser ? (
                   <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 px-5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] dark:shadow-black/20">
                     <div className="whitespace-pre-wrap text-[0.95rem] font-medium leading-relaxed text-gray-800 dark:text-gray-100">{String(m.content || "")}</div>
                   </div>
                 ) : (
                   <div className={`w-full max-w-[750px] px-4 md:px-6 py-4 transition-all duration-500 relative ${isStreaming ? "rounded-xl border border-blue-200/60 dark:border-blue-900/40 shadow-[0_15px_50px_rgba(59,130,246,0.05)] bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl" : "bg-transparent"}`}>
                     {isStreaming && (
                       <div className="flex items-center justify-center mb-4">
                         <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                           <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                         </svg>
                         <span className="ml-3 text-base font-semibold text-blue-700 dark:text-blue-300">Loading...</span>
                       </div>
                     )}
                     {splitMessageSegments(String(m.content || "")).map((seg, segIdx) => {
                       if (seg.type === 'text') {
                         return seg.content.trim()
                           ? <MarkdownMessage key={segIdx} content={seg.content} isUser={false} isMinimalMode={isMinimalMode} />
                           : null;
                       }
                       const g = (graphs[m.id] || [])[seg.graphIndex];
                       if (!g || isMinimalMode) return null;
                       return (
                         <div key={segIdx}>
                           {g.status === "pending" && (
                             <div className="flex items-center gap-2 my-6 text-xs font-semibold text-blue-500 uppercase tracking-widest opacity-60">
                               <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                               Generating diagram…
                             </div>
                           )}
                           {g.status === "done" && g.engine === "desmos" && <DesmosRenderer state={g.desmosState} />}
                           {g.status === "done" && g.engine !== "desmos" && <GeoGebraRenderer state={g.ggbState} />}
                           {g.status === "done" && g.mode === "question" && g.question && (
                             <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-sm">
                               <span className="mt-0.5 text-sm leading-none">❓</span>
                               <span>{g.question}</span>
                             </div>
                           )}
                           {g.status === "error" && (
                             <p className="text-xs text-red-400 italic my-4">Diagram could not be generated.</p>
                           )}
                         </div>
                       );
                     })}
                   </div>
                 )}
              </div>
            );
          })}
          <div ref={bottomRef} className="h-8" />
        </div>

        {/* Diagnostic bubble below first message if in initial diagnostic state */}
        {messages && messages.length === 1 && currentMode === "placement" && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-28 z-20 flex flex-col items-center w-full max-w-[400px] pointer-events-auto">
            <div className="rounded-2xl border border-blue-200 dark:border-blue-700 bg-blue-50/90 dark:bg-blue-900/80 px-5 py-4 shadow-xl flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
              <div className="text-[0.95rem] font-bold text-blue-900 dark:text-blue-100 text-center">Would you like to begin with a quick diagnostic?</div>
              <div className="flex gap-3 mt-1">
                <button
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700 transition-colors"
                  onClick={async () => {
                    switchSubMode("placement");
                    // Add a system message to trigger the AI diagnostic question
                    setIsLoading(true);
                    setError(null);
                    const userMsg = { id: Date.now().toString(), role: "user", content: "Start diagnostic" };
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
                          retrievalMode: "placement",
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
                    } catch (err) {
                      setError({ message: err.message });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Continue with Diagnostic
                </button>
                <button
                  className="rounded-lg bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => switchSubMode("concept")}
                >
                  Skip Diagnostic
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="absolute bottom-4 inset-x-0 flex justify-center px-4 pointer-events-none w-full">
          <div className="w-full max-w-[850px] pointer-events-auto flex items-center gap-2 rounded-xl bg-white/90 dark:bg-gray-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-1 transition-shadow focus-within:ring-4 focus-within:ring-blue-500/10">
            <input
              className="flex-1 bg-transparent py-2.5 pl-5 pr-14 text-[0.95rem] font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              value={draftInput}
              onChange={handleInput}
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
