'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import ProviderChecker from '@/components/ProviderChecker';

export default function CheckMyProviderPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
                        <Shield className="w-4 h-4" />
                        PROJECT GLASS HOUSE
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <Suspense fallback={
                    <div className="text-center py-20">
                        <div className="inline-block w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
                        <p className="text-zinc-500 mt-4">Loading provider database...</p>
                    </div>
                }>
                    <ProviderChecker />
                </Suspense>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-900 py-8 text-center">
                <p className="text-xs text-zinc-600 font-mono">
                    DATA SOURCE: MN DHS LICENSE LOOKUP // LAST VERIFIED: DEC 30, 2025
                </p>
                <p className="text-xs text-zinc-700 mt-2">
                    This tool is for informational purposes. Always verify with official state records.
                </p>
            </footer>
        </div>
    );
}
