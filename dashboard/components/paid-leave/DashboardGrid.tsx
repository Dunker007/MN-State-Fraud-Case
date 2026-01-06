"use client";

import { useState, useEffect, ReactNode } from 'react';
import { Layout, Settings, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardWidgets {
    fraudObservatory: ReactNode;
    insolvencySimulator: ReactNode;
    phoenixDetector: ReactNode;
    sentimentPanel: ReactNode;
    providerNetwork: ReactNode;
    testimonyTracker: ReactNode;
    dataCollectors: ReactNode;
    countyMap: ReactNode;
    charts: ReactNode;
    courtDocket: ReactNode;
    billTracker: ReactNode;
    socialPulse: ReactNode;
    officialWatch: ReactNode;
    keyMetrics: ReactNode;
}

interface DashboardGridProps {
    widgets: DashboardWidgets;
}

type WidgetKey = keyof DashboardWidgets;

const WIDGET_LABELS: Record<WidgetKey, string> = {
    fraudObservatory: 'Fraud Observatory',
    insolvencySimulator: 'Insolvency Simulator',
    phoenixDetector: 'Phoenix Detector',
    sentimentPanel: 'Sentiment Panel',
    providerNetwork: 'Provider Network',
    testimonyTracker: 'Testimony Tracker',
    dataCollectors: 'Data Collectors',
    countyMap: 'County Map',
    charts: 'Financial Models',
    courtDocket: 'Court Docket',
    billTracker: 'Legislative Bills',
    socialPulse: 'Social Pulse',
    officialWatch: 'Official Watch',
    keyMetrics: 'Key Metrics'
};

const DEFAULT_VISIBLE: Record<WidgetKey, boolean> = {
    fraudObservatory: true,
    insolvencySimulator: true,
    phoenixDetector: true,
    sentimentPanel: true,
    providerNetwork: true,
    testimonyTracker: true,
    dataCollectors: true,
    countyMap: true,
    charts: true,
    courtDocket: true,
    billTracker: true,
    socialPulse: true,
    officialWatch: true,
    keyMetrics: true
};

export default function DashboardGrid({ widgets }: DashboardGridProps) {
    const [visible, setVisible] = useState<Record<WidgetKey, boolean>>(DEFAULT_VISIBLE);
    const [showConfig, setShowConfig] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dashboard_config');
        if (saved) {
            try {
                setVisible({ ...DEFAULT_VISIBLE, ...JSON.parse(saved) });
            } catch (e) {
                console.error('Failed to load dashboard config', e);
            }
        }
        setMounted(true);
    }, []);

    const toggleWidget = (key: WidgetKey) => {
        const newState = { ...visible, [key]: !visible[key] };
        setVisible(newState);
        localStorage.setItem('dashboard_config', JSON.stringify(newState));
    };

    if (!mounted) return null; // Avoid hydration mismatch

    return (
        <div className="relative">
            {/* Config Button (Floating or Integrated) */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowConfig(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 rounded-lg text-sm transition-colors"
                >
                    <Layout className="w-4 h-4" />
                    Customize Layout
                </button>
            </div>

            {/* Config Modal */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-purple-500" />
                                    Configure Dashboard
                                </h2>
                                <button onClick={() => setShowConfig(false)} className="p-1 hover:bg-zinc-800 rounded">
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                                {(Object.keys(WIDGET_LABELS) as WidgetKey[]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleWidget(key)}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${visible[key]
                                            ? 'bg-purple-900/20 border-purple-500/50 text-white'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{WIDGET_LABELS[key]}</span>
                                        {visible[key] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 border-t border-zinc-800 flex justify-end">
                                <button
                                    onClick={() => setShowConfig(false)}
                                    className="px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-zinc-200"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Row: Map + Insolvency + Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-[25fr_65fr_auto] gap-6 mb-8">
                {visible.countyMap && (
                    <div className="h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                        <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            Geographic Distribution
                        </h3>
                        {widgets.countyMap}
                    </div>
                )}

                {visible.charts && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                        {widgets.charts}
                    </div>
                )}

                {visible.keyMetrics && (
                    <div className="flex flex-col gap-6">
                        {widgets.keyMetrics}
                    </div>
                )}
            </div>

            {/* Docket & Bills Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {visible.billTracker && <div className="lg:col-span-1">{widgets.billTracker}</div>}

                {visible.officialWatch && <div className="lg:col-span-1">{widgets.officialWatch}</div>}

                {visible.courtDocket && (
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                        {widgets.courtDocket}
                    </div>
                )}
            </div>

            {/* Fraud & Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">
                {visible.fraudObservatory && widgets.fraudObservatory}
                {visible.insolvencySimulator && widgets.insolvencySimulator}
            </div>

            {/* Deep Intelligence */}
            <div className="mb-8">
                {(visible.phoenixDetector || visible.sentimentPanel || visible.providerNetwork || visible.testimonyTracker) && (
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-lg font-bold text-white">Deep Intelligence</h2>
                        <span className="text-[9px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-mono">
                            ADVANCED ANALYTICS
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {visible.phoenixDetector && widgets.phoenixDetector}
                    {visible.sentimentPanel && widgets.sentimentPanel}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {visible.providerNetwork && widgets.providerNetwork}
                    {visible.testimonyTracker && widgets.testimonyTracker}
                </div>
            </div>

            {/* Social Pulse & Collectors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {visible.socialPulse && <div className="lg:col-span-1">{widgets.socialPulse}</div>}
                {visible.dataCollectors && (
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4">
                        {widgets.dataCollectors}
                    </div>
                )}
            </div>
        </div>
    );
}
