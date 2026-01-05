'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Database, Search, Filter, ChevronDown, Building2, MapPin, AlertCircle,
    CheckCircle2, Phone, Mail, TrendingUp
} from 'lucide-react';

export interface Provider {
    'License Number': string;
    'License Type': string;
    'Name of Program': string;
    'AddressLine1': string;
    'AddressLine2': string;
    'AddressLine3': string;
    'City': string;
    'State': string;
    'Zip': string;
    'County': string;
    'Phone': string;
    'License Status': string;
    'License Holder': string;
    'Capacity': string;
    'Type Of License': string;
    'Restrictions': string;
    'Services': string;
    'Licensing Authority': string;
    'Initial Effective Date': string;
    'Current Effective Date': string;
    'Expiration Date': string;
    'License Holder Lives Onsite': string;
    'EmailAddress': string;
}

interface CensusSummary {
    byName: Record<string, { count: number; fips: string }>;
    totalProviders: number;
    totalCounties: number;
}

const ALL_COUNTIES = [
    'Aitkin', 'Anoka', 'Becker', 'Beltrami', 'Benton', 'Big Stone', 'Blue Earth', 'Brown',
    'Carlton', 'Carver', 'Cass', 'Chippewa', 'Chisago', 'Clay', 'Clearwater', 'Cook',
    'Cottonwood', 'Crow Wing', 'Dakota', 'Dodge', 'Douglas', 'Faribault', 'Fillmore', 'Freeborn',
    'Goodhue', 'Grant', 'Hennepin', 'Houston', 'Hubbard', 'Isanti', 'Itasca', 'Jackson',
    'Kanabec', 'Kandiyohi', 'Kittson', 'Koochiching', 'Lac qui Parle', 'Lake', 'Lake of the Woods',
    'Le Sueur', 'Lincoln', 'Lyon', 'McLeod', 'Mahnomen', 'Marshall', 'Martin', 'Meeker',
    'Mille Lacs', 'Morrison', 'Mower', 'Murray', 'Nicollet', 'Nobles', 'Norman', 'Olmsted',
    'Otter Tail', 'Pennington', 'Pine', 'Pipestone', 'Polk', 'Pope', 'Ramsey', 'Red Lake',
    'Redwood', 'Renville', 'Rice', 'Rock', 'Roseau', 'St. Louis', 'Scott', 'Sherburne',
    'Sibley', 'Stearns', 'Steele', 'Stevens', 'Swift', 'Todd', 'Traverse', 'Wabasha',
    'Wadena', 'Waseca', 'Washington', 'Watonwan', 'Wilkin', 'Winona', 'Wright', 'Yellow Medicine'
];

export interface DashboardMetrics {
    riskCount: number;
    investigatingCount: number;
    clearedCount: number;
    serviceMix: {
        hss: number;
        pca: number;
        afc: number;
    };
}

export interface MasterCensusDashboardProps {
    propProviders?: Provider[];
    propLoading?: boolean;
    propError?: string | null;
    selectedCountyName?: string;
    onCountyChange?: (countyName: string) => void;
    onProviderSelect?: (provider: Provider) => void;
    selectedCountyFips?: string; // Legacy/Fallback
    onMetricsCalculated?: (metrics: DashboardMetrics) => void;
    censusSummary?: CensusSummary | null;
}

export function calculateMetrics(providers: Provider[]): DashboardMetrics {
    let risk = 0;
    let investigating = 0;
    let cleared = 0;
    let hss = 0;
    let pca = 0;
    let afc = 0;

    providers.forEach(p => {
        const status = p['License Status']?.toLowerCase() || '';
        const type = p['License Type']?.toLowerCase() || '';
        const capacity = parseInt(p['Capacity'] || '0');

        // Risk logic: Conditional or High Capacity (>100)
        if (status.includes('conditional') || capacity > 100) risk++;
        else if (status.includes('suspend') || status.includes('revok') || status.includes('inactive')) investigating++;
        else cleared++;

        // Service logic
        if (type.includes('home and community')) hss++;
        if (type.includes('personal care')) pca++;
        if (type.includes('foster care')) afc++;
    });

    return {
        riskCount: risk,
        investigatingCount: investigating,
        clearedCount: cleared,
        serviceMix: { hss, pca, afc }
    };
}

