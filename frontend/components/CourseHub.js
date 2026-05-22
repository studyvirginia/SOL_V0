import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCourseCard({ course, onSelectCourse, onDeleteCourse }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`group relative flex flex-col sm:flex-row items-center gap-6 rounded-2xl border ${isDragging ? 'border-blue-500 shadow-2xl scale-[1.02]' : 'border-gray-200/60 dark:border-gray-800 shadow-sm'} bg-white dark:bg-gray-800/40 p-4 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
      </div>

      {/* Visual Placeholder */}
      <div 
        onClick={() => onSelectCourse(course.id)}
        className="h-32 w-full sm:w-48 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 dark:from-indigo-900/40 dark:to-blue-900/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center overflow-hidden relative cursor-pointer ml-8 sm:ml-6"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-20 mix-blend-overlay"></div>
        <svg className="w-12 h-12 text-indigo-400 dark:text-indigo-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
      </div>

      <div 
        onClick={() => onSelectCourse(course.id)}
        className="flex-1 flex flex-col w-full cursor-pointer pr-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{course.subject}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {course.course}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          Comprehensive mastery track covering the complete standard curriculum for {course.course}. Includes foundational concepts, practical applications, and final exam prep.
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-gray-400">
          <div className="flex items-center gap-1.5"><svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg> {course.points || 0} Mastery Points</div>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id); }} 
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
      </button>
    </div>
  );
}

export default function CourseHub({ courses, onCreateCourse, onSelectCourse, onDeleteCourse, onReorderCourses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('');
  const [courseOptions, setCourseOptions] = useState({});
  const [orderedCourses, setOrderedCourses] = useState(courses);

  const [isCustom, setIsCustom] = useState(false);
  const [customCourseName, setCustomCourseName] = useState('');
  const [customSyllabusText, setCustomSyllabusText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setOrderedCourses(courses);
  }, [courses]);

  useEffect(() => {
    fetch("/api/courses")
      .then(res => res.json())
      .then(data => {
        if (data?.options) setCourseOptions(data.options);
      })
      .catch(console.error);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isCustom) {
      if (!customCourseName || !customSyllabusText) return;
      setIsGenerating(true);
      try {
        const res = await fetch("/api/generate-curriculum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: customSyllabusText })
        });
        const data = await res.json();
        if (data.curriculum) {
          onCreateCourse({ subject: "Custom", course: customCourseName, curriculum: data.curriculum });
          setIsModalOpen(false);
          setCustomCourseName('');
          setCustomSyllabusText('');
          setIsCustom(false);
        } else {
          alert("Failed to generate curriculum: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        alert("Failed to generate curriculum.");
      }
      setIsGenerating(false);
    } else {
      if (!subject || !course) return;
      onCreateCourse({ subject, course });
      setIsModalOpen(false);
      setSubject('');
      setCourse('');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrderedCourses((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArr = arrayMove(items, oldIndex, newIndex);
        if (onReorderCourses) onReorderCourses(newArr);
        return newArr;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto w-full relative">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-16">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div> 
              Course Hub
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Manage your active courses and learning tracks.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Create Course</span>
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {orderedCourses.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Courses Found</h3>
              <p className="text-sm font-medium text-gray-500 mt-1 max-w-sm">Create your first course to populate the curriculum and start learning.</p>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedCourses.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {orderedCourses.map(course => (
                <SortableCourseCard 
                  key={course.id} 
                  course={course} 
                  onSelectCourse={onSelectCourse} 
                  onDeleteCourse={onDeleteCourse} 
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[500px] rounded-2xl border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Create New Course</h2>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button type="button" onClick={() => setIsCustom(false)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isCustom ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>Standard</button>
                <button type="button" onClick={() => setIsCustom(true)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isCustom ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}>Custom</button>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {!isCustom ? (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Subject Area</label>
                    <select
                      value={subject}
                      onChange={(e) => { setSubject(e.target.value); setCourse(''); }}
                      className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-semibold text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    >
                      <option value="" disabled>Select Subject...</option>
                      {Object.keys(courseOptions).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Specific Course</label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      disabled={!subject}
                      className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-semibold text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all disabled:opacity-50"
                    >
                      <option value="" disabled>Select Course...</option>
                      {(courseOptions[subject] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced Quantum Mechanics"
                      value={customCourseName}
                      onChange={(e) => setCustomCourseName(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-semibold text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">Course Syllabus / Outline</label>
                    <textarea
                      rows={5}
                      placeholder="Paste syllabus, textbook index, or topics to generate curriculum..."
                      value={customSyllabusText}
                      onChange={(e) => setCustomSyllabusText(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm font-semibold text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-3 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={isCustom ? (!customCourseName || !customSyllabusText || isGenerating) : (!subject || !course)} className="flex-1 rounded-xl bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {isGenerating ? "Synthesizing..." : (isCustom ? "Generate Curriculum" : "Fetch Curriculum")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
