import React, { useState, useRef, useEffect } from 'react';
import PythonVisual from '../components/learning/PythonVisual';

const QUICK_PROMPTS = [
  { label: "Sine Wave", prompt: "Draw y = sin(x) from -2π to 2π using matplotlib", engine: "python" },
  { label: "Unit Circle", prompt: "Plot the unit circle with points at 0°, 90°, 180°, 270° using matplotlib", engine: "python" },
  { label: "Quadratic", prompt: "Graph y = x² - 4x + 3 and label the roots and vertex using matplotlib", engine: "python" },
  { label: "System of Eq.", prompt: "Show the intersection of y = 2x + 1 and y = -x + 4 using matplotlib", engine: "python" },
  { label: "Vectors", prompt: "Draw vectors F1=(3,0) and F2=(0,4) and their resultant using matplotlib", engine: "python" },
  { label: "Normal Dist.", prompt: "Use matplotlib to plot a normal distribution with mean 0 and std dev 1", engine: "python" },
  { label: "3D Saddle", prompt: "Use matplotlib to render a 3D surface plot of f(x,y) = x² - y²", engine: "python" },
  { label: "Box Plot", prompt: "Use matplotlib to show a box plot comparing 3 groups of test scores", engine: "python" },
  { label: "Histogram", prompt: "Use matplotlib to plot a histogram of 1000 random normal samples", engine: "python" },
  { label: "Scatter + Line", prompt: "Use matplotlib to create a scatter plot with a linear regression line", engine: "python" },
];

function MessageBubble({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-violet-600 text-white px-5 py-3 rounded-2xl rounded-br-md text-sm font-medium max-w-lg shadow-lg shadow-violet-600/20">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Assistant text */}
      {msg.content && (
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-lg shadow-violet-500/30 mt-0.5">
            AI
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 px-5 py-4 rounded-2xl rounded-tl-md text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl shadow-sm">
            {msg.content}
            {msg._streaming && (
              <span className="inline-block w-1.5 h-4 bg-violet-400 ml-1 animate-pulse rounded" />
            )}
          </div>
        </div>
      )}

      {/* Tool results — rendered inline after text */}
      {msg.toolResults && msg.toolResults.length > 0 && msg.toolResults.map((tr, j) => (
        <div key={j} className="ml-11">
          {/* Python: showPython tool returns chartData (base64 or SVG) pre-executed by E2B */}
          {tr.chartData && (
            <PythonVisual
              chartData={tr.chartData}
              title={tr.title}
              caption={tr.caption}
              code={tr.code}
              error={tr.error}
              logs={tr.logs}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AiSandbox() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const runPrompt = async (promptText) => {
    const text = promptText || prompt;
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    const userMsg = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setPrompt('');

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          sessionId: 'ai-sandbox',
          subject: 'Math',
          course: 'Algebra 1',
          userFacts: { areaOfFocus: 'Visual Math Exploration' },
        }),
      });

      if (!resp.ok) throw new Error(`Server returned ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let textContent = '';
      let toolResults = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'text-delta') {
              textContent += event.delta || '';
              // Live streaming update
              setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?._streaming) {
                  next[next.length - 1] = { role: 'assistant', content: textContent, toolResults: [], _streaming: true };
                } else {
                  next.push({ role: 'assistant', content: textContent, toolResults: [], _streaming: true });
                }
                return next;
              });
            } else if (event.type === 'tool-output-available') {
              if (event.output) toolResults.push(event.output);
            }
          } catch {}
        }
      }

      // Finalize with all tool results
      const finalMsg = { role: 'assistant', content: textContent, toolResults };
      setMessages(prev => {
        const next = [...prev];
        if (next[next.length - 1]?._streaming) {
          next[next.length - 1] = finalMsg;
        } else {
          next.push(finalMsg);
        }
        return next;
      });

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-black text-sm">🐍</span>
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight">SOL AI Sandbox</h1>
              <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Matplotlib Scientific Engine</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-2">What should we visualize?</h2>
              <p className="text-slate-500 text-sm max-w-md">
                Describe any math or science concept. The AI will generate a high-fidelity scientific visualization using Matplotlib.
              </p>
            </div>

            {/* Quick prompts grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full max-w-2xl mt-4">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => runPrompt(qp.prompt)}
                  className="group text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-xs text-slate-700 dark:text-slate-200">{qp.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{qp.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message thread */}
        {messages.length > 0 && (
          <div className="flex-1 space-y-2">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && !messages[messages.length - 1]?._streaming && (
              <div className="flex items-center gap-2 ml-11 text-slate-400">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
                <span className="text-xs font-bold uppercase tracking-widest">AI reasoning...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-500/30 text-sm text-rose-600 flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">✕</button>
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/10 p-2 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && runPrompt()}
              placeholder="Describe any math concept to visualize..."
              className="flex-1 px-4 py-3 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              disabled={loading}
            />
            <button
              onClick={() => runPrompt()}
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:from-violet-600 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30"
            >
              {loading ? '...' : 'Run →'}
            </button>
          </div>
          {messages.length > 0 && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setMessages([])}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              >
                Clear conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
