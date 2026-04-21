import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book a Recording — Curiosity Theory',
  description: 'Schedule your Curiosity Theory podcast recording with Justin and Dakotah.',
  openGraph: {
    title: 'Book a Recording — Curiosity Theory',
    siteName: 'Curiosity Theory',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark">
      <body
        className="min-h-full flex flex-col ct-starfield"
        style={{ backgroundColor: 'var(--ct-bg)', color: 'var(--ct-text)' }}
      >
        {children}
      </body>
    </html>
  );
}
