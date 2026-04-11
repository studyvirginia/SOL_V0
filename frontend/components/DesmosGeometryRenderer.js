/**
 * DesmosGeometryRenderer.js
 * Renders a Desmos Geometry calculator from a geometryState object.
 *
 * geometryState shape (produced by /api/desmos-geometry-generate):
 *   {
 *     state: <raw Desmos Geometry state object from getState()>,
 *     title: string
 *   }
 *
 * The Desmos Geometry API uses the same calculator.js script as
 * GraphingCalculator, but is instantiated via Desmos.Geometry().
 * State is set/retrieved via getState()/setState().
 */
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const DESMOS_API = "https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";

export default function DesmosGeometryRenderer({ state }) {
  const containerRef = useRef(null);
  const calcRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && !!window.Desmos
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scriptReady || !state || !containerRef.current) return;
    const Desmos = window.Desmos;

    if (!Desmos?.Geometry) {
      setError("Desmos.Geometry is not available on this API key.");
      return;
    }

    if (!calcRef.current) {
      calcRef.current = Desmos.Geometry(containerRef.current, {
        border: false,
        backgroundColor: "white",
      });
    }

    if (state.state) {
      try {
        calcRef.current.setState(state.state);
        setError(null);
      } catch (e) {
        setError("Failed to apply geometry state: " + e.message);
      }
    }
  }, [scriptReady, state]);

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

      {error && (
        <div className="px-4 py-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        style={{ width: "100%", height: error ? "0px" : "400px" }}
        className="desmos-geometry"
      />
    </div>
  );
}
