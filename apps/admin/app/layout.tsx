import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'First Ride Admin',
  description: 'First Ride Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
