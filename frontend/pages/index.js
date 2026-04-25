import { useState, useEffect } from "react";
import ChatWindow, { formatName } from "../components/ChatWindow";
import { MODE_MAP, getSubModeLabel } from "../lib/modeMap";
import Link from "next/link";
import { BarChart3, LayoutDashboard } from "lucide-react";

const DEFAULT_SUBMODES = [
  "diagnostic",
  "notes",
  "study-guide",
  "flashcards",
  "mnemonics",
  "tips",
  "analogies",
  "questions",
  "practice",
  "quiz",
  "progress",
];

function createDefaultJourney(currentSubMode = "diagnostic") {
  return {
    currentSubMode,
    completed: DEFAULT_SUBMODES.reduce((acc, subModeId) => {
      acc[subModeId] = false;
      return acc;
    }, {}),
    completedAt: {},
  };
}

const FOCUS_OPTIONS = [
  "SOL exam",
  "Unit test",
  "Standard",
  "Concept quiz",
  "Final/Midterm",
  "Other",
];

const INITIAL_SUBMODE = "diagnostic";
const INITIAL_ASSISTANT_MESSAGE =
  "Welcome. Let's begin with a quick diagnostic to identify your strongest and weakest areas.\n\n```json\n" +
  JSON.stringify({
    root: "welcome-actions",
    elements: {
      "welcome-actions": {
        type: "Actions",
        props: {
          actions: [
            { label: "Begin", prompt: "Start diagnostic", targetMode: "diagnostic" },
            { label: "Skip", prompt: "Skip diagnostic and go to notes", targetMode: "notes" }
          ]
        }
      }
    }
  }) +
  "\n```";

