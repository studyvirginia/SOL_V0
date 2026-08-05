/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.solprep.com" }],
        destination: "https://solprep.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  transpilePackages: [],
  serverExternalPackages: ['@e2b/code-interpreter', 'e2b'],
  experimental: {},
  webpack: (config, { isServer }) => {
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
    config.resolve.alias = {
      ...config.resolve.alias,
      chalk: require.resolve('./lib/chalk-polyfill.js'),
    };
    return config;
  },
};

module.exports = nextConfig;