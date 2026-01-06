'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InsolvencyData {
    estimatedDate: string;
    daysUntilInsolvent: number;
    confidenceInterval: {
        best: string;
        likely: string;
        worst: string;
    };
    burnRate: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    projections: {
        date: string;
        balance: number;
        scenario: 'best' | 'likely' | 'worst';
    }[];
    recommendations: string[];
}

export default function InsolvencyPredictor() {
    const [data, setData] = useState<InsolvencyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPrediction() {
            try {
                const response = await fetch('/api/paid-leave/insolvency');
                if (!response.ok) throw new Error('Failed to fetch prediction');

                const result = await response.json();
                if (result.success) {
                    setData(result.prediction);
                } else {
                    throw new Error(result.message || 'Unknown error');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load prediction');
            } finally {
                setLoading(false);
            }
        }

        fetchPrediction();
    }, []);

    if (loading) {
        return (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-zinc-800 rounded w-1/3"></div>
                    <div className="h-64 bg-zinc-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-6">
                <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Error loading insolvency prediction: {error || 'Unknown error'}</span>
                </div>
            </div>
        );
    }

    // Format chart data
    const chartData = data.projections.reduce((acc, proj) => {
        const existing = acc.find(item => item.date === new Date(proj.date).toLocaleDateString());
        if (existing) {
            existing[proj.scenario] = proj.balance / 1000000; // Convert to millions
        } else {
            acc.push({
                date: new Date(proj.date).toLocaleDateString(),
                [proj.scenario]: proj.balance / 1000000,
            });
        }
        return acc;
    }, [] as any[]);

    const formatCurrency = (value: number) => {
        return `$${(value / 1000000).toFixed(1)}M`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const urgencyColor = data.daysUntilInsolvent < 90 ? 'text-red-500' :
        data.daysUntilInsolvent < 180 ? 'text-amber-500' :
            'text-blue-500';

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-bold uppercase text-zinc-400">Predicted Insolvency</h3>
                    </div>
                    <div className={`text-2xl font-black ${urgencyColor}`}>
                        {formatDate(data.estimatedDate)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                        {data.daysUntilInsolvent} days remaining
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                        <h3 className="text-xs font-bold uppercase text-zinc-400">Daily Burn Rate</h3>
                    </div>
                    <div className="text-2xl font-black text-white">
                        {formatCurrency(data.burnRate.daily)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                        {formatCurrency(data.burnRate.monthly)}/month
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase text-zinc-400">Best Case</h3>
                    </div>
                    <div className="text-lg font-black text-emerald-400">
                        {formatDate(data.confidenceInterval.best)}
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <h3 className="text-xs font-bold uppercase text-zinc-400">Worst Case</h3>
                    </div>
                    <div className="text-lg font-black text-red-400">
                        {formatDate(data.confidenceInterval.worst)}
                    </div>
                </div>
            </div>

            {/* Projection Chart */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    180-Day Fund Balance Projection
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis
                            dataKey="date"
                            stroke="#71717a"
                            style={{ fontSize: '10px' }}
                        />
                        <YAxis
                            stroke="#71717a"
                            style={{ fontSize: '10px' }}
                            label={{ value: 'Balance ($M)', angle: -90, position: 'insideLeft', fill: '#71717a' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #27272a',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#a1a1aa' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="best"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Best Case"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="likely"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Likely"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="worst"
                            stroke="#ef4444"
                            strokeWidth={2}
                            name="Worst Case"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-6">
                <h3 className="text-sm font-bold uppercase text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Recommendations
                </h3>
                <ul className="space-y-2">
                    {data.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