// Modern UI Icons
const PlusIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" /></svg>;
const MaximizeIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>;
const MinimizeIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></svg>;
const ChatIcon = (props) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const SunIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const ChevronDownIcon = (props) => <svg viewBox="0 0 16 16" fill="currentColor" {...props}><path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>;
const LogOutIcon = (props) => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
const TrashIcon = (props) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...props}><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Defaulting to Dark Mode
  const [theme, setTheme] = useState("dark");

  // Authentication Setup & Theme Init
  useEffect(() => {
    const savedLogin = localStorage.getItem("sol_logged_in") === "true";
    setIsLoggedIn(savedLogin);

    // Default to dark mode for all initially if null
    const savedTheme = localStorage.getItem("sol_theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Application State
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseOptions, setCourseOptions] = useState({});
  const [modalSubject, setModalSubject] = useState("");
  const [modalCourse, setModalCourse] = useState("");
  const [modalGrade, setModalGrade] = useState("");
  const [modalSessionFocus, setModalSessionFocus] = useState("");
  const [modalFocusTopic, setModalFocusTopic] = useState("");
  const [modalFocusDetail, setModalFocusDetail] = useState("");
  const [modalUnitOptions, setModalUnitOptions] = useState([]);
  const [modalTopicSuggestions, setModalTopicSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [modalPreferences, setModalPreferences] = useState("");
  const [modalNeeds, setModalNeeds] = useState("");

  // Effect to fetch dynamic Units or AI Suggestions
  useEffect(() => {
    if (!modalCourse || !modalSubject) return;

    if (modalSessionFocus === "Unit test") {
      setModalTopicSuggestions([]);
      fetch("/api/course-breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: modalSubject, course: modalCourse })
      })
      .then(res => res.json())
      .then(data => setModalUnitOptions(data.breakdown || []))
      .catch(console.error);
    } else if (modalSessionFocus === "Standard") {
      setModalTopicSuggestions([]);
      fetch("/api/course-standards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: modalSubject, course: modalCourse })
      })
      .then(res => res.json())
      .then(data => setModalUnitOptions(data.standards || []))
      .catch(console.error);
    } else if (modalSessionFocus === "Concept quiz") {
      setModalUnitOptions([]);
      setIsLoadingSuggestions(true);
      fetch("/api/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: modalSubject, course: modalCourse })
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
    // Reset selection when focus changes
    setModalFocusDetail("");
  }, [modalSessionFocus, modalCourse, modalSubject]);

  useEffect(() => {
    if (!isLoggedIn) {
       // Make sure we load the courses even if logged out so we can populate the dropdown on login
       fetch("/api/courses").then(res => res.json()).then(data => {
          if (data?.options && !courseOptions[modalSubject]) {
             setCourseOptions(data.options);
             const firstSub = Object.keys(data.options)[0] || "";
             setModalSubject(firstSub);
             setModalCourse(data.options[firstSub]?.[0] || "");
          }
       }).catch(console.error);

       setIsReady(true);
       return;
    }

    const savedSessions = localStorage.getItem("sol_sessions");
    let hasLoadedSessions = false;
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          hasLoadedSessions = true;
        }
      } catch (e) { }
    }
    
    // Fallback load courses if wasn't loaded
    if (Object.keys(courseOptions).length === 0) {
      fetch("/api/courses").then(res => res.json()).then(data => {
         if (data?.options) {
             setCourseOptions(data.options);
             const firstSub = Object.keys(data.options)[0] || "";
             setModalSubject(firstSub);
             setModalCourse(data.options[firstSub]?.[0] || "");
         }
      }).catch(console.error);
    }

    // Only prompt modal later if they explicitly delete all sessions to 0 inside the app
    if (!hasLoadedSessions && sessions.length === 0) {
      // It shouldn't get here typically because login forces you to make a session,
      // but just to be safe if local logic breaks
      setIsModalOpen(true);
    }
    
    setIsReady(true);
  }, [isLoggedIn]);

  useEffect(() => {
    if (isReady && sessions.length > 0) {
      localStorage.setItem("sol_sessions", JSON.stringify(sessions));
    } else if (isReady && sessions.length === 0 && isLoggedIn) {
      localStorage.removeItem("sol_sessions");
    }
  }, [sessions, isReady, isLoggedIn]);

  // Fullscreen UI handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull) {
         setIsSidebarOpen(false);
      } else {
         setIsSidebarOpen(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fullscreen Error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const handleModalSubjectChange = (e) => {
    const newSub = e.target.value;
    setModalSubject(newSub);
    setModalCourse(courseOptions[newSub]?.[0] || "");
  };

  const createSessionFromModal = (e) => {
    e.preventDefault();
    if (!modalSubject || !modalCourse || !modalSessionFocus || !modalFocusDetail) {
      alert("Please fill in all required fields: Subject, Course, Focus, and Topic/Unit.");
      return;
    }

    const personalization = {
      gradeLevel: modalGrade || "",
      areaOfFocus: modalSessionFocus || "",
      focusTopic: modalFocusDetail || "",
      preferences: modalPreferences || "",
      needs: modalNeeds || "",
    };
    const newSession = {
      id: Date.now().toString(),
      name: formatName(modalCourse),
      subject: modalSubject,
      course: modalCourse,
      retrievalMode: INITIAL_SUBMODE,
      journey: createDefaultJourney(INITIAL_SUBMODE),
      sessionFocus: modalSessionFocus || "",
      focusDetail: modalFocusDetail || "",
      userFacts: personalization,
      sessionSummary: "",
      messages: [{ role: "assistant", content: INITIAL_ASSISTANT_MESSAGE }],
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setIsModalOpen(false);
    setModalGrade("");
    setModalSessionFocus("Concept quiz");
    setModalFocusTopic("");
    setModalPreferences("");
    setModalNeeds("");
  };

  const updateSession = (updatedSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id && filtered.length > 0) {
      setActiveSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      setActiveSessionId(null);
      setIsModalOpen(true); // Pops up inside the app if they intentionally purged everywhere
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  if (!isReady) return <div className="h-screen w-screen bg-gray-50 dark:bg-gray-900" />;

  // quasi-LOGIN SCREEN -------------------------------------------------------------
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
               <input 
                 name="username" 
                 type="text"
                 placeholder="demo"
                 defaultValue="demo"
                 className="w-full rounded-xl border-2 border-transparent bg-gray-100 dark:bg-gray-700/50 px-4 py-3.5 text-[0.95rem] transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10"
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-bold tracking-wide text-gray-700 dark:text-gray-300">Passphrase</label>
               <input 
                 name="password" 
                 type="password"
                 placeholder="password"
                 defaultValue="password"
                 className="w-full rounded-xl border-2 border-transparent bg-gray-100 dark:bg-gray-700/50 px-4 py-3.5 text-[0.95rem] transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10"
               />
             </div>
             <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 py-3.5 font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 mt-2">
               Sign In
             </button>
           </form>
           
           <div className="mt-6 flex justify-center">
             <button type="button" onClick={toggleTheme} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
               {theme === "light" ? <MoonIcon/> : <SunIcon/>}
             </button>
           </div>
        </div>
      </main>
    );
  }

  // MAIN APP SCREEN -------------------------------------------------------------
  return (
    <main className="flex h-screen w-full bg-gray-50/50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 overflow-hidden transition-colors duration-300">
      
      {!activeSessionId ? (
        /* SCREEN 1: THE SESSIONS DASHBOARD */
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto w-full relative">
          
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button onClick={toggleTheme} className="rounded-full bg-gray-100 dark:bg-gray-800 p-2.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={handleLogout} className="rounded-full bg-gray-100 dark:bg-gray-800 p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-bold" title="Sign Out">
              <LogOutIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-16">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md text-sm">
                    S
                  </div> 
                </h1>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">Select a study session or create a new curriculum thread.</p>
              </div>

              <div className="flex items-center gap-3">

                {/* Visuals link removed as Penrose is archived */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 shrink-0"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Session</span>
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className="group relative cursor-pointer flex flex-col min-h-[160px] rounded-xl border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 shadow-sm hover:shadow-md dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-[85%]">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {session.name || "Untitled Session"}
                      </h3>
                      <p className="mt-1 flex items-center gap-2 text-[0.8rem] font-medium text-gray-500 dark:text-gray-400">
                        <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-blue-600 dark:text-blue-400">{session.subject || "Math"}</span>
                        <span>•</span>
                        <span className="truncate">{session.course || "General"}</span>
                      </p>
                      <p className="mt-2 text-[0.72rem] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 whitespace-nowrap">
                          {session.sessionFocus || session.userFacts?.areaOfFocus || "Concept quiz"}
                        </span>
                        {(session.focusDetail || session.userFacts?.focusTopic) && (
                          <span className="truncate opacity-80">
                            : {session.focusDetail || session.userFacts?.focusTopic} Prep
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-all shrink-0"
                      title="Delete Session"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-6 flex-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed">
                     <span className="font-bold text-gray-400 dark:text-gray-500 text-[0.7rem] uppercase block mb-1">
                       {session.sessionFocus || "General Review"} 
                       {(session.focusDetail || session.userFacts?.focusTopic) ? `: ${session.focusDetail || session.userFacts?.focusTopic}` : ""}
                     </span>
                     {session.sessionSummary || "No learning summary available yet. Jump in to get started!"}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-[0.7rem] font-medium uppercase tracking-wider text-gray-400">
                     <span>{session.messages?.length || 0} messages</span>
                  </div>
                </div>
              ))}

              {/* Empty state "New Session" Card */}
              <div 
                onClick={() => setIsModalOpen(true)}
                className="group cursor-pointer flex min-h-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 p-4 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:border-blue-500 transition-all duration-300"
              >
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <PlusIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">Create New Session</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SCREEN 2: ACTIVE SESSION CHAT VIEW */
        <div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900">
            {/* Minimal header bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
                {/* Back */}
                <button
                  onClick={() => setActiveSessionId(null)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Sessions
                </button>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {/* Focus indicator moved to sidebar above Learning Path */}

                  {/* Engine toggle pill removed as per request */}
 

                  <button
                    onClick={toggleTheme}
                    className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Toggle Theme"
                  >
                    {theme === "light" ? <MoonIcon /> : <SunIcon />}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="hidden md:flex rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
                  </button>
                </div>
            </div>

            {/* Dynamic Chat Canvas Container */}
            <div className={`mx-auto flex h-full w-full flex-col p-2 pt-16 sm:p-4 sm:pt-20 lg:p-6 lg:pt-20 transition-all duration-300 max-w-[1600px] gap-6 flex-row`}>
                {activeSession ? (
                  <ChatWindow 
                    session={activeSession} 
                    onUpdateSession={updateSession}
                  />
                ) : null}
            </div>
        </div>
      )}

      {/* New Session Config Modal inside Main App */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 text-sm">
           <div className="w-full max-w-[380px] rounded-xl border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in zoom-in-95">
              <h2 className="mb-4 text-xl font-extrabold text-gray-900 dark:text-gray-100">Configure Session</h2>
              <form onSubmit={createSessionFromModal} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Subject Focus</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-10 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                      value={modalSubject}
                      onChange={handleModalSubjectChange}
                    >
                      {Object.keys(courseOptions).length === 0 ? <option>Loading...</option> : Object.keys(courseOptions).map((s) => (
                        <option key={s} value={s}>{formatName(s)}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Course Selection</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-10 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-all focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                      value={modalCourse}
                      onChange={(e) => setModalCourse(e.target.value)}
                      disabled={!(courseOptions[modalSubject]?.length)}
                    >
                      {(courseOptions[modalSubject] || []).length === 0 ? <option>Loading...</option> : (courseOptions[modalSubject] || []).map((c) => (
                        <option key={c} value={c}>{formatName(c)}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Grade / Level</label>
                  <input
                    className="w-full rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-4 text-sm text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    value={modalGrade || ""}
                    onChange={(e) => setModalGrade(e.target.value)}
                    placeholder="e.g. 9th grade, Algebra 1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Session Focus</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-10 text-sm font-semibold text-gray-800 dark:text-gray-200 transition-all focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                      value={modalSessionFocus}
                      onChange={(e) => setModalSessionFocus(e.target.value)}
                    >
                      {FOCUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* DYNAMIC SURGICAL FOCUS FIELD */}
                {(modalSessionFocus === "Unit test" || modalSessionFocus === "Concept quiz") && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      {modalSessionFocus === "Unit test" ? "Select Unit/Standard" : "What concept should we quiz?"}
                    </label>
                    
                    {modalSessionFocus === "Unit test" ? (
                      <div className="relative">
                        <select
                          className="w-full appearance-none rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-10 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                          value={modalFocusDetail}
                          onChange={(e) => setModalFocusDetail(e.target.value)}
                        >
                          <option value="">Select a unit...</option>
                          {modalUnitOptions.map((opt, i) => (
                            <option key={i} value={opt.value} className={opt.type === 'domain' ? 'font-bold' : 'italic text-gray-500'}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
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
                                onClick={() => setModalFocusDetail(topic)}
                                className={`rounded-full px-3 py-1 text-[0.65rem] font-bold transition-all border ${modalFocusDetail === topic ? "bg-blue-600 text-white border-blue-500" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        )}
                        <input
                          className="w-full rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-4 text-xs text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                          value={modalFocusDetail}
                          onChange={(e) => setModalFocusDetail(e.target.value)}
                          placeholder="Or type a custom topic..."
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Focus Topic (Optional)</label>
                  <input
                    className="w-full rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-4 text-sm text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    value={modalFocusTopic || ""}
                    onChange={(e) => setModalFocusTopic(e.target.value)}
                    placeholder="e.g. linear equations"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Learning Preferences</label>
                  <input
                    className="w-full rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-4 text-sm text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    value={modalPreferences || ""}
                    onChange={(e) => setModalPreferences(e.target.value)}
                    placeholder="e.g. visual, step-by-step"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Learning Needs</label>
                  <input
                    className="w-full rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-4 text-sm text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    value={modalNeeds || ""}
                    onChange={(e) => setModalNeeds(e.target.value)}
                    placeholder="e.g. dyslexia support, ELL"
                  />
                </div>

                <div className="mt-6 flex gap-3 pt-1">
                  <button 
                    type="button" 
                    onClick={() => {
                        setIsModalOpen(false);
                        if (sessions.length === 0) handleLogout(); // Prevent trapping empty users
                    }}
                    className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 py-2.5 font-bold text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!modalSubject || !modalCourse || !modalSessionFocus || !modalFocusDetail}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none text-xs"
                  >
                    Start Learning
                  </button>
                </div>

              </form>
           </div>
        </div>
      )}
    </main>
  );
}