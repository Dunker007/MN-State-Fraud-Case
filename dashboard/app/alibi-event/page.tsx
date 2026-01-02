import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertTriangle, ShieldAlert, Share2 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'The December 30th Event | MN Fraud Taskforce',
    description: 'Investigative breakdown of the IT Glitch that occurred simultaneously with federal raids.',
    openGraph: {
        title: 'The December 30th Event: Coincidence or Alibi?',
        description: 'Forensic timeline of the DHS system outages coinciding with FBI raids.',
        images: ['/api/og?title=The Dec 30 Event'], // Assuming we might add an OG generator later, but standard placeholder for now
    },
    twitter: {
        card: 'summary_large_image',
        title: 'The December 30th Event: Coincidence or Alibi?',
        description: 'Forensic timeline of the DHS system outages coinciding with FBI raids.',
    }
};

export default function AlibiEventPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-[#ededed] font-mono p-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-red/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-4xl mx-auto space-y-12">
                <header>
                    <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Return to Dashboard
                    </Link>
                    <div className="border border-neon-red/30 bg-red-950/20 p-6 rounded-lg mb-8">
                        <div className="flex items-center gap-3 text-neon-red mb-2">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                            <span className="font-bold tracking-widest">CRITICAL_EVENT_ANALYSIS</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
                            THE DECEMBER 30 EVENT
                        </h1>
                        <p className="text-xl text-zinc-300 max-w-2xl leading-relaxed">
                            How a convenient "System Glitch" appeared exactly when federal raids commenced, effectively blocking public oversight.
                        </p>
                    </div>
                </header>

                <section className="space-y-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Clock className="text-neon-blue" />
                        FORENSIC_TIMELINE
                    </h2>

                    <div className="space-y-0 relative border-l border-zinc-800 ml-4">
                        {/* Event 1 */}
                        <div className="relative pl-8 pb-12">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-600" />
                            <div className="text-xs text-zinc-500 mb-1">NOV 29, 2025 // 08:00 AM</div>
                            <h3 className="text-lg font-bold text-zinc-300">System Baseline</h3>
                            <p className="text-sm text-zinc-400 mt-2">
                                Routine checks confirm DHS Verification Systems and License Lookup are fully operational. No warning banners are present.
                            </p>
                        </div>

                        {/* Event 2 */}
                        <div className="relative pl-8 pb-12">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <div className="text-xs text-amber-500 mb-1">DEC 12, 2025 // 10:00 AM</div>
                            <h3 className="text-lg font-bold text-white">Public Indictments Announced</h3>
                            <p className="text-sm text-zinc-400 mt-2">
                                Attorney General announces charges against primary ringleaders. The term "Industrial-Scale Fraud" is used publicly for the first time.
                            </p>
                        </div>

                        {/* Event 3 */}
                        <div className="relative pl-8">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-neon-red shadow-[0_0_15px_rgba(255,0,0,0.8)]" />
                            <div className="text-xs text-neon-red font-bold mb-1">DEC 30, 2025 // 09:15 AM</div>
                            <h3 className="text-2xl font-bold text-white mb-2">THE ALIBI EVENT</h3>
                            <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-lg">
                                <p className="text-sm text-zinc-300 leading-relaxed">
                                    Simultaneously:
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-zinc-400">
                                    <li>FBI/HSI Agents execute search warrants at multiple daycares.</li>
                                    <li>DHS website displays a "System Maintenance" banner, citing an IT glitch.</li>
                                    <li><strong>Effect:</strong> Public inability to verify license revocations in real-time during the raids.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <div className="bg-zinc-900/30 p-6 rounded-lg border border-zinc-800">
                        <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
                        <h3 className="font-bold text-white mb-2">The Glitch Hypothesis</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Plausible deniability established. Officials claim the banner was automated or coincidental, despite IT issues rarely aligning perfectly with sealed indictment unsealings.
                        </p>
                    </div>
                    <div className="bg-zinc-900/30 p-6 rounded-lg border border-zinc-800">
                        <Share2 className="w-8 h-8 text-neon-blue mb-4" />
                        <h3 className="font-bold text-white mb-2">Public Record Impact</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            For 24-48 hours, the "Source of Truth" was offline. This allowed entities to potentially move assets or destroy records before the public was fully aware of the specific targets.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
