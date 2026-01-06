import { fetchNewsAPI } from '@/lib/news-api';
import Link from 'next/link';
import CompactTopNav from '@/components/CompactTopNav';
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
import SocialPulse from '@/components/paid-leave/SocialPulse';
import DataCollectorPanel from '@/components/paid-leave/DataCollectorPanel';
import InsolvencyCountdown from '@/components/InsolvencyCountdown';
import PaidLeaveCharts from '@/components/PaidLeaveCharts';
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
        <main className="min-h-screen bg-black text-[#ededed] font-mono pt-16">
            <CompactTopNav />
            {/* Mobile Header hidden for now as CompactTopNav handles it, or keep if specific mobile layout needed */}
            <div className="lg:hidden hidden">
                <CrosscheckHeader />
            </div>

            <div className="container mx-auto max-w-[1600px]">
                {/* Live Ticker - Full Width */}
                <LiveTicker />

                <div className="px-6 py-8">
                    {/* Header Row */}
                    {/* Header Row with Integrated Insolvency Countdown */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-zinc-800 pb-6">
                        <div className="shrink-0">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
                                <span className="text-purple-500">PAID LEAVE</span> <span className="text-white">WATCH</span>
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1 font-mono">
                                Operational Oversight • Insolvency Velocity & Fraud Vectors
                            </p>
                        </div>

                        <div className="flex-1 min-w-0">
                            <InsolvencyCountdown
                                projectedInsolvencyDate={projection.projectedInsolvencyDate}
                                currentBurnRate={projection.currentBurnRateDaily * 30}
                                mode="strip"
                            />
                        </div>

                        <div className="shrink-0">
                            <StatusBadge level={statusLevel} />
                        </div>
                    </div>

                    {/* TOP ROW: Map + Insolvency Model + Gauge */}
                    <div className="grid grid-cols-1 lg:grid-cols-[25fr_65fr_auto] gap-6 mb-8">
                        {/* Map Column */}
                        <div className="h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                            <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Geographic Distribution
                            </h3>
                            <PaidLeaveCountyMap />
                        </div>

                        {/* Insolvency Model */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                            <PaidLeaveCharts
                                snapshots={dbData?.snapshots}
                                projection={projection}
                                lastUpdated={dbData?.meta?.last_updated}
                            />
                        </div>

                        {/* Fund Gauge - Far Right */}
                        <div className="w-[80px] shrink-0 h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden py-4">
                            <FundGauge currentBalance={currentBalance} initialBalance={initialBalance} />
                        </div>
                    </div>

                    {/* ROW 2: Social Pulse + Bill Tracker (50/50) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 h-[300px]">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                            <SocialPulse />
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                            <BillTracker />
                        </div>
                    </div>


                    {/* Official Watch + Court Docket */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                            <OfficialWatch />
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                            <CourtDocket />
                        </div>
                    </div>

                    {/* Fraud Observatory */}
                    <div className="mb-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold font-mono border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                                <span className="text-purple-500">FRAUD</span> <span className="text-zinc-500">OBSERVATORY</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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



                    {/* Data Collector Panel */}
                    <div className="mb-8 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                        <DataCollectorPanel />
                    </div>


                    {/* Legacy Analysis Section (To Be Integrated) */}
                    <div className="mt-12 pt-8">
                        <div className="relative flex items-center justify-center mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-amber-900/30 border-dashed"></div>
                            </div>
                            <div className="relative bg-black px-4 flex items-center gap-2 text-amber-600">
                                <span className="text-xs md:text-sm font-bold font-mono uppercase tracking-[0.2em] animate-pulse"> Experimental Sandbox Zone </span>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                            Deep Analysis Modules <span className="text-purple-500 text-sm bg-purple-950/30 px-2 py-1 rounded ml-2 border border-purple-900/50">IN TRAINING</span>
                        </h3>
                        <p className="text-zinc-600 text-xs font-mono mb-8 border-l-2 border-amber-900/50 pl-3 py-1">
                            DISCLAIMER: Projects below this line may utilize synthetic or extrapolated datasets for training purposes.
                            Metrics displayed in this section are <span className="text-purple-700">NOT</span> to be considered accurate representations of live program status.
                        </p>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                                <VelocityStrip
                                    applicationsToday={latestSnapshot?.claims_received || 0}
                                    approvalRate={latestSnapshot && latestSnapshot.claims_received > 0 ? Math.round((latestSnapshot.claims_approved / latestSnapshot.claims_received) * 100) : 0}
                                    avgProcessingHours={24}
                                    burnRateDaily={projection.currentBurnRateDaily}
                                    daysToInsolvency={projection.daysUntilInsolvency}
                                />
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                                <ProjectionChart data={chartData} />
                            </div>
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
