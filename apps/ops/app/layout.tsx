import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comm-Fit Internal Ops',
  description: 'Comm-Fit Service — Internal Operations Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
