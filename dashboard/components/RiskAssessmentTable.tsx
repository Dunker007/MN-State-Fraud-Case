"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Scale, Search, Filter, Share2, ChevronDown, X, Printer, CheckSquare, Square, Download, Trash2 } from 'lucide-react';
import Image from 'next/image';
import ForensicDossier from './ForensicDossier';

import { type Entity } from '@/lib/schemas';

interface RiskAssessmentTableProps {
    data: Entity[];
}

export default function RiskAssessmentTable({ data }: RiskAssessmentTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [locationFilter, setLocationFilter] = useState("ALL");

    // Pagination
    const [visibleCount, setVisibleCount] = useState(50);

    // Multi-Select
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Keyboard Navigation
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [showBulkMenu, setShowBulkMenu] = useState(false);

    // Derived Lists for Dropdowns
    const uniqueLocations = useMemo(() => {
        return Array.from(new Set(data.map(e => e.city).filter(Boolean))).sort();
    }, [data]);

    // Sorting
    const [sortField, setSortField] = useState<'risk_score' | 'name' | 'status' | 'amount_billed' | 'age'>('risk_score');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'name' || field === 'status' ? 'asc' : 'desc');
        }
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            // Search Text
            const term = searchTerm.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(term) ||
                item.id.toLowerCase().includes(term) ||
                (item.owner && item.owner.toLowerCase().includes(term)) ||
                item.address.toLowerCase().includes(term);

            // Status Filter
            const matchesStatus = statusFilter === "ALL" || item.status.includes(statusFilter);

            // Risk Filter
            let matchesRisk = true;
            if (riskFilter === "HIGH") matchesRisk = item.risk_score >= 100;
            if (riskFilter === "MEDIUM") matchesRisk = item.risk_score >= 50 && item.risk_score < 100;
            if (riskFilter === "LOW") matchesRisk = item.risk_score < 50;

            // Location Filter
            const matchesLocation = locationFilter === "ALL" || item.city === locationFilter;

            return matchesSearch && matchesStatus && matchesRisk && matchesLocation;
        }).sort((a, b) => {
            const direction = sortDirection === 'asc' ? 1 : -1;

            switch (sortField) {
                case 'risk_score':
                    return direction * (b.risk_score - a.risk_score);
                case 'amount_billed':
                    return direction * (b.amount_billed - a.amount_billed);
                case 'name':
                    return direction * a.name.localeCompare(b.name);
                case 'status':
                    return direction * a.status.localeCompare(b.status);
                case 'age':
                    const aDate = a.initial_effective_date ? new Date(a.initial_effective_date).getTime() : 0;
                    const bDate = b.initial_effective_date ? new Date(b.initial_effective_date).getTime() : 0;
                    return direction * (aDate - bDate);
                default:
                    return 0;
            }
        });
    }, [data, searchTerm, statusFilter, riskFilter, locationFilter, sortField, sortDirection]);

    // Reset pagination when filters change (using input dependencies to avoid loops)
    useEffect(() => {
        setVisibleCount(50);
    }, [searchTerm, statusFilter, riskFilter, locationFilter, sortField, sortDirection]);

    const visibleData = filteredData.slice(0, visibleCount);
    const totalExposure = filteredData.reduce((acc, curr) => acc + curr.amount_billed, 0);

    // Selection Logic
    const toggleSelection = useCallback((id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening modal
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    }, [selectedIds]);

    const handleSelectAll = useCallback(() => {
        if (selectedIds.size === filteredData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredData.map(e => e.id)));
        }
    }, [selectedIds, filteredData]);

    const exportBriefing = () => {
        const url = `/briefing?ids=${Array.from(selectedIds).join(',')}`;
        window.open(url, '_blank');
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (visibleData.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(prev + 1, visibleData.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(prev - 1, -1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex >= 0 && focusedIndex < visibleData.length) {
                        setSelectedEntity(visibleData[focusedIndex]);
                    }
                    break;
                case 'Escape':
                    setFocusedIndex(-1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [visibleData, focusedIndex]);

    // Active filters
    const activeFilters = useMemo(() => {
        const filters = [];
        if (statusFilter !== "ALL") filters.push({ type: 'status', value: statusFilter });
        if (riskFilter !== "ALL") filters.push({ type: 'risk', value: riskFilter });
        if (locationFilter !== "ALL") filters.push({ type: 'location', value: locationFilter });
        return filters;
    }, [statusFilter, riskFilter, locationFilter]);

    // Risk Distribution Stats
    const riskStats = useMemo(() => {
        const high = filteredData.filter(e => e.risk_score >= 100).length;
        const medium = filteredData.filter(e => e.risk_score >= 50 && e.risk_score < 100).length;
        const low = filteredData.filter(e => e.risk_score < 50).length;
        const revoked = filteredData.filter(e => e.status.includes("REVOKED") || e.status.includes("DENIED")).length;
        const indicted = filteredData.filter(e => e.federal_status === "INDICTED").length;
        const topThreats = filteredData.slice(0, 5);

        return { high, medium, low, revoked, indicted, topThreats };
    }, [filteredData]);

    return (
        <section className="py-6 relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/10 via-transparent to-transparent pointer-events-none z-0" />
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none z-0">
                <Image src="/mn_seal_glitch.png" alt="CORRUPTED_STATE_RECORD" width={256} height={256} className="w-full h-full object-contain grayscale contrast-150" />
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-neon-red" />
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                            RISK_ASSESSMENT_MATRIX
                        </h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            {filteredData.length} entities analyzed • {riskStats.high} critical threats identified
                        </p>
                    </div>
                </div>

                <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row items-center gap-4 justify-end">
                    {/* Bulk Actions */}
                    {selectedIds.size > 0 && (
                        <div className="relative">
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setShowBulkMenu(!showBulkMenu)}
                                className="bg-neon-red text-black font-bold text-xs px-3 py-2 rounded flex items-center gap-2 hover:bg-white transition-colors shadow-lg shadow-red-500/20"
                            >
                                <CheckSquare className="w-4 h-4" />
                                {selectedIds.size} SELECTED
                                <ChevronDown className={`w-3 h-3 transition-transform ${showBulkMenu ? 'rotate-180' : ''}`} />
                            </motion.button>

                            <AnimatePresence>
                                {showBulkMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full mt-2 right-0 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-20 min-w-[200px]"
                                    >
                                        <button
                                            onClick={exportBriefing}
                                            className="w-full px-4 py-2 text-left text-xs font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <Printer className="w-3 h-3" />
                                            Export Briefing
                                        </button>
                                        <button
                                            onClick={() => {
                                                const csv = visibleData.filter(e => selectedIds.has(e.id)).map(e =>
                                                    `${e.id},${e.name},${e.risk_score},${e.status},${e.amount_billed}`
                                                ).join('\n');
                                                const blob = new Blob([`ID,Name,Risk,Status,Exposure\n${csv}`], { type: 'text/csv' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `risk_assessment_${new Date().toISOString().split('T')[0]}.csv`;
                                                a.click();
                                                setShowBulkMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-3 h-3" />
                                            Export CSV
                                        </button>
                                        <div className="h-px bg-zinc-800" />
                                        <button
                                            onClick={() => {
                                                setSelectedIds(new Set());
                                                setShowBulkMenu(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs font-mono text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Clear Selection
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Original Export (hidden now) */}
                    {false && selectedIds.size > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={exportBriefing}
                            className="bg-neon-red text-black font-bold text-xs px-3 py-2 rounded flex items-center gap-2 hover:bg-white transition-colors shadow-lg shadow-red-500/20"
                        >
                            <Printer className="w-4 h-4" />
                            EXPORT BRIEFING ({selectedIds.size})
                        </motion.button>
                    )}

                    {/* Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 py-1.5 px-2 rounded focus:border-neon-blue focus:outline-none hover:border-zinc-600 transition-colors"
                        >
                            <option value="ALL">STATUS: ALL</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="REVOKED">REVOKED</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="DENIED">DENIED</option>
                        </select>
                        <select
                            value={riskFilter}
                            onChange={(e) => setRiskFilter(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 py-1.5 px-2 rounded focus:border-neon-blue focus:outline-none hover:border-zinc-600 transition-colors"
                        >
                            <option value="ALL">RISK: ALL</option>
                            <option value="HIGH">HIGH (100+)</option>
                            <option value="MEDIUM">MEDIUM (50-99)</option>
                            <option value="LOW">LOW (&lt;50)</option>
                        </select>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 py-1.5 px-2 rounded focus:border-neon-blue focus:outline-none max-w-[120px] hover:border-zinc-600 transition-colors"
                        >
                            <option value="ALL">CITY: ALL</option>
                            {uniqueLocations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        {(statusFilter !== "ALL" || riskFilter !== "ALL" || locationFilter !== "ALL") && (
                            <button
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setRiskFilter("ALL");
                                    setLocationFilter("ALL");
                                }}
                                className="p-1.5 text-zinc-500 hover:text-white bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative group w-full md:w-64">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-neon-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH (NAME, ADDR, OWNER)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black border border-zinc-800 text-xs font-mono text-white py-2 pl-9 pr-4 w-full focus:outline-none focus:border-neon-blue transition-colors placeholder:text-zinc-700 rounded"
                        />
                    </div>
                </div>
            </div>

            {/* Active Filter Pills */}
            {activeFilters.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 mb-4 relative z-10"
                >
                    <Filter className="w-3 h-3 text-zinc-500" />
                    <span className="text-xs text-zinc-500 font-mono">Active Filters:</span>
                    {activeFilters.map((filter, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1 bg-neon-blue/10 border border-neon-blue/30 rounded px-2 py-1"
                        >
                            <span className="text-xs font-mono text-neon-blue font-bold">
                                {filter.type.toUpperCase()}: {filter.value}
                            </span>
                            <button
                                onClick={() => {
                                    if (filter.type === 'status') setStatusFilter('ALL');
                                    if (filter.type === 'risk') setRiskFilter('ALL');
                                    if (filter.type === 'location') setLocationFilter('ALL');
                                }}
                                className="text-neon-blue hover:text-white transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}
                    <button
                        onClick={() => {
                            setStatusFilter('ALL');
                            setRiskFilter('ALL');
                            setLocationFilter('ALL');
                        }}
                        className="text-xs text-zinc-500 hover:text-white font-mono transition-colors ml-2"
                    >
                        Clear All
                    </button>
                </motion.div>
            )}

            {/* Intelligence Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
                {/* Risk Distribution Meter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-gradient-to-br from-zinc-900/90 to-black border border-zinc-800 rounded-lg p-4 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-neon-red" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Risk Distribution</h3>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-zinc-500">CRITICAL (100+)</span>
                            <span className="text-xl font-bold text-neon-red font-mono">{riskStats.high}</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-600 to-neon-red rounded-full"
                                style={{ width: `${(riskStats.high / filteredData.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs font-mono text-zinc-500">ELEVATED (50-99)</span>
                            <span className="text-lg font-bold text-amber-500 font-mono">{riskStats.medium}</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                                style={{ width: `${(riskStats.medium / filteredData.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Status Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-neon-red rounded-full animate-pulse" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Enforcement</h3>
                    </div>
                    <div className="text-3xl font-bold text-neon-red font-mono mb-1">{riskStats.revoked}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">REVOKED/DENIED</div>
                    {riskStats.indicted > 0 && (
                        <div className="mt-3 pt-3 border-t border-red-900/30">
                            <div className="text-xl font-bold text-red-400 font-mono">{riskStats.indicted}</div>
                            <div className="text-[10px] text-red-400 font-mono uppercase">Fed Indictments</div>
                        </div>
                    )}
                </motion.div>

                {/* Financial Exposure */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Exposure</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-500 font-mono mb-1">
                        {totalExposure >= 1000000000
                            ? `$${(totalExposure / 1000000000).toFixed(1)}B`
                            : `$${(totalExposure / 1000000).toFixed(1)}M`
                        }
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">DETECTED BILLING</div>
                    <div className="mt-3 pt-3 border-t border-emerald-900/30">
                        <div className="text-sm font-bold text-emerald-400 font-mono">{filteredData.length}</div>
                        <div className="text-[10px] text-emerald-500/80 font-mono">Active Records</div>
                    </div>
                </motion.div>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 relative z-10">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar relative">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-zinc-800 bg-black text-xs font-mono text-zinc-400 uppercase tracking-widest shadow-lg shadow-black/50">
                                <th className="p-4 w-10 bg-black">
                                    <button onClick={handleSelectAll} className="hover:text-white transition-colors">
                                        {selectedIds.size > 0 && selectedIds.size === filteredData.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                </th>
                                <th className="p-4 w-32 bg-black">ID_REF</th>
                                <th className="p-4 bg-black">Red Flags</th>
                                <th
                                    className="p-4 bg-black cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('risk_score')}
                                >
                                    <div className="flex items-center gap-1">
                                        Score
                                        {sortField === 'risk_score' && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 bg-black cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-1">
                                        Entity / Location
                                        {sortField === 'name' && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 bg-black">Network / Owner</th>
                                <th className="p-4 bg-black">Federal Status</th>
                                <th
                                    className="p-4 bg-black cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        State Status
                                        {sortField === 'status' && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 bg-black text-center cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('age')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Active Age
                                        {sortField === 'age' && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 text-right bg-black cursor-pointer hover:text-white transition-colors select-none"
                                    onClick={() => handleSort('amount_billed')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Exposure
                                        {sortField === 'amount_billed' && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-sm">
                            {visibleData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-zinc-500 font-mono">
                                        NO_MATCHES_FOUND
                                    </td>
                                </tr>
                            ) : (
                                visibleData.map((row, index) => {
                                    const isPurged = row.status === "PURGED" || row.status === "REVOKED" || row.status.includes("DENIED");
                                    const isIndicted = row.federal_status === "INDICTED";
                                    const isSelected = selectedIds.has(row.id);

                                    const isFocused = focusedIndex === index;

                                    return (
                                        <tr
                                            key={row.id}
                                            onClick={() => setSelectedEntity(row)}
                                            onMouseEnter={() => setFocusedIndex(index)}
                                            className={`
                                                border-b border-zinc-800/50 hover:bg-zinc-900/80 transition-all cursor-pointer group
                                                ${isSelected ? 'bg-blue-900/20' : ''}
                                                ${isFocused ? 'bg-neon-blue/10 ring-1 ring-neon-blue/50' : ''}
                                                ${isPurged ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}
                                                ${isIndicted ? 'bg-red-950/10' : ''}
                                            `}
                                        >
                                            <td className="p-4 bg-transparent">
                                                <button onClick={(e) => toggleSelection(row.id, e)} className="text-zinc-500 hover:text-white transition-colors">
                                                    {isSelected ? <CheckSquare className="w-4 h-4 text-neon-blue" /> : <Square className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td className="p-4 text-zinc-500 font-mono text-xs group-hover:text-neon-blue transition-colors border-r border-zinc-800/20">
                                                {row.id}
                                            </td>
                                            <td className="p-4">
                                                {row.risk_score > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className={`w-4 h-4 ${row.risk_score > 100 ? 'text-neon-red animate-pulse' : 'text-amber-500'}`} />
                                                        <span className="text-[10px] text-zinc-600 hidden group-hover:inline">
                                                            {row.red_flag_reason?.[0]}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 text-green-900" />
                                                )}
                                            </td>
                                            <td className="p-4 font-bold">
                                                <span className={`${row.risk_score > 100 ? 'text-neon-red' : row.risk_score > 50 ? 'text-amber-500' : 'text-zinc-600'}`}>
                                                    {row.risk_score}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-white group-hover:text-neon-blue transition-colors relative">
                                                <div>{row.name}</div>
                                                <div className="text-[10px] text-zinc-600 font-normal mt-0.5">{row.address}, {row.city}</div>
                                                {isIndicted && (
                                                    <span className="absolute top-2 right-2 flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-zinc-400 text-xs border-l border-zinc-800/20">
                                                <div className="flex flex-col">
                                                    <span className="truncate max-w-[120px] title={row.owner}">{row.owner}</span>
                                                    {row.linked_count > 1 && (
                                                        <span className="text-[10px] text-zinc-600 flex items-center gap-1 mt-1">
                                                            <Share2 className="w-3 h-3" />
                                                            {row.linked_count} LINKS
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {row.federal_status === "INDICTED" ? (
                                                    <span className="bg-red-950 text-red-500 text-[10px] font-bold px-2 py-1 border border-red-900 animate-pulse">
                                                        INDICTED
                                                    </span>
                                                ) : (
                                                    <span className="text-zinc-700 text-[10px]">—</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${isPurged
                                                    ? 'text-red-400 bg-red-950/20 border border-red-900/30'
                                                    : 'text-green-600 bg-green-950/10 border border-green-900/30'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {row.initial_effective_date ? (
                                                    (() => {
                                                        const start = new Date(row.initial_effective_date);
                                                        const checkDate = new Date("2025-12-30");
                                                        const days = Math.floor((checkDate.getTime() - start.getTime()) / (1000 * 3600 * 24));
                                                        const isNew = days < 45;

                                                        return (
                                                            <div className="flex flex-col items-center">
                                                                <span className={`font-mono font-bold text-xs ${isNew ? 'text-neon-red animate-pulse' : 'text-zinc-500'}`}>
                                                                    {days}d
                                                                </span>
                                                                {isNew && <span className="text-[9px] text-red-400 font-bold uppercase">VELOCITY</span>}
                                                            </div>
                                                        );
                                                    })()
                                                ) : <span className="text-zinc-700 text-[10px]">N/A</span>}
                                            </td>
                                            <td className="p-4 text-right font-mono text-zinc-500 text-xs text-white">
                                                ${row.amount_billed.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {visibleCount < filteredData.length && (
                    <div className="text-center p-4 border-t border-zinc-800 bg-black/50">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-xs font-mono text-zinc-500">
                                SHOWING {visibleCount} / {filteredData.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setVisibleCount(prev => Math.min(prev + 10, filteredData.length))}
                                    className="text-xs font-mono text-zinc-400 hover:text-neon-blue transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-neon-blue/50"
                                >
                                    +10
                                </button>
                                <button
                                    onClick={() => setVisibleCount(prev => Math.min(prev + 50, filteredData.length))}
                                    className="text-xs font-mono text-neon-blue hover:text-white transition-colors px-3 py-1 border border-neon-blue/30 rounded hover:border-neon-blue font-bold"
                                >
                                    +50
                                </button>
                                <button
                                    onClick={() => setVisibleCount(prev => Math.min(prev + 100, filteredData.length))}
                                    className="text-xs font-mono text-zinc-400 hover:text-neon-blue transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-neon-blue/50"
                                >
                                    +100
                                </button>
                                <div className="w-px h-4 bg-zinc-800" />
                                <button
                                    onClick={() => setVisibleCount(filteredData.length)}
                                    className="text-xs font-mono text-amber-500 hover:text-amber-400 transition-colors px-3 py-1 border border-amber-900/50 rounded hover:border-amber-500/50 uppercase tracking-wide"
                                >
                                    Load All ({filteredData.length - visibleCount})
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedEntity && (
                    <ForensicDossier
                        entity={selectedEntity}
                        onClose={() => setSelectedEntity(null)}
                        allEntities={data}
                    />
                )}
            </AnimatePresence>

            <div className="mt-4 flex flex-col md:flex-row justify-between text-xs font-mono text-zinc-600 uppercase border-t border-zinc-900 pt-4 gap-4">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-950/50 border border-red-500"></div> SPOLIATION_RECORD
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-neon-blue/20 border border-neon-blue"></div> NETWORK_DETECTED
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Showing {visibleData.length} / {filteredData.length} matches</span>
                    <span className="text-neon-red font-bold">DETECTED_EXPOSURE: ${totalExposure.toLocaleString()}</span>
                </div>
            </div>
        </section>
    );
}
