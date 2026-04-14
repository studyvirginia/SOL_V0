import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getVisualHint } from '../lib/visualMapping';

const MatplotlibView = dynamic(() => import('../components/MatplotlibView'), { ssr: false });

export async function getServerSideProps() {
  // Server-only imports — safe here since getServerSideProps only runs on the server
  const { getCourseOptions, loadCourseRow } = await import('../lib/curriculumService');
  
  const options = await getCourseOptions();
  const initialCourseData = await loadCourseRow('math', 'Algebra 1').catch(() => null);
  
  return {
    props: {
      courseOptions: options,
      initialCourseData: initialCourseData || { domains: [] }
    }
  };
}

const SUBJECT_LABELS = {
  math: "Mathematics",
  science: "Science",
};

export default function MatplotlibLibrary({ courseOptions, initialCourseData }) {
  const [subject, setSubject] = useState('math');
  const [course, setCourse] = useState('Algebra 1');
  const [courseData, setCourseData] = useState(initialCourseData);
  const [loading, setLoading] = useState(false);
  const [activeStandard, setActiveStandard] = useState(null);
  const [monitorData, setMonitorData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  // Fetch new course data via the thin API endpoint
  const fetchCourse = async (subj, crs) => {
    setLoading(true);
    setActiveStandard(null);
    try {
      const res = await fetch(`/api/course-row?subject=${encodeURIComponent(subj)}&course=${encodeURIComponent(crs)}`);
      if (!res.ok) {
        const err = await res.json();
        console.error('course-row error:', err);
        return;
      }
      const data = await res.json();
      setCourseData(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip the initial load since we already have server-side data for Algebra 1 / math
    if (course === 'Algebra 1' && subject === 'math') return;
    fetchCourse(subject, course);
  }, [subject, course]);

  const allStandards = courseData?.domains?.flatMap(d =>
    d.standards.map(s => ({ ...s, domainName: d.name }))
  ) || [];

  const submitFeedback = async (quality) => {
    if (!monitorData) return;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard: activeStandard.code,
          prompt: monitorData.promptUsed,
          spec: monitorData.spec,
          quality
        })
      });
      if (res.ok) {
        setFeedbackStatus('logged');
        setTimeout(() => setFeedbackStatus(null), 2000);
      }
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c0e] text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40">
      <Head>
        <title>Matplotlib Visual Library | SOL Standards</title>
      </Head>

      {/* Hero Header */}
      <header className="relative bg-white dark:bg-[#121215] border-b border-gray-200 dark:border-gray-800/50 pt-12 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[0.7rem] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/20">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                 Scientific Computing Engine
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Visual Standards <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Library</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-gray-400 leading-relaxed font-medium">
                Browse every Virginia SOL math and science standard. Click any standard to generate a textbook-quality diagram with the Matplotlib engine.
              </p>
           </div>

           <div className="flex flex-col gap-4 min-w-[320px]">
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Subject</label>
                    <select 
                      value={subject} 
                      onChange={(e) => {
                        const newSubj = e.target.value;
                        const firstCourse = courseOptions[newSubj]?.[0] || '';
                        setSubject(newSubj);
                        setCourse(firstCourse);
                      }}
                      className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                    >
                      {Object.keys(courseOptions).filter(k => k === 'math' || k === 'science').map(s => (
                        <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>
                      ))}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Course</label>
                    <select 
                      value={course} 
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 rounded-xl px-4 py-3 text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                    >
                      {courseOptions[subject]?.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                 </div>
              </div>
              <div className="text-[0.65rem] font-bold text-gray-400 text-right uppercase tracking-widest">
                {allStandards.length} standards loaded
              </div>
           </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left: Standards Navigation */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-gray-200">
              Explore Standards
              <span className="ml-3 text-xs font-medium text-slate-400 px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded-lg">
                {allStandards.length} Items
              </span>
            </h2>
            
            <div className="space-y-3 h-[700px] overflow-y-auto pr-4" style={{scrollbarWidth:'thin', scrollbarColor:'rgba(0,0,0,0.1) transparent'}}>
               {loading ? (
                 <div className="space-y-3">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl animate-pulse"></div>
                   ))}
                 </div>
               ) : (
                 courseData?.domains?.map((domain, di) => (
                   <div key={di} className="mb-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500/80 mb-4 flex items-center gap-3">
                         {domain.name}
                         <div className="flex-1 h-px bg-blue-100 dark:bg-blue-900/20"></div>
                      </h3>
                      <div className="grid gap-3">
                        {domain.standards.map((std, si) => {
                          const hasHint = !!getVisualHint(std.code);
                          const isActive = activeStandard?.code === std.code;
                          
                          return (
                            <button
                              key={si}
                              onClick={() => setActiveStandard({ ...std, domainName: domain.name })}
                              className={`group relative text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                                isActive 
                                ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20 translate-x-1" 
                                : "bg-white dark:bg-[#121215] border-gray-100 dark:border-gray-800/40 hover:border-blue-400 dark:hover:border-blue-500/40 hover:translate-x-1 shadow-sm"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                     <span className={`text-[0.65rem] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                                       isActive ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                     }`}>
                                       {std.code}
                                     </span>
                                     {hasHint && (
                                       <span className={`text-[0.6rem] font-bold uppercase ${isActive ? "text-blue-200" : "text-emerald-600 dark:text-emerald-500"}`}>
                                         ✦ Featured Visual
                                       </span>
                                     )}
                                  </div>
                                  <p className={`text-sm font-semibold leading-tight line-clamp-2 ${isActive ? "text-white" : "text-slate-700 dark:text-gray-200"}`}>
                                    {std.description}
                                  </p>
                                </div>
                                <div className={`shrink-0 transition-transform ${isActive ? "text-white" : "text-slate-300 group-hover:text-blue-500"}`}>
                                   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                     <polyline points="9 18 15 12 9 6"></polyline>
                                   </svg>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* Right: Visualization Canvas */}
          <div className="lg:sticky lg:top-8 h-[700px] flex flex-col">
            {activeStandard ? (
              <div className="flex-1 flex flex-col space-y-5">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                       <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{activeStandard.code}</span>
                       <span className="text-xs text-gray-400">•</span>
                       <span className="text-xs font-semibold text-gray-400">{activeStandard.domainName}</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                       Diagram Engine
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                       {activeStandard.description}
                    </p>
                 </div>

                  <div className="flex-1 min-h-0">
                    <MatplotlibView 
                       standard={activeStandard}
                       subject={subject}
                       course={course}
                       visualHint={getVisualHint(activeStandard.code)}
                       onStateChange={(data) => setMonitorData(data)}
                    />
                  </div>

                  {/* Monitor Controls */}
                  <div className="flex items-center justify-between px-2">
                    <button 
                      onClick={() => setIsMonitoring(!isMonitoring)}
                      className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-2"
                    >
                      <span className={`w-2 h-2 rounded-full ${monitorData ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      {isMonitoring ? "Hide Debug Logs" : "Show Semantic Data"}
                    </button>
                    
                    {monitorData && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => submitFeedback('good')}
                          className={`px-3 py-1 text-[0.65rem] font-bold rounded-lg border transition-all ${
                            feedbackStatus === 'logged' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/20 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {feedbackStatus === 'logged' ? 'Saved!' : 'Good'}
                        </button>
                        <button 
                          onClick={() => submitFeedback('bad')}
                          className="px-3 py-1 bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[0.65rem] font-bold rounded-lg border border-red-100 dark:border-red-900/10 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Issues
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Monitor Panel */}
                  {isMonitoring && monitorData && (
                    <div className="p-6 bg-[#121215] border border-gray-800 rounded-3xl space-y-5 animate-in slide-in-from-bottom-4 duration-300">
                       <div className="flex justify-between items-center">
                          <h4 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-blue-400">Generation Context</h4>
                          <span className="text-[0.6rem] font-medium text-slate-500 italic">Hyper-minimal Prompt Engine</span>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                               <p className="text-[0.6rem] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Target Prompt</p>
                               <div className="p-3 bg-black/40 rounded-xl text-xs font-mono text-slate-300 border border-gray-800/50 leading-relaxed">
                                  {monitorData.promptUsed.user}
                               </div>
                            </div>
                            <div>
                               <p className="text-[0.6rem] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">System Strategy</p>
                               <div className="p-3 bg-black/40 rounded-xl text-[10px] font-mono text-slate-500 border border-gray-800/50 italic">
                                  {monitorData.promptUsed.system.slice(0, 120)}...
                               </div>
                            </div>
                          </div>
                          
                          <div>
                             <p className="text-[0.6rem] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Structured Spec (Zod validated)</p>
                             <div className="h-44 overflow-y-auto p-3 bg-black rounded-xl text-[10px] font-mono text-emerald-400/80 border border-gray-800/50 custom-scrollbar">
                                <pre>{JSON.stringify(monitorData.spec, null, 2)}</pre>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/50 dark:bg-[#0c0c0e]">
                <div className="p-8 bg-white dark:bg-gray-900 rounded-full shadow-xl shadow-slate-200/50 dark:shadow-none mb-8 text-blue-500">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Standard</h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xs">
                  Click any standard card on the left to activate the Matplotlib engine and generate a diagram.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
