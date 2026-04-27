/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [],
  experimental: {
    serverExternalPackages: ['@e2b/code-interpreter', 'e2b'],
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
    config.resolve.alias = {
      ...config.resolve.alias,
      chalk: require.resolve('./lib/chalk-polyfill.js'),
    };
    return config;
  },
};

module.exports = nextConfig;