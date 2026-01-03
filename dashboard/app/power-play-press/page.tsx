import { fetchNewsAPI } from '@/lib/news-api';
import PowerPlayFeed from '@/components/PowerPlayFeed';
import { Share2, Clock } from 'lucide-react';
import Link from 'next/link';

import { CrosscheckHeader } from '@/components/CrosscheckHeader';
import PowerPlayNavigation from '@/components/PowerPlayNavigation';

import DesktopSidebar from '@/components/DesktopSidebar';

// Force dynamic rendering since we are fetching live data
export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Power Play Press | MN Fraud Intel',
    description: 'Latest intel drops exposing Minnesota\'s chain of failure. $9B+ diversion. 480 whistleblowers ignored.',
    openGraph: {
        title: 'Power Play Press | MN Fraud Intel',
        description: 'Truth drops from the investigation. Swipe Left on oversight failures.',
        url: 'https://project-crosscheck.vercel.app/power-play-press',
        siteName: 'Project CrossCheck',
        images: [
            {
                url: '/assets/logos/crosscheck-literal.png', // Fallback to local asset if remote not available yet
                width: 1200,
                height: 630,
                alt: 'Power Play Press — Chain of Failure Exposed',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Power Play Press',
        description: 'Latest drops exposing the chain.',
        images: ['/assets/logos/crosscheck-literal.png'],
    },
};

export default async function PowerPlayPage() {
    const articles = await fetchNewsAPI();

    // Sort by relevance score desc to ensure "top 5-10" are first
    const sortedArticles = [...articles].sort((a, b) => b.relevanceScore - a.relevanceScore);

    return (
        <main className="min-h-screen bg-[#050505] text-[#ededed] font-mono selection:bg-purple-500 selection:text-black">
            <DesktopSidebar />

            <div className="lg:hidden">
                <CrosscheckHeader />
                <PowerPlayNavigation />
            </div>

            <div className="w-full max-w-[95%] lg:max-w-none lg:ml-64 lg:w-auto mx-auto px-4 lg:px-8 pb-2 pt-0 lg:pt-0">
                {/* Desktop Branding */}
                <div className="hidden lg:block mb-2 -mx-4 lg:-mx-8">
                    <CrosscheckHeader />
                </div>

                {/* Compact HUD Hero Section */}
                <div className="mb-4 relative rounded-xl border border-white/10 bg-[#09090b]/80 backdrop-blur-md overflow-hidden">

                    {/* Background Tech Effects */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-50" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-red/20 to-transparent opacity-30" />

                    <div className="relative p-3 md:p-3 flex flex-col justify-center items-center gap-4 text-center">
                        {/* Center: Branding & Status */}
                        <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-3 justify-center">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic transform -skew-x-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <span className="text-red-600">POWER</span> <span className="text-white">PLAY</span> <span className="text-blue-500">PRESS</span>
                                </h1>
                                <div className="hidden md:block h-8 w-[2px] bg-zinc-800 rotate-12" />
                                <span className="hidden md:block text-neon-red text-lg font-mono font-bold tracking-widest uppercase animate-pulse">
                                    Your Press Pass to the Fraud War Room
                                </span>
                            </div>

                            {/* Mobile Subtitle */}
                            <span className="md:hidden text-neon-red text-xs font-mono font-bold tracking-widest uppercase">
                                Your Press Pass to the Fraud War Room
                            </span>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 justify-center">
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-zinc-300 font-bold">{articles.reduce((acc, a) => acc + 1 + (a.relatedStories?.length || 0), 0)}</span>
                                    <span>RAW HITS</span>
                                </div>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_5px_#a855f7]"></span>
                                    <span className="text-zinc-300 font-bold">{articles.length}</span>
                                    <span>UNIQUE STORIES</span>
                                </div>
                                <div className="hidden lg:flex items-center gap-2 bg-black/40 px-3 py-1 rounded border border-white/5">
                                    <Clock className="w-3 h-3 text-zinc-500" />
                                    <span className="text-zinc-500 font-bold uppercase">Updated</span>
                                    <span className="text-zinc-300 font-mono">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                                <span className="hidden md:inline text-zinc-600">//</span>
                                <span className="hidden sm:inline">Aggregated from mainstream media, court filings, and social signals.</span>
                            </div>
                        </div>

                        {/* Right: Actions (Absolute on Desktop) */}
                        <div className="flex items-center gap-4 shrink-0 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2">
                            <Link
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check the latest MN fraud developments on Project CrossCheck.")}&url=${encodeURIComponent("https://glasshouse.mn.gov/power-play-press")}`}
                                target="_blank"
                                className="group relative px-5 py-2.5 bg-zinc-100 hover:bg-white text-black font-bold uppercase tracking-wider text-[10px] transition-all clip-path-slant"
                            >
                                <div className="flex items-center gap-2">
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>Share Feed</span>
                                </div>
                                <div className="absolute right-0 bottom-0 w-2 h-2 bg-purple-500 transform translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <PowerPlayFeed initialArticles={sortedArticles} />
            </div>

            <footer className="mt-20 border-t border-zinc-900 py-12 text-center text-zinc-600 font-mono text-xs">
                <p>GENERATED BY PROJECT CROSSCHECK INTELLIGENCE CORE</p>
            </footer>
        </main>
    );
}
