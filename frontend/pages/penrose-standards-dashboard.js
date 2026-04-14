import fs from "fs";
import path from "path";
import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import {
  buildPenroseStandardsEntries,
  PENROSE_ARCHETYPES,
  PENROSE_TOPIC_RULES,
} from "../lib/penroseStandardsDashboard";

const PenroseRenderer = dynamic(() => import("../components/PenroseRenderer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-52 text-xs text-slate-400 animate-pulse">
      Loading Penrose…
    </div>
  ),
});

function topicLabelById(topicId) {
  return PENROSE_TOPIC_RULES.find((rule) => rule.id === topicId)?.label ?? topicId;
}

function PenroseArchetypeCard({ archetypeId, renderAllToken }) {
  const archetype = PENROSE_ARCHETYPES[archetypeId];
  const [active, setActive] = useState(false);
  const triggeredRef = useRef(false);

  if (!archetype || !archetype.trio) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        Missing archetype configuration: <span className="font-semibold">{archetypeId}</span>
      </div>
    );
  }

  useEffect(() => {
    if (renderAllToken > 0 && !triggeredRef.current) {
      triggeredRef.current = true;
      setActive(true);
    }
  }, [renderAllToken]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{archetype.title}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-600">{archetype.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">
            Penrose
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {archetype.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-[280px] p-3">
        {!active ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <button
              onClick={() => {
                triggeredRef.current = true;
                setActive(true);
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Render archetype
            </button>
          </div>
        ) : (
          <PenroseRenderer
            domain={archetype.trio.domain}
            substance={archetype.trio.substance}
            style={archetype.trio.style}
            variation={archetype.trio.variation}
          />
        )}
      </div>
    </div>
  );
}

export default function PenroseStandardsDashboard({ entries, totalStandards, scannedCourses }) {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [renderAllToken, setRenderAllToken] = useState(0);

  const courseOptions = useMemo(
    () => ["all", ...new Set(entries.map((entry) => entry.course))],
    [entries],
  );

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCourse = selectedCourse === "all" || entry.course === selectedCourse;
      const matchesTopic = selectedTopic === "all" || entry.topicIds.includes(selectedTopic);
      return matchesCourse && matchesTopic;
    });
  }, [entries, selectedCourse, selectedTopic]);

  return (
    <>
      <Head>
        <title>Penrose Standards Dashboard</title>
      </Head>

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Standards Scan
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Penrose-Only Standards Dashboard
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  This page scans every math standard in curriculum JSON, keeps only standards that are structurally diagram-first and Penrose-suitable, and shows note archetypes alongside practice archetypes. Function graphs, data plots, and other Matplotlib-first standards are intentionally excluded.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                    Standards scanned
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{totalStandards}</div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                    Penrose-fit standards
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{entries.length}</div>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
                    Courses scanned
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-slate-900">{scannedCourses}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Course
                  <select
                    value={selectedCourse}
                    onChange={(event) => setSelectedCourse(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                  >
                    {courseOptions.map((course) => (
                      <option key={course} value={course}>
                        {course === "all" ? "All courses" : course}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Topic
                  <select
                    value={selectedTopic}
                    onChange={(event) => setSelectedTopic(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                  >
                    <option value="all">All Penrose topics</option>
                    {PENROSE_TOPIC_RULES.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{filteredEntries.length}</span> standards
                </div>
                <button
                  onClick={() => setRenderAllToken((token) => token + 1)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                >
                  Render all visible archetypes
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {filteredEntries.map((entry) => (
              <section
                key={entry.code}
                className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {entry.code}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {entry.course}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {entry.domain}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {entry.skillCount} skills
                      </span>
                    </div>
                    <p className="mt-4 text-base leading-7 text-slate-800">{entry.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {entry.topicIds.map((topicId) => (
                        <span
                          key={topicId}
                          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                        >
                          {topicLabelById(topicId)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Why Penrose fits
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      This standard is primarily about structural geometry, sets, graphs, or diagrammatic relationships rather than plotted numeric functions or statistical charts.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-8 xl:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">Note archetypes</h2>
                      <span className="text-xs font-medium text-slate-500">Concept / explanation diagrams</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {entry.noteArchetypeIds.map((archetypeId) => (
                        <PenroseArchetypeCard
                          key={`${entry.code}-${archetypeId}`}
                          archetypeId={archetypeId}
                          renderAllToken={renderAllToken}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">Practice archetypes</h2>
                      <span className="text-xs font-medium text-slate-500">Problem-ready diagram skeletons</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {entry.practiceArchetypeIds.map((archetypeId) => (
                        <PenroseArchetypeCard
                          key={`${entry.code}-${archetypeId}`}
                          archetypeId={archetypeId}
                          renderAllToken={renderAllToken}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function resolveMathDataDir() {
  const candidates = [
    path.resolve(process.cwd(), "../backend/data/Math"),
    path.resolve(process.cwd(), "backend/data/Math"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

export async function getStaticProps() {
  const mathDir = resolveMathDataDir();
  if (!mathDir) {
    throw new Error("Could not resolve backend/data/Math for the Penrose standards dashboard.");
  }

  const files = fs.readdirSync(mathDir).filter((file) => file.endsWith(".json"));
  const courses = files.map((file) => {
    const fullPath = path.join(mathDir, file);
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  });

  const totalStandards = courses.reduce((count, course) => {
    return count + (course.domains || []).reduce((domainCount, domain) => {
      return domainCount + (domain.standards || []).length;
    }, 0);
  }, 0);

  return {
    props: {
      entries: buildPenroseStandardsEntries(courses),
      totalStandards,
      scannedCourses: courses.length,
    },
  };
}