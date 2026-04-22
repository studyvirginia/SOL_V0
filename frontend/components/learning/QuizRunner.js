import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function QuizRunner({ title, questions = [], onAnswer, onNextRequested }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showRecap) return;
      const key = parseInt(e.key);
      if (key >= 1 && key <= 4) {
        handleSelect(key - 1);
      } else if (e.key === "Enter" && userAnswers[currentIndex] !== undefined) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, userAnswers, showRecap]);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  // Helper to normalize legacy and V2 Zod formats
  const options = currentQ.options || [currentQ.correct_answer, ...(currentQ.distractors || [])].sort(); // Naive sort for consistency if not shuffled
  // Note: For V2, we should probably have the LLM shuffle or we shuffle here.
  
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (idx) => {
    if (showExplanation) return; // Prevent changing after revealing
    setUserAnswers({ ...userAnswers, [currentIndex]: idx });
    setShowExplanation(true); // Reveal evidence immediately on V2 for rigor
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (isLast) {
      setShowRecap(true);
      if (onAnswer) {
        questions.forEach((q, idx) => {
          const uAns = userAnswers[idx];
          const isCorrect = q.options 
            ? uAns === q.answer 
            : options[uAns] === q.correct_answer;
          onAnswer(q.standard_alignment || q.standardCode || "unknown", isCorrect);
        });
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const calculateCorrect = (q, idx) => {
    const uAns = userAnswers[idx];
    if (uAns === undefined) return false;
    return q.options ? uAns === q.answer : options[uAns] === q.correct_answer;
  };

  const score = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
    return acc + (calculateCorrect(questions[idx], idx) ? 1 : 0);
  }, 0);

  if (showRecap) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full max-w-[500px] my-6 p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl text-center animate-in zoom-in-95 duration-500">
        <div className="mb-6 inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
           <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 uppercase tracking-widest">{title}</p>
        
        <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-2">
          {percentage}%
        </div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-10">
          You got {score} out of {questions.length} correct.
        </p>

        <div className="flex gap-3 mt-8">
          <button 
            onClick={() => {
              setShowRecap(false);
              setCurrentIndex(0);
              setUserAnswers({});
            }}
            className="flex-1 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Retake Quiz
          </button>

          {onNextRequested && (
            <button 
              onClick={onNextRequested}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              Next Batch
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] my-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{title}</span>
        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="mb-10 flex justify-between items-start gap-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
          >
            {currentQ.question}
          </ReactMarkdown>
        </h3>
        {(currentQ.standard_alignment || currentQ.standardCode) && (
           <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap mt-1 border border-blue-100 dark:border-blue-800/50">
             {currentQ.standard_alignment || currentQ.standardCode}
           </span>
        )}
      </div>

      {showExplanation && currentQ.evidence_quote && (
        <div className="mb-8 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl animate-in fade-in slide-in-from-top-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block mb-2">Curriculum Evidence</span>
           <p className="text-sm italic text-emerald-800 dark:text-emerald-200 line-clamp-3 leading-relaxed">"{currentQ.evidence_quote}"</p>
           {currentQ.explanation && (
             <p className="mt-3 text-[0.75rem] font-medium text-gray-600 dark:text-gray-400 border-t border-emerald-100 dark:border-emerald-800/30 pt-3">
               {currentQ.explanation}
             </p>
           )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 mb-10">
        {options.map((opt, i) => {
          const isSelected = userAnswers[currentIndex] === i;
          const isCorrect = currentQ.options 
              ? i === currentQ.answer 
              : opt === currentQ.correct_answer;
          
          let btnStyle = "border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400";
          if (showExplanation) {
            if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20";
            else if (isSelected) btnStyle = "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 opacity-80";
          } else if (isSelected) {
            btnStyle = "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showExplanation}
              className={`w-full group text-left px-5 py-4 rounded-xl border-2 transition-all font-bold text-sm flex items-center justify-between ${btnStyle}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                components={{ p: ({node, ...props}) => <span {...props} /> }}
              >
                {opt}
              </ReactMarkdown>
              <span className="text-[0.6rem] font-black opacity-30 group-hover:opacity-100">{i + 1}</span>
            </button>
          );
        })}
      </div>

      <button 
        onClick={handleNext}
        disabled={userAnswers[currentIndex] === undefined}
        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
      >
        {isLast ? "Finish Quiz" : "Next Question"}
      </button>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
    </div>
  );
}
