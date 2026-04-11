/**
 * PenroseRenderer.js
 *
 * Renders a Penrose trio by posting to /api/penrose-render (server-side).
 * This avoids all browser bundler issues (TLA polyfill, WASM, mathjax CJS).
 *
 * Props:
 *   domain     {string}  Penrose .domain program
 *   substance  {string}  Penrose .substance program
 *   style      {string}  Penrose .style program
 *   variation  {string}  Random seed string
 */

import { useEffect, useState } from "react";

export default function PenroseRenderer({
  domain,
  substance,
  style,
  variation = "abc123",
}) {
  const [svgHTML, setSvgHTML] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("running");

  useEffect(() => {
    let alive = true;
    setSvgHTML(null);
    setError(null);
    setPhase("running");

    (async () => {
      try {
        const res = await fetch("/api/penrose-render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, substance, style, variation }),
        });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || data.error) {
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        setSvgHTML(data.svg);
        setPhase("done");
      } catch (err) {
        if (alive) {
          setError(err?.message ?? String(err));
          setPhase("error");
        }
      }
    })();

    return () => { alive = false; };
  }, [domain, substance, style, variation]);

  if (phase === "running") {
    return (
      <div className="flex items-center justify-center h-52 text-sm text-slate-400 animate-pulse">
        Optimizing layout…
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="m-2 p-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded overflow-auto max-h-28">
        <span className="font-semibold">Penrose error: </span>
        <pre className="mt-0.5 whitespace-pre-wrap break-words">{error}</pre>
      </div>
    );
  }

  // Penrose SVG fills the container; force a sensible max-width
  return (
    <div
      className="w-full [&>svg]:w-full [&>svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svgHTML }}
    />
  );
}
