import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';

export default function ValidatedImage({ toolInvocation }) {
  const { toolCallId, state } = toolInvocation;
  const args = toolInvocation.args || toolInvocation.input || {};
  const { query, contextSnippet } = args;

  const [localResult, setLocalResult] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showCitation, setShowCitation] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

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

  const RenderSkeleton = () => (
    <div className="flex flex-col items-center gap-4 py-12">
      <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-400">Sourcing visual...</span>
    </div>
  );

  return (
    <div className={`my-6 w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ${isMaximized ? 'fixed inset-0 z-[100] p-4 md:p-10 bg-black/90 backdrop-blur-xl flex items-center justify-center' : 'max-w-2xl'}`}>
      
      {isMaximized && (
        <button 
          onClick={() => setIsMaximized(false)}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-[110]"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}

      <Card className={`overflow-hidden border-none shadow-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-500 ${isMaximized ? 'w-full max-w-5xl max-h-full overflow-y-auto' : ''}`}>
        <CardContent className="p-0">
          <div className={`relative w-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 ${isMaximized ? 'aspect-auto' : 'aspect-video'}`}>
            
            {isLoading && <RenderSkeleton />}

            {result && !error && (
              <>
                <img 
                  src={result.url} 
                  alt={result.title}
                  className={`w-full h-full object-contain transition-opacity duration-1000 ${isMaximized ? '' : 'object-cover'}`}
                  onLoad={(e) => e.target.style.opacity = 1}
                  style={{ opacity: 0 }}
                />
                
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all shadow-lg"
                    title="Toggle Fullscreen"
                  >
                    {isMaximized ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setShowCitation(!showCitation)}
                    className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${showCitation ? 'bg-blue-500 text-white' : 'bg-black/40 hover:bg-black/60 text-white'}`}
                    title="View Citation"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </button>
                </div>
              </>
            )}

            {error && (
              <div className="flex flex-col items-center gap-6 p-10 text-center animate-in zoom-in-95 duration-500 w-full">
                <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/10 text-rose-500 shadow-inner">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="flex flex-col gap-2 max-w-sm">
                  <p className="text-[0.75rem] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{error}</p>
                  <p className="text-[0.65rem] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Openverse could not find a high-threshold match for this concept.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button 
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-[0.65rem] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                  >
                    {isRetrying ? "Retrying..." : "Try Broaden Search"}
                  </button>
                  <button 
                    onClick={() => setShowDebug(!showDebug)}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[0.65rem] font-black uppercase tracking-widest transition-all"
                  >
                    {showDebug ? "Hide Debug" : "Show Debug"}
                  </button>
                </div>

                {showDebug && (
                  <div className="mt-4 w-full text-left animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-slate-900 rounded-2xl p-5 border border-white/5 font-mono text-[0.65rem] text-slate-400 overflow-x-auto">
                      <div className="text-blue-400 mb-2 font-bold uppercase tracking-widest opacity-80">Diagnostics</div>
                      <div className="space-y-1">
                        <p><span className="text-slate-500">Query:</span> "{query}"</p>
                        <p><span className="text-slate-500">Context:</span> "{contextSnippet?.slice(0, 100)}..."</p>
                        <p><span className="text-slate-500">API:</span> /api/openverse</p>
                        <p><span className="text-slate-500">Error:</span> {error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {result && !error && (
            <div className="p-6 bg-white/60 dark:bg-slate-900/60 border-t border-black/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-500">
              {showCitation ? (
                <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] font-black text-blue-500 uppercase tracking-widest">Metadata & Citation</span>
                    <button onClick={() => setShowCitation(false)} className="text-[0.55rem] font-bold text-slate-400 hover:text-slate-600 uppercase">Close</button>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-black/5">
                    <div className="flex items-center justify-between">
                      <a href={result.foreign_landing_url} target="_blank" rel="noreferrer" className="text-[0.65rem] font-bold text-slate-700 dark:text-slate-300 hover:underline">
                        Source: Openverse ({result.provider?.toUpperCase()})
                      </a>
                      <a href={result.license_url} target="_blank" rel="noreferrer" className="text-[0.55rem] font-black text-blue-500 uppercase">
                        {result.license?.toUpperCase()} {result.license_version}
                      </a>
                    </div>
                    <p className="text-[0.55rem] font-medium text-slate-500 leading-tight italic">
                      {result.attribution || `"${result.title}" by ${result.creator || 'Unknown Creator'}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Visual Explanation</span>
                  </div>
                  <p className="text-[0.95rem] font-medium leading-relaxed text-slate-700 dark:text-slate-300 italic">
                    {result.caption}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
