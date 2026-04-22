import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authContext";
import { supabase } from "../lib/supabaseClient";
import AuthOverlay from "../components/AuthOverlay";
import ChatWindow, { formatName } from "../components/ChatWindow";
import MasteryDashboard from "../components/MasteryDashboard";
import { 
  LogOutIcon, 
  TrashIcon, 
  PlusIcon, 
  ChevronDownIcon, 
  MaximizeIcon, 
  MinimizeIcon, 
  SunIcon, 
  MoonIcon,
  ZapIcon,
  BarChart3,
  BookOpen,
  Target
} from "lucide-react";

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
  "Welcome. Let's begin with a quick diagnostic to identify your strongest and weakest areas. When you're ready, say: Start diagnostic. %%ACTIONS%%[{\"label\": \"Begin\", \"prompt\": \"Start diagnostic\", \"targetMode\": \"diagnostic\"}, {\"label\": \"Skip\", \"prompt\": \"Skip diagnostic and go to notes\", \"targetMode\": \"notes\"}]%%END_ACTIONS%%";

export default function Home() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();

  // Local State
  const [isReady, setIsReady] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isDyslexic, setIsDyslexic] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimalResponseMode, setIsMinimalResponseMode] = useState(false);
  const [graphEngine, setGraphEngine] = useState("geogebra");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMastery, setShowMastery] = useState(false);
  const [courseOptions, setCourseOptions] = useState({});
  const [modalSubject, setModalSubject] = useState("math");
  const [modalCourse, setModalCourse] = useState("algebra-1");
  const [modalGrade, setModalGrade] = useState("");
  const [modalSessionFocus, setModalSessionFocus] = useState("Concept quiz");
  const [modalFocusTopic, setModalFocusTopic] = useState("");
  const [modalFocusDetail, setModalFocusDetail] = useState("");
  const [modalUnitOptions, setModalUnitOptions] = useState([]);
  const [modalTopicSuggestions, setModalTopicSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [modalPreferences, setModalPreferences] = useState("");
  const [modalNeeds, setModalNeeds] = useState("");
  const [modalStudentName, setModalStudentName] = useState("");

  // Sync profile preferences to local state
  useEffect(() => {
    if (profile) {
      if (profile.is_dyslexic !== undefined) setIsDyslexic(profile.is_dyslexic);
      if (profile.is_focus_mode !== undefined) setIsFocusMode(profile.is_focus_mode);
    }
  }, [profile]);

  const toggleDyslexia = async (val) => {
    setIsDyslexic(val);
    if (user) await updateProfile({ is_dyslexic: val });
  };

  const toggleFocusMode = async (val) => {
    setIsFocusMode(val);
    if (user) await updateProfile({ is_focus_mode: val });
  };

  // Authentication Setup & Theme Init
  useEffect(() => {
    // 2. Theme Init
    const savedTheme = localStorage.getItem("sol_theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Migration Bridge: Push local sessions to DB on first login
  useEffect(() => {
    if (!user || authLoading) return;

    const syncLocalData = async () => {
      // Try local storage first if using mock user
      if (localStorage.getItem('sol_mock_user')) {
        const localSessions = JSON.parse(localStorage.getItem('sol_local_sessions') || '[]');
        if (localSessions.length > 0) {
          setSessions(localSessions);
          return;
        }
      }

      const { data, error } = await supabase
        .from('sessions')
        .select('*, messages(*)')
        .order('updated_at', { ascending: false });
      
      if (data && data.length > 0) {
        console.log("[Schema Debug] Sessions Column Keys:", Object.keys(data[0]));
      }
      if (data && data.length > 0) {
        const formatted = data.map(s => ({
            id: s.id,
            name: formatName(s.course),
            subject: s.subject,
            course: s.course,
            retrievalMode: s.messages?.[s.messages.length - 1]?.content.includes('%%ACTIONS%%') ? 'diagnostic' : 'notes',
            journey: createDefaultJourney(),
            sessionFocus: s.session_focus,
            focusDetail: "",
            userFacts: { studentName: user.user_metadata?.full_name || "Student" },
            messages: s.messages?.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map(m => ({
              ...m,
              subMode: m.sub_mode
            })) || []
        }));
        setSessions(formatted);
      }
    };

    syncLocalData();
  }, [user, authLoading]);

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
    setModalFocusDetail("");
  }, [modalSessionFocus, modalCourse, modalSubject]);

  useEffect(() => {
    fetch("/api/courses").then(res => res.json()).then(data => {
        if (data?.options) {
            setCourseOptions(data.options);
            const firstSub = Object.keys(data.options)[0] || "";
            setModalSubject(firstSub);
            setModalCourse(data.options[firstSub]?.[0] || "");
        }
    }).catch(console.error);
    setIsReady(true);
  }, []);

  // Fullscreen UI handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("sol_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const handleModalSubjectChange = (e) => {
    const newSub = e.target.value;
    setModalSubject(newSub);
    setModalCourse(courseOptions[newSub]?.[0] || "");
  };

  const createSessionFromModal = async (e) => {
    e.preventDefault();
    const { data: newSession, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id === '00000000-0000-0000-0000-000000000000' ? null : user.id, // Bypass if mock
        subject: modalSubject,
        course: modalCourse,
        session_focus: modalSessionFocus
      })
      .select('*, messages(*)')
      .single();

    if (error || !newSession) {
      if (user.id === '00000000-0000-0000-0000-000000000000' || error?.status === 401 || error?.status === 403) {
        console.warn("[Session Storage Fallback]: Using LocalStorage due to Auth/RLS restrictions.");
        const mockNewSession = {
          id: Math.random().toString(36).substr(2, 9),
          name: formatName(modalCourse),
          subject: modalSubject,
          course: modalCourse,
          sessionFocus: modalSessionFocus,
          messages: [],
          journey: createDefaultJourney(),
          userFacts: { studentName: user.user_metadata?.student_name || "Student" }
        };
        const updated = [mockNewSession, ...sessions];
        setSessions(updated);
        localStorage.setItem('sol_local_sessions', JSON.stringify(updated));
        setActiveSessionId(mockNewSession.id);
        setIsModalOpen(false);
        return;
      }
    }

    if (newSession) {
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setIsModalOpen(false);
    }
  };

  const updateSession = (updatedSession) => {
    setSessions((prev) => {
      const next = prev.map((s) => (s.id === updatedSession.id ? updatedSession : s));
      if (user.id === '00000000-0000-0000-0000-000000000000' || !user.id) {
        localStorage.setItem('sol_local_sessions', JSON.stringify(next));
      }
      return next;
    });
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    await supabase.from('sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  if (authLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
         <div className="h-8 w-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthOverlay />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDyslexic ? "dyslexia-mode" : ""} ${isFocusMode ? "focus-mode" : ""}`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {showMastery ? (
        <MasteryDashboard onBack={() => setShowMastery(false)} />
      ) : !activeSessionId ? (
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 animate-in fade-in duration-700">
           <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  Welcome, <span className="text-blue-600 dark:text-blue-400">{profile?.full_name?.split(' ')[0] || "Student"}</span>
                </h1>
                <p className="mt-3 text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                   Select a focus to continue your SOL V2 Journey
                </p>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                  onClick={() => signOut()}
                  className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Sign Out"
                 >
                   <LogOutIcon size={20} />
                 </button>
                <Link
                  href="/standards-coverage"
                  className="hidden md:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-[0.7rem] font-bold text-gray-600 dark:text-gray-300 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
                  title="Coverage Analytics"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Coverage</span>
                </Link>
                <button
                  onClick={() => setShowMastery(true)}
                  className="flex items-center gap-2 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/30 px-4 py-2.5 text-[0.7rem] font-bold text-blue-600 dark:text-blue-400 shadow-sm transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95"
                  title="Mastery Hub"
                >
                  <Target className="h-3.5 w-3.5" />
                  <span>Mastery Hub</span>
                </button>
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
                    </div>
                    <button
                      onClick={(e) => deleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-all shrink-0"
                      title="Delete Session"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between text-[0.7rem] font-medium uppercase tracking-wider text-gray-400">
                     <span>{session.messages?.length || 0} messages</span>
                  </div>
                </div>
              ))}
            </div>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-gray-900">
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-100/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
                <button
                  onClick={() => setActiveSessionId(null)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Sessions
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMinimalResponseMode(!isMinimalResponseMode)} className={`rounded-lg p-1.5 transition-colors ${isMinimalResponseMode ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`} title="Toggle Minimal Mode"><ZapIcon /></button>
                  <button onClick={toggleTheme} className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{theme === "light" ? <MoonIcon /> : <SunIcon />}</button>
                  <button onClick={toggleFullscreen} className="hidden md:flex rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}</button>
                </div>
            </div>

            <div className={`mx-auto flex h-full w-full flex-col p-2 pt-16 sm:p-4 sm:pt-20 lg:p-6 lg:pt-20 transition-all duration-300 max-w-[1600px] gap-6 flex-row`}>
                {activeSession ? (
                  <ChatWindow 
                    session={activeSession} 
                    onUpdateSession={updateSession}
                    graphEngine={graphEngine}
                    isMinimalResponseMode={isMinimalResponseMode}
                    isDyslexic={isDyslexic}
                    isFocusMode={isFocusMode}
                    onToggleDyslexia={toggleDyslexia}
                    onToggleFocusMode={toggleFocusMode}
                    theme={theme}
                    toggleTheme={toggleTheme}
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
                  <label className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Student Name</label>
                  <input
                    className="w-full rounded-lg border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-3 pr-4 text-sm text-gray-800 dark:text-gray-200 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    value={modalStudentName}
                    onChange={(e) => setModalStudentName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                  />
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
                        if (sessions.length === 0) signOut(); // Prevent trapping empty users
                    }}
                    className="flex-1 rounded-lg bg-gray-100 dark:bg-gray-800 py-2.5 font-bold text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!modalSubject || !modalCourse || !modalSessionFocus}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none text-xs"
                  >
                    Start Learning
                  </button>
                </div>

              </form>
           </div>
        </div>
      )}
    </div>
  );
}