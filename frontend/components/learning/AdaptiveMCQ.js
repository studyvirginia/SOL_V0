import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function AdaptiveMCQ({ question, options, answer, explanation }) {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isAnswered = selected !== null;

  const handleSelect = (idx) => {
    if (isAnswered || idx < 0 || idx >= options.length) return;
    setSelected(idx);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || isAnswered) return;
      
      const num = parseInt(e.key);
      if (!isNaN(num) && num > 0 && num <= options.length) {
        handleSelect(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, options.length]);

  const markdownProps = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    components: {
      p: ({node, ...props}) => <p className="m-0" {...props} />
    }
  };

  return (
    <div className="w-full max-w-[600px] my-4 p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 opacity-60 mb-3 block">Conceptual Check</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
          <ReactMarkdown {...markdownProps}>{question}</ReactMarkdown>
        </h3>
      </div>

      <div className="space-y-3">
        {options.map((opt, i) => {
          const isCorrect = i === answer;
          const isSelected = selected === i;

          let btnClass = "border-gray-100 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10";
          if (isAnswered) {
            if (isCorrect) {
              btnClass = "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-500/50";
            } else if (isSelected) {
              btnClass = "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-500/50";
            } else {
              btnClass = "opacity-40 border-gray-100 dark:border-gray-800 cursor-default";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all font-semibold flex items-center justify-between text-sm group ${btnClass}`}
            >
              <div className="flex items-center gap-4">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg border text-[0.65rem] font-black transition-colors ${isSelected ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <ReactMarkdown {...markdownProps}>{opt}</ReactMarkdown>
              </div>
              {isAnswered && isCorrect && (
                <svg viewBox="0 0 24 24" width="18" height="18" className="text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )}
            </button>
          );
        })}
      </div>

      {!isAnswered && (
        <p className="mt-6 text-center text-[0.6rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
          Press 1-{options.length} to select
        </p>
      )}

      {isAnswered && (
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-700">
          {!showExplanation ? (
            <button 
              onClick={() => setShowExplanation(true)}
              className="group flex items-center gap-3 text-[0.65rem] font-black text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-[0.15em] mx-auto"
            >
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              Analyze result
            </button>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
               <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-3">Rationale</div>
               <div className="text-[0.95rem] font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                 <ReactMarkdown {...markdownProps}>{explanation}</ReactMarkdown>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
