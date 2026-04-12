import { useState } from 'react';

export default function FlashcardDeck({ cards = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
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
            <span className="absolute top-4 left-6 text-[0.6rem] font-bold uppercase tracking-widest text-blue-500 opacity-50">Front</span>
            <p className="text-xl font-medium text-center text-gray-900 dark:text-gray-100 leading-relaxed font-serif">
              {currentCard.front}
            </p>
            <span className="absolute bottom-4 text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">Click to flip</span>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm ring-1 ring-inset ring-blue-500/10">
            <span className="absolute top-4 left-6 text-[0.6rem] font-bold uppercase tracking-widest text-indigo-500 opacity-50">Back</span>
            <p className="text-xl font-medium text-center text-gray-900 dark:text-gray-100 leading-relaxed">
              {currentCard.back}
            </p>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button 
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">
          {currentIndex + 1} <span className="opacity-30 mx-1">/</span> {cards.length}
        </span>

        <button 
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
