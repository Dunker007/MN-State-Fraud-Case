import { fetchNewsAPI } from '@/lib/news-api';
import WarRoomHeader from '@/components/sandbox/WarRoomHeader';
import DoomsdayClock from '@/components/sandbox/DoomsdayClock';
import VelocityRadar from '@/components/sandbox/VelocityRadar';
import IntelLog from '@/components/sandbox/IntelLog';
import ScrapeTrigger from '@/components/ScrapeTrigger';
import GlitchText from '@/components/sandbox/GlitchText';
import { calculateProjection } from '@/lib/actuary';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';
import { headers } from 'next/headers';

// Force dynamic rendering
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
        console.error("Failed to fetch INTEL data", e);
        return null;
    }
}

export default async function WarRoomPage() {
    const dbData = await getPaidLeaveData();
    const projection = calculateProjection(dbData?.snapshots || []);
    const news = await fetchNewsAPI(); // This could be filtered specifically for intel in Phase 3

    return (
        <main className="min-h-screen bg-[#050505] text-[#22c55e] font-mono selection:bg-green-500 selection:text-black overflow-hidden relative">
            <WarRoomHeader />

            <div className="pt-20 px-4 h-screen grid grid-cols-12 gap-4 pb-4">

                {/* COL 1: INTEL WIRE (3 Cols) */}
                <div className="col-span-3 flex flex-col h-full gap-4">
                    <div className="bg-black border border-green-900/30 p-2 flex justify-between items-center">
                        <span className="text-xs text-green-700">NODE_ID: SANDBOX_ALPHA</span>
                        <ScrapeTrigger />
                    </div>
                    <div className="flex-1 min-h-0 border border-green-900/30 bg-black/50">
                        <IntelLog items={news} />
                    </div>
                </div>

                {/* COL 2: MAIN VISUALIZATION (6 Cols) */}
                <div className="col-span-6 flex flex-col gap-4">
                    <div className="h-2/3 border border-green-900/30 bg-black relative p-1">
                        <VelocityRadar snapshots={dbData?.snapshots || []} />
                    </div>
                    <div className="h-1/3 grid grid-cols-2 gap-4">
                        <div className="bg-black border border-green-900/30 p-4">
                            <h4 className="text-xs text-green-700 mb-2">CURRENT_LIQUIDITY</h4>
                            <div className="text-4xl text-green-500 font-bold tracking-tighter">
                                ${dbData?.snapshots[0]?.fund_balance_millions.toFixed(1) || '0.0'}M
                            </div>
                            <div className="text-xs text-green-800 mt-1">SEED_FUND_STATUS</div>
                        </div>
                        <div className="bg-black border border-green-900/30 p-4">
                            <h4 className="text-xs text-green-700 mb-2">CLAIM_VOLUME_TOTAL</h4>
                            <div className="text-4xl text-green-500 font-bold tracking-tighter">
                                {dbData?.snapshots[0]?.claims_received.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs text-green-800 mt-1">APPLICATIONS_LOGGED</div>
                        </div>
                    </div>
                </div>

                {/* COL 3: THREAT METRICS (3 Cols) */}
                <div className="col-span-3 flex flex-col gap-4">
                    <DoomsdayClock
                        projectedDate={new Date(projection.projectedInsolvencyDate)}
                        burnRate={projection.currentBurnRateDaily}
                    />

                    <div className="flex-1 bg-black border border-green-900/30 p-4 overflow-y-auto">
                        <h4 className="text-xs text-red-500 mb-4 font-bold border-b border-red-900/30 pb-2">
                            ACTIVE_FRAUD_VECTORS
                        </h4>
                        <ul className="space-y-4 text-xs">
                            <li className="flex gap-2">
                                <span className="text-red-500">[CRITICAL]</span>
                                <span className="opacity-70">Shell Company Registration Spike detected in 55407 zip code.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-amber-500">[WARNING]</span>
                                <span className="opacity-70">Duplicate IP clusters found in application batch #9921.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-amber-500">[WARNING]</span>
                                <span className="opacity-70">Medical Provider ID 992-11 flagged for excessive certification volume.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
