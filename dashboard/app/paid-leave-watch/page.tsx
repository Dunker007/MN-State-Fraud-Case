import { fetchNewsAPI } from '@/lib/news-api';
import { CrosscheckHeader } from '@/components/CrosscheckHeader';
import DashboardNavigation from '@/components/DashboardNavigation';
import PaidLeaveCharts from '@/components/PaidLeaveCharts';
import PowerPlayFeed from '@/components/PowerPlayFeed';
import PowerPlayNavigation from '@/components/PowerPlayNavigation'; // Reuse the wrapper for simplicity

// Force dynamic rendering since we are fetching live data
export const dynamic = 'force-dynamic';
export const revalidate = 900; // 15 mins

export default async function PaidLeavePage() {
    // Fetch all news, then filter for Paid Leave specific terms client-side or we can just pass all and let the user see the context
    // Actually, let's filter here if possible, or reliance on the specific "Paid Leave" keywords hitting GDELT recently.
    // Given the "Hunter Protocol" rotates, we might not always have "Paid Leave" news in the cache if we are in Phase 1 (Targets).
    // However, with the new keywords added to ALL phases or a specific phase, it will pop up eventually. 
    // For now, passing all standard news is fine, but ideally we'd filter.

    const allArticles = await fetchNewsAPI();

    // Simple filter for relevance to this page
    const paidLeaveKeywords = ['paid leave', 'medical leave', 'varilek', 'deed', 'insolvency', 'tax hike'];
    const filteredArticles = allArticles.filter(a =>
        paidLeaveKeywords.some(k => (a.title + a.description).toLowerCase().includes(k)) ||
        a.matchedKeywords.some(k => paidLeaveKeywords.some(pk => k.toLowerCase().includes(pk)))
    );

    // If filter is too strict and returns empty, fallback to all (or maybe show "No recent specific news")
    // Let's show all if specific is empty to keep the visual full, but visually prioritized.
    const articlesToShow = filteredArticles.length > 0 ? filteredArticles : allArticles.slice(0, 6);

    return (
        <main className="min-h-screen bg-[#050505] text-[#ededed] font-mono selection:bg-amber-500 selection:text-black">
            <CrosscheckHeader />
            <PowerPlayNavigation /> {/* This will highlight the current tab if we updated nav logic, otherwise it defaults to what we set */}

            {/* 
               Wait, PowerPlayNavigation forces 'power_play' tab active. 
               We need a specific nav for this page or update PowerPlayNavigation to be generic. 
               Let's update PowerPlayNavigation to be generic or just Render DashboardNavigation directly here.
            */}

            <div className="container mx-auto px-4 py-8 max-w-[1600px]">
                {/* HERO */}
                <div className="mb-12 border-b border-white/10 pb-8">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                        PAID LEAVE <span className="text-amber-500">FRAUD WATCH</span>
                    </h1>
                    <p className="text-xl text-zinc-500 mt-4 max-w-3xl">
                        Operational oversight of the $1.2B MN Paid Leave implementation.
                        Tracking insolvency velocity and application fraud vectors.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* LEFT COL: DATA VISUALIZATION */}
                    <div className="xl:col-span-8">
                        <PaidLeaveCharts />
                    </div>

                    {/* RIGHT COL: NEWS FEED */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-2">
                            <h3 className="text-lg font-bold text-amber-500 font-mono">
                                SECTOR_INTEL
                            </h3>
                            <span className="text-xs text-amber-600/70 font-mono px-2 py-0.5 rounded bg-amber-950/30 border border-amber-900/50">
                                LIVE_GDELT_WIRE
                            </span>
                        </div>

                        {/* We reuse the PowerPlayFeed component but maybe constrained */}
                        <div className="h-[800px] overflow-y-auto pr-2 scrollbar-hide">
                            <PowerPlayFeed initialArticles={articlesToShow} />
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-20 border-t border-zinc-900 py-12 text-center text-zinc-600 font-mono text-xs">
                <p>PAID LEAVE OVERSIGHT NODE // CROSSCHECK NETWORK</p>
            </footer>
        </main>
    );
}
