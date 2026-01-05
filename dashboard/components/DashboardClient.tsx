'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { evidenceData, masterlistData, calculateRiskScore } from '@/lib/data';
import { type Entity, type MasterlistEntity } from '@/lib/schemas';
import { useSearchParams } from 'next/navigation';


import { CommandPaletteProvider } from '@/components/CommandPalette';
import { ToastProvider, useToast } from '@/components/ToastProvider';

// Layout Components
import DashboardNavigation, { tabs } from '@/components/DashboardNavigation';
import EntityDetailModal from '@/components/EntityDetailModal';

// Enhanced Features
import InvestigatorSearch from '@/components/InvestigatorSearch';
import InvestigationView from '@/components/InvestigationView';
import MasterlistGrid from '@/components/MasterlistGrid';

// Tab: Overview
import FraudExposureCounter from '@/components/FraudExposureCounter';
import PatternSynthesis from '@/components/PatternSynthesis';
import RiskRadar from '@/components/RiskRadar';
import ActiveOperations from '@/components/ActiveOperations';
import QuickStats from '@/components/QuickStats';
import KeyDates from '@/components/KeyDates';

// Tab: Intel
import SocialMediaFeed from '@/components/SocialMediaFeed';
import SuggestedSources from '@/components/SuggestedSources';
import LiveNewsFeed from '@/components/LiveNewsFeed';
import ReporterTracker from '@/components/ReporterTracker';
import PublicSentimentTracker from '@/components/PublicSentimentTracker';
import MediaPulse from '@/components/MediaPulse';
import SourceVerifier from '@/components/SourceVerifier';
import EvidenceLocker from '@/components/EvidenceLocker';
import LicenseVerifier from '@/components/LicenseVerifier';
import ExcuseTracker from '@/components/ExcuseTracker';
import RealTimeExcuseStatus from '@/components/RealTimeExcuseStatus';
import ForensicTimeMachine from '@/components/ForensicTimeMachine';
import CensusAnalyst from '@/components/CensusAnalyst';
import HistoricalDocBrowser from '@/components/HistoricalDocBrowser';
import ScandalNewsFeed from '@/components/ScandalNewsFeed';


// Tab: Patterns
import TemporalScatterPlot from '@/components/TemporalScatterPlot';
import AddressCluster from '@/components/AddressCluster';
import FraudNexus from '@/components/FraudNexus';
import SpendingArtifacts from '@/components/SpendingArtifacts';
import NetworkGraph from '@/components/NetworkGraph';
import SankeyDiagram from '@/components/SankeyDiagram';
import GeographicHeatmap from '@/components/GeographicHeatmap';
import FraudTimeline from '@/components/FraudTimeline';

// Tab: Entities
import RiskAssessmentTable from '@/components/RiskAssessmentTable';
import ConflictDetector from '@/components/ConflictDetector';

// Utilities
import { ErrorBoundary } from '@/components/ErrorBoundary';

import InvestigatorNotes from './InvestigatorNotes';
import LeaderboardOfShame from './LeaderboardOfShame';
import ConspiracyGraph from '@/components/ConspiracyGraph';

function DashboardContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'intel', 'investigation', 'org_chart', 'patterns', 'entities', 'database', 'paid_leave', 'holding'].includes(tab)) {
            return tab;
        }
        return 'overview';
    });
    const [investigationSubTab, setInvestigationSubTab] = useState('targets');
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [networkFocusIds, setNetworkFocusIds] = useState<string[] | undefined>(undefined);
    const [cityFilter, setCityFilter] = useState<string | null>(null);
    const [activeCorrelationDate, setActiveCorrelationDate] = useState<string>('');

    const toast = useToast();

    useEffect(() => {
        const tab = searchParams.get('tab');
        const entityId = searchParams.get('entity');

        if (tab) {
            if (tab === 'board') {
                setActiveTab('investigation');
                setInvestigationSubTab('workspace');
            } else if (tab === 'evidence') {
                setActiveTab('investigation');
                setInvestigationSubTab('evidence');
            } else if (['overview', 'intel', 'investigation', 'org_chart', 'patterns', 'entities', 'database', 'holding'].includes(tab)) {
                setActiveTab(tab as any);
            }
        }

        if (entityId) {
            const entity = (evidenceData.entities as Entity[]).find((e: Entity) => e.id === entityId);
            if (entity) {
                setSelectedEntity(entity);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        if (selectedEntity) {
            url.searchParams.set('entity', selectedEntity.id);
        } else {
            url.searchParams.delete('entity');
        }
        window.history.replaceState({}, '', url.toString());
    }, [activeTab, selectedEntity]);

    const handleEntitySelect = useCallback((entity: Entity) => {
        setSelectedEntity(entity);
    }, []);

    const handleEntityClose = useCallback(() => {
        setSelectedEntity(null);
    }, []);

    const handleCopyId = useCallback(() => {
        if (selectedEntity) {
            navigator.clipboard.writeText(selectedEntity.id);
            toast.success('Copied to clipboard', `Entity ID: ${selectedEntity.id}`);
        }
    }, [selectedEntity, toast]);

    const handleFlag = useCallback(() => {
        if (selectedEntity) {
            toast.warning('Flagged for review', `${selectedEntity.name} added to watchlist`);
        }
    }, [selectedEntity, toast]);

    const handleShare = useCallback(() => {
        if (selectedEntity) {
            const url = `${window.location.origin}?entity=${selectedEntity.id}`;
            navigator.clipboard.writeText(url);
            toast.info('Link copied', 'Share URL copied to clipboard');
        }
    }, [selectedEntity, toast]);

    const handleVisualizeNetwork = useCallback((ids: string[]) => {
        setNetworkFocusIds(ids);
        setActiveTab('patterns');
    }, []);

    const handleNetworkClose = useCallback(() => {
        setNetworkFocusIds(undefined);
    }, []);

    const tabContentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <CommandPaletteProvider
            entities={evidenceData.entities}
            onNavigate={setActiveTab}
            onEntitySelect={handleEntitySelect}
        >
            <div className="min-h-screen bg-[#050505] text-[#ededed] font-mono selection:bg-blue-500 selection:text-black">
                {/* Mobile Top Nav */}
                <div className="lg:hidden">
                    <DashboardNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Desktop Content Wrapper (Sidebar Offset) */}
                <div className="lg:ml-64 transition-all duration-300">



                    <main className="w-full max-w-[95%] lg:max-w-none mx-auto px-4 lg:px-8 py-6">

                        {/* Desktop Branding Header - MOVED TO GLOBAL LAYOUT */}
                        {/* <div className="hidden lg:block mb-6 -mx-4 lg:-mx-8">
                            <CrosscheckHeader />
                        </div> */}

                        {/* Desktop Section Title */}
                        <div className="hidden lg:flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                            <div>
                                <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase flex items-center gap-4">
                                    <span className="text-zinc-600">/</span> {tabs.find(t => t.id === activeTab)?.label.replace('MN DHS ', '').replace(' (BETA)', '') || activeTab}
                                </h2>
                            </div>

                            <div className="flex items-center gap-4">
                                {activeTab === 'intel' && (
                                    <div className="flex items-center gap-2 bg-red-950/20 px-3 py-1 rounded-full border border-red-900/30">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                        <span className="text-red-500 font-bold font-mono text-[10px] animate-pulse">LIVE FEED ACTIVE</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="mt-0"
                            >
                                {activeTab === 'overview' && (
                                    <div className="space-y-12">
                                        {/* Top Section: Exposure Counter + Risk Radar */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                            <div className="flex flex-col gap-4 lg:col-span-1">
                                                <ActiveOperations />
                                                <KeyDates />
                                            </div>
                                            <div className="h-full lg:col-span-3 flex flex-col gap-4">
                                                <RiskRadar />
                                                <FraudExposureCounter />
                                            </div>
                                        </div>

                                        {/* Bottom Section: Leaderboard + Search + Stats */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                                            <section className="md:col-span-2 lg:col-span-3">
                                                <LeaderboardOfShame onEntitySelect={handleEntitySelect} />
                                            </section>

                                            <section className="flex flex-col gap-6">
                                                <InvestigatorSearch
                                                    onEntitySelect={(id, isMaster) => {
                                                        if (isMaster) {
                                                            const masterEntity = (masterlistData.entities as MasterlistEntity[]).find((e: MasterlistEntity) => e.license_id === id);
                                                            if (masterEntity) {
                                                                handleEntitySelect({
                                                                    id: masterEntity.license_id,
                                                                    name: masterEntity.name,
                                                                    type: masterEntity.service_type,
                                                                    rawStatus: masterEntity.status,
                                                                    holder: masterEntity.name,
                                                                    owner: masterEntity.owner || 'Unknown',
                                                                    address: masterEntity.street,
                                                                    city: masterEntity.city,
                                                                    status: masterEntity.status,
                                                                    state_status: masterEntity.status,
                                                                    amount_billed: 0,
                                                                    risk_score: calculateRiskScore(masterEntity),
                                                                    red_flag_reason: [],
                                                                    federal_status: 'UNKNOWN',
                                                                    linked_count: 0
                                                                });
                                                            }
                                                        } else {
                                                            const curatedEntity = (evidenceData.entities as Entity[]).find((e: Entity) => e.id === id);
                                                            if (curatedEntity) {
                                                                handleEntitySelect(curatedEntity);
                                                            }
                                                        }
                                                    }}
                                                />
                                                <QuickStats />
                                            </section>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'intel' && (
                                    <div className="space-y-12">
                                        <section className="w-full relative group/engine">
                                            {/* Forensic Bridge Connector */}
                                            <div className="hidden xl:block absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-6 h-32 z-50 pointer-events-none">
                                                <div className="h-full w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent mx-auto relative">
                                                    <div className="absolute inset-0 bg-blue-400 blur-sm opacity-50" />
                                                    {/* Pulsing Data Nodes */}
                                                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] animate-pulse" />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] animate-ping" />
                                                    <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] animate-pulse" />
                                                </div>
                                                {/* Left-to-Right Data Stream Indicator */}
                                                <div className="absolute inset-x-[-20px] top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none opacity-20 group-hover/engine:opacity-100 transition-all duration-700">
                                                    <div className="w-4 h-px bg-blue-500/50" />
                                                    <div className="flex items-center justify-center p-[1px] bg-blue-500/40" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' }}>
                                                        <div className="px-4 py-2 bg-blue-950 text-[8px] font-black text-blue-400 uppercase tracking-tighter text-center leading-[1.1] min-w-[110px]" style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)' }}>
                                                            Suspicious<br />Timing<br />Detected
                                                        </div>
                                                    </div>
                                                    <div className="w-4 h-px bg-blue-500/50" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                                <div className="xl:col-span-3">
                                                    <ForensicTimeMachine onDateChange={setActiveCorrelationDate} />
                                                </div>
                                                <div className="xl:col-span-1 h-[700px] xl:h-auto">
                                                    <ScandalNewsFeed activeDate={activeCorrelationDate} />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="w-full">
                                            <ExcuseTracker />
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'holding' && (
                                    <div className="space-y-12">
                                        <div className="bg-amber-950/20 border border-amber-900/30 p-6 rounded-lg mb-8">
                                            <h2 className="text-xl font-bold text-amber-500 mb-2 italic uppercase tracking-tighter">Evaluation Holding Room</h2>
                                            <p className="text-zinc-400 max-w-3xl text-sm">
                                                These components have been flagged for decommissioning or theme adjustment.
                                                They are kept here for evaluation of their forensic utility before a final go/no-go decision.
                                            </p>
                                        </div>

                                        <section className="w-full mb-12">
                                            <ForensicTimeMachine />
                                        </section>

                                        <section className="w-full mb-12">
                                            <RealTimeExcuseStatus />
                                        </section>

                                        <section className="w-full mb-12">
                                            <ExcuseTracker />
                                        </section>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <section className="col-span-1 lg:col-span-2">
                                                <LiveNewsFeed />
                                            </section>
                                            <section className="col-span-1 lg:col-span-2">
                                                <SocialMediaFeed />
                                            </section>
                                        </div>

                                        <section className="w-full">
                                            <PublicSentimentTracker />
                                        </section>

                                        <section>
                                            <SourceVerifier />
                                        </section>

                                        <section className="w-full">
                                            <MediaPulse />
                                        </section>

                                        <section>
                                            <SuggestedSources />
                                        </section>

                                        <section>
                                            <ReporterTracker />
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'investigation' && (
                                    <InvestigationView
                                        entities={evidenceData.entities}
                                        documents={evidenceData.documents}
                                        onVisualizeNetwork={handleVisualizeNetwork}
                                        onNavigate={(tab) => {
                                            if (tab === 'board' || tab === 'evidence') {
                                                setInvestigationSubTab(tab === 'board' ? 'workspace' : 'evidence');
                                            } else {
                                                setActiveTab(tab);
                                            }
                                        }}
                                        activeSubTab={investigationSubTab}
                                    />
                                )}

                                {activeTab === 'org_chart' && (
                                    <div className="space-y-12">
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                                            <h2 className="text-xl font-bold text-white mb-2">Conspiracy Topology: The Chain of Failure</h2>
                                            <p className="text-zinc-400 max-w-3xl">
                                                A forensic reconstruction of the command hierarchy that facilitated the diversion throughout 2024-2025.
                                                This topology maps the <span className="text-red-400">executive override</span> and <span className="text-amber-400">calculated negligence</span> zones.
                                            </p>
                                        </div>
                                        <ConspiracyGraph className="h-[800px]" />
                                    </div>
                                )}

                                {activeTab === 'patterns' && (
                                    <div className="space-y-12">

                                        {/* Fraud Timeline - New Visual Enhancement */}
                                        <FraudTimeline />

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-2">
                                                <h3 className="text-lg font-bold text-cyan-400 font-mono">
                                                    NETWORK_TOPOLOGY
                                                </h3>
                                                <span className="text-xs text-cyan-600/70 font-mono px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-900/50">
                                                    RELATIONSHIP MAPPING
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                                                {/* Full Width Spiderweb */}
                                                <section className="h-full min-h-[600px] xl:col-span-12">
                                                    <NetworkGraph
                                                        entities={evidenceData.entities}
                                                        onEntityClick={handleEntitySelect}
                                                        filterIds={networkFocusIds}
                                                        onClose={handleNetworkClose}
                                                    />
                                                </section>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                                                <section className="xl:col-span-8">
                                                    <FraudNexus />
                                                </section>
                                                <section className="xl:col-span-4">
                                                    <SpendingArtifacts />
                                                </section>
                                            </div>

                                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                                                <div className="xl:col-span-4">
                                                    <AddressCluster />
                                                </div>
                                                <div className="xl:col-span-8">
                                                    <GeographicHeatmap
                                                        entities={evidenceData.entities}
                                                        onCitySelect={(city) => {
                                                            setCityFilter(city);
                                                            setActiveTab('database');
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-2">
                                                <h3 className="text-lg font-bold text-emerald-400 font-mono">
                                                    FINANCIAL_VELOCITY
                                                </h3>
                                                <span className="text-xs text-emerald-600/70 font-mono px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-900/50">
                                                    REVENUE FLOW ANALYSIS
                                                </span>
                                            </div>

                                            <div>
                                                <SankeyDiagram />
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-2">
                                                <h3 className="text-lg font-bold text-amber-400 font-mono">
                                                    TEMPORAL_ANOMALIES
                                                </h3>
                                                <span className="text-xs text-amber-600/70 font-mono px-2 py-0.5 rounded bg-amber-950/30 border border-amber-900/50">
                                                    TIMING SEQUENCING
                                                </span>
                                            </div>

                                            <TemporalScatterPlot entities={evidenceData.entities} />
                                        </div>

                                        <PatternSynthesis onNavigate={setActiveTab} />
                                    </div>
                                )}

                                {activeTab === 'entities' && (
                                    <div className="space-y-12">
                                        <RiskAssessmentTable
                                            data={evidenceData.entities}
                                        />
                                        <ConflictDetector />
                                    </div>
                                )}

                                {activeTab === 'database' && (
                                    <div className="space-y-12">
                                        <section className="w-full">
                                            <HistoricalDocBrowser />
                                        </section>

                                        <section className="w-full">
                                            <EvidenceLocker />
                                        </section>

                                        <section className="w-full">
                                            <LicenseVerifier />
                                        </section>

                                        <CensusAnalyst />
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                                            <h2 className="text-xl font-bold text-white mb-2">MN DHS Provider Masterlist</h2>
                                            <p className="text-zinc-400 max-w-3xl">
                                                This is the raw, comprehensive dataset of all 22,000+ providers licensed by the Minnesota Department of Human Services.
                                                It includes enriched data (owners, ghost status) processed from 87 individual county census sweeps.
                                            </p>
                                        </div>
                                        <MasterlistGrid
                                            onEntitySelect={handleEntitySelect}
                                            cityFilter={cityFilter}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>

                    {selectedEntity && (
                        <EntityDetailModal
                            entity={selectedEntity}
                            onClose={handleEntityClose}
                            allEntities={evidenceData.entities}
                            onEntityClick={handleEntitySelect}
                            onCopyId={handleCopyId}
                            onFlag={handleFlag}
                            onShare={handleShare}
                        />
                    )}

                    <footer className="mt-20 border-t border-zinc-900 py-6 text-center text-zinc-600 text-[10px] uppercase font-mono tracking-[0.2em]">
                        <p className="mb-2">Confidential Investigative Utility // Restricted Access</p>
                        <p className="text-zinc-700">
                            Operational Intelligence Dashboard v4.1.0
                        </p>
                    </footer>

                    <InvestigatorNotes />
                </div>
            </div>
        </CommandPaletteProvider>
    );
}

export default function DashboardClient() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <DashboardContent />
            </ToastProvider>
        </ErrorBoundary>
    );
}
