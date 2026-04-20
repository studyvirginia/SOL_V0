import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownProps as commonMarkdownProps } from '../../lib/markdownConfig';

export default function QuizRunner({ title, questions = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showRecap, setShowRecap] = useState(false);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (idx) => {
    setUserAnswers({ ...userAnswers, [currentIndex]: idx });
  };

  const handleNext = () => {
    if (isLast) {
      setShowRecap(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleJump = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || showRecap) return;
      
      const num = parseInt(e.key);
      if (!isNaN(num) && num > 0 && num <= questions.length) {
        handleJump(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRecap, questions.length]);

  const score = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
    return acc + (ans === questions[idx].answer ? 1 : 0);
  }, 0);

  const markdownProps = {
    ...commonMarkdownProps,
    components: {
      p: ({node, ...props}) => <span {...props} />
    }
  };

  if (showRecap) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full max-w-[550px] my-6 p-10 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl text-center animate-in zoom-in-95 duration-500">
        <div className="mb-8 inline-flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] text-blue-600 dark:text-blue-400">
           <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Knowledge Solidified!</h2>
        <p className="text-[0.7rem] font-black text-gray-400 dark:text-gray-500 mb-10 uppercase tracking-[0.25em]">{title}</p>
        
        <div className="relative inline-block mb-10">
          <div className="text-7xl font-black text-blue-600 dark:text-blue-400">
            {percentage}%
          </div>
          <div className="mt-2 text-sm font-bold text-gray-400">Final Score</div>
        </div>

        <div className="flex justify-center gap-2 mb-12">
          {questions.map((q, i) => {
            const isCorrect = userAnswers[i] === q.answer;
            return (
              <div key={i} className={`h-2 w-8 rounded-full ${isCorrect ? "bg-green-500" : "bg-red-500"}`} />
            );
          })}
        </div>
        
        <button 
          onClick={() => {
            setShowRecap(false);
            setCurrentIndex(0);
            setUserAnswers({});
          }}
          className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-95"
        >
          Retake Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[650px] my-4 p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-[0_15px_50px_rgba(0,0,0,0.05)] dark:shadow-black/30 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 opacity-60">{title}</span>
          <span className="text-[0.65rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
        </div>

        {/* Question Numbers / Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {questions.map((_, i) => {
            const isCurrent = currentIndex === i;
            const isAnswered = userAnswers[i] !== undefined;
            return (
              <button
                key={i}
                onClick={() => handleJump(i)}
                className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl text-xs font-black transition-all border-2 ${
                  isCurrent 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-110" 
                    : isAnswered 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                      : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-400 dark:text-gray-600 hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-10 min-h-[80px]">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
          <ReactMarkdown {...markdownProps}>{currentQ.question}</ReactMarkdown>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-10">
        {currentQ.options.map((opt, i) => {
          const isSelected = userAnswers[currentIndex] === i;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-6 py-4.5 rounded-2xl border-2 transition-all font-bold text-[0.95rem] flex items-center gap-4 ${
                isSelected 
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-md" 
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400"
              }`}
            >
              <span className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-lg border text-[0.6rem] font-black ${isSelected ? "bg-white dark:bg-gray-800 border-blue-200" : "bg-white dark:bg-gray-800 border-gray-200 opacity-60"}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <ReactMarkdown {...markdownProps}>{opt}</ReactMarkdown>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={handleNext}
          disabled={userAnswers[currentIndex] === undefined}
          className="flex-1 py-4.5 bg-blue-600 text-white rounded-2xl font-black text-[0.9rem] shadow-xl shadow-blue-600/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
        >
          {isLast ? "Review Results" : "Continue"}
        </button>
      </div>

      {/* Numerical info for shortcut users */}
      <p className="mt-8 text-center text-[0.6rem] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">
        Press 1-{questions.length} to switch questions
      </p>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-blue-600/10 w-full">
         <div 
          className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
         />
      </div>
    </div>
  );
}
