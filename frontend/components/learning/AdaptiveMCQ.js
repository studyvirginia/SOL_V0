import { useState } from 'react';

export default function AdaptiveMCQ({ question, options, answer, explanation }) {
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isAnswered = selected !== null;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelected(idx);
  };

  return (
    <div className="w-full max-w-[600px] my-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-relaxed mb-6">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((opt, i) => {
          const isCorrect = i === answer;
          const isSelected = selected === i;

          let btnClass = "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10";
          if (isAnswered) {
            if (isCorrect) {
              btnClass = "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-500/50";
            } else if (isSelected) {
              btnClass = "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-500/50";
            } else {
              btnClass = "opacity-40 border-gray-200 dark:border-gray-700 cursor-default";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all font-medium flex items-center justify-between text-sm ${btnClass}`}
            >
              <span>{opt}</span>
              {isAnswered && isCorrect && (
                <svg viewBox="0 0 24 24" width="18" height="18" className="text-green-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-700">
          {!showExplanation ? (
            <button 
              onClick={() => setShowExplanation(true)}
              className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Request Explanation
            </button>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
               <p className="text-[0.95rem] font-serif leading-relaxed text-gray-700 dark:text-gray-300 italic">
                 {explanation}
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
