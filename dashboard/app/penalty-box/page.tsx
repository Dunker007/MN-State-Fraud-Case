
import { getPenaltyBoxCandidates } from '@/lib/db/access';
import { Network, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import WhistleblowerFeed from '@/components/WhistleblowerFeed';
import PenaltyBoxClient from '@/components/PenaltyBoxClient';

export const dynamic = 'force-dynamic';

export default async function PenaltyBoxPage() {
    const candidates = getPenaltyBoxCandidates(50);

    return (
        <div className="min-h-screen bg-[#0a0505] text-red-50 p-4 md:p-8 font-sans">
            {/* Background Texture */}
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />

            <div className="max-w-[1800px] mx-auto relative z-10">

                {/* Top Section: Header + Live Feed */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12 border-b-4 border-red-900/50 pb-8">
                    <div className="xl:col-span-12 2xl:col-span-7">
                        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase mb-4 flex flex-col leading-[0.8]">
                            <span className="text-red-600">PENALTY</span>
                            <span>BOX</span>
                        </h1>
                        <p className="text-red-400 font-mono text-sm md:text-lg tracking-widest max-w-2xl bg-red-950/30 p-2 border-l-4 border-red-600">
                            MINNESOTA ENFORCEMENT & SHAME REGISTRY // CASE #24-00X
                        </p>

                        <div className="flex gap-4 mt-8">
                            <div className="bg-red-600 text-black px-6 py-2 font-black italic transform -skew-x-12 flex flex-col items-center">
                                <span className="text-3xl leading-none">{candidates.length}</span>
                                <span className="text-[10px] uppercase tracking-tighter">Warrants</span>
                            </div>
                            <div className="border-2 border-red-600 text-red-600 px-6 py-2 font-black italic transform -skew-x-12 flex flex-col items-center">
                                <span className="text-3xl leading-none">$1.2B</span>
                                <span className="text-[10px] uppercase tracking-tighter">Recoverable</span>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-12 2xl:col-span-5 flex flex-col gap-4 justify-end">
                        <WhistleblowerFeed />
                        <Link
                            href="/org-chart"
                            className="bg-zinc-900 border border-zinc-700 hover:border-red-600 p-4 rounded-lg group transition-all"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Network className="w-6 h-6 text-red-600 group-hover:animate-spin" />
                                    <div>
                                        <div className="text-sm font-bold text-white uppercase">Conspiracy Topology</div>
                                        <div className="text-[10px] text-zinc-500 font-mono">MAP THE CHANNELS OF FAILURE</div>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-red-600" />
                            </div>
                        </Link>
                    </div>
                </div>

                <PenaltyBoxClient candidates={candidates} />

            </div>
        </div>
    );
}
