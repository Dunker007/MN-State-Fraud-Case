"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { evidenceData, masterlistData, calculateRiskScore } from "@/lib/data";
import { type Entity, type Document } from "@/lib/schemas";
import { useSearchParams } from "next/navigation";
import MasterlistGrid from "@/components/MasterlistGrid";

import FullOrgChart from "@/components/FullOrgChart";
import { OrgChartFail } from "@/components/OrgChartFail";
import EmployeeDossier from "@/components/EmployeeDossier";

// Providers
import { CommandPaletteProvider } from "@/components/CommandPalette";
import { ToastProvider, useToast } from "@/components/ToastProvider";

// Layout Components

import DashboardNavigation from "@/components/DashboardNavigation";
import EntityDetailModal from "@/components/EntityDetailModal";
import LegalDisclaimer from "@/components/LegalDisclaimer"; // Correct path

// Enhanced Features
import InvestigatorSearch from "@/components/InvestigatorSearch";
import GapExplorer from "@/components/GapExplorer";
import InvestigationView from "@/components/InvestigationView";
import InvestigationMenu from "@/components/InvestigationMenu";


// Tab: Overview
import FraudExposureCounter from "@/components/FraudExposureCounter";
import PatternSynthesis from "@/components/PatternSynthesis";
import RiskRadar from "@/components/RiskRadar";
import ActiveOperations from "@/components/ActiveOperations";
import QuickStats from "@/components/QuickStats";
import KeyDates from "@/components/KeyDates";

// Tab: Intel
import SocialMediaFeed from "@/components/SocialMediaFeed";
import SuggestedSources from "@/components/SuggestedSources";

// Tab: Investigation
import ObstructionTimeline from "@/components/ObstructionTimeline";
import SuspectProfiler from "@/components/SuspectProfiler";
import Comer7Tracker from "@/components/Comer7Tracker";
import SystemAnalysis from "@/components/SystemAnalysis";

// Tab: Patterns
import TemporalScatterPlot from "@/components/TemporalScatterPlot";
import AddressCluster from "@/components/AddressCluster";
import FraudNexus from "@/components/FraudNexus";
import SpendingArtifacts from "@/components/SpendingArtifacts";

import NetworkGraph from "@/components/NetworkGraph";
import SankeyDiagram from "@/components/SankeyDiagram";
import GeographicHeatmap from "@/components/GeographicHeatmap";

// Tab: Entities
import RiskAssessmentTable from "@/components/RiskAssessmentTable";

// Tab: Evidence
import IndictmentTracker from "@/components/IndictmentTracker";
import EvidenceGallery from "@/components/EvidenceGallery";
import DocumentLocker from "@/components/DocumentLocker";
import SourceIntel from "@/components/SourceIntel";

// Tab: Intel
import LiveNewsFeed from "@/components/LiveNewsFeed";
import ReporterTracker from "@/components/ReporterTracker";
import PublicSentimentTracker from "@/components/PublicSentimentTracker";
import MediaPulse from "@/components/MediaPulse";
import SourceVerifier from "@/components/SourceVerifier";

// Utilities
import ExportMenu from "@/components/ExportMenu";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { Command, ArrowRight, AlertTriangle } from "lucide-react";
import InvestigatorNotes from "./InvestigatorNotes";
import SuspensionGapTimeline from "./SuspensionGapTimeline";
import LeaderboardOfShame from "./LeaderboardOfShame";
import ConflictDetector from "./ConflictDetector";
import InvestigationBoard from "./InvestigationBoard";

// Animation variants for tab content
const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

