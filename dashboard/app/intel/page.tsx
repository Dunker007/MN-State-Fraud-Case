import { Suspense } from 'react';
import { fetchNewsAPI } from '@/lib/news-api';
import HunterPhaseIndicator from '@/components/HunterPhaseIndicator';
import ScandalNewsFeed from '@/components/ScandalNewsFeed';
import ExcuseTracker from '@/components/ExcuseTracker';
import ForensicTimeMachine from '@/components/ForensicTimeMachine';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'INTEL SANDBOX | MN Fraud Watch',
    description: 'Experimental intelligence visualization and Hunter Protocol analysis.',
};

export default async function IntelSandboxPage() {
    return (
        <main className="min-h-screen bg-[#0a0e14] text-slate-200 font-sans selection:bg-purple-500 selection:text-white">
            <div className="max-w-[1800px] mx-auto p-6">

                {/* Header: Official Structure, Forensic Overlay */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            {/* "State" styling for the label */}
                            <span className="bg-slate-800 text-slate-400 px-2 py-1 text-xs font-bold uppercase tracking-widest rounded-sm">
                                MN Dept. of Inquiry
                            </span>
                            {/* "Opposition" styling for the Title */}
                            <h1 className="text-4xl font-black italic tracking-tighter text-white">
                                <span className="text-purple-500">INTEL</span> <span className="text-slate-600">/</span> SANDBOX
                            </h1>
                        </div>
                        <p className="mt-2 text-slate-400 max-w-2xl font-light">
                            Official Analysis Vector <span className="text-purple-500/50 mx-2">//</span> <span className="font-mono text-purple-400 text-sm">Forensic Override Active</span>
                        </p>
                    </div>
                    <div>
                        <HunterPhaseIndicator variant="badge" />
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                    {/* Left Column: Tools (The Inputs) */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* Timeline: Looks Official until used */}
                        <div className="bg-[#0f141e] border border-slate-800 p-0 rounded-lg overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
                            <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    Temporal Query
                                </h3>
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-purple-500 transition-colors"></div>
                            </div>
                            <div className="p-4">
                                <ForensicTimeMachine />
                            </div>
                        </div>

                        {/* Tracker: The "Problem" */}
                        <div className="bg-[#0f141e] border border-slate-800 p-0 rounded-lg overflow-hidden group hover:border-yellow-500/30 transition-colors duration-500">
                            <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    Mechanism Status
                                </h3>
                                <div className="h-1.5 w-1.5 rounded-full bg-slate-700 group-hover:bg-yellow-500 transition-colors"></div>
                            </div>
                            <div className="p-4">
                                <ExcuseTracker />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Feed (The Evidence) */}
                    <div className="xl:col-span-3">
                        {/* Container is Dark/Official */}
                        <div className="h-[800px] bg-[#0f141e] border border-slate-800 rounded-lg overflow-hidden flex flex-col relative">
                            {/* The "Truth" Header inside the Official Container */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-yellow-500 to-purple-600 opacity-50"></div>

                            <Suspense fallback={<div className="p-8 text-center text-slate-600 font-mono">Loading Signal Feed...</div>}>
                                <ScandalNewsFeed />
                            </Suspense>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
