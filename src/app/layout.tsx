import type { Metadata } from 'next';
import { Inter_Tight, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/site';

const sans = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Spice Lane — a tasting belt that keeps turning',
  description: 'Spice Lane: pick a plate from our rotating 3D tasting belt and order in seconds.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Spice Lane — a tasting belt that keeps turning',
    description: 'Spin the 3D tasting belt, tap a plate, order in seconds.',
    type: 'website',
    siteName: 'Spice Lane',
  },
  twitter: { card: 'summary_large_image', title: 'Spice Lane', description: 'Spin the 3D tasting belt, tap a plate, order in seconds.' },
  robots: { index: true, follow: true },
};

export const viewport = { themeColor: '#0a0a0a', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="grain min-h-screen bg-bg">
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
