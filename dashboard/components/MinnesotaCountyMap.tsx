'use client';

import { useState, useEffect, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// US Counties TopoJSON from US Atlas
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

// Minnesota FIPS Code prefix
const MN_FIPS_PREFIX = '27';

interface CountyProperties {
    name: string;
}

export interface CensusSummary {
    byFips: Record<string, number>;
    byName: Record<string, { count: number; fips: string }>;
    totalProviders: number;
    totalCounties: number;
}

interface MinnesotaCountyMapProps {
    onCountyClick?: (countyId: string, countyName: string, providerCount: number) => void;
    highlightedCounty?: string;
    censusSummary?: CensusSummary | null;
}

// Color scale for choropleth (provider density)
// Color scale for choropleth (provider density)
const getColorForCount = (count: number, max: number): string => {
    // if (count === 0) return '#18181b'; // Removed per user request - allow 0 to fall into Purple-800 tier

    // Logarithmic scale for better distribution
    const logCount = Math.log10(count + 1);
    const logMax = Math.log10(max + 1);
    const ratio = logCount / logMax;

    // Vikings Theme: Purple -> Gold Gradient
    // TARGET: Balanced Map (Top 20-25% Yellow/Gold)
    // User Selection: 7 -> 3 -> 1 (Light Purple -> Dark Purple Inversion)

    if (ratio < 0.35) return '#6b21a8'; // #7 Purple-800
    if (ratio < 0.55) return '#3b0764'; // #3 Purple-950
    if (ratio < 0.68) return '#2e0249'; // #1 Deep Plum

    // 3 Distinct Tiers of Yellow/Gold (Locked)
    if (ratio < 0.78) return '#FDE047'; // Yellow-300 (Bright Light Yellow)
    if (ratio < 0.88) return '#F59E0B'; // Amber-500 (Deep Amber/Gold)
    return '#FFC62F'; // Vikings Gold (Official - Highest)
};

export default function MinnesotaCountyMap({
    onCountyClick,
    highlightedCounty,
    censusSummary: propCensusSummary
}: MinnesotaCountyMapProps) {
    const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
    const [hoveredName, setHoveredName] = useState<string>('');
    const [hoveredCount, setHoveredCount] = useState<number>(0);
    const [countyCount, setCountyCount] = useState<number>(0);
    const [localCensusData, setLocalCensusData] = useState<CensusSummary | null>(null);

    // Use prop if available, otherwise local state
    const censusData = propCensusSummary || localCensusData;

    const [zoom, setZoom] = useState<number>(1);
    const [center, setCenter] = useState<[number, number]>([-94.5, 46.2]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.05, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.05, 0.5));
    const handleReset = () => {
        setZoom(1);
        setCenter([-94.5, 46.2]);
    };

    // Load census summary on mount ONLY if not provided via props
    useEffect(() => {
        if (propCensusSummary) return;

        async function fetchCensusSummary() {
            try {
                const response = await fetch('/api/census-summary');
                if (response.ok) {
                    const data = await response.json();
                    setLocalCensusData(data);

                    // Pre-select Hennepin County (FIPS 27053) for impactful initial view
                    const defaultFips = '27053';
                    if (data.byFips && data.byFips[defaultFips]) {
                        setHoveredCounty(defaultFips);
                        setHoveredName('Hennepin');
                        setHoveredCount(data.byFips[defaultFips]);
                    }
                }
            } catch (err) {
                console.error('Failed to load census summary:', err);
            }
        }
        fetchCensusSummary();
    }, [propCensusSummary]);

    // Calculate max for color scaling
    const maxProviders = useMemo(() => {
        if (!censusData?.byFips) return 1;
        return Math.max(...Object.values(censusData.byFips), 1);
    }, [censusData]);

    return (
        <div className="relative w-full h-full flex flex-col bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        Provider Proliferation Map
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                        {censusData?.totalProviders?.toLocaleString() || '...'} providers across {censusData ? Object.keys(censusData.byFips).length : 87} counties
                    </p>
                </div>

                {/* Hover info */}
                <div className="text-right h-12 flex items-center justify-end">
                    {hoveredName ? (
                        <div className="px-4 py-2 bg-zinc-900 border-2 border-purple-500 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] flex flex-col justify-center min-w-[140px] animate-in fade-in slide-in-from-right-4 duration-200">
                            <div className="text-base font-black text-white leading-none mb-1">{hoveredName.toUpperCase()}</div>
                            <div className="text-xs text-purple-300 font-mono font-bold">
                                {hoveredCount.toLocaleString()} PROVIDERS
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-gradient-to-r from-purple-900 to-yellow-600/80 border border-white/10 rounded-xl shadow-lg whitespace-nowrap">
                            <div className="text-lg font-black text-white/90 tracking-wider drop-shadow-md">HOVER FOR DETAILS</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container - Flex Grow to take remaining space */}
            <div className="flex-1 min-h-0 relative flex items-center justify-center">

                {/* Manual Zoom Controls Overlay (Moved to Left & Lowered) */}
                <div className="absolute top-32 left-4 z-10 flex flex-col gap-1 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-1.5 shadow-xl">
                    <button
                        onClick={handleZoomIn}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold transition-colors"
                        title="Zoom In"
                    >
                        +
                    </button>
                    <div className="px-1 py-1 text-center bg-black/50 rounded border border-zinc-800">
                        <span className="text-[10px] font-mono font-bold text-yellow-400">
                            {Math.round(zoom * 100)}%
                        </span>
                    </div>
                    <button
                        onClick={handleZoomOut}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold transition-colors"
                        title="Zoom Out"
                    >
                        -
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors mt-1"
                        title="Reset Zoom"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 3500, // 85% of previous 4125
                        center: [-94.5, 46.2]
                    }}
                    className="w-full h-full"
                >
                    <ZoomableGroup
                        zoom={zoom}
                        center={center}
                        onMoveEnd={({ zoom: newZoom, coordinates: newCenter }) => {
                            setZoom(newZoom);
                            setCenter(newCenter as [number, number]);
                        }}
                        maxZoom={4}
                        minZoom={0.5}
                    >
                        <Geographies geography={GEO_URL}>
                            {({ geographies }) => {
                                // Filter for MN counties (FIPS starts with 27)
                                const mnCounties = geographies.filter(geo => String(geo.id).startsWith(MN_FIPS_PREFIX));

                                // Update county count once - Removed to fix bad setState() error
                                // MN has 87 counties. We can just display that static or derive from data.

                                return mnCounties.map(geo => {
                                    const fips = String(geo.id);
                                    const count = censusData?.byFips[fips] || 0;
                                    const isHovered = hoveredCounty === fips;
                                    const isHighlighted = highlightedCounty === fips;
                                    const fillColor = getColorForCount(count, maxProviders);

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            onMouseEnter={() => {
                                                setHoveredCounty(fips);
                                                setHoveredName((geo.properties as unknown as CountyProperties).name);
                                                setHoveredCount(count);
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredCounty(null);
                                                setHoveredName('');
                                                setHoveredCount(0);
                                            }}
                                            onClick={(evt) => {
                                                evt.stopPropagation();
                                                if (onCountyClick) {
                                                    onCountyClick(fips, (geo.properties as unknown as CountyProperties).name, count);
                                                }
                                            }}
                                            style={{
                                                default: {
                                                    fill: isHighlighted ? '#EAB308' : fillColor,
                                                    stroke: '#000000',
                                                    strokeWidth: 0.5,
                                                    outline: 'none',
                                                    transition: 'all 0.3s ease'
                                                },
                                                hover: {
                                                    fill: '#fbbf24', // Amber-400 on hover
                                                    stroke: '#ffffff',
                                                    strokeWidth: 1.5,
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                },
                                                pressed: {
                                                    fill: '#f59e0b',
                                                    stroke: '#ffffff',
                                                    strokeWidth: 2,
                                                    outline: 'none'
                                                }
                                            }}
                                        />
                                    );
                                });
                            }}
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            </div>

            {/* Choropleth Legend (Compact Bottom) */}
            <div className="flex-none flex flex-col justify-end mt-2 space-y-2">
                <div className="text-lg font-bold text-zinc-300 uppercase tracking-widest text-center">
                    Provider Density
                </div>
                <div className="flex items-center justify-center gap-4">
                    <span className="text-base font-bold text-zinc-500">Low</span>
                    <div className="flex gap-1.5 sh-lg">
                        <div className="w-12 h-8 bg-[#6b21a8] rounded-l animate-pulse" style={{ animationDelay: '0s' }} title="Low (#7)" />
                        <div className="w-12 h-8 bg-[#3b0764] animate-pulse" style={{ animationDelay: '0.3s' }} title="Medium-Low (#3)" />
                        <div className="w-12 h-8 bg-[#2e0249] animate-pulse" style={{ animationDelay: '0.6s' }} title="Medium (#1)" />
                        <div className="w-12 h-8 bg-[#FDE047] animate-pulse" style={{ animationDelay: '0.9s' }} title="High (T1)" />
                        <div className="w-12 h-8 bg-[#FFC62F] animate-pulse" style={{ animationDelay: '1.2s' }} title="High (T2 - Swapped)" />
                        <div className="w-12 h-8 bg-[#F59E0B] rounded-r animate-pulse" style={{ animationDelay: '1.5s' }} title="Highest (T3 - Swapped)" />
                    </div>
                    <span className="text-base font-bold text-zinc-500">High</span>
                </div>
                <div className="flex items-center justify-center gap-8 text-base text-zinc-400 font-medium">
                    <span>Max: <strong className="text-white text-lg">{maxProviders.toLocaleString()}</strong></span>
                    <span className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-blue-500 rounded border border-blue-400 shadow-sm" />
                        Selected
                    </span>
                </div>
            </div>
        </div>
    );
}
