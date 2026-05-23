import React, { useState, useEffect } from 'react';
import SessionBuilder from './SessionBuilder';

export default function CourseDashboard({ course, sessions, onBack, onCreateSession, onSelectSession }) {
  const [syllabus, setSyllabus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State
  const [focus, setFocus] = useState('Standard');
  const [focusDetail, setFocusDetail] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState(['notes', 'flashcards', 'quiz']);

  // Dynamic Suggestion State
  const [modalUnitOptions, setModalUnitOptions] = useState([]);
  const [modalTopicSuggestions, setModalTopicSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [preferences, setPreferences] = useState('');
  const [needs, setNeeds] = useState('');
  
  // Accordion State for Syllabus
  const [expandedDomains, setExpandedDomains] = useState({});
  const toggleDomain = (idx) => setExpandedDomains(prev => ({...prev, [idx]: !prev[idx]}));

  useEffect(() => {
    if (!course) return;

    if (focus === "Unit test") {
      setModalTopicSuggestions([]);
      if (course.curriculum) {
        setModalUnitOptions(course.curriculum.filter(c => c.type === 'domain').map(c => ({ title: c.title })));
      } else {
        fetch("/api/course-breakdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: course.subject, course: course.course })
        })
        .then(res => res.json())
        .then(data => setModalUnitOptions(data.breakdown || []))
        .catch(console.error);
      }
    } else if (focus === "Standard") {
      setModalTopicSuggestions([]);
      if (course.curriculum) {
        setModalUnitOptions(course.curriculum.filter(c => c.type === 'standard').map(c => c.title));
      } else {
        fetch("/api/course-standards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: course.subject, course: course.course })
        })
        .then(res => res.json())
        .then(data => setModalUnitOptions(data.standards || []))
        .catch(console.error);
      }
    } else if (focus === "Concept quiz") {
      setModalUnitOptions([]);
      setIsLoadingSuggestions(true);
      fetch("/api/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: course.subject, course: course.course })
      })
      .then(res => res.json())
      .then(data => {
        setModalTopicSuggestions(data.topics || []);
        setIsLoadingSuggestions(false);
      })
      .catch(() => setIsLoadingSuggestions(false));
    } else {
      setModalUnitOptions([]);
      setModalTopicSuggestions([]);
    }
    setFocusDetail("");
  }, [focus, course]);

  useEffect(() => {
    if (course.curriculum) {
      setSyllabus(course.curriculum);
    } else {
      // Fetch syllabus dynamically
      fetch("/api/course-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: course.subject, course: course.course })
      })
      .then(res => res.json())
      .then(data => {
         if (data.breakdown) {
           setSyllabus(data.breakdown);
         }
      })
      .catch(console.error);
    }
  }, [course]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!focus || !focusDetail) return;
    
    onCreateSession({
      courseId: course.id,
      subject: course.subject,
      courseName: course.course,
      sessionFocus: focus,
      focusDetail,
      blocks: selectedBlocks,
      preferences,
      needs
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden w-full relative">
      <div className="h-full flex flex-col lg:flex-row">
        
        {/* LEFT PANE: Course Overview & Syllabus */}
        <div className="w-full lg:w-[40%] xl:w-[35%] border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex flex-col h-full overflow-y-auto">
          <div className="p-6 md:p-8">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Hub
            </button>
            
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">{course.course}</h1>
            <div className="flex items-center gap-3 mb-6">
               <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-bold tracking-wide uppercase">{course.subject}</span>
               <span className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> {course.points || 0} pts</span>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 shadow-sm mb-8 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                 AI Course Summary
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
                 This curriculum is designed to master core concepts of {course.course}. You will navigate through foundational theories, apply them in practice scenarios, and solidify your knowledge using active recall techniques tailored for the final exam.
               </p>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Mastery Syllabus</h3>
            
            <div className="space-y-3">
               {syllabus.length === 0 ? (
                 <div className="animate-pulse space-y-3">
                   {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>)}
                 </div>
               ) : (
                 (() => {
                   const groupedSyllabus = [];
                   let currentDomain = null;
                   
                   syllabus.forEach(item => {
                     if (item.type === 'domain') {
                       currentDomain = { ...item, standards: [] };
                       groupedSyllabus.push(currentDomain);
                     } else {
                       if (currentDomain) currentDomain.standards.push(item);
                       else groupedSyllabus.push({ ...item, standards: [] });
                     }
                   });

                   return groupedSyllabus.map((domain, idx) => {
                     const isExpanded = !!expandedDomains[idx];
                     return (
                       <div key={idx} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                         <button 
                           onClick={() => toggleDomain(idx)}
                           className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                         >
                           <span className="text-sm font-bold text-gray-900 dark:text-gray-100 pr-4">{domain.label}</span>
                           <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </button>
                         {isExpanded && domain.standards.length > 0 && (
                            <div className="bg-gray-50/50 dark:bg-gray-900/50 px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                              <ul className="space-y-3 mt-2">
                                {domain.standards.map((std, i) => (
                                  <li key={i} className="text-[0.8rem] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue-400 dark:before:bg-blue-500">
                                    <div className="text-gray-800 dark:text-gray-200 font-medium mb-1">{std.label}</div>
                                    {std.key_concepts && std.key_concepts.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {std.key_concepts.map((concept, cIdx) => (
                                          <span key={cIdx} className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[0.65rem] font-bold">
                                            {concept}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                         )}
                       </div>
                     );
                   });
                 })()
               )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Action Hub (Sessions) */}
        <div className="w-full lg:w-[60%] xl:w-[65%] flex flex-col h-full overflow-y-auto bg-white dark:bg-gray-900 p-6 md:p-8 lg:p-12">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
             <div>
               <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Study Sessions</h2>
               <p className="text-sm text-gray-500 mt-1">Jump back into a previous study track or configure a new one.</p>
             </div>
             <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-gray-900 shadow-lg shadow-gray-900/20 dark:shadow-white/10 transition-transform hover:-translate-y-0.5 active:scale-95 shrink-0"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
               Create Session
             </button>
          </div>

          <div className="space-y-4">
            {sessions.filter(s => s.courseId === course.id).length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No Sessions Yet</h3>
                 <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">You haven't started any study sessions for this course. Click "Create Session" to begin.</p>
              </div>
            ) : (
              sessions.filter(s => s.courseId === course.id).map(session => (
                <div 
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/30 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-lg">
                      {session.sessionFocus?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                        {session.sessionFocus || 'General Review'}
                        {session.focusDetail ? `: ${session.focusDetail}` : ''}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-gray-500">
                         <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                         <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                         <span>{session.messages?.length || 0} Interactions</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center text-blue-600 font-bold text-sm gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                    Continue <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE SESSION MODAL WITH SESSION BUILDER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
           <div className="w-full max-w-3xl rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-2xl animate-in zoom-in-95 my-8 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                 <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Plan Your Session</h2>
                 <p className="text-sm text-gray-500 mt-2">
                   {course.subject === "Custom" 
                     ? "Launch an AI-guided mastery journey through your custom course." 
                     : "Select what you want to focus on and build your study flow."}
                 </p>
              </div>

              <form onSubmit={handleCreate} className="space-y-8">
                {course.subject !== "Custom" ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Focus Scope</label>
                        <select
                          value={focus}
                          onChange={(e) => setFocus(e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        >
                          <option value="Unit test">Specific Unit</option>
                          <option value="Standard">Specific Standard</option>
                          <option value="Concept quiz">Specific Concept</option>
                          <option value="SOL exam">Full Course Review (Midterm/Final)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                          {(focus === "Unit test" || focus === "Standard") ? "Select Unit/Standard" : "What concept should we quiz?"}
                        </label>
                        
                        {(focus === "Unit test" || focus === "Standard") ? (
                          <select
                            value={focusDetail}
                            onChange={(e) => setFocusDetail(e.target.value)}
                            className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          >
                            <option value="">Select a unit/standard...</option>
                            {modalUnitOptions.map((opt, i) => (
                              <option key={i} value={opt.value} className={opt.type === 'domain' ? 'font-bold' : 'italic text-gray-500'}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="space-y-3">
                            {isLoadingSuggestions ? (
                              <div className="text-[0.65rem] text-gray-400 animate-pulse italic">Brewing topic suggestions...</div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {modalTopicSuggestions.map((topic, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setFocusDetail(topic)}
                                    className={`rounded-full px-3 py-1 text-[0.65rem] font-bold transition-all border ${focusDetail === topic ? "bg-blue-600 text-white border-blue-500" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                  >
                                    {topic}
                                  </button>
                                ))}
                              </div>
                            )}
                            <input
                              value={focusDetail}
                              onChange={(e) => setFocusDetail(e.target.value)}
                              placeholder="Or type a custom topic..."
                              className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Learning Preferences</label>
                        <input
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          value={preferences}
                          onChange={(e) => setPreferences(e.target.value)}
                          placeholder="e.g. visual, step-by-step"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Learning Needs</label>
                        <input
                          className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                          value={needs}
                          onChange={(e) => setNeeds(e.target.value)}
                          placeholder="e.g. dyslexia support, ELL"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Study Flow Builder</h3>
                       <SessionBuilder 
                          selectedBlocks={selectedBlocks} 
                          setSelectedBlocks={setSelectedBlocks} 
                       />
                    </div>
                  </>
                ) : (
                  <div className="py-6 px-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Linear Mastery Journey</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md text-sm leading-relaxed">
                      This custom course is designed for end-to-end learning. You will be guided topic-by-topic through the curriculum, concluding with a final comprehensive review.
                    </p>
                  </div>
                )}

                <div className="pt-6 flex justify-end">
                   {course.subject === "Custom" ? (
                     <button 
                       type="button"
                       onClick={(e) => {
                         e.preventDefault();
                         onCreateSession({
                           courseId: course.id,
                           focus: "Custom Course Journey",
                           focusDetail: course.course,
                           preferences,
                           needs,
                           blocks: ["custom_linear"],
                           retrievalMode: "custom_linear"
                         });
                         setIsModalOpen(false);
                       }}
                       className="rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2"
                     >
                       Start Linear Journey <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                     </button>
                   ) : (
                     <button 
                       type="submit" 
                       disabled={!focus || !focusDetail || selectedBlocks.length === 0}
                       className="rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                     >
                       Launch Study Mode <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                     </button>
                   )}
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
