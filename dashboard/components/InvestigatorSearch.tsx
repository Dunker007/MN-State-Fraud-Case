"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Sparkles,
    Brain,
    ChevronRight,
    Download,
    Database,
    MapPin,
    Building2,
    Info,
    User,
    TrendingUp
} from 'lucide-react';
import { evidenceData, searchMasterlist, calculateRiskScore } from '@/lib/data';
import { getDossierList } from '@/lib/dossiers';
import { SMART_QUERIES } from '@/lib/smart_queries';
import { type Entity, type MasterlistEntity } from '@/lib/schemas';

interface SearchResultEntity extends Partial<Entity>, Partial<MasterlistEntity> {
    id: string;
    name: string;
    status?: string | undefined;
    _isMasterlist?: boolean;
    _isDossier?: boolean;
    role?: string;
    notes?: string;
    risk_score?: number;
    city?: string;
}

interface SearchResults {
    headline: string;
    entities: SearchResultEntity[];
    action?: string;
    source: 'curated' | 'masterlist' | 'mixed';
}

interface InvestigatorSearchProps {
    onEntitySelect: (id: string, isMasterlist?: boolean) => void;
}

export default function InvestigatorSearch({ onEntitySelect }: InvestigatorSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [results, setResults] = useState<SearchResults | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsThinking(true);
        setResults(null);

        // Simulate AI Thinking
        setTimeout(() => {
            const lowerQ = searchQuery.toLowerCase();

            // 1. Check for Smart Queries (Exact/Pattern matches)
            const matchedConfig = Object.values(SMART_QUERIES).find(q =>
                q.keywords.some(t => lowerQ.includes(t.toLowerCase()))
            );

            // 2. Smart Query matched - use curated entities
            if (matchedConfig) {
                let finalEntities: Entity[] = [];
                let headline = matchedConfig.headline;
                let action = undefined;

                if (matchedConfig.filter) {
                    finalEntities = matchedConfig.filter(evidenceData.entities);
                } else if (matchedConfig.action === 'show_clusters') {
                    action = 'show_clusters';
                    const clusterIds = new Set(evidenceData.high_risk_address_clusters.flatMap(c => c.ids));
                    finalEntities = evidenceData.entities.filter(e => clusterIds.has(e.id));
                    headline = `Found ${evidenceData.high_risk_address_clusters.length} Suspicious Address Clusters`;
                }

                setResults({
                    headline,
                    entities: finalEntities as SearchResultEntity[],
                    action,
                    source: 'curated'
                });
            } else {
                // 3. Generic Search - combine Masterlist + Dossiers
                const masterlistResults = searchMasterlist(searchQuery, 40);

                // Search Dossiers
                const dossierEntries = getDossierList();
                const matchedDossiers = dossierEntries.filter(d =>
                    d.name.toLowerCase().includes(lowerQ) ||
                    d.role.toLowerCase().includes(lowerQ)
                );

                // Add marker to distinguish results
                const taggedResults: SearchResultEntity[] = [
                    ...matchedDossiers.map(d => ({
                        id: d.id,
                        name: d.name,
                        status: d.investigationStatus,
                        city: 'DHS HQ',
                        role: d.role,
                        notes: d.notes,
                        _isDossier: true as const
                    } as SearchResultEntity)),
                    ...masterlistResults.map(e => ({
                        ...e,
                        _isMasterlist: true as const
                    } as SearchResultEntity))
                ];

                setResults({
                    headline: `Found ${taggedResults.length} matches for "${searchQuery}"`,
                    entities: taggedResults,
                    source: 'mixed'
                });
            }

            setIsThinking(false);
        }, 600);
    };

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase() || '';
        if (s.includes('TARGET') || s.includes('REVOKED') || s.includes('DENIED')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (s.includes('POI') || s.includes('SUSPENDED')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (s.includes('WITNESS') || s.includes('BURIED')) return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        return 'text-green-500 bg-green-500/10 border-green-500/20';
    };

    return (
        <div className="space-y-8">
            {/* Search Input Area */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Brain className="w-32 h-32" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <Sparkles className="text-neon-blue w-6 h-6" />
                        AI_INVESTIGATOR_SEARCH
                    </h2>
                    <p className="text-zinc-500 text-sm mb-4 font-mono">
                        Query the unified intelligence engine. Search by name, pattern, or address.
                    </p>

                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="e.g. 'show phoenix rebrands', 'find Dawn Davis', 'suspicious st paul addresses'..."
                            className="w-full bg-black border-2 border-zinc-800 rounded-xl px-6 py-4 text-white placeholder:text-zinc-700 focus:border-neon-blue outline-none transition-all shadow-2xl"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-neon-blue text-black rounded-lg hover:scale-105 transition-transform disabled:opacity-50"
                            disabled={isThinking}
                        >
                            {isThinking ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full" /> : <Search className="w-5 h-5" />}
                        </button>
                    </form>

                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {['Phoenix Protocol', 'Dawn Davis', 'Mass Licensing Gap', 'Empty DHS Department'].map(suggestion => (
                            <button
                                key={suggestion}
                                onClick={() => {
                                    setSearchQuery(suggestion);
                                }}
                                className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 hover:text-neon-blue transition-colors px-2 py-1 bg-zinc-800/50 rounded border border-zinc-700/50"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-20 text-center space-y-4"
                    >
                        <div className="flex justify-center gap-2">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-3 h-3 bg-neon-blue rounded-full"
                                />
                            ))}
                        </div>
                        <p className="text-xs font-mono text-zinc-500 animate-pulse">SYNTHESIZING_INTELLIGENCE_LAYER...</p>
                    </motion.div>
                )}

                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-3">
                                <Database className="w-5 h-5 text-zinc-500" />
                                {results.headline}
                            </h3>
                            <button className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1 border border-zinc-800 px-2 py-1 rounded">
                                <Download className="w-3 h-3" /> EXPORT_RESULTS
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.entities.map((entity, i) => {
                                const isMasterlist = entity._isMasterlist;
                                const isDossier = entity._isDossier;
                                const risk = isMasterlist ? calculateRiskScore(entity as MasterlistEntity) : (entity.risk_score || 0);

                                return (
                                    <motion.div
                                        key={entity.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => onEntitySelect(entity.id, isMasterlist)}
                                        className={`group p-4 bg-zinc-900 border rounded-xl hover:border-zinc-500 transition-all cursor-pointer relative overflow-hidden ${isDossier ? 'border-purple-900/50' : 'border-zinc-800'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-mono text-zinc-500 mb-1 flex items-center gap-1 uppercase">
                                                    {isDossier ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                                                    {isDossier ? 'Personnel' : 'Entity'}
                                                </span>
                                                <h4 className="font-bold text-white group-hover:text-neon-blue transition-colors truncate max-w-[200px]" title={entity.name}>
                                                    {entity.name}
                                                </h4>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(entity.status || '')}`}>
                                                {entity.status}
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                <MapPin className="w-3 h-3" />
                                                {entity.city || 'UNKNOWN'}, MN
                                            </div>
                                            {isDossier && entity.role && (
                                                <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
                                                    <Info className="w-3 h-3" />
                                                    {entity.role}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] text-zinc-600 uppercase">Risk Level</span>
                                                    <span className={`text-xs font-bold ${risk > 50 ? 'text-red-500' : 'text-zinc-400'}`}>
                                                        {risk > 75 ? 'CRITICAL' : risk > 40 ? 'HIGH' : 'STANDARD'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
                                        </div>

                                        {isDossier && (
                                            <div className="absolute top-0 right-0 p-1">
                                                <TrendingUp className="w-6 h-6 text-purple-500/10" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
