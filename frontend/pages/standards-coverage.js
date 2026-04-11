/**
 * /pages/standards-coverage.js
 * Comprehensive AI Prompt Pipeline Coverage Dashboard.
 * One image card per every SOL curriculum standard (~919 standards).
 * Evaluates the LLM's ability to act as a tutor and generate effective visual aid queries.
 */

import { useState, useEffect, useCallback, useRef } from "react";

const SUBJECT_COLORS = {
  math:    { bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-blue-200 dark:border-blue-800",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",    dot: "bg-blue-500" },
  english: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300", dot: "bg-violet-500" },
  history: { bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",   dot: "bg-amber-500" },
  science: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300", dot: "bg-emerald-500" },
};

function StatusBadge({ status }) {
  if (status === "done")    return <span className="inline-block h-2 w-2 rounded-full bg-green-400 shrink-0" title="Image loaded" />;
  if (status === "loading") return <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse shrink-0" title="Loading…" />;
  if (status === "error")   return <span className="inline-block h-2 w-2 rounded-full bg-red-400 shrink-0" title="Error in pipeline" />;
  return <span className="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" title="Not tested" />;
}

function StandardCard({ standard, result, loading, onTest }) {
  const [expanded, setExpanded] = useState(false);
  const colors = SUBJECT_COLORS[standard.subject] || SUBJECT_COLORS.math;
  const status = loading ? "loading" : result === undefined ? "idle" : result?.error ? "error" : "done";

  return (
    <div className={`rounded-xl border ${colors.border} bg-white dark:bg-gray-900 overflow-hidden shadow-sm flex flex-col transition-shadow hover:shadow-md`}>
      {/* Header */}
      <div className={`px-3 py-2.5 ${colors.bg} border-b ${colors.border} flex items-start gap-2`}>
        <StatusBadge status={status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[0.6rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${colors.badge}`}>{standard.code}</span>
            <span className="text-[0.6rem] text-gray-400 dark:text-gray-500 font-medium truncate">{standard.course}</span>
          </div>
          <p className="mt-1 text-[0.7rem] leading-snug line-clamp-3">
            {result?.explanation ? (
              <span className="text-indigo-800 dark:text-indigo-300 font-medium tracking-tight">AI: {result.explanation}</span>
            ) : (
              <span className="text-gray-700 dark:text-gray-300">{standard.description}</span>
            )}
          </p>
        </div>
      </div>

      {/* Image area */}
      <div
        className="relative bg-gray-50 dark:bg-gray-800/50 h-36 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => status === "idle" ? onTest() : setExpanded(!expanded)}
      >
        {status === "idle" && (
          <button
            onClick={(e) => { e.stopPropagation(); onTest(); }}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.414-4.414a2 2 0 012.828 0L16 16m-2-2l1.414-1.414a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-[0.6rem] font-semibold">Test Prompt Pipeline</span>
          </button>
        )}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-2 p-2 text-center w-full">
            <svg className="animate-spin h-5 w-5 text-indigo-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-[0.6rem] text-indigo-500 font-bold max-w-full truncate px-4">
              {result?.prompting === false ? `Fetching: "${result.query}"…` : "Prompting AI…"}
            </span>
          </div>
        )}
        {status === "done" && result?.url && (
          <img
            src={result.url}
            alt={standard.code}
            className={`w-full h-full object-contain p-1 transition-all ${expanded ? "object-cover" : ""}`}
          />
        )}
        {status === "error" && (
          <div className="text-center px-3 w-full">
            <p className="text-[0.65rem] font-bold text-red-500 truncate max-w-full">{result.error}</p>
            <button onClick={(e) => { e.stopPropagation(); onTest(); }} className="mt-1 text-[0.6rem] text-blue-500 hover:underline">Retry</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
        <div className="flex-1 min-w-0 mr-2 flex flex-col justify-center">
          {status !== "idle" && result?.query ? (
            <>
              <span className="text-[0.6rem] font-bold text-gray-800 dark:text-gray-100 truncate font-mono bg-blue-100/50 dark:bg-blue-900/30 px-1 py-0.5 rounded inline-block w-fit mb-0.5 uppercase tracking-wide">
                AI Q: {result.query}
              </span>
              {status === "done" && result?.sourceUrl && (
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[0.55rem] text-gray-400 hover:text-blue-500 truncate inline-block"
                >
                  {decodeURIComponent(result.sourceUrl.split("/File:")[1] || "").replace(/_/g, " ")} (Wiki)
                </a>
              )}
            </>
          ) : (
            <span className="text-[0.6rem] text-gray-400 dark:text-gray-600 font-mono truncate">{standard.domain}</span>
          )}
        </div>
        
        {status === "idle" && (
          <button
            onClick={onTest}
            className="shrink-0 text-[0.6rem] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded"
          >
            Run Pipeline
          </button>
        )}
        {status === "done" && (
          <button onClick={onTest} className="shrink-0 text-[0.6rem] text-gray-400 hover:text-indigo-500 font-bold ml-1">↻ Retest</button>
        )}
      </div>
    </div>
  );
}

// Groups standards by subject → course → domain
function groupStandards(standards) {
  const grouped = {};
  for (const std of standards) {
    if (!grouped[std.subject]) grouped[std.subject] = {};
    if (!grouped[std.subject][std.course]) grouped[std.subject][std.course] = {};
    if (!grouped[std.subject][std.course][std.domain]) grouped[std.subject][std.course][std.domain] = [];
    grouped[std.subject][std.course][std.domain].push(std);
  }
  return grouped;
}

export default function StandardsCoverageDashboard() {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({});        // { [standard.id]: { url, sourceUrl, error, explanation, query, prompting } | null }
  const [loadingIds, setLoadingIds] = useState({});  // { [standard.id]: true }
  const [activeSubject, setActiveSubject] = useState("all");
  const [visualOnly, setVisualOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [runQueue, setRunQueue] = useState([]);       // queue of ids to process
  const processingRef = useRef(false);

  // Stats
  const tested   = Object.keys(results).length;
  const successes = Object.values(results).filter(r => r && !r.error && r.url).length;
  const errors   = Object.values(results).filter(r => r?.error).length;

  useEffect(() => {
    fetch("/api/all-standards")
      .then(r => r.json())
      .then(data => { setStandards(data.standards || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const fetchOne = useCallback(async (standard) => {
    const id = standard.id;
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    setResults(prev => ({ ...prev, [id]: { prompting: true } }));
    
    try {
      // Step 1: Prompt API pipeline
      const promptRes = await fetch("/api/test-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standard }),
      });
      const promptData = await promptRes.json();
      
      if (promptData.error) throw new Error(`LLM Error: ${promptData.error}`);
      const query = promptData.query;
      
      if (!query) throw new Error("AI pipeline failed to generate an image query token.");

      setResults(prev => ({ 
        ...prev, 
        [id]: { prompting: false, query, explanation: promptData.explanation } 
      }));

      // Step 2: Wikimedia Integration
      const wikiRes = await fetch("/api/wikimedia-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const wikiData = await wikiRes.json();
      
      setResults(prev => ({ 
        ...prev, 
        [id]: { 
           ...prev[id],
           prompting: false,
           ...(wikiData.error ? { error: wikiData.error } : wikiData)
        } 
      }));
    } catch (e) {
      setResults(prev => ({ ...prev, [id]: { error: e.message, prompting: false } }));
    } finally {
      setLoadingIds(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  }, []);

  // Queue processor — drains queue one at a time with 2-second delay to respect LLM rate limits
  useEffect(() => {
    if (processingRef.current || runQueue.length === 0) return;
    processingRef.current = true;

    const process = async () => {
      while (runQueue.length > 0) {
        const id = runQueue[0];
        setRunQueue(prev => prev.slice(1));
        const std = standards.find(s => s.id === id);
        if (std) await fetchOne(std);
        await new Promise(r => setTimeout(r, 2000)); // Sleep between LLM calls
      }
      processingRef.current = false;
    };
    process();
  }, [runQueue, standards, fetchOne]);

  const enqueue = useCallback((ids) => {
    setRunQueue(prev => [...prev, ...ids.filter(id => !prev.includes(id))]);
  }, []);

  const runForSubject = (subject) => {
    const ids = standards.filter(s => s.subject === subject).map(s => s.id);
    enqueue(ids);
  };

  const runForCourse = (subject, course) => {
    const ids = standards.filter(s => s.subject === subject && s.course === course).map(s => s.id);
    enqueue(ids);
  };

  const runAll = () => {
    const ids = displayedStandards.map(s => s.id);
    enqueue(ids);
  };

  // Visual heuristic filter
  const isVisual = (std) => {
    const text = (std.code + " " + std.description + " " + std.domain).toLowerCase();
    const keywords = [
      // Math
      "geometry", "graph", "plot", "shape", "polygon", "triangle", "angle", "proof", "pythagorean", "volume", "area", "coordinate", "scatter", "histogram", "boxplot", "translation", "reflection", "rotation", "measurement", "model",
      // Science
      "cell", "anatomy", "ecosystem", "diagram", "model", "fossil", "planet", "solar", "cycle", "structure", "rock", "geological", "weather", "atmosphere", "organism", "chemical", "forces", "motion", "plate",
      // History
      "map", "war", "battle", "artifact", "portrait", "empire", "geography", "trade route", "civil war", "world war", "architecture", "culture", "colony", "invention", "ancient", "monument",
      // General
      "visual", "media", "illustration", "picture", "photograph", "chart"
    ];
    return keywords.some(kw => text.includes(kw));
  };

  // Filtering
  const displayedStandards = standards.filter(s => {
    if (visualOnly && !isVisual(s)) return false;
    if (activeSubject !== "all" && s.subject !== activeSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.course.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q);
    }
    return true;
  });

  const grouped = groupStandards(displayedStandards);
  const subjects = ["all", "math", "english", "history", "science"];

  const queueSize = runQueue.length + Object.keys(loadingIds).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm font-semibold text-gray-500">Loading {standards.length || "…"} standards…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 font-bold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
          {/* Title */}
          <div className="shrink-0 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
            <h1 className="text-sm font-extrabold tracking-tight text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[0.6rem] font-black">AI</span>
              Prompt Pipeline Tester
            </h1>
            <p className="text-[0.6rem] font-medium text-indigo-600/80 dark:text-indigo-300">
              {standards.length} standards · {tested} tested · {successes} ✅ · {errors} ❌
              {queueSize > 0 && <span className="ml-2 text-orange-500 font-black animate-pulse">⚡ {queueSize} processing</span>}
            </p>
          </div>

          {/* Progress bar */}
          {tested > 0 && (
            <div className="hidden md:flex flex-1 items-center gap-2 max-w-xs">
              <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all" style={{ width: `${(tested / standards.length) * 100}%` }} />
              </div>
              <span className="text-[0.6rem] font-bold text-gray-400">{Math.round((tested / standards.length) * 100)}%</span>
            </div>
          )}

          {/* Search */}
          <div className="flex-1 max-w-xs min-w-[160px]">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search standards, codes, domains…"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Subject filter */}
          <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-1">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                className={`px-3 py-1 rounded-md text-[0.65rem] font-bold transition-all capitalize ${activeSubject === s ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
              >
                {s === "all" ? `All (${standards.length})` : s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setVisualOnly(!visualOnly)}
            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors border ${
              visualOnly 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-400" 
                : "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${visualOnly ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
            Highly Visual Only
          </button>

          {/* Run all visible */}
          <button
            onClick={runAll}
            disabled={queueSize > 0}
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-colors disabled:opacity-40 shadow-sm"
          >
            {queueSize > 0 ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Processing Queue…
              </>
            ) : `▶ Run ${displayedStandards.length} Visible`}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-12">
        {Object.entries(grouped).map(([subject, courses]) => {
          const colors = SUBJECT_COLORS[subject] || SUBJECT_COLORS.math;
          const subjectStdCount = Object.values(courses).flatMap(d => Object.values(d)).flat().length;

          return (
            <section key={subject}>
              {/* Subject Header */}
              <div className={`flex items-center justify-between rounded-xl px-5 py-3 mb-6 ${colors.bg} border ${colors.border} shadow-sm`}>
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${colors.dot}`} />
                  <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-800 dark:text-gray-100 capitalize">{subject}</h2>
                  <span className="text-xs text-gray-400 font-medium">{subjectStdCount} standards · {Object.keys(courses).length} courses</span>
                </div>
                <button
                  onClick={() => runForSubject(subject)}
                  disabled={queueSize > 0}
                  className="text-[0.65rem] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 disabled:opacity-40"
                >
                  ▶ Run All {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </button>
              </div>

              {/* Courses */}
              <div className="space-y-8 pl-2">
                {Object.entries(courses).map(([course, domains]) => {
                  const courseStds = Object.values(domains).flat();
                  const courseTested = courseStds.filter(s => results[s.id] !== undefined).length;

                  return (
                    <div key={course}>
                      {/* Course header */}
                      <div className="flex items-center justify-between mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">{course}</h3>
                          <span className="text-[0.65rem] text-gray-400">{courseStds.length} standards</span>
                          {courseTested > 0 && (
                            <span className="text-[0.65rem] text-indigo-500 font-semibold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{courseTested} tested</span>
                          )}
                        </div>
                        <button
                          onClick={() => runForCourse(subject, course)}
                          disabled={queueSize > 0}
                          className="text-[0.65rem] font-bold text-blue-500 hover:text-blue-700 disabled:opacity-40"
                        >
                          ▶ Run Course
                        </button>
                      </div>

                      {/* Domain → Standards grid */}
                      {Object.entries(domains).map(([domain, stds]) => (
                        <div key={domain} className="mb-6">
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 ml-1">{domain}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                            {stds.map(std => (
                              <StandardCard
                                key={std.id}
                                standard={std}
                                result={results[std.id]}
                                loading={!!loadingIds[std.id]}
                                onTest={() => fetchOne(std)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {displayedStandards.length === 0 && (
          <div className="py-24 text-center text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold">No standards match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
