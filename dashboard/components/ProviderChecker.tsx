"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Shield,
    AlertTriangle,
    CheckCircle,
    ChevronRight,
    Share2,
    ExternalLink,
    Users,
    Skull,
    Database,
    MapPin,
    Phone,
    Building
} from 'lucide-react';
import { searchMasterlist, calculateRiskScore, masterlistData, getMasterlistStats } from '@/lib/data';
import { type MasterlistEntity } from '@/lib/schemas';
import ClaimProofButton from './ClaimProofButton';

function detectRedFlags(entity: MasterlistEntity, allEntities: MasterlistEntity[]) {
    const flags: { type: string; message: string; severity: 'CRITICAL' | 'HIGH' | 'MODERATE' }[] = [];

    // 1. GHOST OFFICE DETECTION
    const isGhostOffice = !entity.street || entity.street.trim() === '' ||
        (entity.city && !entity.street.includes(' '));
    if (isGhostOffice) {
        flags.push({
            type: 'GHOST_OFFICE',
            message: 'No physical street address on file. May be a virtual/ghost office.',
            severity: 'CRITICAL'
        });
    }

    // 2. SHELL COMPANY DETECTION
    const isShellCompany = !entity.owner || entity.owner.trim() === '' ||
        entity.owner === 'UNKNOWN' || entity.owner === entity.name.toUpperCase();
    if (isShellCompany) {
        flags.push({
            type: 'SHELL_COMPANY',
            message: 'Owner information hidden or anonymous. Possible shell company structure.',
            severity: 'HIGH'
        });
    }

    // 3. PHOENIX PATTERN DETECTION
    const nameStem = entity.name.split(' ')[0].toUpperCase();
    const hasRevokedSibling = allEntities.some(e =>
        e.license_id !== entity.license_id &&
        e.name.toUpperCase().startsWith(nameStem) &&
        (e.status.toUpperCase().includes('REVOKED') || e.status.toUpperCase().includes('DENIED'))
    );
    if (hasRevokedSibling && entity.status.toUpperCase().includes('ACTIVE')) {
        flags.push({
            type: 'PHOENIX_PATTERN',
            message: `Similar entity with name starting with ${nameStem} was previously revoked. Possible rebrand.`,
            severity: 'CRITICAL'
        });
    }

    // 4. ADDRESS CLUSTER DETECTION
    if (entity.street && entity.city) {
        const sameAddress = allEntities.filter(e =>
            e.street === entity.street &&
            e.city === entity.city &&
            e.license_id !== entity.license_id
        );
        if (sameAddress.length >= 4) {
            flags.push({
                type: 'ADDRESS_CLUSTER',
                message: `${sameAddress.length + 1} entities registered at this address. High-risk concentration.`,
                severity: 'HIGH'
            });
        }
    }

    return flags;
}

