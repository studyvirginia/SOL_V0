import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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

  const toggleFlip = () => setIsFlipped(!isFlipped);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid triggering when user is typing in a text field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, cards.length]); // Re-bind when state changes to have fresh closures

  const markdownProps = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    components: {
      p: ({node, ...props}) => <p className="m-0" {...props} />
    }
  };

  return (
    <div className="w-full max-w-[500px] my-6 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Container for the 3D Effect */}
      <div 
        className="relative w-full aspect-[1.6/1] perspective-1000 cursor-pointer group"
        onClick={toggleFlip}
      >
        <div className={`relative w-full h-full duration-1000 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-black/20 group-hover:shadow-lg transition-shadow">
            <span className="absolute top-4 left-6 text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-500 opacity-60">Term</span>
            <div className="text-xl font-medium text-center text-gray-900 dark:text-gray-100 leading-relaxed max-h-full overflow-y-auto">
              <ReactMarkdown {...markdownProps}>{currentCard.front}</ReactMarkdown>
            </div>
            <div className="absolute bottom-4 flex items-center gap-2 text-[0.6rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
               <span>Space to flip</span>
               <span className="opacity-30">|</span>
               <span>Arrows to move</span>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
            <span className="absolute top-4 left-6 text-[0.65rem] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-60">Definition</span>
            <div className="text-lg font-medium text-center text-gray-800 dark:text-gray-200 leading-relaxed max-h-full overflow-y-auto">
              <ReactMarkdown {...markdownProps}>{currentCard.back}</ReactMarkdown>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-6 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <button 
          onClick={handlePrev}
          className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow active:scale-95"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        <span className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 tracking-[0.3em] uppercase">
          <span className="text-gray-900 dark:text-gray-100">{currentIndex + 1}</span> 
          <span className="mx-2">/</span> 
          <span>{cards.length}</span>
        </span>

        <button 
          onClick={handleNext}
          className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow active:scale-95"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
