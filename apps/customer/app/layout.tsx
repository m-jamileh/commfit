import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comm-Fit Customer Portal',
  description: 'Comm-Fit Service — Customer Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
