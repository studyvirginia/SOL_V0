/**
 * /tool-test — Tool Calling Debug Dashboard
 *
 * Tests Flashcards, MCQ, and Quiz tool calling end-to-end.
 * Uses plain fetch() — no useChat, no SDK hooks, no ambiguity.
 */
import { useState, useRef } from "react";
import FlashcardDeck from "../components/learning/FlashcardDeck";
import AdaptiveMCQ from "../components/learning/AdaptiveMCQ";
import QuizRunner from "../components/learning/QuizRunner";

const PRESETS = [
  { label: "Flashcards — Limits",       prompt: "Give me 5 flashcards on limits in calculus",            tool: "showFlashcards" },
  { label: "Flashcards — Water Cycle",  prompt: "Create vocabulary flashcards for the water cycle",       tool: "showFlashcards" },
  { label: "MCQ — Derivatives",         prompt: "Give me a single practice multiple choice question on derivatives", tool: "showMCQ" },
  { label: "MCQ — Newton's Laws",       prompt: "Give me one MCQ question about Newton's three laws of motion",      tool: "showMCQ" },
  { label: "Quiz — Photosynthesis",     prompt: "Create a 5-question quiz on photosynthesis",             tool: "showQuiz" },
  { label: "Quiz — US History",         prompt: "Create a 4-question quiz on the American Civil War",     tool: "showQuiz" },
  { label: "Actions — After lesson",    prompt: "I just finished learning about the water cycle. What should I do next?", tool: "showActions" },
  { label: "Actions — After quiz",      prompt: "I scored 3 out of 5 on a photosynthesis quiz. Recommend my next steps.", tool: "showActions" },
];

const TOOL_COLORS = {
  showFlashcards: { badge: "bg-blue-600",   label: "Flashcards",  border: "border-blue-800" },
  showMCQ:        { badge: "bg-violet-600", label: "MCQ",         border: "border-violet-800" },
  showQuiz:       { badge: "bg-emerald-600",label: "Quiz",        border: "border-emerald-800" },
  showActions:    { badge: "bg-amber-600",  label: "Actions",     border: "border-amber-800" },
};

function EventBadge({ entry }) {
  const isToolEvent = entry.type.startsWith("tool-");
  const color = isToolEvent
    ? "text-violet-300 border-violet-800/60 bg-violet-950/30"
    : entry.type === "error"
    ? "text-red-300 border-red-800/60 bg-red-950/30"
    : entry.type === "done" || entry.type === "finish"
    ? "text-emerald-300 border-emerald-800/60 bg-emerald-950/30"
    : entry.type === "meta"
    ? "text-blue-300 border-blue-800/60 bg-blue-950/30"
    : "text-gray-500 border-gray-800/40 bg-gray-900/10";

  return (
    <div className={`rounded border px-2 py-1 text-[0.62rem] font-mono leading-relaxed ${color}`}>
      <span className="font-black mr-2 opacity-60">[{entry.type}]</span>
      <span className="break-all whitespace-pre-wrap">{entry.text}</span>
    </div>
  );
}

