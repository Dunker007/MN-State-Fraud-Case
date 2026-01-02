"use client";

import React, { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { User, XCircle, ShieldAlert, ChevronUp, ChevronDown } from 'lucide-react';

// --- SUB-COMPONENTS FOR CONSISTENCY ---

const NodeActive = ({ title, name, role, highlight }: { title: string, name: string, role?: string, highlight?: boolean }) => (
    <div className="flex flex-col items-center z-10">
        <div className={`w-48 bg-slate-800 border rounded-lg p-3 shadow-lg relative group transition-colors ${highlight ? 'border-red-500 shadow-red-900/40' : 'border-slate-600 hover:border-blue-500'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2">
                <User className={`w-5 h-5 ${highlight ? 'text-red-500' : 'text-blue-400'}`} />
            </div>
            <p className="text-xs text-slate-400 uppercase font-bold mt-1 text-center">{title}</p>
            <p className="text-sm text-white font-medium text-center">{name}</p>
            {role && <p className="text-[10px] text-slate-500 text-center">{role}</p>}

            {/* Overwhelmed Badge */}
            <div className="mt-2 flex justify-center">
                <span className={`text-[9px] px-2 py-0.5 rounded border ${highlight ? 'bg-red-900/40 text-red-300 border-red-900' : 'bg-blue-900/40 text-blue-300 border-blue-900'}`}>
                    ACTIVE
                </span>
            </div>
        </div>
    </div>
);

const NodeVacant = ({ title, count = 1 }: { title: string, count?: number }) => (
    <div className="flex flex-col items-center z-10 gap-2">
        {/* Loop for multiple vacancies if needed */}
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="w-48 bg-red-950/10 border-2 border-dashed border-red-800/50 rounded-lg p-3 relative flex flex-col items-center justify-center min-h-[85px]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xs text-red-500 uppercase font-bold text-center mt-1">{title}</p>
                <p className="text-lg text-red-600 font-black tracking-widest animate-pulse">VACANT</p>
            </div>
        ))}
    </div>
);

// --- WING COMPONENTS ---

const PageOneWing = () => (
    <div className="flex flex-col items-center opacity-80 scale-90 origin-top-right">
        <div className="mb-4 text-xs font-mono text-slate-500 uppercase tracking-widest text-center border-b border-slate-700 pb-2 w-full">Page 1: Admin & Support</div>
        <NodeActive title="Asst Deputy Inspector General" name="Megan Thompson" role="Admin & Support" />
        <div className="h-8 w-px bg-slate-700 my-1"></div>
        <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center">
                <NodeActive title="Enterprise Services" name="Jennifer Sirek" role="Area Manager" />
                <div className="h-4 w-px bg-slate-700"></div>
                <div className="mt-2 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 p-2 rounded text-center w-32">
                    Start Advancement<br />
                    Enterprise Svc<br />
                    Internal Support
                </div>
            </div>
            <div className="flex flex-col items-center">
                <NodeActive title="Training & Dev" name="Julie Lange" role="Supervisor" />
                <div className="h-4 w-px bg-slate-700"></div>
                <div className="mt-2 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 p-2 rounded text-center w-32">
                    e-Learning<br />
                    Trainers<br />
                    Specialists
                </div>
            </div>
        </div>
    </div>
);

const PageTwoWing = () => (
    <div className="flex flex-col items-center opacity-80 scale-90 origin-top-left">
        <div className="mb-4 text-xs font-mono text-slate-500 uppercase tracking-widest text-center border-b border-slate-700 pb-2 w-full">Page 2: Operations Factory</div>
        <NodeActive title="Asst Deputy Inspector General" name="Josh Quigley" role="Operations & Systems" />
        <div className="h-8 w-px bg-slate-700 my-1"></div>
        <div className="flex gap-8 items-start">
            <div className="flex flex-col items-center">
                <NodeActive title="Systems & Vendor Mgmt" name="Michelle Hassler" role="Area Manager" />
                <div className="h-4 w-px bg-slate-700"></div>
                <div className="mt-2 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 p-2 rounded text-center w-32">
                    NS2 Help Desk<br />
                    NS2 Development<br />
                    Systems Projects
                </div>
            </div>
            <div className="flex flex-col items-center">
                <NodeActive title="Research & Operations" name="Jana Nicolaison" role="Area Manager" />
                <div className="h-4 w-px bg-slate-700"></div>
                <div className="mt-2 relative group cursor-help">
                    <div className="text-[10px] text-blue-300 bg-blue-950/30 border border-blue-500/30 p-2 rounded text-center w-32 animate-pulse">
                        HIGH VOLUME<br />
                        FACTORY
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-black border border-slate-700 p-2 rounded text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Units 1-4 (Research)<br />
                        Contact Center<br />
                        Processing Leads
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const OrgChartFail = () => {
    const [scale, setScale] = useState(0.7);
    // Use MotionValues for high-performance direct manipulation
    const x = useMotionValue(-240);
    const y = useMotionValue(-310);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.4));
    const handleReset = () => {
        setScale(0.7);
        x.set(-240);
        y.set(-310);
    };

    return (
        <div className="w-full bg-[#050505] p-8 rounded-xl border border-slate-800 overflow-hidden relative h-[800px] group mobile-touch-action-none">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Controls */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-zinc-900/90 backdrop-blur p-2 rounded-lg border border-zinc-700 shadow-xl">
                <button onClick={handleZoomIn} className="p-2 hover:bg-zinc-800 rounded text-white" title="Zoom In"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={handleReset} className="p-2 hover:bg-zinc-800 rounded text-white text-xs font-mono" title="Reset">{Math.round(scale * 100)}%</button>
                <button onClick={handleZoomOut} className="p-2 hover:bg-zinc-800 rounded text-white" title="Zoom Out"><ChevronDown className="w-4 h-4" /></button>
            </div>

            {/* HEADER - Sticky/Overlay */}
            <div className="absolute top-8 left-0 right-0 z-40 pointer-events-none flex flex-col items-center">
                <div className="inline-flex items-center gap-2 text-red-500 font-bold border border-red-900/50 bg-red-950/20 px-4 py-1 rounded-full mb-2 backdrop-blur-md">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-sm">EVIDENCE ITEM B: THE HOLLOW COMPLIANCE TEAM</span>
                </div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">Department of Human Services: Background Studies</h2>
                <p className="text-slate-500 text-sm mt-1 drop-shadow-md">Snapshot Date: May 2025 (During Systems Issue Crisis)</p>
            </div>

            {/* Draggable Area - Center Anchored */}
            <motion.div
                className="absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing origin-center"
                drag
                dragMomentum={false}
                style={{ x, y, scale }}
                animate={{ scale }}
            >
                {/* Centering Wrapper: Shifts content so (0,0) is center of the node tree */}
                <div className="-translate-x-1/2 -translate-y-[20%] w-fit p-20 pt-20">
                    {/* TRIPTYCH LAYOUT: Page 1 | Center Focus | Page 2 */}
                    <div className="flex items-start justify-center gap-12 min-w-[1400px]">

                        {/* LEFT FLANK: PAGE 1 (Megan Thompson) */}
                        <div className="pt-20">
                            <PageOneWing />
                        </div>

                        {/* CENTER STAGE: THE FAILURE */}
                        <div className="flex flex-col items-center z-10 scale-110 origin-top">
                            {/* LEVEL 1: THE COMMANDER */}
                            <NodeActive title="Background Studies" name="Dawn Davis" role="Deputy Inspector General" highlight={true} />

                            {/* Connector V-Line */}
                            <div className="h-8 w-px bg-slate-600 my-1"></div>

                            {/* LEVEL 2: THE MANAGER */}
                            <NodeActive title="Compliance & Quality Mgmt" name="Kate Bigg" role="Area Manager" highlight={true} />

                            {/* Connector Split */}
                            <div className="h-8 w-px bg-slate-600"></div>
                            <div className="w-[600px] h-px bg-slate-600 relative">
                                <div className="absolute left-0 top-0 h-8 w-px bg-slate-600"></div>
                                <div className="absolute right-0 top-0 h-8 w-px bg-slate-600"></div>
                            </div>

                            {/* LEVEL 3: THE SPLIT */}
                            <div className="flex justify-between w-[600px] mt-8">
                                <div className="flex flex-col items-center">
                                    <NodeActive title="Quality Mgmt" name="Hope Spooner" role="Supervisor" />
                                    <div className="h-4 w-px bg-slate-600"></div>
                                    <div className="mt-2 space-y-2 opacity-50">
                                        <div className="w-40 h-8 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-500">Staffed (Admin)</div>
                                        <div className="w-40 h-8 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-500">Staffed (Admin)</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center relative">
                                    <NodeVacant title="Compliance Supervisor" />
                                    <div className="h-8 w-px bg-red-900/50"></div>
                                    <div className="grid gap-4 bg-red-950/5 p-4 rounded-xl border border-red-900/20">
                                        <NodeVacant title="Regulatory Compliance" />
                                        <NodeVacant title="Compliance Specialist" />
                                        <NodeVacant title="Project Manager" count={2} />
                                    </div>
                                    <div className="absolute -left-96 top-[65%] w-80 text-3xl font-black text-red-500 font-mono text-right leading-tight -translate-y-1/2 opacity-80">
                                        THIS TEAM SHOULD HAVE STOPPED THE FRAUD ►
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT FLANK: PAGE 2 (Josh Quigley) */}
                        <div className="pt-20">
                            <PageTwoWing />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
