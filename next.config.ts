import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: true,
  },
};

const nextConfig = withPWA({
  dest: "public",
  disable: false,
  register: true,
  sw: "sw.js",
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
  },
})(config);

export default nextConfig;
