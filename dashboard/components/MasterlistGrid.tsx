"use client";

import { useState, useMemo, useEffect } from 'react';
import {
    Search,

    ArrowUpDown,
    Shield,
    MapPin,
    User,
    Ghost,

    CheckCircle,
    XCircle,
    LayoutGrid,
    Map,
    X
} from 'lucide-react';
import { masterlistData, calculateRiskScore, getMasterlistStats } from '@/lib/data';
import { type Entity } from '@/lib/schemas';
import MasterlistRow from './MasterlistRow';


interface MasterlistGridProps {
    onEntitySelect?: (entity: Entity) => void;
    cityFilter?: string | null;
}

export default function MasterlistGrid({ onEntitySelect, cityFilter }: MasterlistGridProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [ghostFilter, setGhostFilter] = useState(false);
    const [ownerFilter, setOwnerFilter] = useState(false);

    // Enhanced field-specific filters
    const [specificOwner, setSpecificOwner] = useState<string | null>(null);
    const [specificAddress, setSpecificAddress] = useState<string | null>(null);
    const [specificCity, setSpecificCity] = useState<string | null>(null);
    const [specificLicenseType, setSpecificLicenseType] = useState<string | null>(null);

    // Sorting
    const [sortField, setSortField] = useState<'name' | 'status' | 'city' | 'age'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Keyboard Navigation  
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const pageSize = 50;

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection(field === 'name' || field === 'city' ? 'asc' : 'desc');
        }
    };

    // Apply external city filter from map
    useEffect(() => {
        if (cityFilter) {
            setSpecificCity(cityFilter);
            setPage(1);
        }
    }, [cityFilter]);

    const stats = getMasterlistStats();

    // Filtering Logic
    const filteredData = useMemo(() => {
        let data = masterlistData.entities;

        // Text Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            // Normalized term for ID search (remove 'mn-', 'mn', spaces)
            const normalizedIdTerm = lowerTerm.replace(/mn[-\s]?/g, '').trim();

            data = data.filter(e =>
                e.name.toLowerCase().includes(lowerTerm) ||
                e.license_id.toLowerCase().includes(normalizedIdTerm) ||
                (e.owner && e.owner.toLowerCase().includes(lowerTerm)) ||
                (e.city && e.city.toLowerCase().includes(lowerTerm))
            );
        }

        // Status Filter
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'ACTIVE') data = data.filter(e => e.status.toUpperCase().includes('ACTIVE'));
            else if (statusFilter === 'REVOKED') data = data.filter(e => e.status.toUpperCase().includes('REVOKED') || e.status.toUpperCase().includes('DENIED'));
            else if (statusFilter === 'SUSPENDED') data = data.filter(e => e.status.toUpperCase().includes('SUSPENDED'));
            else if (statusFilter === 'CONDITIONAL') data = data.filter(e => e.status.toUpperCase().includes('CONDITIONAL'));
        }

        // Feature Filters
        if (ghostFilter) data = data.filter(e => e.is_ghost_office);
        if (ownerFilter) data = data.filter(e => !e.owner || e.owner.length === 0); // NO OWNER is the red flag

        // Specific Field Filters
        if (specificOwner) data = data.filter(e => e.owner?.toUpperCase() === specificOwner.toUpperCase());
        if (specificAddress) data = data.filter(e => {
            const addr = `${e.street} ${e.city} ${e.zip}`.toUpperCase();
            return addr.includes(specificAddress.toUpperCase());
        });
        if (specificCity) data = data.filter(e => e.city?.toUpperCase() === specificCity.toUpperCase());
        if (specificLicenseType) data = data.filter(e => e.service_type?.toUpperCase() === specificLicenseType.toUpperCase());

        // Sorting
        return data.sort((a, b) => {
            const direction = sortDirection === 'asc' ? 1 : -1;

            switch (sortField) {
                case 'name':
                    return direction * a.name.localeCompare(b.name);
                case 'status':
                    return direction * a.status.localeCompare(b.status);
                case 'city':
                    return direction * (a.city || '').localeCompare(b.city || '');
                case 'age':
                    const aDate = a.initial_effective_date ? new Date(a.initial_effective_date).getTime() : 0;
                    const bDate = b.initial_effective_date ? new Date(b.initial_effective_date).getTime() : 0;
                    return direction * (aDate - bDate);
                default:
                    return 0;
            }
        });
    }, [searchTerm, statusFilter, ghostFilter, ownerFilter, specificOwner, specificAddress, specificCity, specificLicenseType, sortField, sortDirection]);

    // Pagination
    const paginatedData = useMemo(() => {
        return filteredData.slice(0, page * pageSize);
    }, [filteredData, page]);

    // Database Stats
    const dbStats = useMemo(() => {
        const active = filteredData.filter(e => e.status.toUpperCase().includes('ACTIVE')).length;
        const revoked = filteredData.filter(e => e.status.toUpperCase().includes('REVOKED') || e.status.toUpperCase().includes('DENIED')).length;
        const ghost = filteredData.filter(e => e.is_ghost_office).length;
        const cities = new Set(filteredData.map(e => e.city).filter(Boolean)).size;
        return { active, revoked, ghost, cities };
    }, [filteredData]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (paginatedData.length === 0 || viewMode === 'map') return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.min(prev + 1, paginatedData.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex(prev => Math.max(prev - 1, -1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex >= 0 && focusedIndex < paginatedData.length && onEntitySelect) {
                        const row = paginatedData[focusedIndex];
                        onEntitySelect({
                            ...row,
                            id: `MN-${row.license_id}`,
                            type: row.service_type || 'Unknown',
                            rawStatus: row.status,
                            holder: row.owner || 'Unknown',
                            address: row.street || '',
                            city: row.city || '',
                            status: row.status,
                            state_status: row.status_date ? `${row.status} as of ${row.status_date}` : row.status,
                            amount_billed: 0,

                            risk_score: calculateRiskScore(row),
                            red_flag_reason: row.is_ghost_office ? ['Ghost Office Suspected'] : [],
                            federal_status: 'Active',
                            linked_count: 0,
                            initial_effective_date: row.initial_effective_date
                        });
                    }
                    break;
                case 'Escape':
                    setFocusedIndex(-1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paginatedData, focusedIndex, viewMode, onEntitySelect]);

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes('REVOKED') || s.includes('DENIED')) return 'bg-red-950 text-red-400 border-red-900';
        if (s.includes('SUSPENDED')) return 'bg-orange-950 text-orange-400 border-orange-900';
        if (s.includes('CONDITIONAL')) return 'bg-yellow-950 text-yellow-400 border-yellow-900';
        if (s.includes('ACTIVE')) return 'bg-green-950 text-green-400 border-green-900';
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    };

    return (
        <div className="space-y-6">
            {/* Data Freshness Banner */}
            <div className="bg-gradient-to-r from-blue-950/30 via-purple-950/30 to-blue-950/30 border border-blue-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <div>
                            <h3 className="text-xs font-mono uppercase text-blue-400 font-bold">Data Freshness</h3>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Upload Range: <span className="text-zinc-400">Dec 29, 2024</span> → <span className="text-blue-400">Dec 30, 2024</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                        <div className="text-right">
                            <div className="text-zinc-500">First Upload</div>
                            <div className="text-white font-bold">Dec 29, 2024</div>
                        </div>
                        <div className="w-px h-8 bg-blue-900/50" />
                        <div className="text-right">
                            <div className="text-zinc-500">Latest Upload</div>
                            <div className="text-blue-400 font-bold">Dec 30, 2024</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-zinc-900/90 to-black border border-zinc-800 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Active Providers</h3>
                    </div>
                    <div className="text-2xl font-bold text-green-500 font-mono">{dbStats.active.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">Currently Licensed</div>
                </div>

                <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-neon-red" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Enforcement</h3>
                    </div>
                    <div className="text-2xl font-bold text-neon-red font-mono">{dbStats.revoked.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">Revoked/Denied</div>
                </div>

                <div className="bg-amber-950/20 border border-amber-900/50 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Ghost className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Ghost Offices</h3>
                    </div>
                    <div className="text-2xl font-bold text-amber-500 font-mono">{dbStats.ghost.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">Address Anomalies</div>
                </div>

                <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-mono uppercase text-zinc-400 font-bold">Municipalities</h3>
                    </div>
                    <div className="text-2xl font-bold text-blue-400 font-mono">{dbStats.cities.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1">Unique Cities</div>
                </div>
            </div>

            {/* Header / Controls */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sticky top-24 z-30 backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-neon-blue" />
                            Provider Database
                            <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                                {filteredData.length.toLocaleString()} / {stats.total.toLocaleString()}
                            </span>
                        </h2>

                        <div className="flex bg-black border border-zinc-800 rounded p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'map' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-white'}`}
                            >
                                <Map className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setGhostFilter(!ghostFilter)}
                            className={`px-3 py-1.5 rounded text-xs font-bold border flex items-center gap-2 transition-colors ${ghostFilter
                                ? 'bg-amber-950/50 border-amber-600 text-amber-500'
                                : 'bg-black border-zinc-700 text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Ghost className="w-3 h-3" />
                            GHOST OFFICES ({dbStats.ghost})
                        </button>
                        <button
                            onClick={() => setOwnerFilter(!ownerFilter)}
                            className={`px-3 py-1.5 rounded text-xs font-bold border flex items-center gap-2 transition-colors ${ownerFilter
                                ? 'bg-red-950/50 border-red-600 text-red-400'
                                : 'bg-black border-zinc-700 text-zinc-400 hover:text-white'
                                }`}
                        >
                            <User className="w-3 h-3" />
                            NO OWNER ({filteredData.filter(e => !e.owner || e.owner.length === 0).length})
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search providers, license IDs, or addresses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-neon-blue outline-none"
                        />
                    </div>

                    {/* Active Filter Chips */}
                    {(specificOwner || specificAddress || specificCity || specificLicenseType) && (
                        <div className="flex items-center gap-2 flex-wrap col-span-full">
                            <span className="text-xs text-zinc-500 font-mono">FILTERS:</span>

                            {specificOwner && (
                                <button
                                    onClick={() => setSpecificOwner(null)}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-950/50 border border-blue-600 text-blue-300 rounded-full text-xs font-mono hover:bg-blue-900/50 transition-colors"
                                >
                                    <User className="w-3 h-3" />
                                    {specificOwner}
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            {specificCity && (
                                <button
                                    onClick={() => setSpecificCity(null)}
                                    className="flex items-center gap-2 px-3 py-1 bg-purple-950/50 border border-purple-600 text-purple-300 rounded-full text-xs font-mono hover:bg-purple-900/50 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                    {specificCity}
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            {specificAddress && (
                                <button
                                    onClick={() => setSpecificAddress(null)}
                                    className="flex items-center gap-2 px-3 py-1 bg-amber-950/50 border border-amber-600 text-amber-300 rounded-full text-xs font-mono hover:bg-amber-900/50 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                    {specificAddress}
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            {specificLicenseType && (
                                <button
                                    onClick={() => setSpecificLicenseType(null)}
                                    className="flex items-center gap-2 px-3 py-1 bg-green-950/50 border border-green-600 text-green-300 rounded-full text-xs font-mono hover:bg-green-900/50 transition-colors"
                                >
                                    {specificLicenseType}
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setSpecificOwner(null);
                                    setSpecificAddress(null);
                                    setSpecificCity(null);
                                    setSpecificLicenseType(null);
                                }}
                                className="px-3 py-1 bg-red-950/50 border border-red-600 text-red-300 rounded-full text-xs font-mono hover:bg-red-900/50 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:border-neon-blue outline-none"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="REVOKED">Revoked/Denied</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="CONDITIONAL">Conditional</option>
                    </select>
                </div>
            </div>

            {/* Data View */}
            {viewMode === 'grid' ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black text-zinc-400 text-xs uppercase font-bold border-b border-zinc-800 sticky top-0">
                                <tr>
                                    <th className="p-4 w-[150px]">License ID</th>
                                    <th className="p-4 w-[150px]">Risk</th>
                                    <th
                                        className="p-4 w-[350px] cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Provider Name
                                            {sortField === 'name' && (
                                                <ArrowUpDown className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-4 w-[250px] hidden md:table-cell">Owner</th>
                                    <th
                                        className="p-4 bg-black cursor-pointer hover:text-white transition-colors select-none"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center gap-1">
                                            License Status
                                            {sortField === 'status' && (
                                                <ArrowUpDown className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
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
                                                <ArrowUpDown className={`w-3 h-3 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </th>
                                    <th className="p-4 text-right bg-black">Amount Billed</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-zinc-500 font-mono">
                                            NO_MATCHES_FOUND
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((row, index) => (
                                        <MasterlistRow
                                            key={row.license_id}
                                            row={row}
                                            index={index}
                                            riskScore={calculateRiskScore(row)}
                                            isFocused={focusedIndex === index}
                                            getStatusColor={getStatusColor}
                                            onSelect={(entity) => onEntitySelect?.(entity)}
                                            onHover={setFocusedIndex}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Load More Trigger */}
                    {
                        paginatedData.length < filteredData.length && (
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-xs font-mono text-zinc-500">
                                        SHOWING {paginatedData.length.toLocaleString()} / {filteredData.length.toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            className="text-xs font-mono text-zinc-400 hover:text-neon-blue transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-neon-blue/50"
                                        >
                                            +50
                                        </button>
                                        <button
                                            onClick={() => setPage(p => p + 2)}
                                            className="text-xs font-mono text-zinc-400 hover:text-neon-blue transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-neon-blue/50"
                                        >
                                            +100
                                        </button>
                                        <button
                                            onClick={() => setPage(p => p + 10)}
                                            className="text-xs font-mono text-zinc-400 hover:text-neon-blue transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-neon-blue/50"
                                        >
                                            +500
                                        </button>
                                        <div className="w-px h-4 bg-zinc-800" />
                                        <button
                                            onClick={() => setPage(Math.ceil(filteredData.length / pageSize))}
                                            className="text-xs font-mono text-amber-500 hover:text-amber-400 transition-colors px-3 py-1 border border-amber-900/50 rounded hover:border-amber-500/50 uppercase tracking-wide"
                                        >
                                            Load All ({(filteredData.length - paginatedData.length).toLocaleString()})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        filteredData.length === 0 && (
                            <div className="p-12 text-center text-zinc-500">
                                No providers found matching filters.
                            </div>
                        )
                    }
                </div >
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 h-[600px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                            <path d="M 15 8 L 55 8 L 58 15 L 70 15 L 70 25 L 75 28 L 75 35 L 72 38 L 72 95 L 15 95 L 15 75 L 20 72 L 18 65 L 20 58 L 15 55 L 15 45 L 18 42 L 15 38 Z" fill="currentColor" />
                        </svg>
                    </div>
                    {/* Real-time Cluster Analytics */}
                    {(() => {
                        const cityCounts: Record<string, number> = {};
                        const ghostCities: Record<string, number> = {};
                        filteredData.forEach(e => {
                            cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
                            if (e.is_ghost_office) ghostCities[e.city] = (ghostCities[e.city] || 0) + 1;
                        });

                        const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 1);
                        const topGhostHubs = Object.entries(ghostCities).sort((a, b) => b[1] - a[1]).slice(0, 1);
                        const totalGhost = filteredData.filter(e => e.is_ghost_office).length;

                        return (
                            <>
                                <MapPin className="w-12 h-12 text-neon-blue mb-4 animate-pulse" />
                                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest font-mono">Geographic_Cluster_Engine</h3>
                                <p className="text-zinc-500 max-w-sm mb-6 font-mono text-sm leading-relaxed">
                                    Analyzing <span className="text-white">{filteredData.length.toLocaleString()}</span> providers.
                                    {totalGhost > 0 && (
                                        <span> Detected <span className="text-amber-500">{totalGhost}</span> high-risk address anomalies across {Object.keys(ghostCities).length} municipalities.</span>
                                    )}
                                </p>
                                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                    <div className="bg-black/50 border border-zinc-800 p-4 rounded text-left border-l-2 border-l-neon-red">
                                        <div className="text-[10px] text-zinc-500 uppercase mb-1 font-bold">Primary Cluster</div>
                                        <div className="text-white font-bold truncate">
                                            {topCities[0] ? topCities[0][0] : 'N/A'}
                                        </div>
                                        <div className="text-[10px] text-neon-red font-mono mt-1 tracking-tighter">
                                            {topCities[0] ? `${topCities[0][1]} ENTITIES` : 'NO DATA'}
                                        </div>
                                    </div>
                                    <div className="bg-black/50 border border-zinc-800 p-4 rounded text-left border-l-2 border-l-amber-500">
                                        <div className="text-[10px] text-zinc-500 uppercase mb-1 font-bold">Ghost Hub</div>
                                        <div className="text-white font-bold truncate">
                                            {topGhostHubs[0] ? topGhostHubs[0][0] : 'N/A'}
                                        </div>
                                        <div className="text-[10px] text-amber-500 font-mono mt-1 tracking-tighter uppercase">
                                            {topGhostHubs[0] ? `${topGhostHubs[0][1]} OFFICE ANOMALIES` : 'NONE DETECTED'}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em] animate-pulse">
                                    [ LIVE_DATA_INTEGRATION_ACTIVE ]
                                </div>
                            </>
                        );
                    })()}
                </div>
            )
            }
        </div >
    );
}
