"use client";

import { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { User, Users, ShieldAlert, Ghost, DollarSign, Zap, AlertTriangle, ChevronDown, ChevronUp, Briefcase, Gavel, FileText, Stamp } from 'lucide-react';
import { orgData, OrgNode } from '@/lib/org-data';

export default function FullOrgChart() {
    const [scale, setScale] = useState(0.8);
    // Use MotionValues for high-performance direct manipulation (fixes drag conflict)
    const x = useMotionValue(0);
    const y = useMotionValue(-200);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 2));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.4));
    const handleReset = () => {
        setScale(0.8);
        x.set(0);
        y.set(-200);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Chart Canvas */}
            <div className="bg-zinc-950 h-[800px] border border-zinc-800 rounded-xl relative overflow-hidden group mobile-touch-action-none">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Controls */}
                <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-zinc-900/90 backdrop-blur p-2 rounded-lg border border-zinc-700 shadow-xl">
                    <button onClick={handleZoomIn} className="p-2 hover:bg-zinc-800 rounded text-white" title="Zoom In"><ChevronUp className="w-4 h-4" /></button>
                    <button onClick={handleReset} className="p-2 hover:bg-zinc-800 rounded text-white text-xs font-mono" title="Reset">{Math.round(scale * 100)}%</button>
                    <button onClick={handleZoomOut} className="p-2 hover:bg-zinc-800 rounded text-white" title="Zoom Out"><ChevronDown className="w-4 h-4" /></button>
                </div>

                <div className="relative z-10 text-center pt-8 pointer-events-none">
                    <h2 className="text-3xl font-black text-white flex items-center justify-center gap-3">
                        <ShieldAlert className="w-10 h-10 text-neon-red animate-pulse" />
                        DHS ORG CHART // MAY 2025
                    </h2>
                    <div className="flex justify-center gap-6 mt-4 text-xs font-mono uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-2"><User className="w-4 h-4 text-white" /> Active</span>
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-500 animate-pulse" /> Critical Failure (Vacant/Overwhelmed)</span>
                        <span className="flex items-center gap-2"><Stamp className="w-4 h-4 text-blue-400" /> High Velocity (Rubber Stamp)</span>
                    </div>
                </div>

                {/* Draggable Area - Center Anchored */}
                <motion.div
                    className="absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing origin-center"
                    drag
                    dragMomentum={false}
                    style={{ x, y, scale }}
                    animate={{ scale }} // Only animate scale via React state
                >
                    {/* Centering Wrapper: Shifts content so (0,0) is center of the node tree */}
                    <div className="-translate-x-1/2 -translate-y-[20%] w-fit flex justify-center p-20">
                        <NodeComponent node={orgData} />
                    </div>
                </motion.div>
            </div>

            {/* Analysis Panel - Moved Below Canvas */}
            <div className="bg-zinc-900/90 backdrop-blur border border-zinc-700 p-6 rounded-lg flex items-start gap-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="text-lg font-bold text-white mb-2">THE ENFORCEMENT GAP ANALYSIS</h4>
                    <p className="text-sm text-zinc-400 max-w-5xl leading-relaxed">
                        This structure explains <strong className="text-white">Why the Fraud Scaled</strong>. The organization optimized for <strong className="text-blue-400">Throughput</strong> (Josh Quigley's Research Units clearing 100k+ apps/year) while systematically dismantling <strong className="text-red-400">Security</strong> (Megan Thompson's Compliance Unit).
                        <br /><br />
                        Dawn Davis (Deputy IG) testified to <span className="text-white font-mono">85% clearance in 24-48 hours</span>—a speed metric achievable only by removing the compliance brakes. This wasn't a computer glitch; it was a staffing choice.
                    </p>
                </div>
            </div>
        </div>
    );
}