export default function MasterCensusDashboard({
    propProviders,
    propLoading,
    propError,
    selectedCountyName,
    onCountyChange,
    selectedCountyFips,
    onProviderSelect,
    onMetricsCalculated,
    censusSummary: propCensusSummary
}: MasterCensusDashboardProps) {
    // Internal State (fallback)
    const [localSelectedCounty, setLocalSelectedCounty] = useState<string>('Hennepin');
    const [localProviders, setLocalProviders] = useState<Provider[]>([]);
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [localCensusSummary, setLocalCensusSummary] = useState<CensusSummary | null>(null);

    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'city' | 'type'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    // Resolve Effective Props
    const isControlled = !!propProviders;
    const providers = isControlled ? propProviders : localProviders;
    const loading = isControlled ? (propLoading || false) : localLoading;
    const error = isControlled ? (propError || null) : localError;
    const censusSummary = propCensusSummary || localCensusSummary;
    const activeCounty = selectedCountyName || localSelectedCounty;

    // Auto-select first provider when data changes (Controlled or Local)
    useEffect(() => {
        if (providers && providers.length > 0) {
            setSelectedProvider(providers[0]);
        } else {
            setSelectedProvider(null);
        }
    }, [providers]);

    // Load census summary on mount ONLY if not provided
    useEffect(() => {
        if (propCensusSummary) return;

        async function fetchSummary() {
            try {
                const response = await fetch('/api/census-summary');
                if (response.ok) {
                    const data = await response.json();
                    setLocalCensusSummary(data);
                }
            } catch (err) {
                console.error('Failed to load census summary:', err);
            }
        }
        fetchSummary();
    }, [propCensusSummary]);

    // Handle FIPS prop change (Legacy support) - Update local selected county name
    useEffect(() => {
        if (selectedCountyFips && censusSummary && !selectedCountyName) {
            const entry = Object.entries(censusSummary.byName).find(
                ([_, data]) => data.fips === selectedCountyFips
            );
            if (entry) {
                setLocalSelectedCounty(entry[0]);
            }
        }
    }, [selectedCountyFips, censusSummary, selectedCountyName]);

    // Internal Fetch Logic (Only if NOT controlled)
    useEffect(() => {
        if (isControlled) return;

        async function fetchProviders() {
            setLocalLoading(true);
            setLocalError(null);
            try {
                const response = await fetch(`/api/census?county=${activeCounty}`);
                if (!response.ok) throw new Error(`No data for ${activeCounty}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);

                const parsed: Provider[] = data.providers.map((record: Record<string, string>) => {
                    return record as unknown as Provider;
                });

                setLocalProviders(parsed);

                // Calculate and emit metrics locally
                const metrics = calculateMetrics(parsed);
                onMetricsCalculated?.(metrics);

                // Auto-select first provider
                setSelectedProvider(parsed.length > 0 ? parsed[0] : null);
            } catch (err) {
                setLocalError(err instanceof Error ? err.message : 'Failed to load');
                setLocalProviders([]);
            } finally {
                setLocalLoading(false);
            }
        }

        if (activeCounty) {
            fetchProviders();
        }
    }, [activeCounty, isControlled, onMetricsCalculated]);

    // Handle Dropdown Change
    const handleCountySelect = (county: string) => {
        if (onCountyChange) {
            onCountyChange(county);
        } else {
            setLocalSelectedCounty(county);
        }
    };

    // Get unique license types
    const uniqueTypes = useMemo(() => {
        const types = new Set(providers.map(p => p['License Type']).filter(Boolean));
        return Array.from(types).sort();
    }, [providers]);

    // Get unique statuses
    const uniqueStatuses = useMemo(() => {
        const statuses = new Set(providers.map(p => p['License Status']).filter(Boolean));
        return Array.from(statuses).sort();
    }, [providers]);

    // Filter and sort providers
    const filteredProviders = useMemo(() => {
        let filtered = providers;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p['Name of Program']?.toLowerCase().includes(term) ||
                p['License Number']?.toLowerCase().includes(term) ||
                p.City?.toLowerCase().includes(term) ||
                p['License Holder']?.toLowerCase().includes(term) ||
                p['AddressLine1']?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p['License Status'] === statusFilter);
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p['License Type'] === typeFilter);
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            const nameA = (a['Name of Program'] || '').trim().toLowerCase();
            const nameB = (b['Name of Program'] || '').trim().toLowerCase();

            const isUnknownA = nameA === 'unknown' || nameA === '';
            const isUnknownB = nameB === 'unknown' || nameB === '';

            if (isUnknownA && !isUnknownB) return 1;
            if (!isUnknownA && isUnknownB) return -1;
            if (isUnknownA && isUnknownB) return 0;

            let valA = '', valB = '';
            if (sortBy === 'name') {
                valA = a['Name of Program'] || '';
                valB = b['Name of Program'] || '';
            } else if (sortBy === 'city') {
                valA = a.City || '';
                valB = b.City || '';
            } else if (sortBy === 'type') {
                valA = a['License Type'] || '';
                valB = b['License Type'] || '';
            }
            const cmp = valA.localeCompare(valB);
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return filtered.slice(0, 100); // Limit for performance
    }, [providers, searchTerm, statusFilter, typeFilter, sortBy, sortDir]);

    // Stats
    const stats = useMemo(() => {
        const active = providers.filter(p => p['License Status']?.toLowerCase().includes('active')).length;
        const closed = providers.filter(p => p['License Status']?.toLowerCase().includes('closed')).length;
        return { total: providers.length, active, closed };
    }, [providers]);

    const handleSort = (field: 'name' | 'city' | 'type') => {
        if (sortBy === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Database className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                Master Census Dashboard
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-mono">
                                {censusSummary?.totalCounties || 87} Counties • {censusSummary?.totalProviders?.toLocaleString() || '...'} Total Providers
                            </p>
                        </div>
                    </div>

                    {/* County Stats */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-lg font-black text-white">{stats.total.toLocaleString()}</div>
                            <div className="text-[10px] text-zinc-500 uppercase">In {activeCounty}</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-700" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-green-400 font-mono">{stats.active}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-xs text-red-400 font-mono">{stats.closed}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* County Selector */}
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <select
                            value={activeCounty}
                            onChange={(e) => handleCountySelect(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white appearance-none cursor-pointer hover:border-zinc-600 transition-colors"
                        >
                            {ALL_COUNTIES.map(county => (
                                <option key={county} value={county}>
                                    {county} {censusSummary?.byName[county] ? `(${censusSummary.byName[county].count})` : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search name, license, city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 hover:border-zinc-600 focus:border-purple-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white appearance-none cursor-pointer hover:border-zinc-600 transition-colors"
                        >
                            <option value="all">All License Types</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white appearance-none cursor-pointer hover:border-zinc-600 transition-colors"
                        >
                            <option value="all">All Status</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 flex-1 min-h-0">
                {/* Provider Table */}
                <div className="border-r border-zinc-800 overflow-hidden">
                    <div className="h-full max-h-[600px] overflow-auto" dir="rtl">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                                <p className="text-sm text-zinc-500">Loading {activeCounty} providers...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm" dir="ltr">
                                <thead className="bg-zinc-900 sticky top-0 z-10">
                                    <tr className="text-left text-sm text-blue-400 font-bold uppercase tracking-wider">
                                        <th
                                            className="px-4 py-3 cursor-pointer hover:text-white transition-colors w-[35%]"
                                            onClick={() => handleSort('name')}
                                        >
                                            Provider {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-4 py-3 w-[15%]">License #</th>
                                        <th
                                            className="px-4 py-3 cursor-pointer hover:text-white transition-colors w-[20%]"
                                            onClick={() => handleSort('type')}
                                        >
                                            Type {sortBy === 'type' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-4 py-3 cursor-pointer hover:text-white transition-colors w-[15%]"
                                            onClick={() => handleSort('city')}
                                        >
                                            City {sortBy === 'city' && (sortDir === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-4 py-3 w-[15%]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {filteredProviders.map((provider, idx) => (
                                        <tr
                                            key={`${provider['License Number']}-${idx}`}
                                            onClick={() => {
                                                setSelectedProvider(provider);
                                                onProviderSelect?.(provider);
                                            }}
                                            className={`hover:bg-zinc-800/50 transition-colors cursor-pointer ${selectedProvider?.['License Number'] === provider['License Number']
                                                ? 'bg-purple-900/20'
                                                : ''
                                                }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                                                    <span className="text-white font-medium truncate max-w-[200px]">
                                                        {provider['Name of Program'] || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                                                {provider['License Number']}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400 truncate max-w-[150px]">
                                                {provider['License Type']}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-400">
                                                {provider.City}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${provider['License Status']?.toLowerCase().includes('active')
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : provider['License Status']?.toLowerCase().includes('closed')
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-zinc-700 text-zinc-400'
                                                    }`}>
                                                    {provider['License Status']?.toLowerCase().includes('active') && (
                                                        <CheckCircle2 className="w-3 h-3" />
                                                    )}
                                                    {provider['License Status'] || 'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="p-4 bg-zinc-900/30">
                    {selectedProvider ? (
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Provider Details</h4>
                                <h3 className="text-lg font-bold text-white">{selectedProvider['Name of Program']}</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase">License Number</span>
                                    <div className="text-sm font-mono text-purple-400">{selectedProvider['License Number']}</div>
                                </div>

                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase">License Type</span>
                                    <div className="text-sm text-white">{selectedProvider['License Type']}</div>
                                </div>

                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase">License Holder</span>
                                    <div className="text-sm text-white">{selectedProvider['License Holder'] || '—'}</div>
                                </div>

                                <div className="pt-2 border-t border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 uppercase">Address</span>
                                    <div className="text-sm text-white">{selectedProvider['AddressLine1']}</div>
                                    <div className="text-sm text-zinc-400">
                                        {selectedProvider.City}, MN {selectedProvider.Zip}
                                    </div>
                                </div>

                                {selectedProvider.Phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-3 h-3 text-zinc-500" />
                                        <span className="text-zinc-300">{selectedProvider.Phone}</span>
                                    </div>
                                )}

                                {selectedProvider['EmailAddress'] && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="w-3 h-3 text-zinc-500" />
                                        <span className="text-zinc-300 truncate">{selectedProvider['EmailAddress']}</span>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-zinc-800">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-[10px] text-zinc-500 uppercase">Effective</span>
                                            <div className="text-xs text-zinc-400">{selectedProvider['Current Effective Date'] || '—'}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-zinc-500 uppercase">Expires</span>
                                            <div className="text-xs text-zinc-400">{selectedProvider['Expiration Date'] || '—'}</div>
                                        </div>
                                    </div>
                                </div>

                                {(selectedProvider.Services || selectedProvider.Capacity) && (
                                    <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-3">
                                        <div className={!selectedProvider.Capacity ? "col-span-2" : ""}>
                                            <span className="text-[10px] text-zinc-500 uppercase">Services</span>
                                            <div className="text-xs text-zinc-400 mt-1">{selectedProvider.Services || '—'}</div>
                                        </div>
                                        {selectedProvider.Capacity && (
                                            <div>
                                                <span className="text-[10px] text-zinc-500 uppercase">Capacity</span>
                                                <div className="text-sm text-white mt-1">{selectedProvider.Capacity}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-zinc-600">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Select a provider to view details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
                <span>
                    Showing {filteredProviders.length} of {providers.length} providers
                </span>
                {providers.length > 100 && (
                    <span className="text-amber-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Results limited to 100 for performance
                    </span>
                )}
            </div>
        </div>
    );
}
