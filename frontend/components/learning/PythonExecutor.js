import React from 'react';
import PythonVisual from './PythonVisual';

/**
 * PythonExecutor now acts as a renderer for the server-executed Python results.
 * It handles the loading/error/success states provided by the AI SDK.
 */
export default function PythonExecutor({ toolInvocation }) {
  const { state, result, output, error: sdkError, input, args } = toolInvocation;
  const toolArgs = input || args || {};
  const toolResult = result || output || {};
  const { code, title, caption } = toolArgs;

  if (state === 'call') {
    return (
      <div className="my-10 w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-blue-500/20 p-12 flex flex-col items-center justify-center shadow-xl animate-pulse">
          <div className="w-16 h-16 relative mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Executing Python Logic...</h3>
          <p className="text-sm text-slate-500 uppercase tracking-widest font-black">SOL Scientific Sandbox v2</p>
          
          <div className="mt-8 w-full max-w-md bg-black/5 dark:bg-black/40 rounded-xl p-4 font-mono text-[10px] text-slate-400 overflow-hidden">
            <div className="flex gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div>
            </div>
            <p className="">&gt; Initializing E2B instance...</p>
            <p className="animate-pulse">&gt; Importing matplotlib.pyplot as plt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'result' || state === 'output-available') {
    if (toolResult.error) {
      return (
        <div className="my-10 w-full max-w-4xl mx-auto">
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] border border-rose-500/30 p-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white font-bold">!</div>
              <h3 className="text-xl font-bold text-rose-700 dark:text-rose-400">Python Runtime Error</h3>
            </div>
            <pre className="bg-black/80 p-6 rounded-2xl text-xs font-mono text-rose-300 overflow-x-auto">
              {toolResult.error}
              {toolResult.logs && toolResult.logs.length > 0 && `\n\nLogs:\n${toolResult.logs.join('\n')}`}
            </pre>
            <p className="mt-4 text-sm text-rose-600/70 italic">The SOL assistant will attempt to self-heal this code in the next step.</p>
          </div>
        </div>
      );
    }

    return (
      <PythonVisual 
        chartData={toolResult.chartData} 
        title={title} 
        code={code} 
        caption={caption} 
      />
    );
  }

  return null;
}
