import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';

export default function ValidatedImage({ toolInvocation }) {
  const { toolCallId, state } = toolInvocation;
  const args = toolInvocation.args || toolInvocation.input || {};
  const { query, contextSnippet } = args;

  const [localResult, setLocalResult] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Synchronize with tool output when it arrives
  useEffect(() => {
    if (state === 'output-available' && toolInvocation.output) {
      setLocalResult(toolInvocation.output);
    }
  }, [state, toolInvocation.output]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setLocalError(null);
    try {
      const response = await fetch('/api/openverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, contextSnippet, broaden: true })
      });
      const data = await response.json();
      if (response.ok) {
        setLocalResult(data);
      } else {
        setLocalError(data.error || 'No visuals met the threshold');
      }
    } catch (err) {
      setLocalError('Connection error');
    } finally {
      setIsRetrying(false);
    }
  };

  const result = localResult;
  const isLoading = (state === 'input-available' || (state === 'output-available' && !result && !localError)) || isRetrying;
  const error = localError || (state === 'output-available' && !result ? 'Visual unavailable for this segment' : result?.error);

  return (
    <div className="my-4 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="overflow-hidden border-none shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
        <CardContent className="p-0">
          <div className="relative aspect-video w-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50">
            
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-md">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[0.65rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] animate-pulse">
                    SOL Intelligence
                  </span>
                  <span className="text-[0.6rem] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Sourcing educational visual...
                  </span>
                </div>
              </div>
            )}

            {result && !error && (
              <>
                <img 
                  src={result.url} 
                  alt={result.title}
                  className="w-full h-full object-cover transition-opacity duration-1000"
                  onLoad={(e) => e.target.style.opacity = 1}
                  style={{ opacity: 0 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </>
            )}

            {error && (
              <div className="flex flex-col items-center gap-4 p-10 text-center animate-in zoom-in-95 duration-500">
                <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 shadow-inner">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">{error}</p>
                  <p className="text-[0.6rem] font-medium text-slate-400 opacity-60">Academic sources may be limited for this specific term</p>
                </div>
                
                <button 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="mt-2 px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white text-[0.65rem] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  {isRetrying ? (
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  )}
                  Try Again
                </button>
              </div>
            )}
          </div>

          {result && !error && result.caption && (
            <div className="p-6 bg-white/60 dark:bg-slate-900/60 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Visual Rationale</span>
              </div>
              <p className="text-[0.95rem] font-medium leading-relaxed text-slate-700 dark:text-slate-300 italic">
                {result.caption}
              </p>
              
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <a 
                    href={result.foreign_landing_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group flex items-center gap-1.5 text-[0.6rem] font-bold text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    Source: Openverse
                  </a>
                  <a 
                    href={result.license_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[0.6rem] font-bold text-slate-400 hover:text-slate-500 transition-colors uppercase tracking-widest"
                  >
                    License: {result.license?.toUpperCase()} {result.license_version}
                  </a>
                </div>
                <div className="text-[0.55rem] font-medium text-slate-400 leading-tight opacity-60">
                  {result.attribution || `"${result.title}" by ${result.creator || 'Unknown Creator'}`}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
