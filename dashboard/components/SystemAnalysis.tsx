"use client";

import { Terminal, GitCommitHorizontal, AlertTriangle } from 'lucide-react';

interface AnalysisData {
    ID: string;
    NOV_29_STATUS: string;
    DEC_30_STATUS: string;
    CONCLUSION: string;
}

interface SystemAnalysisProps {
    data: AnalysisData;
}

export default function SystemAnalysis({ data }: SystemAnalysisProps) {
    return (
        <section className="py-8">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-2">
                <Terminal className="w-6 h-6 text-neon-yellow" />
                <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                    SYSTEM_LOG_ANALYSIS
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Comparison Viewer */}
                <div className="bg-black border border-zinc-800 p-6 font-mono relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-yellow to-transparent opacity-50" />

                    <h3 className="text-zinc-500 text-xs uppercase mb-4 flex items-center gap-2">
                        <GitCommitHorizontal className="w-4 h-4" />
                        VCS_DIFF_CHECK
                    </h3>

                    <div className="space-y-6">
                        <div className="border-l-2 border-green-500/30 pl-4">
                            <span className="text-green-500 text-xs block mb-1">2024-11-29 [BASELINE]</span>
                            <p className="text-zinc-300 text-sm">{data.NOV_29_STATUS}</p>
                        </div>

                        <div className="border-l-2 border-neon-red pl-4 relative">
                            <span className="text-neon-red text-xs block mb-1">2024-12-30 [CURRENT]</span>
                            <p className="text-white text-sm glitch-text" data-text={data.DEC_30_STATUS}>
                                {data.DEC_30_STATUS}
                            </p>

                            {/* Pointer to significance */}
                            <div className="absolute -right-2 top-0 mt-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-neon-red opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red"></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conclusion Box */}
                <div className="flex flex-col justify-center border border-dashed border-neon-yellow/30 bg-yellow-950/10 p-6 relative">
                    <AlertTriangle className="w-8 h-8 text-neon-yellow mb-4" />
                    <h4 className="text-neon-yellow font-bold uppercase tracking-widest text-sm mb-2">
                        FORENSIC_CONCLUSION
                    </h4>
                    <p className="text-xl text-white font-bold leading-relaxed">
                        {data.CONCLUSION}
                    </p>
                    <div className="mt-4 text-xs text-zinc-500 font-mono">
                        PROBABILITY_OF_COINCIDENCE: &lt; 0.0001%
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-20">
                        <Terminal className="w-16 h-16 text-neon-yellow" />
                    </div>
                </div>
            </div>
        </section>
    );
}
