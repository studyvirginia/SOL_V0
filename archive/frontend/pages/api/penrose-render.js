// Server-side Penrose rendering — avoids all browser bundler/WASM/TLA issues.
// Penrose is designed for browser DOM but global-jsdom stubs what it needs in Node.
import "global-jsdom/register";
import { compile, optimize, toSVG, showError } from "@penrose/core";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { domain, substance, style, variation = "abc123" } = req.body ?? {};
  if (!domain || !substance || !style) {
    return res.status(400).json({ error: "domain, substance, style required" });
  }

  try {
    const compiled = await compile({ domain, substance, style, variation });
    if (compiled.isErr()) {
      return res.status(422).json({ error: showError(compiled.error) });
    }

    const optimized = optimize(compiled.value);
    if (optimized.isErr()) {
      return res.status(422).json({ error: showError(optimized.error) });
    }

    const svgEl = await toSVG(optimized.value, async () => undefined, "penrose");
    const rawSvg = typeof svgEl === "string" ? svgEl : svgEl.outerHTML;

    // Penrose serializes each color channel as Math.round(c_8bit * 255) in hex,
    // WITHOUT zero-padding. Channels 0–16 (value ≤ 4080) produce only 1–3 hex
    // digits instead of 4, yielding 5–11 char hex strings that browsers reject.
    //
    // Recovery: all valid channel values are multiples of 255 in [0, 65025].
    // We try all (len1, len2, len3) splits where each len is 1–4, find the
    // unique one where every group divided by 255 is an integer ≤ 255, and
    // decode as c_8bit = hex_group / 255.
    //
    // ORDER: run 5–11 char pass FIRST so its 6-char outputs are not re-consumed
    // by the 12-char pass (which requires exactly {4}{4}{4} = 12 hex chars).
    function normalizePenroseHex(svg) {
      function tryConvert(hex) {
        const n = hex.length;
        for (let l1 = 1; l1 <= 4; l1++) {
          for (let l2 = 1; l2 <= 4; l2++) {
            const l3 = n - l1 - l2;
            if (l3 < 1 || l3 > 4) continue;
            const rv = parseInt(hex.slice(0, l1).padStart(4, "0"), 16);
            const gv = parseInt(hex.slice(l1, l1 + l2).padStart(4, "0"), 16);
            const bv = parseInt(hex.slice(l1 + l2).padStart(4, "0"), 16);
            if (rv % 255 === 0 && gv % 255 === 0 && bv % 255 === 0
                && rv <= 65025 && gv <= 65025 && bv <= 65025) {
              return "#" + [rv, gv, bv].map(v =>
                Math.round(v / 255).toString(16).padStart(2, "0")
              ).join("");
            }
          }
        }
        return null;
      }
      return svg
        // Pass 1: 5–11 char hex (≥1 channel dropped a leading zero)
        .replace(/#([0-9a-fA-F]{5,11})(?![0-9a-fA-F])/g, (match, hex) =>
          tryConvert(hex) ?? match
        )
        // Pass 2: 12-char hex (all 3 channels produced 4 digits — common case)
        .replace(
          /#([0-9a-fA-F]{4})([0-9a-fA-F]{4})([0-9a-fA-F]{4})(?![0-9a-fA-F])/g,
          (_, r, g, b) =>
            "#" + [r, g, b].map(h =>
              Math.round(parseInt(h, 16) / 255).toString(16).padStart(2, "0")
            ).join("")
        );
    }

    const svg = normalizePenroseHex(rawSvg);

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ svg });
  } catch (err) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
}
