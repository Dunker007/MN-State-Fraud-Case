import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import LegalDisclaimer from '@/components/LegalDisclaimer';
import SystemBanner from '@/components/SystemBanner';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import WebVitalsReporter from '@/components/WebVitalsReporter';

// ...

export const metadata: Metadata = {
  metadataBase: new URL('https://projectcrosscheck.org'),
  title: 'PROJECT CROSSCHECK | MN Fraud Forensic Audit',
  description: 'Verified forensic analysis of the $9 Billion MN DHS financial diversion. Tracking the ghost network.',
  keywords: ['Minnesota fraud', 'DHS investigation', 'Feeding Our Future', 'government accountability', 'Paid Leave'],
  authors: [{ name: 'Project CrossCheck' }],
  openGraph: {
    title: 'PROJECT CROSSCHECK',
    description: 'Exposing $9B+ in Minnesota state fraud. Real-time forensic audit dashboard.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Project CrossCheck',
    images: [
      {
        url: '/assets/logos/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Project CrossCheck - MN Fraud Forensic Audit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROJECT CROSSCHECK | MN Fraud Investigation',
    description: 'Real-time tracking of $9B+ in Minnesota state fraud. Join the investigation.',
    images: ['/assets/logos/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import CompactTopNav from '@/components/CompactTopNav';
import { Suspense } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        suppressHydrationWarning
      >
        <div className="min-h-screen flex flex-col">
          <SystemBanner />
          <Suspense fallback={<div className="h-16 bg-black border-b border-zinc-800" />}>
            <CompactTopNav />
          </Suspense>
          <div className="flex-1 pt-16">
            {children}
            <SpeedInsights />
            <Analytics />
            <WebVitalsReporter />
          </div>
          <LegalDisclaimer />
        </div>
      </body>
    </html>
  );
}
