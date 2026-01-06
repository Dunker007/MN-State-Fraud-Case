'use client';

import { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// US Counties TopoJSON from US Atlas
const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

// Minnesota FIPS Code prefix
const MN_FIPS_PREFIX = '27';

interface CountyProperties {
    name: string;
}

// Simulated claim data by county FIPS (Paid Leave applications)
// In production, this would come from the paid-leave database
const CLAIM_DATA: Record<string, number> = {
    '27053': 2847, // Hennepin
    '27123': 1923, // Ramsey
    '27037': 1456, // Dakota
    '27003': 1234, // Anoka
    '27163': 987,  // Washington
    '27139': 654,  // Scott
    '27109': 543,  // Olmsted
    '27145': 432,  // Stearns
    '27137': 398,  // St. Louis
    '27171': 321,  // Wright
    '27019': 287,  // Carver
    '27013': 234,  // Blue Earth
    '27027': 198,  // Clay
    '27035': 176,  // Crow Wing
    '27111': 154,  // Otter Tail
    '27025': 145,  // Chisago
    '27131': 132,  // Rice
    '27099': 121,  // Mower
    '27047': 110,  // Freeborn
    '27157': 98,   // Wabasha
};

// Neon blue/cyan color scale (matching MN Fraud Watch palette)
const getColorForCount = (count: number, max: number): string => {
    if (count === 0) return '#18181b'; // Zinc-900 for no data

    const logCount = Math.log10(count + 1);
    const logMax = Math.log10(max + 1);
    const ratio = logCount / logMax;

    // Cyan/Blue gradient (low) -> Red (high claims = stress)
    if (ratio < 0.25) return '#164e63'; // Cyan-900
    if (ratio < 0.40) return '#0891b2'; // Cyan-600
    if (ratio < 0.55) return '#06b6d4'; // Cyan-500
    if (ratio < 0.70) return '#22d3ee'; // Cyan-400
    if (ratio < 0.80) return '#f59e0b'; // Amber-500 (warning)
    if (ratio < 0.90) return '#ef4444'; // Red-500 (high stress)
    return '#ff003c'; // Neon Red (critical)
};

interface PaidLeaveCountyMapProps {
    claimData?: Record<string, number>;
    onCountyClick?: (countyId: string, countyName: string, claimCount: number) => void;
}

export default function PaidLeaveCountyMap({
    claimData = CLAIM_DATA,
    onCountyClick
}: PaidLeaveCountyMapProps) {
    const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
    const [hoveredName, setHoveredName] = useState<string>('');
    const [hoveredCount, setHoveredCount] = useState<number>(0);
    const [zoom, setZoom] = useState<number>(1);
    const [center, setCenter] = useState<[number, number]>([-94.5, 46.2]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.05, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.05, 0.5));
    const handleReset = () => {
        setZoom(1);
        setCenter([-94.5, 46.2]);
    };

    const maxClaims = useMemo(() => {
        return Math.max(...Object.values(claimData), 1);
    }, [claimData]);

    const totalClaims = useMemo(() => {
        return Object.values(claimData).reduce((sum, c) => sum + c, 0);
    }, [claimData]);

    const countiesWithData = useMemo(() => {
        return Object.keys(claimData).length;
    }, [claimData]);

    return (
        <div className="relative w-full h-full flex flex-col bg-zinc-950/50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                        Claim Distribution Map
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                        {totalClaims.toLocaleString()} claims across {countiesWithData} counties
                    </p>
                </div>

                {/* Hover info */}
                <div className="text-right">
                    {hoveredName ? (
                        <div className="px-4 py-2 bg-zinc-900 border-2 border-cyan-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                            <div className="text-base font-black text-white">{hoveredName.toUpperCase()}</div>
                            <div className="text-xs text-cyan-300 font-mono font-bold">
                                {hoveredCount.toLocaleString()} CLAIMS
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-2 bg-gradient-to-r from-cyan-900 to-red-900/50 border border-white/10 rounded-xl">
                            <div className="text-sm font-bold text-white/70">HOVER FOR DETAILS</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 min-h-0 relative">
                {/* Zoom Controls */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-1.5">
                    <button onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold">+</button>
                    <div className="px-1 py-1 text-center bg-black/50 rounded text-[10px] font-mono text-cyan-400">{Math.round(zoom * 100)}%</div>
                    <button onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold">-</button>
                    <button onClick={handleReset} className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded mt-1">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 3230, center: [-94.5, 46.2] }}
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
                                    const mnCounties = geographies.filter(geo => String(geo.id).startsWith(MN_FIPS_PREFIX));
                                    return mnCounties.map(geo => {
                                        const fips = String(geo.id);
                                        const count = claimData[fips] || 0;
                                        const fillColor = getColorForCount(count, maxClaims);

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
                                                        fill: fillColor,
                                                        stroke: '#000000',
                                                        strokeWidth: 0.5,
                                                        outline: 'none',
                                                        transition: 'all 0.3s ease'
                                                    },
                                                    hover: {
                                                        fill: '#00f3ff', // Neon blue on hover
                                                        stroke: '#ffffff',
                                                        strokeWidth: 1.5,
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    },
                                                    pressed: {
                                                        fill: '#ff003c',
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
            </div>

            {/* Legend */}
            <div className="flex-none p-3 border-t border-zinc-800">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider text-center mb-2">
                    Claim Density
                </div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-zinc-600">Low</span>
                    <div className="flex gap-0.5">
                        <div className="w-6 h-4 bg-[#164e63] rounded-l" />
                        <div className="w-6 h-4 bg-[#0891b2]" />
                        <div className="w-6 h-4 bg-[#06b6d4]" />
                        <div className="w-6 h-4 bg-[#22d3ee]" />
                        <div className="w-6 h-4 bg-[#f59e0b]" />
                        <div className="w-6 h-4 bg-[#ef4444]" />
                        <div className="w-6 h-4 bg-[#ff003c] rounded-r" />
                    </div>
                    <span className="text-xs text-zinc-600">High</span>
                </div>
            </div>
        </div>
    );
}