function NodeComponent({ node }: { node: OrgNode }) {
    const isVacant = node.status === 'VACANT';
    const isOverwhelmed = node.status === 'OVERWHELMED';
    const isCritical = isVacant || isOverwhelmed; // Both are now Critical
    const isIllusion = node.status === 'ILLUSION';
    const isStandard = node.status === 'STANDARD';

    const handleScrollToDossier = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.person) {
            // Replicate the ID generation logic from EmployeeDossier
            // Clean name: remove titles in parens, trim, replace spaces/special chars
            const cleaned = node.person.split('(')[0].trim();
            const id = `dossier-${cleaned.replace(/\s+/g, '-').replace(/[()]/g, '')}`;

            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: Flash focus ring handled by CSS target
                window.location.hash = id;
            } else {
                console.warn('Dossier not found for:', id);
            }
        }
    };

    // Styles based on status
    let containerClass = 'bg-zinc-900 border-zinc-700';
    let iconColor = 'text-white';
    let indicator = null;

    if (isCritical) {
        containerClass = 'bg-red-950/40 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
        iconColor = 'text-red-500';
        indicator = <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.0, repeat: Infinity }}
            className="text-[10px] font-bold text-red-200 uppercase bg-red-900/80 px-1 rounded flex items-center gap-1 border border-red-500/50"
        >
            <Zap className="w-3 h-3" /> {isVacant ? 'VACANT' : 'OVERWHELMED'}
        </motion.span>;
    } else if (isIllusion) {
        containerClass = 'bg-blue-950/20 border-blue-900/50';
        iconColor = 'text-blue-400';
        indicator = <span className="text-[10px] font-bold text-blue-400 uppercase bg-blue-950/50 px-1 rounded">High Volume</span>;
    } else if (isStandard) {
        containerClass = 'bg-zinc-900 grayscale opacity-70 border-zinc-800';
        iconColor = 'text-zinc-500';
    }

    const yOffset = node.yOffset || 0;
    const connectorHeight = 32 + yOffset;

    return (
        <div className="flex flex-col items-center mx-8" style={{ marginTop: yOffset }}>
            {/* The Node Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleScrollToDossier}
                className={`
                    flex flex-col items-center justify-center 
                    w-64 p-4 rounded-xl border-2 relative z-10 transition-all duration-300
                    hover:scale-105 hover:z-20 hover:shadow-2xl hover:grayscale-0 cursor-pointer
                    ${containerClass}
                `}
            >
                {/* Connector Line UP (if not root) */}
                {node.id !== 'root' && (
                    <div
                        className="absolute left-1/2 w-0.5 bg-zinc-700"
                        style={{
                            height: `${connectorHeight}px`,
                            top: `-${connectorHeight}px`
                        }}
                    />
                )}

                {/* Rubber Stamp Animation for Illusion/Volume Roles */}
                {isIllusion && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2, rotate: -45 }}
                        animate={{ opacity: 0.6, scale: 1, rotate: -15 }}
                        transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
                        className="absolute -right-2 -top-2 z-50 pointer-events-none"
                    >
                        <div className="border-[3px] border-blue-500/50 text-blue-500/50 rounded px-2 py-1 font-black text-xs uppercase tracking-widest rotate-[-15deg] backdrop-blur-sm text-center leading-none">
                            AUTO-<br />APPROVED
                        </div>
                    </motion.div>
                )}

                <div className="mb-2 relative">
                    {/* Icon */}
                    <div className={`p-3 rounded-full bg-black/50 border border-zinc-800 ${isCritical ? 'animate-pulse bg-red-950/50' : ''}`}>
                        {isVacant ? <Ghost className={`w-6 h-6 ${iconColor}`} /> :
                            node.id === 'payment' ? <DollarSign className={`w-6 h-6 ${iconColor}`} /> :
                                node.id === 'researchers' ? <Users className={`w-6 h-6 ${iconColor}`} /> :
                                    node.id.includes('legal') ? <Gavel className={`w-6 h-6 ${iconColor}`} /> :
                                        node.id.includes('policy') ? <FileText className={`w-6 h-6 ${iconColor}`} /> :
                                            node.id.includes('hr') ? <Briefcase className={`w-6 h-6 ${iconColor}`} /> :
                                                <User className={`w-6 h-6 ${iconColor}`} />}
                    </div>
                </div>

                <h3 className={`text-sm font-bold text-center mb-1 ${isVacant ? 'text-red-400' : 'text-white'}`}>
                    {node.title}
                </h3>

                {node.person && (
                    <p className={`text-xs text-center font-mono mb-2 ${isVacant ? 'text-red-400/70' : 'text-zinc-400'}`}>
                        {node.person}
                    </p>
                )}

                {indicator}

                {node.notes && (
                    <div className={`mt-3 text-[10px] text-center leading-tight p-2 rounded bg-black/30 w-full ${isCritical ? 'text-red-300/70' : 'text-zinc-500'}`}>
                        {node.notes}
                    </div>
                )}
            </motion.div>

            {/* Children Connector Logic */}
            {node.children && node.children.length > 0 && (
                <div className="relative mt-8">
                    {/* STANDARD HORIZONTAL LAYOUT */}
                    {node.layout !== 'vertical' && node.layout !== 'grid' && (
                        <>
                            {/* Horizontal Bar for Children */}
                            {node.children.length > 1 && (
                                <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-zinc-700" />
                            )}
                            {/* Vertical Line Down from Parent to Bar */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-zinc-700" />

                            <div className="flex items-start gap-4">
                                {node.children.map(child => (
                                    <NodeComponent key={child.id} node={child} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* VERTICAL STACK LAYOUT */}
                    {node.layout === 'vertical' && (
                        <div className="flex flex-col items-center">
                            {/* Vertical Line Down from Parent to First Child */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-zinc-700" />

                            {node.children.map((child, index) => (
                                <div key={child.id} className="flex flex-col items-center">
                                    {/* Connector between siblings */}
                                    {index > 0 && (
                                        <div className="w-0.5 h-8 bg-zinc-700 -mt-0.5" />
                                    )}
                                    <NodeComponent node={child} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* GRID LAYOUT */}
                    {node.layout === 'grid' && (
                        <div className="flex flex-col items-center">
                            {/* Vertical Line Down from Parent to Grid Top */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-zinc-700" />

                            <div className="grid grid-cols-2 gap-x-12 gap-y-12 pt-4 border-t border-zinc-700/50">
                                {node.children.map(child => (
                                    <div key={child.id} className="flex justify-center relative">
                                        <div className="absolute -top-4 w-0.5 h-4 bg-zinc-700/50" />
                                        <NodeComponent node={child} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
