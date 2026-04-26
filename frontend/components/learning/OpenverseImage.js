import { useState, useEffect, useRef } from "react";

/**
 * OpenverseImage
 *
 * Inline educational image sourced from the Openverse API and validated by
 * a secondary LLM before display. Designed as a sparing visual anchor —
 * conceptually similar to RoughNotation but spatial: it attaches a concrete
 * visual to a concept mid-explanation rather than annotating text.
 *
 * Fails 100% silently: on any error (network, validation rejection, timeout)
 * the component returns null and takes up zero vertical space.
 *
 * Props:
 *   query        — 1-3 concrete noun keywords (e.g. "civil war cannon")
 *   lessonContext — 1-sentence description of what the student is learning
 *   subject      — e.g. "Biology"
 *   course       — e.g. "Biology I"
 */
export default function OpenverseImage({ query, lessonContext, subject, course }) {
  const [state, setState] = useState("loading"); // "loading" | "ready" | "failed"
  const [data, setData] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setState("failed");
      return;
    }

    setState("loading");
    setImgLoaded(false);
    const controller = new AbortController();
    abortRef.current = controller;

    // 8-second hard timeout — fail silently if the pipeline is slow
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch("/api/openverse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, lessonContext, subject, course }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("no_result");
        return res.json();
      })
      .then((json) => {
        if (!json.thumbnail && !json.url) throw new Error("no_result");
        setData(json);
        setState("ready");
      })
      .catch(() => {
        setState("failed");
      })
      .finally(() => {
        clearTimeout(timeout);
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query, lessonContext, subject, course]);

  // ── Silent fail: zero vertical space ─────────────────────────────────────
  if (state === "failed") return null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="openverse-skeleton my-6 mx-auto" style={{ maxWidth: 560 }}>
        <div
          style={{
            height: 240,
            borderRadius: "1rem",
            background: "linear-gradient(90deg, rgba(148,163,184,0.12) 25%, rgba(148,163,184,0.22) 50%, rgba(148,163,184,0.12) 75%)",
            backgroundSize: "200% 100%",
            animation: "openverse-shimmer 1.6s ease-in-out infinite",
          }}
        />
        <style>{`
          @keyframes openverse-shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  // ── Render validated image ────────────────────────────────────────────────
  const { thumbnail, url, caption, attribution, foreignLandingUrl } = data;
  const imgSrc = thumbnail || url;

  return (
    <figure
      className="openverse-figure my-6 mx-auto"
      style={{
        maxWidth: 560,
        opacity: imgLoaded ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Image */}
      <div
        style={{
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          background: "rgba(148,163,184,0.08)",
          lineHeight: 0,
        }}
      >
        <img
          src={imgSrc}
          alt={caption || query}
          onLoad={() => setImgLoaded(true)}
          onError={() => setState("failed")}
          style={{
            width: "100%",
            maxHeight: 320,
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Caption */}
      {caption && (
        <figcaption
          style={{
            marginTop: "0.5rem",
            fontSize: "0.82rem",
            lineHeight: 1.55,
            color: "var(--openverse-caption, rgba(100,116,139,0.9))",
            fontStyle: "italic",
            paddingLeft: "0.25rem",
          }}
        >
          {caption}
        </figcaption>
      )}

      {/* Minimal attribution */}
      {attribution && (
        <figcaption
          style={{
            marginTop: "0.2rem",
            fontSize: "0.68rem",
            color: "var(--openverse-attribution, rgba(148,163,184,0.7))",
            paddingLeft: "0.25rem",
          }}
        >
          {foreignLandingUrl ? (
            <a
              href={foreignLandingUrl}
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {attribution}
            </a>
          ) : (
            attribution
          )}
        </figcaption>
      )}
    </figure>
  );
}
