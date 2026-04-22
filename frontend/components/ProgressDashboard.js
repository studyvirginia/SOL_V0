import { useState, useMemo } from 'react';

export default function ProgressDashboard({ session, standards = [] }) {
  const scores = session.userFacts?.scores || {};
  const studentName = session.userFacts?.studentName || "Student";
  
  // Calculate readiness score
  const readinessData = useMemo(() => {
    if (!standards.length) return { score: 0, totalAttempted: 0 };
    
    let totalScore = 0;
    let attemptedCount = 0;
    
    standards.forEach(std => {
      const score = scores[std.code];
      if (score && score.total > 0) {
        totalScore += (score.correct / score.total);
        attemptedCount++;
      }
    });
    
    // Weighted readiness: (Average Accuracy * (attempted / total))
    // This rewards both accuracy AND coverage.
    const averageAccuracy = attemptedCount > 0 ? (totalScore / attemptedCount) : 0;
    const coverage = attemptedCount / standards.length;
    const finalScore = Math.round(averageAccuracy * coverage * 100);
    
    return {
      score: finalScore,
      totalAttempted: attemptedCount,
      totalStandards: standards.length
    };
  }, [scores, standards]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[800px] mx-auto p-4 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-700 print:shadow-none print:border-none print:p-0">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">SOL Mastery Wall</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{session.course} Portfolio</p>
        </div>
        <div className="flex items-center gap-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Report
          </button>
        </div>
      </div>

      {/* Hero Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-2 flex flex-col justify-center p-8 bg-blue-600 dark:bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20">
          <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-1">Overall SOL Readiness</span>
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-black tabular-nums">{readinessData.score}</span>
            <span className="text-2xl font-bold opacity-60">/ 100</span>
          </div>
          <p className="mt-4 text-sm font-medium opacity-90 max-w-[280px]">
            Based on active performance across {readinessData.totalAttempted} of {readinessData.totalStandards} key standards.
          </p>
        </div>
        
        <div className="flex flex-col justify-between p-8 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800">
           <div>
             <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 block mb-4">Student Profile</span>
             <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{studentName}</h3>
             <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">{session.subject} • {session.gradeLevel || 'No Grade specified'}</p>
           </div>
           <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
             <div className="flex justify-between text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2">
                <span>Coverage</span>
                <span>{Math.round((readinessData.totalAttempted / readinessData.totalStandards) * 100)}%</span>
             </div>
             <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(readinessData.totalAttempted / readinessData.totalStandards) * 100}%` }}
                />
             </div>
           </div>
        </div>
      </div>

      {/* Standards List */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Standard-by-Standard Mastery</h2>
        
        {standards.map((std, idx) => {
          const score = scores[std.code] || { correct: 0, total: 0 };
          const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
          
          let status = "New";
          let colorClass = "bg-gray-100 text-gray-400 dark:bg-gray-800";
          let barClass = "bg-gray-200 dark:bg-gray-700";
          
          if (score.total > 0) {
            if (accuracy >= 80) {
              status = "Mastered";
              colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
              barClass = "bg-green-500";
            } else if (accuracy >= 50) {
              status = "Moderate";
              colorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
              barClass = "bg-amber-500";
            } else {
              status = "Needs Practice";
              colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
              barClass = "bg-red-500";
            }
          }

          return (
            <div key={idx} className="group p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.65rem] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{std.code}</span>
                    <span className={`text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-full tracking-tighter ${colorClass}`}>
                      {status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">
                    {std.description}
                  </h4>
                </div>
                {score.total > 0 && (
                  <div className="text-right">
                    <div className="text-xl font-black text-gray-900 dark:text-white leading-none">{accuracy}%</div>
                    <div className="text-[0.6rem] font-bold text-gray-400 uppercase mt-1">{score.correct}/{score.total} Correct</div>
                  </div>
                )}
              </div>
              
              <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${barClass}`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
        }
      `}</style>
    </div>
  );
}
