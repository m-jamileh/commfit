import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SwRegister } from "./sw-register";
import { CommFitQueryProvider } from "@commfit/ui";

export const metadata: Metadata = {
  title: "Comm-Fit Field",
  description: "Comm-Fit Service — Technician PWA",
  manifest: "/manifest.json",
  themeColor: "#16314D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-bg font-sans text-text-primary antialiased">
        <CommFitQueryProvider>
          <SwRegister />
          <div className="flex flex-col min-h-screen max-w-md mx-auto">
            {/* Content */}
            <main className="flex-1 overflow-y-auto pb-16">
              {children}
            </main>

            {/* Bottom nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-10">
              <div className="max-w-md mx-auto flex">
                <Link
                  href="/today"
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 text-text-muted hover:text-primary transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span className="text-xs font-medium">Today</span>
                </Link>
                <Link
                  href="/history"
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 text-text-muted hover:text-primary transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="text-xs font-medium">History</span>
                </Link>
              </div>
            </nav>
          </div>
        </CommFitQueryProvider>
      </body>
    </html>
  );
}
