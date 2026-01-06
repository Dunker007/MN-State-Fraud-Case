import { fetchNewsAPI } from '@/lib/news-api';
import DesktopSidebar from '@/components/DesktopSidebar';
import { CrosscheckHeader } from '@/components/CrosscheckHeader';
import PowerPlayFeed from '@/components/PowerPlayFeed';
import FundGauge from '@/components/paid-leave/FundGauge';
import VelocityStrip from '@/components/paid-leave/VelocityStrip';
import StatusBadge from '@/components/paid-leave/StatusBadge';
import PaidLeaveCountyMap from '@/components/paid-leave/PaidLeaveCountyMap';
import FraudPatternCard from '@/components/paid-leave/FraudPatternCard';
import ProjectionChart from '@/components/paid-leave/ProjectionChart';
import OfficialWatch from '@/components/paid-leave/OfficialWatch';
import LiveTicker from '@/components/paid-leave/LiveTicker';
import BillTracker from '@/components/paid-leave/BillTracker';
import CourtDocket from '@/components/paid-leave/CourtDocket';
import { calculateProjection } from '@/lib/actuary';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';
import { headers } from 'next/headers';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPaidLeaveData() {
    try {
        const host = (await headers()).get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const res = await fetch(`${protocol}://${host}/api/paid-leave`, { cache: 'no-store' });
        if (!res.ok) return null;
        return await res.json() as PaidLeaveDatabase;
    } catch (e) {
        console.error("Failed to fetch data", e);
        return null;
    }
}

export default async function PaidLeaveSandboxPage() {
    const dbData = await getPaidLeaveData();
    const projection = calculateProjection(dbData?.snapshots || []);
    const news = await fetchNewsAPI();

    // Derive metrics
    const latestSnapshot = dbData?.snapshots[0];
    const currentBalance = latestSnapshot?.fund_balance_millions || 500;
    const initialBalance = 500;
    const healthPercent = (currentBalance / initialBalance) * 100;
    const statusLevel = healthPercent >= 50 ? 'operational' : healthPercent >= 25 ? 'strained' : 'critical';

    // Chart data
    const chartData = dbData?.snapshots.slice().reverse().map(s => ({
        date: s.date.slice(5),
        balance: s.fund_balance_millions,
        payouts: s.total_payout_millions
    })) || [];

    // Filter news for paid leave relevance
    const paidLeaveKeywords = ['paid leave', 'deed', 'varilek', 'insolvency', 'medical leave'];
    const relevantNews = news.filter(a =>
        paidLeaveKeywords.some(k => (a.title + a.description).toLowerCase().includes(k))
    );
    const displayNews = relevantNews.length > 0 ? relevantNews : news.slice(0, 6);

    return (
        <main className="min-h-screen bg-[#050505] text-[#ededed] font-mono">
            <DesktopSidebar />
            <div className="lg:hidden">
                <CrosscheckHeader />
            </div>

            <div className="lg:ml-[200px]">
                {/* Live Ticker - Full Width */}
                <LiveTicker />

                <div className="px-6 py-8">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                <span className="text-cyan-500">PAID LEAVE</span> WATCH
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                MN Paid Leave Program Health Monitor • Real-Time Intelligence
                            </p>
                        </div>
                        <StatusBadge level={statusLevel} />
                    </div>

                    {/* Velocity Strip - Integrated into Header Area */}
                    <div className="mb-8">
                        <VelocityStrip
                            applicationsToday={latestSnapshot?.claims_received || 0}
                            approvalRate={latestSnapshot && latestSnapshot.claims_received > 0 ? Math.round((latestSnapshot.claims_approved / latestSnapshot.claims_received) * 100) : 0}
                            avgProcessingHours={24}
                            burnRateDaily={projection.currentBurnRateDaily}
                            daysToInsolvency={projection.daysUntilInsolvency}
                        />
                    </div>

                    {/* TOP ROW: Map + Fund Gauge + Official Watch */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="lg:col-span-1 bg-black/50 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="h-[400px]">
                                <PaidLeaveCountyMap />
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <FundGauge currentBalance={currentBalance} initialBalance={initialBalance} />
                        </div>
                        <div className="lg:col-span-2">
                            <OfficialWatch />
                        </div>
                    </div>

                    {/* Fund Trajectory + Fraud Observatory (50/50) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        <ProjectionChart data={chartData} />

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold font-mono">
                                <span className="text-red-500">FRAUD</span>_OBSERVATORY
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FraudPatternCard
                                    type="shell_company"
                                    title="55407 Zip Cluster"
                                    description="12 shell companies registered within 30 days of program launch, all filing claims."
                                    count={47}
                                    location="Minneapolis"
                                    severity="critical"
                                />
                                <FraudPatternCard
                                    type="medical_mill"
                                    title="Provider ID 992-11"
                                    description="Single chiropractor certifying claims at 8x the state average rate."
                                    count={312}
                                    location="St. Paul"
                                    severity="high"
                                />
                                <FraudPatternCard
                                    type="ip_cluster"
                                    title="Batch #9921 Anomaly"
                                    description="156 applications submitted from 3 IP addresses within 2-hour window."
                                    count={156}
                                    severity="medium"
                                />
                                <FraudPatternCard
                                    type="velocity_spike"
                                    title="Overnight Surge"
                                    description="Application velocity 340% above baseline between 2-4 AM CST."
                                    count={892}
                                    timestamp="2026-01-04 03:22"
                                    severity="high"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bill Tracker + Court Docket (50/50) */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                        <BillTracker />
                        <CourtDocket />
                    </div>

                    {/* Intel Feed */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold font-mono mb-4">
                            <span className="text-cyan-500">INTEL</span>_FEED
                        </h3>
                        <div className="h-[300px] overflow-y-auto scrollbar-hide bg-black/50 border border-zinc-800 rounded-xl p-4">
                            <PowerPlayFeed initialArticles={displayNews} />
                        </div>
                    </div>



                    {/* Footer */}
                    <footer className="mt-12 pt-6 border-t border-zinc-900 text-center text-zinc-600 text-xs font-mono">
                        PAID LEAVE WATCH // CROSSCHECK NETWORK // PHASE 2 ACTIVE
                    </footer>
                </div>
            </div>
        </main>
    );
}
