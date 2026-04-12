import { useState } from 'react';

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

  const score = Object.entries(userAnswers).reduce((acc, [idx, ans]) => {
    return acc + (ans === questions[idx].answer ? 1 : 0);
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

        <button 
          onClick={() => {
            setShowRecap(false);
            setCurrentIndex(0);
            setUserAnswers({});
          }}
          className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] my-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{title}</span>
        <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="mb-10">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-10">
        {currentQ.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-bold text-sm ${
              userAnswers[currentIndex] === i 
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/30 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400"
            }`}
          >
            {opt}
          </button>
        ))}
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
