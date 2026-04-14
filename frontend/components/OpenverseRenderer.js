import React, { useState } from 'react';
import { ExternalLink, Info, AlertCircle, Maximize2, Download } from 'lucide-react';

const OpenverseRenderer = ({ image, caption }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!image || !image.url) return null;

  return (
    <div 
      className="group relative my-8 w-full max-w-2xl mx-auto overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-black/40 transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] appearance-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
        {!hasError ? (
          <img 
            src={image.url} 
            alt={image.title || caption} 
            className={`h-full w-full object-contain transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
            <AlertCircle className="h-10 w-10 opacity-20" />
            <p className="text-xs font-medium italic">Image source unavailable</p>
          </div>
        )}

        {/* Floating Action Overlay */}
        <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center gap-4 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
           <a 
             href={image.sourceUrl} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 shadow-lg hover:scale-110 active:scale-95 transition-all"
             title="View Original Source"
           >
             <ExternalLink className="h-5 w-5" />
           </a>
           <button 
             onClick={() => window.open(image.url, '_blank')}
             className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 shadow-lg hover:scale-110 active:scale-95 transition-all"
             title="Expand Image"
           >
             <Maximize2 className="h-5 w-5" />
           </button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-[0.9rem] font-bold text-gray-800 dark:text-gray-100 leading-tight">
              {image.title || "Untitled Educational Resource"}
            </h4>
            {caption && (
              <p className="mt-1 text-[0.8rem] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed italic">
                {caption}
              </p>
            )}
          </div>
          <div className="shrink-0 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            <div className="h-6 w-6 flex items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
              <Info className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-blue-500"></span>
            <span>Source: {image.provider?.toUpperCase() || "OPENVERSE"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-indigo-500"></span>
            <span>License: {image.license?.toUpperCase() || "CC0"}</span>
          </div>
          {image.attribution && (
            <div className="flex items-center gap-1.5 w-full mt-1 lowercase font-medium tracking-normal opacity-70">
              <span className="truncate">© {image.attribution}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenverseRenderer;
