"use client";

import { useState, useEffect } from 'react';
import { Scale, ExternalLink, Clock, AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface CourtCase {
    case_number: string;
    title: string;
    court?: string;
    status: string;
    filing_date?: string;
    parties?: string;
    summary?: string;
    url?: string;
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        case 'pending':
            return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
        case 'closed':
        case 'resolved':
            return 'text-green-500 bg-green-500/10 border-green-500/30';
        case 'dismissed':
            return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
        case 'under investigation':
            return 'text-red-500 bg-red-500/10 border-red-500/30';
        case 'preliminary':
            return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
        default:
            return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
    }
}

function getCourtIcon(court?: string) {
    if (court?.toLowerCase().includes('federal') || court?.toLowerCase().includes('u.s.')) {
        return <Shield className="w-5 h-5 text-blue-500" />;
    }
    return <Scale className="w-5 h-5 text-amber-500" />;
}

export default function CourtDocket() {
    const [cases, setCases] = useState<CourtCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/courts/search');
            if (response.ok) {
                const data = await response.json();
                setCases(data.cases || []);
                setLastUpdated(data.timestamp);
            }
        } catch (error) {
            console.error('Failed to fetch court cases:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
        // Refresh every hour
        const interval = setInterval(fetchCases, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-amber-500">COURT</span>_DOCKET
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCases}
                        disabled={loading}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-[10px] text-zinc-600 font-mono">MN_COURTS</span>
                </div>
            </div>

            <div className="space-y-3">
                {loading && cases.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 font-mono text-xs animate-pulse">
                        QUERYING_COURT_RECORDS...
                    </div>
                ) : cases.length === 0 ? (
                    <div className="text-center py-8 text-zinc-600">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No related court cases found</p>
                    </div>
                ) : (
                    cases.map((courtCase) => (
                        <div
                            key={courtCase.case_number}
                            className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${courtCase.court?.includes('U.S.') ? 'bg-blue-500/20' : 'bg-amber-500/20'
                                        }`}>
                                        {getCourtIcon(courtCase.court)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-bold font-mono text-sm">{courtCase.case_number}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusColor(courtCase.status)}`}>
                                                {courtCase.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <h4 className="text-zinc-300 text-sm mt-1">{courtCase.title}</h4>
                                        {courtCase.summary && (
                                            <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{courtCase.summary}</p>
                                        )}
                                    </div>
                                </div>

                                {courtCase.url && (
                                    <a
                                        href={courtCase.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:text-purple-300 shrink-0"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-zinc-600">
                                {courtCase.court && <span>{courtCase.court}</span>}
                                {courtCase.filing_date && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Filed: {courtCase.filing_date}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {lastUpdated && (
                <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[9px] text-zinc-600 font-mono">
                        Sources: MCRO, PACER, Curated
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                        Updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </span>
                </div>
            )}
        </div>
    );
}
