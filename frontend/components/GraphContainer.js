import React, { useState } from 'react';
import { Maximize2, Copy, Check, Info, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GraphContainer = ({ pngBase64, title, pythonCode, source }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Phase 16: Hybrid SVG/PNG Detection
  const isSvg = typeof pngBase64 === 'string' && pngBase64.trim().startsWith('<svg');
  
  const handleCopy = () => {
    if (pythonCode) {
      navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    if (isSvg) {
      const blob = new Blob([pngBase64], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, '_') || 'math_graph'}.svg`;
    } else {
      link.href = `data:image/png;base64,${pngBase64}`;
      link.download = `${title.replace(/\s+/g, '_') || 'math_graph'}.png`;
    }
    link.click();
  };

  return (
    <div className="my-8 w-full max-w-3xl mx-auto overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800/50 backdrop-blur-sm group">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${source === 'template' ? 'bg-blue-500' : 'bg-amber-500'}`} />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">
            {source === 'template' ? 'Verified Vector Template' : 'AI GraphSynthesis (SVG)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isSvg && (
            <div className="flex items-center mr-2 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
               <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">4K VECTOR</span>
            </div>
          )}
          {pythonCode && (
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title="Copy Python Code"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
          <button 
            onClick={downloadImage}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title={isSvg ? "Download SVG" : "Download PNG"}
          >
            <Download size={14} />
          </button>
          <button 
            onClick={() => setIsExpanded(true)}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title="Full Screen View"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Rendering Area */}
      <div className="relative aspect-[7/5] w-full bg-white dark:bg-[#0f172a] overflow-hidden flex items-center justify-center p-2 sm:p-4">
        {isSvg ? (
          <div 
            className="w-full h-full flex items-center justify-center text-gray-900 dark:text-gray-100 transition-all duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
            dangerouslySetInnerHTML={{ __html: pngBase64 }}
          />
        ) : (
          <img 
            src={`data:image/png;base64,${pngBase64}`} 
            alt={title || "Generated Graph"} 
            className="max-w-full max-height-full object-contain mix-blend-multiply transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        )}
        
        {/* Phase 16 Interactive Zoom Control overlay (visible on hover) */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-900/80 backdrop-blur px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
           <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} className="p-1 hover:text-blue-500 transition-colors text-xs font-bold">-</button>
           <span className="text-[10px] font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
           <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} className="p-1 hover:text-blue-500 transition-colors text-xs font-bold">+</button>
        </div>

        {source === 'llm' && (
          <div className="absolute bottom-3 right-3 opacity-40 hover:opacity-100 transition-opacity">
             <Info size={14} className="text-gray-400 cursor-help" title="Dynamic logic-generated vector graph." />
          </div>
        )}
      </div>

      {/* Caption */}
      {title && (
        <div className="px-5 py-4 bg-white dark:bg-transparent">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
            {title}
          </p>
        </div>
      )}

      {/* Expansion Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-10"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <img 
                  src={`data:image/png;base64,${pngBase64}`} 
                  alt={title} 
                  className="w-full h-auto object-contain"
                />
                {title && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {source === 'template' ? 'Verified SOL Content' : 'Generative Assistance Output'}
                    </p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <Maximize2 size={20} className="rotate-45" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GraphContainer;
