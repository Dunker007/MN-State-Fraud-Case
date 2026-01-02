import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Search, AlertTriangle, Globe, Lock } from 'lucide-react';

const MOCK_RESULTS = {
    trusted: {
        score: 92,
        status: 'high',
        label: 'VERIFIED SOURCE',
        flags: [],
        owner: 'Public Trust Media Group',
        history: 'Clean'
    },
    suspect: {
        score: 35,
        status: 'critical',
        label: 'FLAGGED DOMAIN',
        flags: ['Sensationalist Patterns', 'Opaque Ownership', 'High Ad Density'],
        owner: 'Shell Corp LLC (Offshore)',
        history: '3 Failed Fact Checks'
    }
};

type VerificationResult = {
    score: number;
    status: string;
    label: string;
    flags: string[];
    owner: string;
    history: string;
};

const SourceVerifier = () => {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsAnalyzing(true);
        setResult(null);

        // Simulate analysis delay
        setTimeout(() => {
            setIsAnalyzing(false);
            // Simple toggle for demo based on string length
            setResult(url.length > 20 ? MOCK_RESULTS.suspect : MOCK_RESULTS.trusted);
        }, 1500);
    };

    return (
        <div className="bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="h-10 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Source Verifier</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400 font-mono">
                    <Lock className="w-3 h-3" />
                    SECURE
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Search / Input */}
                <form onSubmit={handleAnalyze} className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste source URL to verify integrity..."
                        className="w-full bg-zinc-900/50 border border-zinc-700 text-zinc-200 text-xs rounded pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder:text-zinc-600 font-mono"
                    />
                    <button
                        type="submit"
                        disabled={isAnalyzing || !url}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-[10px] font-bold text-zinc-300 rounded transition-colors"
                    >
                        {isAnalyzing ? 'SCANNING...' : 'VERIFY'}
                    </button>

                    {/* Scanning Beam Effect */}
                    {isAnalyzing && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 pointer-events-none"
                        />
                    )}
                </form>

                {/* Results Area */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className={`rounded border p-3 ${result.status === 'high'
                                ? 'bg-emerald-900/10 border-emerald-900/30'
                                : 'bg-red-900/10 border-red-900/30'
                                }`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            {result.status === 'high'
                                                ? <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                : <ShieldAlert className="w-4 h-4 text-red-500" />
                                            }
                                            <span className={`text-xs font-bold tracking-wider ${result.status === 'high' ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {result.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                                            <Globe className="w-3 h-3" />
                                            {url.replace(/^https?:\/\//, '').split('/')[0] || 'unknown-domain.com'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-black ${result.status === 'high' ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            {result.score}/100
                                        </div>
                                        <div className="text-[9px] text-zinc-600 font-mono uppercase">Trust Score</div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-zinc-900/50 p-2 rounded">
                                        <div className="text-[9px] text-zinc-500 uppercase mb-0.5">Known Owner</div>
                                        <div className="text-[10px] text-zinc-300 font-medium truncate title={result.owner}">{result.owner}</div>
                                    </div>
                                    <div className="bg-zinc-900/50 p-2 rounded">
                                        <div className="text-[9px] text-zinc-500 uppercase mb-0.5">History</div>
                                        <div className="text-[10px] text-zinc-300 font-medium truncate">{result.history}</div>
                                    </div>
                                </div>

                                {/* Warning Flags */}
                                {result.flags.length > 0 && (
                                    <div className="space-y-1">
                                        {result.flags.map((flag: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px] text-red-400 bg-red-900/20 px-2 py-1 rounded">
                                                <AlertTriangle className="w-3 h-3" />
                                                {flag}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SourceVerifier;
