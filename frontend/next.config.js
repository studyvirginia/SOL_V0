const path = require("path");

// react-plotly.js resolves `plotly.js/dist/plotly`; we ship the min bundle instead.
const plotlyMinAbs = path.join(
  __dirname,
  "node_modules/plotly.js-dist-min/plotly.min.js"
);
// Turbopack `root` is the repo root (`..`); alias paths are relative to that root.
const plotlyMinRel = "./frontend/node_modules/plotly.js-dist-min/plotly.min.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@penrose/core"],
  turbopack: {
    root: path.join(__dirname, ".."),
    resolveAlias: {
      "plotly.js/dist/plotly": plotlyMinRel,
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "plotly.js/dist/plotly": plotlyMinAbs,
    };
    // @rose-lang/wasm uses top-level await to load its WASM binary.
    // asyncWebAssembly + topLevelAwait enable this.
    // CRITICAL: target es2022 on the client so webpack emits native async/await
    // instead of a require()-based polyfill, which breaks in the browser.
    if (!isServer) {
      config.target = ["web", "es2022"];
    }
    config.experiments = {
      ...(config.experiments ?? {}),
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      util: false,
      path: false,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;