export default function ProviderChecker() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<MasterlistEntity | null>(null);
    const [showResults, setShowResults] = useState(false);

    // Search results from full masterlist (19k+ entities)
    const searchResults = useMemo(() => {
        return searchMasterlist(searchTerm, 15);
    }, [searchTerm]);

    // Find similar entities (same address or owner)
    const similarEntities = useMemo(() => {
        if (!selectedEntity) return [];
        return masterlistData.entities
            .filter(e =>
                e.license_id !== selectedEntity.license_id && (
                    (e.street && e.street === selectedEntity.street && e.city === selectedEntity.city) ||
                    (e.owner && e.owner !== '' && e.owner === selectedEntity.owner)
                )
            )
            .slice(0, 5);
    }, [selectedEntity]);

    const handleSelect = (entity: MasterlistEntity) => {
        setSelectedEntity(entity);
        setShowResults(false);
        setSearchTerm('');
    };

    const getRiskLevel = (score: number) => {
        if (score >= 100) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-950/50', border: 'border-red-600' };
        if (score >= 50) return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-950/50', border: 'border-orange-600' };
        if (score >= 25) return { label: 'ELEVATED', color: 'text-yellow-500', bg: 'bg-yellow-950/50', border: 'border-yellow-600' };
        return { label: 'LOW', color: 'text-green-500', bg: 'bg-green-950/50', border: 'border-green-600' };
    };

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('REVOKED') || s.includes('DENIED')) return 'text-red-500';
        if (s.includes('SUSPENDED')) return 'text-red-400';
        if (s.includes('CONDITIONAL')) return 'text-amber-500';
        if (s.includes('CLOSED')) return 'text-zinc-400';
        if (s.includes('ACTIVE')) return 'text-green-500';
        return 'text-zinc-300';
    };

    const generateShareText = () => {
        if (!selectedEntity) return '';
        const riskScore = calculateRiskScore(selectedEntity);
        const risk = getRiskLevel(riskScore);
        return `🔍 I checked my provider on Project Glass House:

${selectedEntity.name}
License: ${selectedEntity.license_id}
Status: ${selectedEntity.status}
Risk Level: ${risk.label}

Check yours: glasshouse.mn.gov/check-my-provider`;
    };

    const handleShare = async () => {
        const text = generateShareText();
        if (navigator.share) {
            await navigator.share({ text });
        } else {
            await navigator.clipboard.writeText(text);
            alert('Copied to clipboard!');
        }
    };

    const stats = getMasterlistStats();

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-950/50 border border-red-600 rounded-full mb-4">
                    <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    Is Your Provider Safe?
                </h1>
                <p className="text-zinc-400 max-w-md mx-auto">
                    Search any Minnesota childcare or healthcare provider to check their license status.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-600">
                    <Database className="w-3 h-3" />
                    <span>{stats.total.toLocaleString()} providers in database</span>
                </div>
            </div>

            {/* Search Box */}
            <div className="relative mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Enter provider name, license number, or address..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-red-500 rounded-lg pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 outline-none transition-colors text-lg"
                    />
                </div>

                {/* Autocomplete */}
                <AnimatePresence>
                    {showResults && searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden max-h-[400px] overflow-y-auto"
                        >
                            {searchResults.map((entity) => {
                                const riskScore = calculateRiskScore(entity);
                                const risk = getRiskLevel(riskScore);
                                return (
                                    <button
                                        key={entity.license_id}
                                        onClick={() => handleSelect(entity)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 transition-colors text-left border-b border-zinc-800 last:border-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-medium truncate">{entity.name}</div>
                                            <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                                                <span>#{entity.license_id}</span>
                                                <span className={getStatusColor(entity.status)}>{entity.status}</span>
                                            </div>
                                            <div className="text-xs text-zinc-600 truncate">{entity.city}, MN</div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${risk.bg} ${risk.color}`}>
                                            {risk.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No results */}
                {showResults && searchTerm.length >= 2 && searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center text-zinc-500">
                        No providers found matching {searchTerm}
                    </div>
                )}
            </div>

            {/* Suggested Searches */}
            {!selectedEntity && (
                <div className="text-center mb-8">
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">Try Searching:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {['Quality Learning', 'Prestige Care', 'Star Autism', 'Sunshine', 'First Step'].map(name => (
                            <button
                                key={name}
                                onClick={() => {
                                    setSearchTerm(name);
                                    setShowResults(true);
                                }}
                                className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results Card */}
            <AnimatePresence mode="wait">
                {selectedEntity && (() => {
                    const riskScore = calculateRiskScore(selectedEntity);
                    const risk = getRiskLevel(riskScore);

                    return (
                        <motion.div
                            key={selectedEntity.license_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
                        >
                            {/* Risk Banner */}
                            <div className={`${risk.bg} border-b ${risk.border} p-4 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    {riskScore >= 50 ? (
                                        <Skull className={`w-8 h-8 ${risk.color}`} />
                                    ) : (
                                        <CheckCircle className={`w-8 h-8 ${risk.color}`} />
                                    )}
                                    <div>
                                        <div className={`text-2xl font-black ${risk.color}`}>
                                            {risk.label} RISK
                                        </div>
                                        <div className="text-xs text-zinc-400">
                                            Calculated Score: {riskScore}
                                        </div>
                                    </div>
                                </div>
                                <ClaimProofButton
                                    claim={{
                                        id: `provider-check-${selectedEntity.license_id}`,
                                        type: 'entity_risk',
                                        statement: `${selectedEntity.name} has status ${selectedEntity.status}`,
                                        entity_id: selectedEntity.license_id,
                                        evidence: {
                                            primary_source: 'MN DHS License Lookup Database',
                                            verification_url: 'https://licensinglookup.dhs.state.mn.us/'
                                        },
                                        verification_steps: [
                                            'Visit MN DHS License Lookup',
                                            `Search for license: ${selectedEntity.license_id}`,
                                            'Compare status and review any sanctions'
                                        ]
                                    }}
                                />
                            </div>

                            {/* RED FLAGS SECTION */}
                            {selectedEntity && (() => {
                                const redFlags = detectRedFlags(selectedEntity, masterlistData.entities);
                                if (redFlags.length === 0) return null;

                                return (
                                    <div className="px-6 pt-6 space-y-2">
                                        <h3 className="text-sm font-bold text-red-500 uppercase flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Automated Red Flags Detected
                                        </h3>
                                        {redFlags.map((flag, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`border-l-4 p-3 rounded ${flag.severity === 'CRITICAL'
                                                    ? 'bg-red-950/50 border-red-500'
                                                    : 'bg-orange-950/50 border-orange-500'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {flag.type === 'GHOST_OFFICE' && <Building className="w-5 h-5 text-red-400" />}
                                                        {flag.type === 'SHELL_COMPANY' && <Skull className="w-5 h-5 text-red-400" />}
                                                        {flag.type === 'PHOENIX_PATTERN' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                                                        {flag.type === 'ADDRESS_CLUSTER' && <Users className="w-5 h-5 text-orange-400" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-bold text-red-300 uppercase mb-1">
                                                            {flag.type.replace(/_/g, ' ')}
                                                        </div>
                                                        <p className="text-sm text-zinc-300">{flag.message}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        <p className="text-xs text-zinc-500 mt-2">
                                            ⚠️ These are automated detections based on public records. Always verify with official sources.
                                        </p>
                                    </div>
                                );
                            })()}

                            {/* Entity Details */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{selectedEntity.name}</h2>
                                    <p className="text-zinc-500 font-mono text-sm">License #{selectedEntity.license_id}</p>
                                    {selectedEntity.owner && (
                                        <p className="text-zinc-500 text-sm mt-1">Owner: {selectedEntity.owner}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="bg-black/50 p-4 rounded border border-zinc-800">
                                    <div className="text-xs text-zinc-500 uppercase mb-1">License Status</div>
                                    <div className={`text-lg font-bold ${getStatusColor(selectedEntity.status)}`}>
                                        {selectedEntity.status}
                                    </div>
                                    {selectedEntity.status_date && (
                                        <div className="text-xs text-zinc-600 mt-1">
                                            Status date: {selectedEntity.status_date}
                                        </div>
                                    )}
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="text-zinc-400">{selectedEntity.street}</div>
                                            <div className="text-zinc-500">{selectedEntity.city}, MN {selectedEntity.zip}</div>
                                        </div>
                                    </div>
                                    {selectedEntity.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                            <span className="text-zinc-400">{selectedEntity.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                        <span className="text-zinc-400">{selectedEntity.county} County</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-zinc-400">{selectedEntity.service_type}</span>
                                    </div>
                                </div>

                                {/* Similar Entities */}
                                {similarEntities.length > 0 && (
                                    <div>
                                        <h3 className="text-xs text-zinc-500 uppercase mb-2 flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Related Entities ({similarEntities.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {similarEntities.map(entity => (
                                                <button
                                                    key={entity.license_id}
                                                    onClick={() => handleSelect(entity)}
                                                    className="w-full flex items-center justify-between p-2 bg-zinc-800/50 rounded hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="text-left">
                                                        <div className="text-white text-sm">{entity.name}</div>
                                                        <div className="text-xs text-zinc-500">
                                                            {entity.street === selectedEntity.street ? 'Same Address' : 'Same Owner'}
                                                            <span className={`ml-2 ${getStatusColor(entity.status)}`}>{entity.status}</span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                                    <button
                                        onClick={handleShare}
                                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded font-bold transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share Results
                                    </button>
                                    <a
                                        href="https://licensinglookup.dhs.state.mn.us/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white py-3 rounded font-bold transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Verify on DHS
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Disclaimer */}
            <p className="text-center text-xs text-zinc-600 mt-8 max-w-md mx-auto">
                Data sourced from MN DHS License Lookup (Dec 30, 2025). Risk scores are calculated based on license status and service type patterns. Always verify with official sources.
            </p>
        </div>
    );
}
