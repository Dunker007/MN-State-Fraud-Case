"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Shield,
    Download,
    Upload,
    ExternalLink,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Loader2,
    FileText,
    RefreshCw
} from 'lucide-react';

interface LicenseRecord {
    license_number: string;
    program_name: string;
    status: string;
    city?: string;
    county?: string;
    license_type?: string;
}

interface AutoCollectResponse {
    success?: boolean;
    error?: string;
    message?: string;
    manual_url?: string;
    instructions?: string[];
    records?: LicenseRecord[];
    total_records?: number;
    status_breakdown?: Record<string, number>;
}

export default function LicenseVerifier() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<LicenseRecord[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualMode, setManualMode] = useState(false);
    const [manualUrl, setManualUrl] = useState<string | null>(null);
    const [instructions, setInstructions] = useState<string[]>([]);
    const [statusBreakdown, setStatusBreakdown] = useState<Record<string, number>>({});

    // Try auto-collect first
    const handleAutoCollect = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults(null);
        setManualMode(false);

        try {
            const response = await fetch(`/api/dhs-auto?q=${encodeURIComponent(searchQuery)}`);
            const data: AutoCollectResponse = await response.json();

            if (data.success && data.records) {
                setResults(data.records);
                setStatusBreakdown(data.status_breakdown || {});
            } else if (data.error) {
                // Auto-collect blocked, switch to manual mode
                setManualMode(true);
                setManualUrl(data.manual_url || null);
                setInstructions(data.instructions || []);
                setError(data.message || data.error);
            }
        } catch (err) {
            setError('Failed to connect to verification API');
            setManualMode(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle manual CSV upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/dhs-lookup', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.all_results) {
                // Convert comparison results to license records
                const records = data.all_results.map((r: { license_id: string; program_name: string; dhs_status: string; discrepancy?: string }) => ({
                    license_number: r.license_id,
                    program_name: r.program_name,
                    status: r.dhs_status,
                    discrepancy: r.discrepancy
                }));
                setResults(records);
                setManualMode(false);
                setStatusBreakdown({
                    'Matches': data.stats?.status_matches || 0,
                    'Mismatches': data.stats?.status_mismatches || 0,
                    'New': data.stats?.not_in_our_database || 0
                });
            } else {
                setError(data.error || 'Failed to parse CSV');
            }
        } catch (err) {
            setError('Failed to upload CSV');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('active') && !s.includes('inactive')) {
            return <CheckCircle className="h-4 w-4 text-emerald-400" />;
        }
        if (s.includes('revoked') || s.includes('suspended')) {
            return <XCircle className="h-4 w-4 text-red-400" />;
        }
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    };

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('active') && !s.includes('inactive')) return 'text-emerald-400';
        if (s.includes('revoked') || s.includes('suspended')) return 'text-red-400';
        return 'text-amber-400';
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">License Verifier</h2>
                    <p className="text-sm text-slate-400">Auto-check DHS license status for providers</p>
                </div>
            </div>

            {/* Search Form */}
            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAutoCollect()}
                        placeholder="Enter provider name (e.g., Dungarvin)"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 
                                 text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 
                                 focus:ring-cyan-500 transition-colors"
                    />
                </div>
                <button
                    onClick={handleAutoCollect}
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 
                             disabled:cursor-not-allowed rounded-lg flex items-center gap-2 
                             text-white font-medium transition-colors"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    Verify
                </button>
            </div>

            {/* Manual Mode UI */}
            <AnimatePresence>
                {manualMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-amber-200 font-medium mb-2">Manual Export Required</p>
                                <p className="text-slate-300 text-sm mb-3">{error}</p>

                                {instructions.length > 0 && (
                                    <ol className="text-sm text-slate-400 space-y-1 mb-4">
                                        {instructions.map((inst, i) => (
                                            <li key={i}>{inst}</li>
                                        ))}
                                    </ol>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    {manualUrl && (
                                        <a
                                            href={manualUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 
                                                     bg-cyan-600 hover:bg-cyan-500 rounded-lg 
                                                     text-white text-sm transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Open DHS Search
                                        </a>
                                    )}

                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 
                                                     bg-slate-700 hover:bg-slate-600 rounded-lg 
                                                     text-white text-sm cursor-pointer transition-colors">
                                        <Upload className="h-4 w-4" />
                                        Upload CSV
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {results && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Status Summary */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm">
                                <span className="text-slate-400">Total: </span>
                                <span className="text-white font-medium">{results.length}</span>
                            </div>
                            {Object.entries(statusBreakdown).map(([status, count]) => (
                                <div key={status} className="px-3 py-1.5 bg-slate-800 rounded-lg text-sm">
                                    <span className="text-slate-400">{status}: </span>
                                    <span className={getStatusColor(status)}>{count}</span>
                                </div>
                            ))}
                        </div>

                        {/* Results List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {results.slice(0, 50).map((record, index) => (
                                <motion.div
                                    key={record.license_number || index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 
                                             border border-slate-700/50 rounded-lg hover:border-slate-600 
                                             transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {getStatusIcon(record.status)}
                                        <div className="min-w-0">
                                            <div className="text-white font-medium truncate">
                                                {record.program_name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                License #{record.license_number}
                                                {record.city && ` • ${record.city}`}
                                                {record.county && `, ${record.county} County`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                        <a
                                            href={`https://licensinglookup.dhs.state.mn.us/Details.aspx?l=${record.license_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                                            title="View on DHS"
                                        >
                                            <FileText className="h-4 w-4 text-slate-400" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                            {results.length > 50 && (
                                <div className="text-center text-sm text-slate-500 py-2">
                                    Showing 50 of {results.length} results
                                </div>
                            )}
                        </div>

                        {/* Export Button */}
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-end">
                            <button
                                onClick={() => {
                                    const csv = [
                                        'License Number,Program Name,Status,City,County',
                                        ...results.map(r =>
                                            `${r.license_number},"${r.program_name}",${r.status},${r.city || ''},${r.county || ''}`
                                        )
                                    ].join('\n');

                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `license_verification_${Date.now()}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 
                                         bg-slate-700 hover:bg-slate-600 rounded-lg 
                                         text-white text-sm transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Export Results
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!isLoading && !results && !manualMode && (
                <div className="text-center py-8 text-slate-500">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Enter a provider name to verify their DHS license status</p>
                </div>
            )}
        </div>
    );
}
