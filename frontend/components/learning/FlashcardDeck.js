import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';

export default function FlashcardDeck({ cards = [], onAction }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedIndices, setFlippedIndices] = useState(new Set());
  const [showRecap, setShowRecap] = useState(false);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;

  const handleNext = () => {
    if (isLast) {
      finishDeck();
    } else {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setFlippedIndices(prev => new Set(prev).add(currentIndex));
    }
  };

  const finishDeck = () => {
    setShowRecap(true);
    const count = flippedIndices.size;
    const percentage = Math.round((count / cards.length) * 100);
    
    if (onAction) {
      onAction('LOG_INTERACTION', {
        type: 'Flashcards',
        totalCards: cards.length,
        cardsFlipped: count,
        percentReviewed: percentage,
        summary: `User reviewed ${count} out of ${cards.length} flashcards.`
      });
    }
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setFlippedIndices(new Set());
    setShowRecap(false);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || showRecap) return;

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
  }, [currentIndex, isFlipped, showRecap, cards.length, flippedIndices]);

  const markdownProps = {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    components: {
      p: ({node, ...props}) => <p className="m-0" {...props} />
    }
  };

  if (showRecap) {
    const count = flippedIndices.size;
    const percentage = Math.round((count / cards.length) * 100);
    
    return (
      <Card className="w-full max-w-[500px] my-6 p-10 bg-white dark:bg-gray-800 rounded-3xl border-none shadow-2xl text-center animate-in zoom-in-95 duration-500">
        <div className="mb-6 inline-flex items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
           <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Session Complete!</h2>
        <p className="text-[0.7rem] font-bold text-gray-400 dark:text-gray-500 mb-10 uppercase tracking-widest">Flashcard Review</p>
        
        <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
          {percentage}%
        </div>
        <div className="text-sm font-bold text-gray-400 mb-10">Percent Reviewed (flipped)</div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={resetDeck}
            className="w-full h-auto py-4.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Study Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-[500px] my-6 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Card Container */}
      <div 
        className="relative w-full aspect-[1.6/1] perspective-1000 cursor-pointer group"
        onClick={toggleFlip}
      >
        <div className={`relative w-full h-full duration-1000 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-black/20 group-hover:shadow-lg transition-shadow">
            <span className="absolute top-4 left-6 text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-500 opacity-60">Term</span>
            <div className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 leading-relaxed max-h-full overflow-y-auto">
              <ReactMarkdown {...markdownProps}>{currentCard.front}</ReactMarkdown>
            </div>
            <div className="absolute bottom-4 flex items-center gap-2 text-[0.6rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
               <span>Space / Click to flip</span>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm">
            <span className="absolute top-4 left-6 text-[0.65rem] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-60">Definition</span>
            <div className="text-lg font-medium text-center text-gray-800 dark:text-gray-200 leading-relaxed max-h-full overflow-y-auto">
              <ReactMarkdown {...markdownProps}>{currentCard.back}</ReactMarkdown>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation & Progress */}
      <div className="flex items-center gap-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-black/5">
        <Button 
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 disabled:opacity-0"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Button>
        
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          <span className="text-[0.65rem] font-black text-gray-900 dark:text-gray-100 tracking-[0.2em] uppercase">
            {currentIndex + 1} <span className="mx-1 text-gray-300 dark:text-gray-600">/</span> {cards.length}
          </span>
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-500 transition-all duration-500" 
               style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
             />
          </div>
        </div>

        <Button 
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="p-2 rounded-xl text-gray-400 hover:text-blue-600 active:scale-95"
        >
          {isLast ? (
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ) : (
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          )}
        </Button>
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
