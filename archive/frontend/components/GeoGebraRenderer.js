import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const GGB_SCRIPT = "https://www.geogebra.org/apps/deployggb.js";

// Module-level counter so every applet instance gets a unique DOM id,
// even when multiple GeoGebraRenderer components are mounted simultaneously.
let ggbCounter = 0;

/**
 * GeoGebraRenderer
 * Renders an interactive GeoGebra Classic applet from an AI-generated state.
 *
 * Props:
 *   state — output of parseGeoGebraResponse():
 *     { cmds: string[], view: [xmin,xmax,ymin,ymax], showGrid, title }
 */
export default function GeoGebraRenderer({ state }) {
  const containerRef = useRef(null);
  // Considered ready if GGBApplet is already on window (script preloaded or
  // previously loaded by another instance on this page).
  const [scriptReady, setScriptReady] = useState(
    typeof window !== "undefined" && typeof window.GGBApplet !== "undefined"
  );
  const [error, setError] = useState(null);

  // Poll briefly after Script loads — GGBApplet is defined synchronously when
  // the script executes, so this resolves within one tick after onLoad fires.
  // Also handles the case where the script was already loaded globally.
  useEffect(() => {
    if (scriptReady) return;
    const poll = setInterval(() => {
      if (typeof window !== "undefined" && typeof window.GGBApplet !== "undefined") {
        setScriptReady(true);
        clearInterval(poll);
      }
    }, 100);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !state) return;
    if (typeof window.GGBApplet === "undefined") return;

    setError(null);

    // Clear any previous applet
    containerRef.current.innerHTML = "";

    const appletId = `ggb_chat_${++ggbCounter}`;
    const inner = document.createElement("div");
    inner.id = appletId;
    containerRef.current.appendChild(inner);

    const [xmin = -10, xmax = 10, ymin = -10, ymax = 10] = state.view || [];
    const width = containerRef.current.offsetWidth || 560;

    const params = {
      appName:          "classic",
      width:            width,
      height:           420,
      showToolBar:      false,
      showAlgebraInput: false,
      showMenuBar:      false,
      enableRightClick: false,
      errorDialogsActive: false,
      useBrowserForJS:  false,
      id:               appletId,
      appletOnLoad(api) {
        try {
          api.setPerspective("G");
          api.setCoordSystem(xmin, xmax, ymin, ymax);
          api.setAxesVisible(true, true);
          api.setGridVisible(state.showGrid ?? true);
          api.setErrorDialogsActive(false);

          for (const cmd of state.cmds || []) {
            api.evalCommand(cmd);
          }

          // Double rAF — let GeoGebra finish its own layout pass, then refresh
          requestAnimationFrame(() => {
            requestAnimationFrame(() => api.refreshViews());
          });
        } catch (err) {
          setError(err.message);
        }
      },
    };

    const applet = new window.GGBApplet(params, true);
    applet.inject(appletId);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [scriptReady, state]);

  if (!state) return null;

  return (
    <>
      <Script
        src={GGB_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Failed to load GeoGebra")}
      />

      <div className="ggb-centering-wrapper w-full flex justify-center my-10">
        <div className="ggb-renderer-container inline-flex flex-col items-start justify-center p-4 border border-slate-200/60 rounded-[2rem] bg-white/80 backdrop-blur-md shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden group relative"
             style={{ minWidth: 320, maxWidth: 640, width: "100%" }}>

          {/* Header bar */}
          <div className="flex items-center justify-between w-full mb-3 px-1">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-orange-500 opacity-80">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[0.6rem] font-black uppercase tracking-[0.15em] text-slate-400">
                GeoGebra
              </span>
            </div>
            {state.title && (
              <span className="text-[0.72rem] font-semibold text-slate-500 truncate max-w-[260px]">
                {state.title}
              </span>
            )}
          </div>

          {/* Applet container */}
          {error ? (
            <div className="w-full rounded-2xl bg-red-50 border border-red-100 p-4 text-xs text-red-500 font-medium">
              {error}
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full rounded-2xl overflow-hidden"
              style={{ minHeight: 420 }}
            />
          )}
        </div>
      </div>
    </>
  );
}
