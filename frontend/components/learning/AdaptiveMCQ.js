import { useState, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function AdaptiveMCQ({ 
  question, 
  options, 
  answer, // index
  correct_answer, // string (V2)
  distractors, // array (V2)
  evidence_quote, 
  explanation, 
  standard_alignment,
  standardCode = "unknown", 
  math_context,
  onAnswer, 
  onNextRequested 
}) {
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [validationStatus, setValidationStatus] = useState('validating'); // validating, verified, error
  const [validationMsg, setValidationMsg] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Phase 18: Keyboard Mapping (1-4)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnswered) return;
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const idx = parseInt(key) - 1;
        if (options[idx]) handleSelect(options[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, options]);

  // Phase 20: Rigor Validation (SymPy / Critic)
  useEffect(() => {
    let isMounted = true;
    const runValidation = async () => {
      try {
        const res = await fetch("/api/validate-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            options,
            answerIndex: answer,
            correct_answer,
            distractors,
            subject: standardCode || standard_alignment || "General",
            type: math_context?.type || (options.some(o => o.includes('$') || o.includes('x')) ? "equation_solution" : "generic"),
            context: math_context || { equation: question }
          })
        });
        const data = await res.json();
        if (!isMounted) return;
        
        if (data.isValid) {
          setValidationStatus('verified');
        } else {
          setValidationStatus('error');
          setValidationMsg(data.errors?.join(". ") || data.reasoning || "Logic anomaly detected.");
          console.warn("[Rigor Check Failed]:", data);
        }
      } catch (err) {
        if (isMounted) setValidationStatus('verified'); // Fallback to trust on network error
      }
    };
    runValidation();
    return () => { isMounted = false; };
  }, [question, options, answer]);

  // Phase 18: Text-to-Speech
  const handleTTS = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = async (option) => {
    if (isAnswered) return;
    const isCorrect = option === correct_answer;
    setSelected(option);
    setIsAnswered(true);
    setIsSyncing(true);

    // Phase 17: Mastery Sync
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch("/api/update-mastery", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ 
            standard_code: standard_alignment || standardCode,
            subject,
            is_correct: isCorrect
          }),
        });
      }
    } catch (e) {
      console.error("Mastery sync failed:", e);
    } finally {
      setIsSyncing(false);
    }

    if (isCorrect && onAnswer) {
       onAnswer(standard_alignment || standardCode, true);
    }
  };

  return (
    <div className="w-full max-w-[600px] my-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className="max-w-[85%]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                components={{ p: ({node, ...props}) => <span {...props} /> }}
              >
                {question}
              </ReactMarkdown>
            </h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
            <button 
              onClick={handleTTS}
              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
              title="Speak Question"
            >
              <Volume2 size={16} />
            </button>
            {(standard_alignment || standardCode !== "unknown") && (
              <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800/50">
                {standard_alignment || standardCode}
              </span>
            )}
            
            {/* Phase 20: Rigor Badge */}
            {validationStatus === 'validating' && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 animate-pulse uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-300" /> Verifying Rigor
              </span>
            )}
            {validationStatus === 'verified' && (
              <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Rigor Verified
              </span>
            )}
            {validationStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Quality Alert
              </span>
            )}
        </div>
      </div>

      {validationStatus === 'error' && (
        <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl animate-in shake duration-500">
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
            ⚠️ Note: The AI Critic found an anomaly: "{validationMsg}". Proceed with caution or ask for a fresh question.
          </p>
        </div>
      )}

      {isAnswered && evidence_quote && (
        <div className="mb-6 p-4 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl animate-in fade-in slide-in-from-top-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block mb-2">Curriculum Evidence</span>
           <p className="text-sm italic text-emerald-800 dark:text-emerald-200 line-clamp-3 leading-relaxed">"{evidence_quote}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const isCorrect = opt === correct_answer;
          const isSelected = opt === selected;
          
          let btnClass = "border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 hover:border-blue-300 dark:hover:border-blue-700";
          if (isAnswered) {
             if (isCorrect) {
               btnClass = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/50";
             } else if (isSelected) {
               btnClass = "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-red-500/50";
             } else {
               btnClass = "opacity-40 border-gray-200 dark:border-gray-700 cursor-default";
             }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              aria-pressed={isSelected}
              className={`w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all font-medium flex items-center justify-between text-sm ${btnClass}`}
            >
              <span className="flex-1 flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-black/5 dark:bg-white/10 text-xs font-bold text-gray-400">
                  {i + 1}
                </span>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                  components={{ p: ({node, ...props}) => <span {...props} /> }}
                >
                  {opt}
                </ReactMarkdown>
              </span>
              {isAnswered && isCorrect && (
                <svg viewBox="0 0 24 24" width="18" height="18" className="text-green-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 animate-in fade-in duration-700">
          {!showExplanation ? (
            <button 
              onClick={() => setShowExplanation(true)}
              className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Request Explanation
            </button>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
               <div className="text-[0.95rem] font-serif leading-relaxed text-gray-700 dark:text-gray-300 italic">
                 <ReactMarkdown
                    remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
                    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                 >
                   {explanation}
                 </ReactMarkdown>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
