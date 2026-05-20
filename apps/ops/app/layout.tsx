import type { Metadata } from "next";
import "./globals.css";
import { OpsShell } from "./ops-shell";

export const metadata: Metadata = {
  title: "Comm-Fit Internal Ops",
  description: "Comm-Fit Service — Internal Operations Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg font-sans text-text-primary antialiased">
        <OpsShell>{children}</OpsShell>
      </body>
    </html>
  );
}
