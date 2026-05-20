import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comm-Fit Tech PWA',
  description: 'Comm-Fit Service — Technician PWA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
