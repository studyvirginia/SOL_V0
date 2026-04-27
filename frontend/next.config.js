/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  turbopack: {},
  experimental: {
    serverExternalPackages: ['@e2b/code-interpreter', 'e2b', 'chalk'],
    esmExternals: 'loose',
  },
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
    return config;
  },
};

module.exports = nextConfig;