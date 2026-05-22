import { useState, useEffect } from "react";
import ChatWindow, { formatName } from "../components/ChatWindow";
import { db } from "../lib/db";
import { runSessionJanitor } from "../lib/janitor";
import CourseHub from "../components/CourseHub";
import CourseDashboard from "../components/CourseDashboard";

// Modern UI Icons
const SunIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const LogOutIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("dark");

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Authentication Setup & Theme Init
  useEffect(() => {
    const savedLogin = localStorage.getItem("sol_logged_in") === "true";
    setIsLoggedIn(savedLogin);

    const savedTheme = localStorage.getItem("sol_theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const initStorage = async () => {
      await runSessionJanitor();

      try {
        const allCourses = await db.courses.orderBy('createdAt').reverse().toArray();
        setCourses(allCourses);

        const allSessions = await db.sessions.orderBy('createdAt').reverse().toArray();
        setSessions(allSessions);
        
        const savedActiveSessionId = sessionStorage.getItem('sol_active_session_id');
        if (savedActiveSessionId && allSessions.some(s => s.id === savedActiveSessionId)) {
          setActiveSessionId(savedActiveSessionId);
          const s = allSessions.find(s => s.id === savedActiveSessionId);
          setActiveCourseId(s.courseId);
        } else {
          const savedActiveCourseId = sessionStorage.getItem('sol_active_course_id');
          if (savedActiveCourseId && allCourses.some(c => c.id === savedActiveCourseId)) {
            setActiveCourseId(savedActiveCourseId);
          }
        }
      } catch (err) {
        console.error("Failed to load from IndexedDB:", err);
      }

      setIsReady(true);
    };

    initStorage();
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeSessionId) sessionStorage.setItem('sol_active_session_id', activeSessionId);
    else sessionStorage.removeItem('sol_active_session_id');
    
    if (activeCourseId) sessionStorage.setItem('sol_active_course_id', activeCourseId);
    else sessionStorage.removeItem('sol_active_course_id');
  }, [activeSessionId, activeCourseId]);

  const handleLogin = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const user = data.get("username");
    const pass = data.get("password");
    if (user === "demo" && pass === "password") {
       setIsLoggedIn(true);
       localStorage.setItem("sol_logged_in", "true");
    } else {
       alert("Invalid credentials. Try: demo / password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("sol_logged_in");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("sol_theme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleCreateCourse = async (courseData) => {
    const newCourse = {
      id: Date.now().toString(),
      subject: courseData.subject,
      course: courseData.course,
      createdAt: Date.now(),
      points: 0,
      ...(courseData.curriculum ? { curriculum: courseData.curriculum } : {})
    };
    await db.courses.put(newCourse);
    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newCourse.id);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course and all its sessions?")) return;
    await db.courses.delete(courseId);
    // Also delete associated sessions
    const courseSessions = await db.sessions.where('courseId').equals(courseId).toArray();
    for (let s of courseSessions) {
       await db.sessions.delete(s.id);
    }
    setCourses(prev => prev.filter(c => c.id !== courseId));
    setSessions(prev => prev.filter(s => s.courseId !== courseId));
    if (activeCourseId === courseId) setActiveCourseId(null);
  };

  const handleCreateSession = async (sessionData) => {
    const INITIAL_SUBMODE = sessionData.blocks[0] || "diagnostic";
    const INITIAL_MESSAGE_PARTS = [
      { 
        type: "text", 
        text: `Welcome to your session on ${sessionData.focusDetail}. Let's begin.` 
      }
    ];

    const completed = sessionData.blocks.reduce((acc, b) => ({...acc, [b]: false}), {});

    const courseDataObj = courses.find(c => c.id === sessionData.courseId);

    const newSession = {
      id: Date.now().toString(),
      courseId: sessionData.courseId,
      name: sessionData.focusDetail || "Study Session",
      subject: sessionData.subject,
      course: sessionData.courseName,
      ...(courseDataObj?.curriculum ? { curriculum: courseDataObj.curriculum } : {}),
      retrievalMode: INITIAL_SUBMODE,
      journey: {
        blocks: sessionData.blocks,
        currentIndex: 0,
        currentSubMode: INITIAL_SUBMODE,
        completed,
        completedAt: {},
      },
      sessionFocus: sessionData.sessionFocus,
      focusDetail: sessionData.focusDetail,
      userFacts: {
        areaOfFocus: sessionData.sessionFocus,
        focusTopic: sessionData.focusDetail,
        preferences: sessionData.preferences || "",
        needs: sessionData.needs || ""
      },
      sessionSummary: "",
      messages: [{ id: `init-${Date.now()}`, role: "assistant", content: INITIAL_MESSAGE_PARTS[0].text, parts: INITIAL_MESSAGE_PARTS }],
      createdAt: Date.now()
    };
    
    await db.sessions.put(newSession);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const updateSession = (updatedSession) => {
    db.sessions.put(updatedSession).catch(err => console.error("DB Update Error:", err));
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
  };

  const updateCoursePoints = async (courseId, pointsToAdd) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      const updatedCourse = { ...course, points: (course.points || 0) + pointsToAdd };
      await db.courses.put(updatedCourse);
      setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
    }
  };

  if (!isReady) return <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900" />;

  if (!isLoggedIn) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 p-8 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95">
           <div className="mb-8 text-center">
             <h1 className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
                SOL Assistant
             </h1>
             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to access your learning hub.</p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Auth ID</label>
               <input name="username" type="text" defaultValue="demo" className="w-full rounded-xl border-2 border-transparent bg-gray-100 dark:bg-gray-700/50 px-4 py-3.5 text-[0.95rem] transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10" />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Passphrase</label>
               <input name="password" type="password" defaultValue="password" className="w-full rounded-xl border-2 border-transparent bg-gray-100 dark:bg-gray-700/50 px-4 py-3.5 text-[0.95rem] transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10" />
             </div>
             <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 mt-2">Sign In</button>
           </form>
        </div>
      </main>
    );
  }

  const activeCourse = activeCourseId ? courses.find(c => c.id === activeCourseId) : null;
  const activeSession = activeSessionId ? sessions.find(s => s.id === activeSessionId) : null;

  return (
    <main className="flex h-screen w-full bg-gray-50/50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden transition-colors duration-300 relative">
      
      {/* Global Header Controls */}
      {!activeSessionId && (
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button onClick={toggleTheme} className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur p-2.5 text-gray-500 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <button onClick={handleLogout} className="rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur p-2.5 text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-bold">
            <LogOutIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {!activeCourseId ? (
        <CourseHub 
          courses={courses} 
          onCreateCourse={handleCreateCourse} 
          onSelectCourse={setActiveCourseId}
          onDeleteCourse={handleDeleteCourse}
        />
      ) : !activeSessionId ? (
        <CourseDashboard 
          course={activeCourse} 
          sessions={sessions} 
          onBack={() => setActiveCourseId(null)}
          onCreateSession={handleCreateSession}
          onSelectSession={setActiveSessionId}
        />
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900">
           <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
              <button
                onClick={() => setActiveSessionId(null)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Course Dashboard
              </button>
              <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {theme === "light" ? <MoonIcon /> : <SunIcon />}
                </button>
              </div>
           </div>

           <div className="mx-auto flex h-full w-full flex-col pt-14 transition-all duration-300 flex-row">
              <ChatWindow 
                key={activeSession.id}
                session={activeSession} 
                onUpdateSession={updateSession}
                onAwardPoints={(pts) => updateCoursePoints(activeSession.courseId, pts)}
              />
           </div>
        </div>
      )}
    </main>
  );
}