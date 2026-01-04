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
import { SpeedInsights } from "@vercel/speed-insights/next";

// ...

export const metadata: Metadata = {
  metadataBase: new URL('https://project-crosscheck.vercel.app'),
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

import { CrosscheckHeader } from '@/components/CrosscheckHeader';

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
          <CrosscheckHeader />
          <div className="flex-1">
            {children}
            <SpeedInsights />
          </div>
          <LegalDisclaimer />
        </div>
      </body>
    </html>
  );
}