export default function ToolTestPage() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [toolResults, setToolResults] = useState({}); // { toolName: args } — supports multiple per response
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [activePreset, setActivePreset] = useState(null);
  const bottomRef = useRef(null);

  // Backwards compat: single toolResult still works
  const toolResult = Object.keys(toolResults).length > 0
    ? { toolName: Object.keys(toolResults)[0], args: Object.values(toolResults)[0] }
    : null;

  const appendLog = (entry) => {
    setLog((prev) => [...prev, entry]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
  };

  const send = async (text) => {
    if (!text.trim() || status === "loading") return;
    setLog([]);
    setToolResults({});
    setErrorMsg("");
    setStatus("loading");

    appendLog({ type: "meta", text: `POST /api/tool-test  →  "${text.trim()}"` });

    try {
      const res = await fetch("/api/tool-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text.trim() }] }),
      });

      appendLog({ type: "meta", text: `HTTP ${res.status} ${res.statusText}` });

      if (!res.ok) {
        const body = await res.text();
        appendLog({ type: "error", text: body });
        setErrorMsg(body);
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") { appendLog({ type: "done", text: "[DONE]" }); continue; }

          let parsed;
          try { parsed = JSON.parse(raw); } catch { continue; }
          appendLog({ type: parsed.type, text: raw });

          if (parsed.type === "tool-input-available" && parsed.input && parsed.toolName) {
            setToolResults(prev => ({ ...prev, [parsed.toolName]: parsed.input }));
          }
        }
      }
      setStatus("done");
    } catch (e) {
      appendLog({ type: "error", text: String(e) });
      setErrorMsg(String(e));
      setStatus("error");
    }
  };

  const toolEvents = log.filter(e => e.type.startsWith("tool-")).length;
  const toolColor = toolResult ? TOOL_COLORS[toolResult.toolName] : null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/90 backdrop-blur px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full transition-colors ${
            status === "loading" ? "bg-yellow-400 animate-pulse" :
            status === "done" ? "bg-emerald-500" :
            status === "error" ? "bg-red-500" : "bg-gray-600"
          }`} />
          <span className="text-sm font-bold text-gray-200 tracking-tight">Tool Calling Debug Dashboard</span>
          <span className="hidden sm:block text-[0.6rem] font-mono text-gray-600 bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700">
            fetch → /api/tool-test
          </span>
        </div>
        <div className="flex items-center gap-3">
          {toolResult && (
            <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white ${toolColor?.badge}`}>
              {toolColor?.label} received
            </span>
          )}
          <span className={`text-[0.6rem] font-black uppercase tracking-widest ${
            status === "loading" ? "text-yellow-400" :
            status === "done" ? "text-emerald-400" :
            status === "error" ? "text-red-400" : "text-gray-700"
          }`}>{status}</span>
        </div>
      </div>

      {/* Presets */}
      <div className="px-5 pt-3 pb-2 flex flex-wrap gap-2 shrink-0 border-b border-gray-800/50">
        {PRESETS.map((p, i) => {
          const tc = TOOL_COLORS[p.tool];
          const isActive = activePreset === i;
          return (
            <button
              key={i}
              onClick={() => { setActivePreset(i); setInput(p.prompt); send(p.prompt); }}
              disabled={status === "loading"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.65rem] font-bold border transition-all active:scale-95 disabled:opacity-40 ${
                isActive
                  ? `${tc.badge} border-transparent text-white`
                  : `bg-gray-800/60 ${tc.border} text-gray-400 hover:text-gray-200`
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tc.badge}`} />
              {p.label}
            </button>
          );
        })}
      </div>

      {/* 2-panel layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — SSE event log */}
        <div className="w-[42%] border-r border-gray-800 flex flex-col overflow-hidden font-mono">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gray-900/40">
            <span className="text-[0.58rem] font-black uppercase tracking-widest text-violet-400">Raw SSE Events</span>
            <div className="flex items-center gap-3">
              <span className={`text-[0.58rem] font-black uppercase tracking-widest ${toolEvents > 0 ? "text-violet-400" : "text-gray-700"}`}>
                {toolEvents} tool events
              </span>
              <span className="text-[0.58rem] text-gray-700">{log.length} total</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {log.length === 0 && (
              <p className="text-center text-gray-700 text-xs py-10 font-sans">
                Click a preset to fire a request.
                <br />
                <span className="text-violet-600 font-mono text-[0.6rem]">tool-input-*</span> events appear in purple.
              </p>
            )}
            {log.map((entry, i) => <EventBadge key={i} entry={entry} />)}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 p-3 flex gap-2 shrink-0">
            <input
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500 font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setActivePreset(null); send(input); } }}
              placeholder="Custom prompt..."
              disabled={status === "loading"}
            />
            <button
              onClick={() => { setActivePreset(null); send(input); }}
              disabled={status === "loading" || !input.trim()}
              className="px-4 py-2 rounded-lg bg-violet-700 text-white text-[0.65rem] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-violet-600 active:scale-95 transition-all"
            >
              Send
            </button>
          </div>
        </div>

        {/* RIGHT — rendered output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gray-900/40">
            <span className="text-[0.58rem] font-black uppercase tracking-widest text-emerald-400">
              Rendered Components
            </span>
            <div className="flex items-center gap-1.5">
              {Object.keys(toolResults).map(name => (
                <span key={name} className={`text-[0.58rem] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded ${TOOL_COLORS[name]?.badge || 'bg-gray-600'}`}>
                  {name}
                </span>
              ))}
              {Object.keys(toolResults).length === 0 && (
                <span className="text-[0.58rem] text-gray-700">awaiting tool-input-available...</span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6">
            {Object.keys(toolResults).length > 0 ? (
              <>
                {/* Primary components */}
                {toolResults.showFlashcards?.cards && (
                  <FlashcardDeck cards={toolResults.showFlashcards.cards} />
                )}
                {toolResults.showMCQ && (
                  <AdaptiveMCQ
                    question={toolResults.showMCQ.question}
                    options={toolResults.showMCQ.options}
                    answer={toolResults.showMCQ.answer}
                    explanation={toolResults.showMCQ.explanation}
                    mode={toolResults.showMCQ.mode || "practice"}
                  />
                )}
                {toolResults.showQuiz && (
                  <QuizRunner
                    title={toolResults.showQuiz.title}
                    questions={toolResults.showQuiz.questions}
                    mode={toolResults.showQuiz.mode || "practice"}
                  />
                )}

                {/* Actions row — renders below any primary component, or standalone */}
                {toolResults.showActions?.actions && (
                  <div className="w-full max-w-lg">
                    <div className="text-[0.58rem] font-black uppercase tracking-widest text-amber-500 mb-3">
                      showActions — {toolResults.showActions.actions.length} buttons
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {toolResults.showActions.actions.map((act, i) => (
                        <div key={i} className="group relative">
                          <button
                            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.7rem] font-bold transition-all shadow-sm ring-1 ring-inset active:scale-95 bg-indigo-600 text-white ring-indigo-500 hover:bg-indigo-700"
                            onClick={() => alert(`Would send: "${act.prompt}"${act.targetMode ? `\nMode: ${act.targetMode}` : ''}`)}
                          >
                            {act.label}
                          </button>
                          {act.reason && (
                            <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-48 text-[0.6rem] bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1.5 z-10 leading-relaxed">
                              {act.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {toolResults.showActions.actions[0]?.reason && (
                      <p className="text-[0.58rem] text-gray-600 mt-2">Hover a button to see its reason</p>
                    )}
                  </div>
                )}
              </>
            ) : status === "done" ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="h-12 w-12 rounded-full bg-red-900/20 border border-red-800 flex items-center justify-center mb-4">
                  <span className="text-red-500 text-xl font-black">!</span>
                </div>
                <p className="text-sm font-bold text-red-400 mb-2">Stream complete — no tool invocation</p>
                <p className="text-xs text-gray-600">The model responded but did not call a tool. Check the SSE log.</p>
              </div>
            ) : status === "error" ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <p className="text-sm font-bold text-red-400 mb-2">Request failed</p>
                <pre className="text-xs text-red-600 break-all whitespace-pre-wrap">{errorMsg}</pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <div className="flex gap-2">
                  {Object.entries(TOOL_COLORS).map(([name, c]) => (
                    <div key={name} className={`h-2 w-2 rounded-full ${c.badge} opacity-40`} />
                  ))}
                </div>
                <p className="text-xs text-gray-700">Click a preset to test a component.</p>
              </div>
            )}
          </div>

          {/* Stats footer */}
          <div className="border-t border-gray-800 px-4 py-2.5 grid grid-cols-4 gap-2 shrink-0 bg-gray-900/30">
            {[
              { label: "Events",       value: log.length },
              { label: "Tool events",  value: toolEvents, hi: toolEvents > 0 },
              { label: "Tools fired",  value: Object.keys(toolResults).length, hi: Object.keys(toolResults).length > 0 },
              { label: "Status",       value: status },
            ].map((s, i) => (
              <div key={i} className="rounded bg-gray-800/50 px-2 py-1.5 text-[0.58rem]">
                <div className="text-gray-600 mb-0.5 uppercase tracking-widest font-bold">{s.label}</div>
                <div className={`font-bold truncate ${s.hi ? "text-emerald-400" : "text-gray-400"}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
