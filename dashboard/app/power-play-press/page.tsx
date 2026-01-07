import { fetchNewsAPI } from '@/lib/news-api';
import PowerPlayFeed from '@/components/PowerPlayFeed';
import { Share2, Clock } from 'lucide-react';
import Link from 'next/link';
import HunterPhaseIndicator from '@/components/HunterPhaseIndicator';



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
        url: 'https://projectcrosscheck.org/power-play-press',
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


            <div className="w-full max-w-[95%] lg:max-w-none lg:w-auto mx-auto px-4 lg:px-8 pb-2 pt-0 lg:pt-0">

                {/* Compact Horizontal Hero */}
                <div className="mb-4 relative rounded-lg border border-zinc-800 bg-[#09090b]/90 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

                    <div className="relative px-4 py-3 flex items-center justify-between gap-4">
                        {/* Left: Branding */}
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic transform -skew-x-3">
                                <span className="text-red-600">POWER</span><span className="text-white">PLAY</span><span className="text-blue-500">PRESS</span>
                            </h1>
                            <span className="hidden md:block text-zinc-600 text-xs font-mono">|</span>
                            <span className="hidden md:block text-zinc-500 text-xs font-mono uppercase tracking-widest">
                                Your Press Pass to the Fraud War Room
                            </span>
                        </div>

                        {/* Center: Stats */}
                        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-white font-bold">{articles.reduce((acc, a) => acc + 1 + (a.relatedStories?.length || 0), 0)}</span>
                                <span className="text-zinc-500">HITS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span className="text-white font-bold">{articles.length}</span>
                                <span className="text-zinc-500">STORIES</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600">
                                <Clock className="w-3 h-3" />
                                <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        {/* Right: Share */}
                        <Link
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check the latest MN fraud developments on Project CrossCheck.")}&url=${encodeURIComponent("https://powerplaypress.org/power-play-press")}`}
                            target="_blank"
                            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-[10px] rounded transition-colors"
                        >
                            <Share2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Share</span>
                        </Link>
                    </div>
                </div>

                {/* Main Feed */}
                <PowerPlayFeed initialArticles={sortedArticles} />
            </div>


        </main>
    );
}
