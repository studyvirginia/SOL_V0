import { useState, useEffect } from 'react';

/**
 * MatplotlibView
 * A component that renders a Matplotlib diagram based on a standard's description.
 */
export default function MatplotlibView({ 
  standard, 
  subject, 
  course, 
  visualHint, 
  autoGenerate = false,
  onStateChange // Callback to pass spec/prompt back to parent
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [showSource, setShowSource] = useState(false);
  const [sourceCode, setSourceCode] = useState('');

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/matplotlib-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'standard_visual',
          description: `${visualHint || ''} Standard: ${standard.code}. ${standard.description}`,
          course: `${subject} - ${course}`,
          notes: 'Ensure clean labels and high contrast for educational use.'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      setImageData(data.pngBase64);
      setSourceCode(JSON.stringify(data.spec, null, 2));
      
      if (onStateChange) {
        onStateChange({
          spec: data.spec,
          promptUsed: data.promptUsed,
          imageData: data.pngBase64
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoGenerate && !imageData && !loading) {
      generate();
    }
  }, [autoGenerate, standard]);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
      {/* Viewport */}
      <div className="relative flex-1 bg-gray-50/50 dark:bg-black/20 overflow-hidden flex items-center justify-center p-4">
        {loading && (
          <div className="flex flex-col items-center gap-3">
             <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
             <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 animate-pulse">Generating Plot...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-6">
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/10 mb-4 text-xs font-medium">
              {error}
            </div>
            <button 
              onClick={generate}
              className="text-xs font-bold px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && !imageData && (
          <button 
            onClick={generate}
            className="group flex flex-col items-center gap-4 transition-all hover:scale-105"
          >
            <div className="p-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Generate Visual</span>
          </button>
        )}

        {imageData && !loading && (
          <img 
            src={`data:image/png;base64,${imageData}`} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            alt="Generated Matplotlib Diagram"
          />
        )}

        {/* Source Overlay */}
        {showSource && sourceCode && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm p-6 overflow-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Visual Spec (JSON)</h4>
              <button onClick={() => setShowSource(false)} className="text-gray-400 hover:text-white">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <pre className="text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap">
              {sourceCode}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <span className="text-[0.65rem] font-black uppercase bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
            Matplotlib V3.8
          </span>
          {imageData && (
            <span className="text-[0.6rem] text-gray-400 font-medium">Rendered in ~2.4s</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {imageData && (
            <button 
              onClick={() => setShowSource(!showSource)}
              className={`p-2 rounded-lg transition-all ${showSource ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-600'}`}
              title="View Source"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </button>
          )}
          <button 
            onClick={generate}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-blue-600 transition-all disabled:opacity-30"
            title="Regenerate"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
