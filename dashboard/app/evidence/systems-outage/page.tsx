import Link from 'next/link';
import { ArrowLeft, Share2 } from 'lucide-react';
import SystemsOutageComparison from '@/components/SystemsOutageComparison';
import OutageTimeline from '@/components/OutageTimeline';

export default function SystemsOutagePage() {
    return (
        <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
            <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
                <Link href="/?tab=investigation" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" />
                    BACK_TO_DASHBOARD
                </Link>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" /> SHARE
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-16">
                {/* Hero */}
                <div className="text-center space-y-4">
                    <div className="inline-block px-3 py-1 bg-red-950/30 border border-red-900 rounded-full text-neon-red text-xs font-bold mb-4 animate-pulse">
                        EVIDENCE FILE #99-A: OBSTRUCTION
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        THE SYSTEM OUTAGE
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        How a scheduled maintenance window was used to conceal the largest mass-revocation of fraud-linked entities in state history.
                    </p>
                </div>

                {/* Primary Visual */}
                <SystemsOutageComparison />

                {/* Timeline */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-zinc-800 flex-1" />
                        <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-500">Timeline of Deception</h2>
                        <div className="h-px bg-zinc-800 flex-1" />
                    </div>
                    <OutageTimeline />
                </section>

                {/* Impact Stats */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-b border-zinc-900 py-12">
                    <div>
                        <div className="text-4xl font-black text-white mb-2">14</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Entities Hidden</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-neon-red mb-2">64</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Days of Silence</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-white mb-2">$3.2M</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">Est. Hidden Exposure</div>
                    </div>
                </section>

            </main>
        </div>
    );
}
