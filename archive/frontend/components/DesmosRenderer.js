/**
 * DesmosRenderer.js
 * Renders a Desmos GraphingCalculator from a desmosState object.
 *
 * desmosState shape (produced by /api/desmos-generate):
 *   {
 *     expressions: [{ id, latex, color?, label?, showLabel?, hidden?,
 *                     lineStyle?, lineWidth?, pointStyle?, pointSize?,
 *                     dragMode?, fill?, fillOpacity?, points?, lines?,
 *                     parametricDomain?, polarDomain? }],
 *     viewport:    { left, bottom, right, top },
 *     showGrid:    boolean,
 *     showAxes:    boolean,
 *     degreeMode:  boolean,
 *     polarMode:   boolean,
 *     title:       string
 *   }
 */
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const DESMOS_API = "https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";

export default function DesmosRenderer({ state }) {
  const containerRef = useRef(null);
  const calcRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && !!window.Desmos
  );

  // Initialise/update calculator whenever state or scriptReady changes
  useEffect(() => {
    if (!scriptReady || !state || !containerRef.current) return;
    const Desmos = window.Desmos;
    if (!Desmos?.GraphingCalculator) return;

    if (!calcRef.current) {
      calcRef.current = Desmos.GraphingCalculator(containerRef.current, {
        keypad:          false,
        expressions:     false,
        settingsMenu:    false,
        zoomButtons:     true,
        lockViewport:    false,
        border:          false,
        backgroundColor: "transparent",
      });
    }

    const calc = calcRef.current;

    // Apply top-level settings
    calc.updateSettings({
      showGrid:   state.showGrid  ?? true,
      showXAxis:  state.showAxes  ?? true,
      showYAxis:  state.showAxes  ?? true,
      degreeMode: state.degreeMode ?? false,
      polarMode:  state.polarMode  ?? false,
    });

    // Set viewport
    if (state.viewport) {
      calc.setMathBounds(state.viewport);
    }

    // Set expressions
    calc.setExpressions(state.expressions || []);
  }, [scriptReady, state]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (calcRef.current) {
        try { calcRef.current.destroy(); } catch {}
        calcRef.current = null;
      }
    };
  }, []);

  if (!state) return null;

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-900">
      {state.title && (
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
          <p className="text-[0.8rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
            {state.title}
          </p>
        </div>
      )}

      <Script
        src={DESMOS_API}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div
        ref={containerRef}
        style={{ width: "100%", height: "400px" }}
        className="desmos-calculator"
      />
    </div>
  );
}
