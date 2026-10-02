import type { NextConfig } from "next";

/**
 * `react-native` resolves to its web implementation.
 *
 * @hanzo/ui draws on @hanzo/gui, which is cross-platform: a few of its parts
 * reach for `react-native`, and the package that answers on web is
 * `react-native-web`. Without the alias the bundler reads React Native's own
 * source, which is Flow, and stops at the first `import typeof`. The `$` is
 * exact-match, so deep paths still resolve normally.
 */
const alias = {
  "react-native$": "react-native-web",
  // The registry package forwards to React Native's own internals, which the
  // alias above has already replaced, so it resolves to undefined and any
  // component asking it to register an asset throws. react-native-web ships the
  // web implementation of the same module.
  "@react-native/assets-registry/registry$": "react-native-web/dist/modules/AssetRegistry",
};
const web = [".web.tsx", ".web.ts", ".web.jsx", ".web.js"];

const nextConfig: NextConfig = {
  output: "export",
  // The gui packages ship untranspiled ESM resolved against react-native.
  transpilePackages: ["@hanzo/gui", "@hanzo/ui", "@hanzogui/shell", "react-native-web"],
  images: {
    unoptimized: true,
  },
  // TypeScript 7 has no compiler API; Next shells out to tsc instead.
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
      "@react-native/assets-registry/registry": "react-native-web/dist/modules/AssetRegistry",
    },
    resolveExtensions: [...web, ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, ...alias };
    config.resolve.extensions = [...web, ...config.resolve.extensions];
    return config;
  },
};

export default nextConfig;
