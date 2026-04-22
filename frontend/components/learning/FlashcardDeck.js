import { useState } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function FlashcardDeck({ cards = [], onAnswer, onNextRequested }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState({}); // { index: true|false }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]); // Re-bind when index changes to ensure nav works correctly

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleConfidence = (isMastered) => {
    setMastered({ ...mastered, [currentIndex]: isMastered });
    if (onAnswer) {
      onAnswer(currentCard.standardCode || "unknown", isMastered);
    }
    // Auto-advance after selection to keep flow
    setTimeout(handleNext, 400);
  };

  return (
    <div className="w-full max-w-[500px] my-6 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Container for the 3D Effect */}
      <div 
        className="relative w-full aspect-[1.6/1] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-shadow ring-1 ring-inset ring-gray-900/5">
            <span className="absolute top-4 left-6 text-[0.6rem] font-bold uppercase tracking-widest text-blue-500 opacity-50">Question</span>
            <div className="text-xl font-medium text-center text-gray-900 dark:text-gray-100 leading-relaxed font-serif">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
              >
                {currentCard.front}
              </ReactMarkdown>
            </div>
            <span className="absolute bottom-4 text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px]">Space</span> to flip
            </span>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm ring-1 ring-inset ring-blue-500/10">
            <span className="absolute top-4 left-6 text-[0.6rem] font-bold uppercase tracking-widest text-indigo-500 opacity-50">Explanation</span>
            <div className="text-xl font-medium text-center text-gray-900 dark:text-gray-100 leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
              >
                {currentCard.back}
              </ReactMarkdown>
            </div>
          </div>

        </div>
      </div>

      {/* Confidence Controls (Only when flipped) */}
      <div className={`flex gap-3 w-full transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
         <button 
           onClick={() => handleConfidence(false)}
           className="flex-1 py-3 px-4 rounded-xl border-2 border-red-100 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
         >
           Review Again
         </button>
         <button 
           onClick={() => handleConfidence(true)}
           className="flex-1 py-3 px-4 rounded-xl border-2 border-green-100 text-green-600 font-bold text-xs uppercase tracking-widest hover:bg-green-50 transition-colors"
         >
           Got It
         </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6 mt-2">
        <button 
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase items-center flex gap-2">
          {currentIndex + 1} <span className="opacity-30">/</span> {cards.length}
          {currentCard.standardCode && currentCard.standardCode !== "unknown" && (
            <span className="bg-slate-200 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded-full">{currentCard.standardCode}</span>
          )}
        </span>

        <button 
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Next card"
          title="Arrow Right"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {currentIndex === cards.length - 1 && onNextRequested && (
        <div className="w-full mt-4 animate-in fade-in zoom-in duration-500">
           <button 
             onClick={onNextRequested}
             className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
           >
             Generate Next Batch
             <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
           </button>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
