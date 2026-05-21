import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Comm-Fit Customer Portal",
  description: "Comm-Fit Service — Customer Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg font-sans text-text-primary antialiased min-h-screen">
        <Providers>
          {/* Top navigation */}
          <header className="bg-surface border-b border-border sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
              {/* Logo */}
              <Link href="/overview" className="flex items-center gap-2 shrink-0">
                <div className="h-7 w-7 rounded bg-accent flex items-center justify-center">
                  <span className="text-xs font-bold text-white font-display">CF</span>
                </div>
                <span className="font-display font-semibold text-sm text-text-primary hidden md:block">
                  Comm-Fit
                </span>
              </Link>

              {/* Nav links */}
              <nav className="flex items-center gap-1 flex-1">
                {[
                  { label: "Overview", href: "/overview" },
                  { label: "Properties", href: "/properties" },
                  { label: "Service Requests", href: "/service-requests" },
                  { label: "Invoices", href: "/invoices" },
                  { label: "Contracts", href: "/contracts" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-1.5 rounded text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-primary/5 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* User */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">S</span>
                </div>
                <span className="text-sm text-text-secondary hidden md:block">Sandra Kim</span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
