"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Activity, TrendingDown, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';

interface SimulationResult {
    median: string;
    percentile10: string;
    percentile25: string;
    percentile75: string;
    percentile90: string;
    percentile95: string;
    meanDays: number;
    standardDeviation: number;
    probabilities: {
        before30Days: number;
        before60Days: number;
        before90Days: number;
    };
    distribution: number[];
    confidence: 'high' | 'medium' | 'low';
}

interface SimulationParams {
    currentBalance: number;
    baseBurnRate: number;
    claimVelocityVariance: number;
    approvalRateVariance: number;
    fraudRateImpact: number;
}

export default function InsolvencySimulator() {
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [params, setParams] = useState<SimulationParams>({
        currentBalance: 500,
        baseBurnRate: 8.0,
        claimVelocityVariance: 0.2,
        approvalRateVariance: 0.1,
        fraudRateImpact: 0.1
    });
    const [loading, setLoading] = useState(false);
    const [computeTime, setComputeTime] = useState<number | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const searchParams = useSearchParams();

    const runSimulation = useCallback(async (overrideParams?: SimulationParams) => {
        setLoading(true);
        const p = overrideParams || params;
        try {
            const response = await fetch('/api/analytics/simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data.results);
                setComputeTime(data.meta?.computeTimeMs);
            }
        } catch (error) {
            console.error('Simulation failed:', error);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        // Check URL first
        const bal = searchParams.get('sim_balance');
        const burn = searchParams.get('sim_burn');
        const fraud = searchParams.get('sim_fraud');

        if (bal || burn || fraud) {
            const newParams = { ...params };
            if (bal) newParams.currentBalance = parseFloat(bal);
            if (burn) newParams.baseBurnRate = parseFloat(burn);
            if (fraud) newParams.fraudRateImpact = parseFloat(fraud);

            setParams(newParams);
            setExpanded(true);
            runSimulation(newParams);
        } else {
            // Default initialization
            (async () => {
                setLoading(true);
                try {
                    const response = await fetch('/api/analytics/simulation');
                    if (response.ok) {
                        const data = await response.json();
                        setResult(data.results);
                        // Only sync params if we didn't have URL overrides (double check)
                        if (!bal) setParams(data.params);
                        setComputeTime(data.meta?.computeTimeMs);
                    }
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, []);

    const handleShare = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('sim_balance', params.currentBalance.toString());
        url.searchParams.set('sim_burn', params.baseBurnRate.toString());
        url.searchParams.set('sim_fraud', params.fraudRateImpact.toString());

        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high': return 'text-green-400';
            case 'medium': return 'text-amber-400';
            case 'low': return 'text-red-400';
            default: return 'text-zinc-400';
        }
    };

    return (
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                Monte Carlo Simulator
                                <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded font-mono">
                                    10K RUNS
                                </span>
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                Probabilistic insolvency projection
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
                            title="Share Scenario"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => runSimulation()}
                            disabled={loading}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {result && (
                <div className="p-4 space-y-4">
                    {/* Median / Key Dates */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                            <div className="text-[10px] text-zinc-500 font-mono mb-1">OPTIMISTIC (P10)</div>
                            <div className="text-sm font-bold text-green-400">{formatDate(result.percentile10)}</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                            <div className="text-[10px] text-red-400 font-mono mb-1">MEDIAN (P50)</div>
                            <div className="text-lg font-black text-red-500">{formatDate(result.median)}</div>
                            <div className="text-[10px] text-zinc-500">{result.meanDays} days avg</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                            <div className="text-[10px] text-zinc-500 font-mono mb-1">PESSIMISTIC (P90)</div>
                            <div className="text-sm font-bold text-amber-400">{formatDate(result.percentile90)}</div>
                        </div>
                    </div>

                    {/* Probability Bars */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500">P(Insolvency &lt; 30d)</span>
                            <span className={result.probabilities.before30Days > 50 ? 'text-red-400 font-bold' : 'text-zinc-400'}>
                                {result.probabilities.before30Days}%
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                                style={{ width: `${result.probabilities.before30Days}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500">P(Insolvency &lt; 60d)</span>
                            <span className={result.probabilities.before60Days > 50 ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                                {result.probabilities.before60Days}%
                            </span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                                style={{ width: `${result.probabilities.before60Days}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500">P(Insolvency &lt; 90d)</span>
                            <span className="text-zinc-400">{result.probabilities.before90Days}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 transition-all duration-500"
                                style={{ width: `${result.probabilities.before90Days}%` }}
                            />
                        </div>
                    </div>

                    {/* Distribution Mini-Chart */}
                    <div className="bg-zinc-800/30 rounded-lg p-3">
                        <div className="text-[10px] text-zinc-500 font-mono mb-2">DISTRIBUTION (10K SIMULATIONS)</div>
                        <div className="h-16 flex items-end gap-px">
                            {result.distribution.map((count, i) => {
                                const maxCount = Math.max(...result.distribution);
                                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 bg-purple-500/50 rounded-t transition-all hover:bg-purple-400"
                                        style={{ height: `${height}%` }}
                                        title={`Bucket ${i + 1}: ${count} simulations`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span className={getConfidenceColor(result.confidence)}>
                            {result.confidence.toUpperCase()} CONFIDENCE
                        </span>
                        <span>σ = {result.standardDeviation} days</span>
                        {computeTime && <span>{computeTime}ms compute</span>}
                    </div>
                </div>
            )}

            {/* Parameter Controls (Expandable) */}
            <div className="border-t border-zinc-800">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 hover:bg-zinc-800/50 transition-colors"
                >
                    <span className="font-mono">SIMULATION PARAMETERS</span>
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {expanded && (
                    <div className="p-4 space-y-3 bg-zinc-900/50">
                        <div>
                            <label htmlFor="sim-balance" className="text-[10px] text-zinc-500 font-mono block mb-1">
                                FUND BALANCE ($M): {params.currentBalance}
                            </label>
                            <input
                                id="sim-balance"
                                type="range"
                                min="100"
                                max="1000"
                                value={params.currentBalance}
                                onChange={(e) => setParams(p => ({ ...p, currentBalance: parseInt(e.target.value) }))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="sim-burn" className="text-[10px] text-zinc-500 font-mono block mb-1">
                                BURN RATE ($M/day): {params.baseBurnRate.toFixed(1)}
                            </label>
                            <input
                                id="sim-burn"
                                type="range"
                                min="1"
                                max="20"
                                step="0.5"
                                value={params.baseBurnRate}
                                onChange={(e) => setParams(p => ({ ...p, baseBurnRate: parseFloat(e.target.value) }))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="sim-fraud" className="text-[10px] text-zinc-500 font-mono block mb-1">
                                FRAUD RATE IMPACT: {(params.fraudRateImpact * 100).toFixed(0)}%
                            </label>
                            <input
                                id="sim-fraud"
                                type="range"
                                min="0"
                                max="0.5"
                                step="0.05"
                                value={params.fraudRateImpact}
                                onChange={(e) => setParams(p => ({ ...p, fraudRateImpact: parseFloat(e.target.value) }))}
                                className="w-full accent-red-500"
                            />
                        </div>
                        <button
                            onClick={() => runSimulation()}
                            disabled={loading}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'RUNNING 10,000 SIMULATIONS...' : 'RUN SIMULATION'}
                        </button>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && !result && (
                <div className="p-8 text-center">
                    <Activity className="w-8 h-8 text-purple-500 mx-auto mb-3 animate-pulse" />
                    <p className="text-zinc-500 text-sm">Running 10,000 simulations...</p>
                </div>
            )}
        </div>
    );
}
