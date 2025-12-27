import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Silence Turbopack warning for PWA webpack config
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
    runtimeCaching: [
      {
        urlPattern: ({ request, url }) =>
          request.mode === "navigate" ||
          ["/", "/workouts", "/nutrition", "/progress", "/me", "/offline"].includes(url.pathname) ||
          url.pathname.startsWith("/workouts"),
        handler: "CacheFirst", // Extreme offline: Use cache directly
        options: {
          cacheName: "offline-pages",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /\.(?:js|css|json|woff2?)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "offline-static",
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "offline-images",
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "offline-fonts",
        }
      }
    ],
  },
})(config);

export default nextConfig;
