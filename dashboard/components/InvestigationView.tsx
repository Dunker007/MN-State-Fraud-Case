"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type Entity, type Document } from '@/lib/schemas';
import { evidenceData } from '@/lib/data';

// Components
import InvestigationBoard from '@/components/InvestigationBoard';
import SuspectProfiler from '@/components/SuspectProfiler';
import Comer7Tracker from '@/components/Comer7Tracker';
import RiskAssessmentTable from '@/components/RiskAssessmentTable';
import ObstructionTimeline from '@/components/ObstructionTimeline';
import SuspensionGapTimeline from '@/components/SuspensionGapTimeline';
import GapExplorer from '@/components/GapExplorer';
import SystemAnalysis from '@/components/SystemAnalysis';
import EvidenceGallery from '@/components/EvidenceGallery';
import DocumentLocker from '@/components/DocumentLocker';
import SourceIntel from '@/components/SourceIntel';
import IndictmentTracker from '@/components/IndictmentTracker';
import ConflictDetector from '@/components/ConflictDetector';
import Timeline from '@/components/Timeline';

interface InvestigationViewProps {
    entities: Entity[];
    documents: Document[];
    onVisualizeNetwork: (ids: string[]) => void;
    onNavigate: (tab: string) => void;
    activeSubTab: string;
}

export default function InvestigationView({ entities, documents, onVisualizeNetwork, onNavigate, activeSubTab }: InvestigationViewProps) {
    const [selectedDay, setSelectedDay] = useState(0); // Shared state for gap explorer

    return (
        <div className="space-y-6">
            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeSubTab === 'workspace' && (
                        <div className="space-y-8">
                            <InvestigationBoard onNavigate={onNavigate} />
                        </div>
                    )}

                    {activeSubTab === 'targets' && (
                        <div className="space-y-8">
                            {/* Top: Suspect Profiler (full width) */}
                            <SuspectProfiler
                                entities={entities}
                                documents={documents}
                                onVisualizeNetwork={onVisualizeNetwork}
                            />

                            {/* Bottom: Indictment Tracker + Comer7 Tracker (side by side) */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <section>
                                    <IndictmentTracker />
                                </section>
                                <section>
                                    <Comer7Tracker />
                                </section>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'risk_assessment' && (
                        <div className="space-y-8">
                            <ConflictDetector />
                            <RiskAssessmentTable data={evidenceData.entities} />
                        </div>
                    )}

                    {activeSubTab === 'timelines' && (
                        <div className="space-y-8">
                            {/* Special Report Links - Keep grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href="/alibi-event" className="block p-1 border border-neon-red/30 rounded-lg hover:border-neon-red transition-all group">
                                    <div className="bg-red-950/20 p-4 rounded flex items-center justify-between h-full">
                                        <div>
                                            <h3 className="text-neon-red font-bold flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" />
                                                SPECIAL REPORT: THE DECEMBER 30 EVENT
                                            </h3>
                                            <p className="text-xs text-red-200/70 mt-1">
                                                Forensic analysis of the system blackout during federal raids.
                                            </p>
                                        </div>
                                        <ArrowRight className="text-neon-red group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>

                                <Link href="/evidence/systems-outage" className="block p-1 border border-amber-500/30 rounded-lg hover:border-amber-500 transition-all group">
                                    <div className="bg-amber-950/20 p-4 rounded flex items-center justify-between h-full">
                                        <div>
                                            <h3 className="text-amber-500 font-bold flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" />
                                                SYSTEMS OUTAGE ANALYSIS
                                            </h3>
                                            <p className="text-xs text-amber-200/70 mt-1">
                                                Interactive comparison of the 'Maintenance' alibi.
                                            </p>
                                        </div>
                                        <ArrowRight className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </div>

                            {/* Timelines Grid - 40/60 split */}
                            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                                <section className="xl:col-span-2">
                                    <SuspensionGapTimeline selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                                </section>
                                <section className="xl:col-span-3">
                                    <GapExplorer selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                                </section>
                            </div>

                            {/* Obstruction Timeline (full width) */}
                            <ObstructionTimeline />

                            {/* System Analysis (full width) */}
                            <SystemAnalysis data={evidenceData.alibi_analysis} />

                            {/* Master Timeline Reconstruction */}
                            <Timeline events={evidenceData.timeline} />
                        </div>
                    )}

                    {activeSubTab === 'evidence' && (
                        <div className="space-y-8">
                            {/* Evidence Gallery (full width) */}
                            <EvidenceGallery />

                            {/* Document Locker + Source Intel (grid) */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <section>
                                    <DocumentLocker documents={documents} />
                                </section>
                                <section>
                                    <SourceIntel sources={evidenceData.sources} />
                                </section>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
