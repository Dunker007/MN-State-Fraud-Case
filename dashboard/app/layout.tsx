import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import LegalDisclaimer from "@/components/LegalDisclaimer";

// ...

export const metadata: Metadata = {
  title: "PROJECT CROSSCHECK | MN Fraud Forensic Audit",
  description: "Verified forensic analysis of the $9 Billion MN DHS financial diversion. Tracking the ghost network.",
};

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
          <div className="flex-1">
            {children}
          </div>
          <LegalDisclaimer />
        </div>
      </body>
    </html>
  );
}
