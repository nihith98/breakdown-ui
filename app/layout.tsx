import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'breakDown — Privacy-first expense splitting',
  description: 'Split expenses with friends and family, the privacy-first way',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
