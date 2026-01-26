import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PersonalityToggle } from "@/components/layout/PersonalityToggle";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NotificationInitializer } from "@/components/notifications/NotificationInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitTrack Pro",
  description: "Offline-first personal fitness tracker",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Disables pinch-zoom for app-like feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="FitTrack Pro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FitTrack" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className={`${inter.className} min-h-screen pb-24 antialiased`} style={{
        backgroundColor: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))'
      }} suppressHydrationWarning>
        <ThemeProvider>
          <NotificationInitializer />
          <ThemeToggle />
          <PersonalityToggle />
          <main className="container mx-auto max-w-md px-4 pt-6">
            <Header />
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>

        {/* PWA & Reliability Scripts */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // 1. Force reload on ChunkLoadErrors (Critical for PWAs after redeploy)
            const handleChunkError = (message) => {
              const chunkError = /Loading chunk [\\d]+ failed | ChunkLoadError | Loading CSS chunk /i;
              if (message && chunkError.test(message)) {
                console.warn('PWA: Asset mismatch detected. Recovering...');
                window.location.reload();
              }
            };

            window.addEventListener('error', (e) => handleChunkError(e.message), true);
            window.addEventListener('unhandledrejection', (e) => {
              const reason = e.reason && (e.reason.message || e.reason.toString());
              handleChunkError(reason);
            });

            // 2. Service Worker Registration with Update Logic
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('SW registered: ', registration.scope);
                  
                  // Check for updates on every page navigation
                  registration.update();

                  // Handle immediate take over
                  registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker == null) return;
                    installingWorker.onstatechange = () => {
                      if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                          console.log('New content detected. Reloading...');
                          window.location.reload();
                        }
                      }
                    };
                  };
                }).catch(function(err) {
                  console.log('SW registration failed: ', err);
                });
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