function DashboardContent() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'intel', 'investigation', 'org_chart', 'patterns', 'entities', 'database'].includes(tab)) {
            return tab;
        }
        return 'overview';
    });
    const [investigationSubTab, setInvestigationSubTab] = useState("targets");
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [networkFocusIds, setNetworkFocusIds] = useState<string[] | undefined>(undefined);

    // Shared filter for map -> grid integration
    const [cityFilter, setCityFilter] = useState<string | null>(null);

    const toast = useToast();

    // Deep linking: read tab and entity from URL
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
            } else if (['overview', 'intel', 'investigation', 'org_chart', 'patterns', 'entities', 'database'].includes(tab)) {
                setActiveTab(tab);
            }
        }

        if (entityId) {
            const entity = evidenceData.entities.find(e => e.id === entityId);
            if (entity) {
                setSelectedEntity(entity);
            }
        }
    }, [searchParams]);

    // Update URL when tab changes
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
            toast.success("Copied to clipboard", `Entity ID: ${selectedEntity.id} `);
        }
    }, [selectedEntity, toast]);

    const handleFlag = useCallback(() => {
        if (selectedEntity) {
            toast.warning("Flagged for review", `${selectedEntity.name} added to watchlist`);
        }
    }, [selectedEntity, toast]);

    const handleShare = useCallback(() => {
        if (selectedEntity) {
            const url = `${window.location.origin}?entity=${selectedEntity.id}`;
            navigator.clipboard.writeText(url);
            toast.info("Link copied", "Share URL copied to clipboard");
        }
    }, [selectedEntity, toast]);

    const handleVisualizeNetwork = useCallback((ids: string[]) => {
        setNetworkFocusIds(ids);
        setActiveTab("patterns");
    }, []);

    const handleNetworkClose = useCallback(() => {
        setNetworkFocusIds(undefined);
    }, []);

    return (
        <CommandPaletteProvider
            entities={evidenceData.entities}
            onNavigate={setActiveTab}
            onEntitySelect={handleEntitySelect}
        >
            <div className="min-h-screen bg-[#050505] text-[#ededed] font-mono selection:bg-neon-blue selection:text-black">
                {/* Navigation Tabs */}
                <DashboardNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Sub-Navigation (Investigation Hub) - Sticky under main nav */}
                {
                    activeTab === "investigation" && (
                        <InvestigationMenu
                            activeTab={investigationSubTab}
                            onTabChange={setInvestigationSubTab}
                        />
                    )
                }

                {/* Main Content */}
                <main className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={tabContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mt-8"
                        >
                            {/* OVERVIEW TAB */}
                            {activeTab === "overview" && (
                                <div className="space-y-12">
                                    {/* Top Section: 2/3 Leaderboard, 1/3 AI Search */}
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
                                        {/* Leaderboard - 2/3 width */}
                                        <section className="xl:col-span-2">
                                            <LeaderboardOfShame />
                                        </section>

                                        {/* AI Investigator Search + Quick Stats - 1/3 width */}
                                        <section className="flex flex-col gap-6">
                                            <InvestigatorSearch
                                                onEntitySelect={(id, isMaster) => {
                                                    if (isMaster) {
                                                        const masterEntity = masterlistData.entities.find(e => e.license_id === id);
                                                        if (masterEntity) {
                                                            handleEntitySelect({
                                                                id: masterEntity.license_id,
                                                                name: masterEntity.name,
                                                                type: masterEntity.service_type,
                                                                rawStatus: masterEntity.status,
                                                                holder: masterEntity.name,
                                                                owner: masterEntity.owner || "Unknown",
                                                                address: masterEntity.street,
                                                                city: masterEntity.city,
                                                                status: masterEntity.status,
                                                                state_status: masterEntity.status,
                                                                amount_billed: 0,
                                                                risk_score: calculateRiskScore(masterEntity),
                                                                red_flag_reason: [],
                                                                federal_status: "UNKNOWN",
                                                                linked_count: 0
                                                            });
                                                        }
                                                    } else {
                                                        const curatedEntity = evidenceData.entities.find(e => e.id === id);
                                                        if (curatedEntity) {
                                                            handleEntitySelect(curatedEntity);
                                                        }
                                                    }
                                                }}
                                            />
                                            <QuickStats />
                                        </section>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                                        <div className="flex flex-col gap-6">
                                            <FraudExposureCounter />
                                            <ActiveOperations />
                                            <KeyDates />
                                        </div>
                                        <div className="h-full">
                                            <RiskRadar />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INTEL TAB */}
                            {activeTab === "intel" && (
                                <div className="space-y-12">
                                    {/* Sentiment Tracker Banner */}
                                    <section className="w-full">
                                        <PublicSentimentTracker />
                                    </section>

                                    {/* Top Section: 50/50 Mainstream Media + Social Media */}
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                        <section>
                                            <LiveNewsFeed />
                                        </section>
                                        <section>
                                            <SocialMediaFeed />
                                        </section>
                                    </div>

                                    {/* Source Verifier */}
                                    <section>
                                        <SourceVerifier />
                                    </section>

                                    {/* Media Pulse */}
                                    <section className="w-full">
                                        <MediaPulse />
                                    </section>

                                    {/* Suggested Sources */}
                                    <section>
                                        <SuggestedSources />
                                    </section>

                                    {/* Reporter Tracker */}
                                    <section>
                                        <ReporterTracker />
                                    </section>
                                </div>
                            )}

                            {/* INVESTIGATION TAB HUB */}
                            {activeTab === "investigation" && (
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


                            {/* ORG CHART TAB */}
                            {activeTab === "org_chart" && (
                                <div className="space-y-12">
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                                        <h2 className="text-xl font-bold text-white mb-2">Structural Failure Analysis</h2>
                                        <p className="text-zinc-400 max-w-3xl">
                                            A forensic reconstruction of the DHS Dept. of Background Studies as of May 2025.
                                            This chart reveals the <span className="text-red-400">critical vacancies</span> and <span className="text-amber-400">process bottlenecks</span> that created the specific conditions for massive fraud throughput.
                                        </p>
                                    </div>
                                    <OrgChartFail />
                                    {/* <FullOrgChart /> */}
                                    {/* <EmployeeDossier /> */}
                                </div>
                            )}

                            {/* PATTERNS TAB */}
                            {activeTab === "patterns" && (
                                <div className="space-y-12">
                                    <PatternSynthesis onNavigate={setActiveTab} />

                                    {/* ZONE 1: NETWORK & SPATIAL */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-2">
                                            <h3 className="text-lg font-bold text-cyan-400 font-mono">
                                                NETWORK_TOPOLOGY
                                            </h3>
                                            <span className="text-xs text-cyan-600/70 font-mono px-2 py-0.5 rounded bg-cyan-950/30 border border-cyan-900/50">
                                                RELATIONSHIP MAPPING
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                            <section className="h-full min-h-[350px] xl:col-span-5">
                                                <NetworkGraph
                                                    entities={evidenceData.entities}
                                                    onEntityClick={handleEntitySelect}
                                                    filterIds={networkFocusIds}
                                                    onClose={handleNetworkClose}
                                                />
                                            </section>
                                            <section className="xl:col-span-5">
                                                <FraudNexus />
                                            </section>
                                            <section className="xl:col-span-2">
                                                <SpendingArtifacts />
                                            </section>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                            <div className="xl:col-span-4">
                                                <AddressCluster />
                                            </div>
                                            <div className="xl:col-span-8">
                                                <GeographicHeatmap
                                                    entities={evidenceData.entities}
                                                    onCitySelect={(city) => {
                                                        setCityFilter(city);
                                                        setActiveTab("database");
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ZONE 2: FINANCIAL VELOCITY */}
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

                                    {/* ZONE 3: TEMPORAL ANOMALIES */}
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

                                </div>
                            )}

                            {/* TARGETS TAB (formerly ENTITIES) */}
                            {activeTab === "entities" && (
                                <div className="space-y-12">
                                    <RiskAssessmentTable
                                        data={evidenceData.entities}
                                    />
                                    <ConflictDetector />
                                </div>
                            )}

                            {/* DATABASE TAB */}
                            {activeTab === "database" && (
                                <div className="space-y-12">
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                                        <h2 className="text-xl font-bold text-white mb-2">MN DHS Provider Masterlist</h2>
                                        <p className="text-zinc-400 max-w-3xl">
                                            This is the raw, comprehensive dataset of all 19,000+ providers licensed by the Minnesota Department of Human Services.
                                            It includes enriched data (owners, ghost status) processed from multiple source exports.
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

                {/* Entity Detail Modal */}
                {
                    selectedEntity && (
                        <EntityDetailModal
                            entity={selectedEntity}
                            onClose={handleEntityClose}
                            allEntities={evidenceData.entities}
                            onEntityClick={handleEntitySelect}
                            onCopyId={handleCopyId}
                            onFlag={handleFlag}
                            onShare={handleShare}
                        />
                    )
                }

                {/* Footer */}
                <footer className="mt-20 border-t border-zinc-900 py-6 text-center text-zinc-600 text-[10px] uppercase font-mono tracking-[0.2em]">
                    <p className="mb-2">Confidential Investigative Utility // Restricted Access</p>
                    <p className="text-zinc-700">
                        Operational Intelligence Dashboard v4.1.0
                    </p>
                </footer>

                {/* Case Scratchpad */}
                <InvestigatorNotes />
            </div >
        </CommandPaletteProvider >
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
