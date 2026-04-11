import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

const DESMOS_API_KEY = "9299ac9714cd4f159e4a6a40b9c8e4a2";
const DESMOS_SCRIPT = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${DESMOS_API_KEY}`;

/**
 * DesmosRenderer
 * Renders an interactive Desmos graphing calculator from a state object.
 *
 * Props:
 *   state — output of parseDesmosResponse():
 *     { expressions: [...], viewport: {left,bottom,right,top}, showGrid, showAxes, title }
 */
export default function DesmosRenderer({ state }) {
  const containerRef = useRef(null);
  const calcRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && typeof window.Desmos !== "undefined"
  );
  const [error, setError] = useState(null);

  // Initialise calculator once both the script and container are ready
  useEffect(() => {
    if (!scriptReady || !containerRef.current || !state) return;
    if (typeof window.Desmos === "undefined") return;

    try {
      // Destroy previous instance if re-rendering
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }

      const calc = window.Desmos.GraphingCalculator(containerRef.current, {
        // Configuration options — these persist through setState() calls
        expressionsCollapsed: true,
        expressionsTopbar:    false,
        settingsMenu:  false,
        zoomButtons:   true,
        border:        false,
        lockViewport:  false,
        images:        false,
        folders:       false,
        notes:         false,
        sliders:       false,
        links:         false,
        keypad:        false,
        distributions: false,
        trace:         true,
        pointsOfInterest: false,
        administerSecretFolders: false,
      });

      calcRef.current = calc;

      // Apply ALL graph-state settings via updateSettings.
      // Graph settings (showGrid, degreeMode, xAxisStep, etc.) ARE included in
      // getState(), so they survive the getState/setState round-trip below.
      calc.updateSettings({
        showGrid:   state.showGrid   ?? true,
        showXAxis:  state.showAxes   ?? true,
        showYAxis:  state.showAxes   ?? true,
        degreeMode: state.degreeMode ?? false,
        polarMode:  state.polarMode  ?? false,
        xAxisLabel: state.xAxisLabel ?? "",
        yAxisLabel: state.yAxisLabel ?? "",
        ...(state.xAxisStep    != null && { xAxisStep:    state.xAxisStep    }),
        ...(state.yAxisStep    != null && { yAxisStep:    state.yAxisStep    }),
        ...(state.xAxisNumbers != null && { xAxisNumbers: state.xAxisNumbers }),
        ...(state.yAxisNumbers != null && { yAxisNumbers: state.yAxisNumbers }),
      });

      // Set viewport via the documented API — MUST happen before getState()
      // so the correct bounds are captured in the opaque state below.
      calc.setMathBounds({
        left:   state.viewport?.left   ?? -10,
        right:  state.viewport?.right  ?? 10,
        bottom: state.viewport?.bottom ?? -10,
        top:    state.viewport?.top    ?? 10,
      });

      // Two-rAF + getState/setState round-trip:
      //
      //   rAF 1 — setExpressions: registers all expressions into Desmos's list
      //   rAF 2 — setState(getState()): by this frame Desmos has had a full
      //           paint cycle to register the expressions. getState() returns
      //           the valid opaque state (with correct viewport + settings set
      //           above). setState() triggers a complete evaluator reset —
      //           this is what makes floor(x)/abs(x)/polygon()/polar curves
      //           render immediately without the "type-a-letter" workaround.
      //
      // Tables sorted first so regression expressions (y_1~mx_1+b) can resolve
      // their column references on the very first evaluation pass.

      const raw = state.expressions || [];
      const tables  = raw.filter(e => e.type === "table");
      const others  = raw.filter(e => e.type !== "table");
      const ordered = [...tables, ...others];

      const toSet = ordered.map(e => {
        if (e.type === "table") {
          return { type: "table", id: e.id, columns: e.columns };
        }
        const expr = {
          type:      "expression",
          id:        e.id,
          latex:     e.latex  ?? "",
          color:     e.color  ?? "#007AFF",
          hidden:    e.hidden ?? false,
          showLabel: e.showLabel ?? false,
        };
        const passThrough = [
          "lineStyle","lineWidth","lineOpacity",
          "pointStyle","pointSize","pointOpacity",
          "points","lines","fill","fillOpacity",
          "dragMode","label","labelOrientation","labelSize",
          "parametricDomain","polarDomain","sliderBounds",
        ];
        for (const key of passThrough) {
          if (e[key] != null) expr[key] = e[key];
        }
        return expr;
      });

      let rafId = requestAnimationFrame(() => {
        if (!calcRef.current) return;

        // rAF 1: push all expressions in using the documented incremental API.
        calcRef.current.setExpressions(toSet);

        // rAF 2: force a full evaluation cycle via the getState/setState
        // round-trip. getState() returns Desmos's own valid opaque state
        // (including randSeed, internal expression metadata, etc).
        // setState() with that triggers a complete evaluator reset.
        rafId = requestAnimationFrame(() => {
          if (!calcRef.current) return;
          try {
            calcRef.current.setState(calcRef.current.getState());
          } catch (err) {
            console.error("[DesmosRenderer] setState round-trip", err);
          }
        });
      });

      // Cleanup: cancel pending rAF and destroy calculator
      return () => {
        cancelAnimationFrame(rafId);
        if (calcRef.current) {
          calcRef.current.destroy();
          calcRef.current = null;
        }
      };
    } catch (err) {
      console.error("[DesmosRenderer]", err);
      setError(err.message);
    }

    // Cleanup on unmount (fallback if try block didn't return its own cleanup)
    return () => {
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
  }, [scriptReady, state]);

  if (!state) return null;

  return (
    <>
      <Script
        src={DESMOS_SCRIPT}
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Failed to load Desmos API")}
      />

      <div className="desmos-centering-wrapper w-full flex justify-center my-10">
        <div className="desmos-renderer-container inline-flex flex-col items-start justify-center p-4 border border-slate-200/60 rounded-[2rem] bg-white/80 backdrop-blur-md shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden group relative">

          {state.title && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 px-4">
              {state.title}
            </p>
          )}

          {error ? (
            <div className="flex items-center justify-center w-[540px] h-[380px] text-sm text-red-400 italic">
              Graph could not be loaded: {error}
            </div>
          ) : !scriptReady ? (
            <div className="flex items-center justify-center w-[540px] h-[380px] gap-2 text-xs font-semibold text-blue-500 uppercase tracking-widest opacity-60">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading graph…
            </div>
          ) : (
            <div
              ref={containerRef}
              style={{ width: "540px", height: "380px" }}
              className="rounded-2xl overflow-hidden"
            />
          )}

          <div className="absolute top-1.5 right-3 select-none pointer-events-none">
            <span className="text-[9px] font-bold tracking-widest uppercase text-slate-300 opacity-60">
              Desmos
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
