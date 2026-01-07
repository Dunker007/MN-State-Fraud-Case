import { fetchNewsAPI } from '@/lib/news-api';
import Link from 'next/link';
import PowerPlayFeed from '@/components/PowerPlayFeed';
import FundGauge from '@/components/paid-leave/FundGauge';
import VelocityStrip from '@/components/paid-leave/VelocityStrip';
import StatusBadge from '@/components/paid-leave/StatusBadge';
import PaidLeaveCountyMap from '@/components/paid-leave/PaidLeaveCountyMap';
import FraudObservatory from '@/components/paid-leave/FraudObservatory';
import ProjectionChart from '@/components/paid-leave/ProjectionChart';
import OfficialWatch from '@/components/paid-leave/OfficialWatch';
import LiveTicker from '@/components/paid-leave/LiveTicker';
import BillTracker from '@/components/paid-leave/BillTracker';
import CourtDocket from '@/components/paid-leave/CourtDocket';
import SocialPulse from '@/components/paid-leave/SocialPulse';
import DataCollectorPanel from '@/components/paid-leave/DataCollectorPanel';
import InsolvencySimulator from '@/components/paid-leave/InsolvencySimulator';
import PaidLeaveDisclaimer from '@/components/paid-leave/PaidLeaveDisclaimer';
import ReportHeader from '@/components/ReportHeader';
import PhoenixDetector from '@/components/paid-leave/PhoenixDetector';
import SentimentPanel from '@/components/paid-leave/SentimentPanel';
import ProviderNetworkGraph from '@/components/paid-leave/ProviderNetworkGraph';
import TestimonyTracker from '@/components/paid-leave/TestimonyTracker';
import InsolvencyCountdown from '@/components/InsolvencyCountdown';
import DashboardGrid from '@/components/paid-leave/DashboardGrid';
import PaidLeaveCharts from '@/components/PaidLeaveCharts';
import ExportButton from '@/components/ExportButton';
import { calculateProjection } from '@/lib/actuary';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';
import { headers } from 'next/headers';
import InsolvencyPredictor from '@/components/InsolvencyPredictor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PAID LEAVE WATCH | MN Insolvency Tracker',
    description: 'Forensic projection of MN Paid Leave fund solvency. Monte Carlo simulations and daily burn rate tracking.',
    openGraph: {
        title: 'PAID LEAVE WATCH | MN Insolvency Tracker',
        description: 'Forensic projection of MN Paid Leave fund solvency. Monte Carlo simulations and daily burn rate tracking.',
        url: 'https://projectcrosscheck.org/paid-leave-watch',
        siteName: 'Project CrossCheck',
        images: [
            {
                url: '/assets/logos/crosscheck-literal.png',
                width: 1200,
                height: 630,
                alt: 'Paid Leave Watch - Solvency Tracker',
            },
        ],
        type: 'website',
    },
};

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

export default async function PaidLeaveWatchPage() {
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
        <main className="min-h-screen bg-black text-[#ededed] font-mono print:pt-0 print:bg-white print:text-black">


            <div className="container mx-auto max-w-[1600px]">
                <ReportHeader />

                {/* Live Ticker - Full Width */}
                <div className="print:hidden">
                    <LiveTicker />
                </div>

                <div className="px-6 py-8 print:px-0 print:py-0">
                    {/* Header Row */}
                    {/* Header Row with Integrated Insolvency Countdown */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-6 border-b border-zinc-800 pb-6 print:hidden">
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
                            <ExportButton compact />
                        </div>

                        <div className="shrink-0">
                            <StatusBadge level={statusLevel} />
                        </div>
                    </div>

                    <DashboardGrid
                        widgets={{
                            countyMap: <PaidLeaveCountyMap />,
                            charts: (
                                <div className="flex gap-6 h-full">
                                    <div className="flex-grow">
                                        <PaidLeaveCharts
                                            snapshots={dbData?.snapshots}
                                            projection={projection}
                                            lastUpdated={dbData?.meta?.last_updated}
                                        />
                                    </div>
                                    <div className="w-[80px] shrink-0">
                                        <FundGauge currentBalance={currentBalance} initialBalance={initialBalance} />
                                    </div>
                                </div>
                            ),
                            insolvencyPredictor: <InsolvencyPredictor />,
                            socialPulse: <SocialPulse />,
                            billTracker: <BillTracker />,
                            officialWatch: <OfficialWatch />,
                            courtDocket: <CourtDocket />,
                            fraudObservatory: <FraudObservatory />,
                            insolvencySimulator: <InsolvencySimulator />,
                            phoenixDetector: <PhoenixDetector />,
                            sentimentPanel: <SentimentPanel />,
                            providerNetwork: <ProviderNetworkGraph />,
                            testimonyTracker: <TestimonyTracker />,
                            dataCollectors: <DataCollectorPanel />,
                            keyMetrics: null
                        }}
                    />


                    {/* Forensic Deep Dive Section */}
                    <div className="mt-8 pt-6 border-t border-zinc-900/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-900/50 to-transparent"></div>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/10 border border-purple-900/30 text-purple-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                </span>
                                <span className="text-xs font-black font-mono tracking-widest uppercase">Forensic Projection Lab</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-900/50 to-transparent"></div>
                        </div>

                        <p className="text-zinc-600 text-[10px] font-mono mb-6 text-center max-w-2xl mx-auto">
                            WARNING: Models below utilize synthetic extrapolation for stress-testing. <br />
                            <span className="text-purple-500/70">Scenarios depicted may assume worst-case fraud prevalence.</span>
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

                    <div className="mt-8 mb-4">
                        <PaidLeaveDisclaimer />
                    </div>


                </div>
            </div >
        </main >
    );
}
