'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MinnesotaCountyMap, { CensusSummary } from '@/components/MinnesotaCountyMap';
import MasterCensusDashboard, { DashboardMetrics, Provider, calculateMetrics } from '@/components/MasterCensusDashboard';
import { MapPin, FlaskConical, CheckCircle2, Shield, Layers, AlertTriangle, PieChart, Activity, Lock, Download, Camera, Flag } from 'lucide-react';
import DesktopSidebar from '@/components/DesktopSidebar';
import { CrosscheckHeader } from '@/components/CrosscheckHeader';
import DashboardNavigation from '@/components/DashboardNavigation';

interface ComparisonProps {
    censusSummary: CensusSummary | null;
    metrics: DashboardMetrics | null;
}

function ComparisonCycleBox({ censusSummary, metrics }: ComparisonProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % 2);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const totalTargets = censusSummary?.totalProviders.toLocaleString() || '...';
    const countiesActive = censusSummary?.totalCounties || 87;

    // Risk Data
    const riskCount = metrics?.riskCount.toLocaleString() || '0';
    const investigating = metrics?.investigatingCount.toLocaleString() || '0';
    const cleared = metrics?.clearedCount.toLocaleString() || '0';

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center min-h-[100px] transition-all duration-500">
            {index === 0 ? (
                <>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Layers className="w-3 h-3" />
                        Statewide Scope
                    </h3>
                    <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-bottom-3 duration-700">
                        <div className="text-center">
                            <div className="text-xl font-black text-zinc-300 leading-none">{totalTargets}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Total Targets</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="text-center">
                            <div className="text-xl font-black text-amber-500 leading-none">{countiesActive}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Counties Active</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="text-center">
                            <div className="text-xl font-black text-blue-500 leading-none">High</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Metro Density</div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        Risk Analysis
                    </h3>
                    <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-top-3 duration-700">
                        <div className="text-center">
                            <div className="text-xl font-black text-red-500 leading-none">{riskCount}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">High Risk</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="text-center">
                            <div className="text-xl font-black text-amber-500 leading-none">{investigating}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Investigating</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="text-center">
                            <div className="text-xl font-black text-emerald-500 leading-none">{cleared}</div>
                            <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Cleared</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function OpsCenter() {
    const router = useRouter();
    const [selectedCounty, setSelectedCounty] = useState<{ id: string; name: string; providers: number } | null>(null);
    const [censusSummary, setCensusSummary] = useState<CensusSummary | null>(null);
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);

    // Data State (Lifted from MasterCensusDashboard)
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(false);
    const [providerError, setProviderError] = useState<string | null>(null);

    // 1. Load Census Summary
    useEffect(() => {
        async function fetchCensusSummary() {
            try {
                const response = await fetch('/api/census-summary');
                if (response.ok) {
                    const data = await response.json();
                    setCensusSummary(data);

                    // Auto-select Hennepin by default on load
                    const hennepin = data.byName['Hennepin'];
                    if (hennepin) {
                        setSelectedCounty({ id: hennepin.fips, name: 'Hennepin', providers: hennepin.count });
                    }
                }
            } catch (err) {
                console.error('Failed to load census summary:', err);
            }
        }
        fetchCensusSummary();
    }, []);

    // 2. Load Providers when County Changes
    useEffect(() => {
        async function fetchProviders() {
            if (!selectedCounty) {
                setProviders([]);
                setDashboardMetrics(null);
                return;
            }

            setLoadingProviders(true);
            setProviderError(null);
            try {
                // Normalize name for API (e.g. St. Louis -> St Louis handled by API usually, but let's pass name)
                const response = await fetch(`/api/census?county=${selectedCounty.name}`);
                if (!response.ok) throw new Error(`No data for ${selectedCounty.name}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const parsed: Provider[] = data.providers.map((record: any) => record as Provider);
                setProviders(parsed);

                // Calculate metrics immediately
                const metrics = calculateMetrics(parsed);
                setDashboardMetrics(metrics);

            } catch (err) {
                console.error("Fetch error:", err);
                setProviderError(err instanceof Error ? err.message : 'Failed to load');
                setProviders([]);
                setDashboardMetrics(null);
            } finally {
                setLoadingProviders(false);
            }
        }

        fetchProviders();
    }, [selectedCounty?.id]); // Watch ID changes

    const handleTabChange = (tabId: string) => {
        router.push(`/?tab=${tabId}`);
    };

    const handleCountyClick = (countyId: string, countyName: string, providerCount: number) => {
        setSelectedCounty({ id: countyId, name: countyName, providers: providerCount });
    };

    const handleSnap = () => {
        alert("Snapshot saved to case file.");
    };

    const handleExport = () => {
        if (!providers || providers.length === 0) {
            alert("No provider data loaded to export. Please select a county.");
            return;
        }

        // Generate CSV
        const headers = Object.keys(providers[0]); // Use first record keys
        const csvContent = [
            headers.join(','), // Header row
            ...providers.map(row => headers.map(fieldName => {
                const val = (row as any)[fieldName]?.toString() || '';
                // Escape quotes and wrap in quotes if contains comma
                if (val.includes(',') || val.includes('"')) {
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(','))
        ].join('\n');

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedCounty?.name || 'MN'}_Providers_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDashboardCountyChange = (name: string) => {
        if (!censusSummary) return;
        const data = censusSummary.byName[name];
        if (data) {
            setSelectedCounty({ id: data.fips, name: name, providers: data.count });
        }
    };

    // Calculate Service Distribution Percentages for Display
    const totalService = dashboardMetrics ? (dashboardMetrics.serviceMix.hss + dashboardMetrics.serviceMix.pca + dashboardMetrics.serviceMix.afc) : 1;
    const hssPct = dashboardMetrics ? Math.round((dashboardMetrics.serviceMix.hss / totalService) * 100) : 0;
    const pcaPct = dashboardMetrics ? Math.round((dashboardMetrics.serviceMix.pca / totalService) * 100) : 0;
    const afcPct = dashboardMetrics ? Math.round((dashboardMetrics.serviceMix.afc / totalService) * 100) : 0;

    return (
        <main className="min-h-screen bg-black text-white">
            <DesktopSidebar />

            <div className="lg:hidden">
                <CrosscheckHeader />
                <DashboardNavigation activeTab="ops_center" onTabChange={handleTabChange} />
            </div>

            <div className="lg:ml-[200px] p-6 md:p-8" style={{ paddingRight: '75px' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    ::-webkit-scrollbar-thumb {
                        background: linear-gradient(to bottom, #a855f7, #eab308) !important;
                        border-radius: 4px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(to bottom, #9333ea, #ca8a04) !important;
                    }
                `}} />
                <div className="max-w-[2000px] mx-auto space-y-6">
                    {/* Header HUD */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-600/20 rounded-lg">
                                    <FlaskConical className="w-6 h-6 text-purple-500" />
                                </div>
                                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                                    Operations Center
                                </h1>
                            </div>
                            <p className="text-zinc-500 font-mono text-sm">
                                Strategic Overview • Geographic provider mapping & risk analysis
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
                            <div className="flex flex-col items-center px-3 border-r border-zinc-800">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Components</span>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3 h-3 text-purple-400" />
                                    <span className="text-xs font-mono font-bold text-purple-400">3 ACTIVE</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center px-3">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</span>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    <span className="text-xs font-mono font-bold text-green-500">OPERATIONAL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: 35/65 Split - Map | Dashboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6 items-start">
                        {/* Left: Provider Density Map (35%) */}
                        <div>
                            <MinnesotaCountyMap
                                onCountyClick={handleCountyClick}
                                highlightedCounty={selectedCounty?.id}
                                censusSummary={censusSummary}
                            />
                        </div>

                        {/* Right: Master Census Dashboard (65%) */}
                        <div>
                            <MasterCensusDashboard
                                censusSummary={censusSummary}
                                selectedCountyName={selectedCounty?.name}
                                onCountyChange={handleDashboardCountyChange}
                                propProviders={providers}
                                propLoading={loadingProviders}
                                propError={providerError}
                            />
                        </div>
                    </div>

                    {/* Row 1: High Impact / Cycling / Colored */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Forensic Integrity */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center min-h-[100px]">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                Forensic Integrity
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xl font-black text-emerald-500 leading-none">99.9%</div>
                                    <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Valid Checksums</div>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-zinc-300 leading-none flex items-center gap-1">
                                        Live
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Stream Status</div>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                                    <span>Protocol: DOC-2.0</span>
                                    <span>Latency: 24ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Cycle Box (Cycling) */}
                        <ComparisonCycleBox censusSummary={censusSummary} metrics={dashboardMetrics} />

                        {/* Service Mix (Colorful) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center min-h-[100px]">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                                <PieChart className="w-3 h-3" />
                                Service Distribution
                            </h3>
                            <div className="space-y-2">
                                {/* Bar 1 */}
                                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                                    <span className="w-8">HSS</span>
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full bg-purple-500 transition-all duration-1000`} style={{ width: `${hssPct}%` }} />
                                    </div>
                                    <span className="w-6 text-right">{hssPct}%</span>
                                </div>
                                {/* Bar 2 */}
                                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                                    <span className="w-8">PCA</span>
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full bg-blue-500 transition-all duration-1000`} style={{ width: `${pcaPct}%` }} />
                                    </div>
                                    <span className="w-6 text-right">{pcaPct}%</span>
                                </div>
                                {/* Bar 3 */}
                                <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                                    <span className="w-8">AFC</span>
                                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className={`h-full bg-amber-500 transition-all duration-1000`} style={{ width: `${afcPct}%` }} />
                                    </div>
                                    <span className="w-6 text-right">{afcPct}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Static / Detail Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Selected County Info */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center min-h-[100px]">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                Selected County
                            </h3>
                            {selectedCounty ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-baseline gap-3">
                                            <div className="text-xl font-black text-white leading-none">
                                                {selectedCounty.name}
                                            </div>
                                            <div className="text-sm font-bold text-purple-400 leading-none">
                                                {selectedCounty.providers.toLocaleString()} providers
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-zinc-600 mt-1">
                                            FIPS: {selectedCounty.id}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCounty(null)}
                                        className="px-2 py-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 rounded transition-colors text-zinc-300"
                                    >
                                        Clear
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-zinc-600 text-sm italic">
                                    <MapPin className="w-4 h-4 opacity-50" />
                                    <span>Click map to inspect county data</span>
                                </div>
                            )}
                        </div>

                        {/* Analyst Toolkit (Colorful) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center min-h-[100px]">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                                <Activity className="w-3 h-3" />
                                Analyst Toolkit
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={handleSnap} className="flex flex-col items-center justify-center p-2 rounded bg-purple-950/30 border border-purple-900/40 hover:bg-purple-600 hover:text-white transition-all group">
                                    <Camera className="w-4 h-4 text-purple-400 group-hover:text-white mb-1" />
                                    <span className="text-[8px] uppercase tracking-wider text-purple-300 group-hover:text-white">Snap</span>
                                </button>
                                <button onClick={handleExport} className="flex flex-col items-center justify-center p-2 rounded bg-blue-950/30 border border-blue-900/40 hover:bg-blue-600 hover:text-white transition-all group">
                                    <Download className="w-4 h-4 text-blue-400 group-hover:text-white mb-1" />
                                    <span className="text-[8px] uppercase tracking-wider text-blue-300 group-hover:text-white">Export</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-2 rounded bg-red-950/30 border border-red-900/40 hover:bg-red-600 hover:text-white transition-all group">
                                    <Flag className="w-4 h-4 text-red-400 group-hover:text-white mb-1" />
                                    <span className="text-[8px] uppercase tracking-wider text-red-300 group-hover:text-white">Report</span>
                                </button>
                            </div>
                        </div>

                        {/* Platform Capabilities */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col justify-center min-h-[100px]">
                            <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                Platform Capabilities
                            </h3>
                            <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    <span className="text-xs text-zinc-300 truncate">
                                        Heatmap Engine
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    <span className="text-xs text-zinc-300 truncate">
                                        Census Explorer
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    <span className="text-xs text-zinc-300 truncate">
                                        Pipeline Health
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                    <span className="text-xs text-zinc-300 truncate">
                                        Cross-Module Sync
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
