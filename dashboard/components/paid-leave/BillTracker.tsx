"use client";

import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface Bill {
    bill_number: string;
    title: string;
    summary?: string;
    status: string;
    last_action?: string;
    last_action_date?: string;
    authors?: string;
    url?: string;
}

function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
        case 'passed':
        case 'signed':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'failed':
        case 'vetoed':
            return <XCircle className="w-4 h-4 text-red-500" />;
        case 'in committee':
        case 'introduced':
            return <Clock className="w-4 h-4 text-amber-500" />;
        default:
            return <AlertTriangle className="w-4 h-4 text-zinc-500" />;
    }
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'passed':
        case 'signed':
            return 'text-green-500 bg-green-500/10 border-green-500/30';
        case 'failed':
        case 'vetoed':
            return 'text-red-500 bg-red-500/10 border-red-500/30';
        case 'in committee':
            return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        case 'introduced':
            return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
        default:
            return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
    }
}

export default function BillTracker() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [source, setSource] = useState<string>('');

    const fetchBills = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/legislature/bills');
            if (response.ok) {
                const data = await response.json();
                setBills(data.bills || []);
                setLastUpdated(data.timestamp);
                setSource(data.source);
            }
        } catch (error) {
            console.error('Failed to fetch bills:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
        // Refresh every 30 minutes
        const interval = setInterval(fetchBills, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-purple-500">BILL</span>_TRACKER
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchBills}
                        disabled={loading}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-[10px] text-zinc-600 font-mono">
                        {source === 'revisor.mn.gov' ? 'LIVE' : 'CURATED'}
                    </span>
                </div>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto min-h-0 pr-2">
                {loading && bills.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 font-mono text-xs animate-pulse">
                        QUERYING_LEGISLATURE...
                    </div>
                ) : bills.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No paid leave bills found</p>
                    </div>
                ) : (
                    bills.map((bill) => (
                        <div
                            key={bill.bill_number}
                            className="border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 overflow-hidden">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-bold font-mono text-xs">{bill.bill_number}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${getStatusColor(bill.status)}`}>
                                                {bill.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="text-zinc-300 text-xs mt-0.5 truncate">{bill.title}</h4>
                                        {bill.summary && (
                                            <p className="text-zinc-500 text-[10px] mt-0.5 truncate">{bill.summary}</p>
                                        )}
                                        {bill.last_action && (
                                            <p className="text-zinc-600 text-[9px] mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {bill.last_action}
                                                {bill.last_action_date && ` (${bill.last_action_date})`}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {bill.url && (
                                    <a
                                        href={bill.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 shrink-0"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[9px] text-zinc-600 font-mono">MN_LEGISLATURE</span>
                {lastUpdated && (
                    <span className="text-[9px] text-zinc-600 font-mono">
                        {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                )}
            </div>
        </div>
    );
}
