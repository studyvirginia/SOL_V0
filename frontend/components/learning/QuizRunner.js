import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function QuizRunner({ title, questions = [], mode = 'practice', onAction }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showRecap, setShowRecap] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswer = userAnswers[currentIndex];
  const hasAnsweredCurrent = currentAnswer !== undefined;

  const handleSelect = (idx) => {
    if (isReviewing && mode === 'practice') return; // Can't change answers in review if already seen feedback
    setUserAnswers({ ...userAnswers, [currentIndex]: idx });
  };

  const handleNext = () => {
    if (isLast) {
      finishQuiz();
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowExplanation(false);
    }
  };

  const handleJump = (idx) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentIndex(idx);
      setShowExplanation(false);
    }
  };

  const finishQuiz = () => {
    setShowRecap(true);
    // Continuity: Notify the parent (ChatWindow)
    const logs = questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      userAnswer: q.options[userAnswers[i]],
      correctAnswer: q.options[q.answer],
      isCorrect: userAnswers[i] === q.answer,
      explanation: q.explanation
    }));
    
    if (onAction) {
      onAction('FINISH_QUIZ', { title, score, total: questions.length, logs });
    }
  };

  const enterReview = (idx) => {
    setIsReviewing(true);
    setShowRecap(false);
    setCurrentIndex(idx);
    setShowExplanation(true);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || showRecap) return;
      
      // 1-4: Options
      const num = parseInt(e.key);
      if (!isNaN(num) && num > 0 && num <= currentQ.options.length) {
        handleSelect(num - 1);
      } 
      // Arrows: Navigation
      else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRecap, currentIndex, userAnswers, currentQ.options.length]);

  const score = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
    return acc + (ans === questions[idx].answer ? 1 : 0);
  }, 0);

  const markdownProps = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    components: {
      p: ({node, ...props}) => <span {...props} />
    }
  };

  if (showRecap) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full max-w-[550px] my-6 p-10 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl text-center animate-in zoom-in-95 duration-500">
        <div className="mb-6 inline-flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-blue-600 dark:text-blue-400">
           <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Quiz Complete!</h2>
        <p className="text-[0.7rem] font-black text-gray-400 dark:text-gray-500 mb-10 uppercase tracking-widest">{title}</p>
        
        <div className="text-6xl font-black text-blue-600 dark:text-blue-400 mb-8">
          {percentage}%
        </div>

        <div className="mb-10 text-left">
          <h4 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">Review Results</h4>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => {
              const isCorrect = userAnswers[i] === q.answer;
              const isAnswered = userAnswers[i] !== undefined;
              return (
                <button
                  key={i}
                  onClick={() => enterReview(i)}
                  className={`h-11 w-11 flex items-center justify-center rounded-xl text-xs font-black transition-all border-2 ${
                    isAnswered 
                      ? (isCorrect ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400")
                      : "bg-gray-50 border-gray-100 text-gray-400 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-600"
                  } hover:scale-110 active:scale-95`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              setShowRecap(false);
              setIsReviewing(false);
              setCurrentIndex(0);
              setUserAnswers({});
              setShowExplanation(false);
            }}
            className="w-full py-4.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95"
          >
            Reset & Retake
          </button>
        </div>
      </div>
    );
  }

  const showCorrectness = isReviewing || (mode === 'practice' && hasAnsweredCurrent);

  return (
    <div className="w-full max-w-[650px] my-4 p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-[0_15px_50px_rgba(0,0,0,0.05)] dark:shadow-black/30 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[0.55rem] font-black uppercase tracking-widest ${mode === 'diagnostic' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {mode}
            </span>
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 opacity-60">{title}</span>
          </div>
          <span className="text-[0.65rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
        </div>

        {/* Question Tabs */}
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
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105" 
                    : isAnswered 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                      : "bg-gray-50 dark:bg-gray-900 border-transparent text-gray-400 dark:text-gray-600 hover:border-gray-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-10 min-h-[80px]">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
          <ReactMarkdown {...markdownProps}>{currentQ.question}</ReactMarkdown>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-10">
        {currentQ.options.map((opt, i) => {
          const isSelected = currentAnswer === i;
          const isCorrect = i === currentQ.answer;
          
          let btnClass = "border-gray-100 dark:border-gray-800 hover:border-blue-300 bg-gray-50/30 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400";
          
          if (showCorrectness) {
            if (isCorrect) {
              btnClass = "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-500/30";
            } else if (isSelected) {
              btnClass = "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 shadow-sm ring-1 ring-red-500/30";
            } else {
              btnClass = "opacity-40 border-gray-100 dark:border-gray-800 text-gray-400 grayscale";
            }
          } else if (isSelected) {
            btnClass = "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-md";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showCorrectness && !isReviewing}
              className={`w-full text-left px-6 py-4.5 rounded-2xl border-2 transition-all font-bold text-[0.9rem] flex items-center gap-4 ${btnClass}`}
            >
              <span className={`h-6 w-6 shrink-0 flex items-center justify-center rounded-lg border text-[0.6rem] font-black ${isSelected ? "bg-white dark:bg-gray-800 border-current" : "bg-white dark:bg-gray-800 border-gray-200 opacity-60"}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <ReactMarkdown {...markdownProps}>{opt}</ReactMarkdown>
            </button>
          );
        })}
      </div>

      {/* Rationale / Explanation */}
      {showExplanation && (
        <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner animate-in slide-in-from-top-4 duration-500">
           <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-3">Rationale</div>
           <div className="text-[0.95rem] font-medium leading-relaxed text-slate-700 dark:text-slate-300">
             <ReactMarkdown {...markdownProps}>{currentQ.explanation}</ReactMarkdown>
           </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all border border-gray-100 dark:border-gray-800 disabled:opacity-0"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        {!isReviewing ? (
          <button 
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
            className="flex-1 py-4.5 bg-blue-600 text-white rounded-2xl font-black text-[0.9rem] shadow-xl shadow-blue-600/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
          >
            {isLast ? "Finalize Quiz" : "Continue"}
          </button>
        ) : (
          <button 
            onClick={() => setShowRecap(true)}
            className="flex-1 py-4.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-[0.9rem] shadow-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            Back to Results
          </button>
        )}

        <button 
          onClick={handleNext}
          disabled={isLast || !hasAnsweredCurrent}
          className={`p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all border border-gray-100 dark:border-gray-800 ${isReviewing || !isLast ? '' : 'opacity-0'}`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div className="mt-8 flex items-center justify-between px-2">
        <p className="text-[0.6rem] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.2em]">
          1-4: Options <span className="mx-2 opacity-30">|</span> Arr: Move
        </p>
        
        {hasAnsweredCurrent && !showExplanation && (
          <button 
            onClick={() => setShowExplanation(true)}
            className="text-[0.65rem] font-black text-blue-500 hover:text-blue-600 uppercase tracking-[0.1em] flex items-center gap-2"
          >
            View Rationale
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-blue-600/10 w-full">
         <div 
          className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
         />
      </div>
    </div>
  );
}
