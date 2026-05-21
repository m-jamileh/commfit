"use client";
import { CommFitQueryProvider, CommfitClientProvider, createCommfitClient } from "@commfit/ui";

// Module-level singleton; avoids re-creating the client on every render
const commfitClient = createCommfitClient({
  getAuthHeaders: (): Record<string, string> => {
    if (typeof document === "undefined") return {};
    const match = document.cookie.match(/(?:^|;\s*)commfit-tech-session=([^;]*)/);
    const session = match?.[1];
    return session ? { Authorization: `Bearer ${session}` } : {};
  },
});

export function TechProviders({ children }: { children: React.ReactNode }) {
  return (
    <CommFitQueryProvider>
      <CommfitClientProvider client={commfitClient}>
        {children}
      </CommfitClientProvider>
    </CommFitQueryProvider>
  );
}
