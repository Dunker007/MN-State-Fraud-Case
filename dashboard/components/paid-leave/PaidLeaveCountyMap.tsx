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

    // Purple (low) -> Gold (high)
    if (ratio < 0.25) return '#3b0764'; // Purple-950
    if (ratio < 0.40) return '#581c87'; // Purple-900
    if (ratio < 0.55) return '#6b21a8'; // Purple-800
    if (ratio < 0.70) return '#9333ea'; // Purple-600
    if (ratio < 0.80) return '#d97706'; // Amber-600
    if (ratio < 0.90) return '#f59e0b'; // Amber-500
    return '#fbbf24'; // Amber-400 (High)
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
    const [zoom, setZoom] = useState<number>(0.95);
    const [center, setCenter] = useState<[number, number]>([-93.25, 46.5]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.05, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.05, 0.5));
    const handleReset = () => {
        setZoom(0.95);
        setCenter([-93.25, 46.5]);
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
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 shrink-0">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                        Claim Distribution Map
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono">
                        {totalClaims.toLocaleString()} claims across {countiesWithData} counties
                    </p>
                </div>

                {/* Hover info */}
                <div className="text-right">
                    {hoveredName ? (
                        <div className="w-32 px-3 py-1.5 bg-zinc-900 border-2 border-purple-500 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.4)] min-h-[54px] flex flex-col justify-center items-center">
                            <div className="text-xs font-black text-white leading-tight mb-0.5 text-center">{hoveredName.toUpperCase()}</div>
                            <div className="text-[10px] text-purple-300 font-mono font-bold leading-none">
                                {hoveredCount.toLocaleString()} CLAIMS
                            </div>
                        </div>
                    ) : (
                        <div className="w-32 px-3 py-1.5 bg-gradient-to-r from-purple-900 to-amber-900/50 border border-white/10 rounded-lg min-h-[54px] flex items-center justify-center">
                            <div className="text-[10px] font-bold text-white/70 flex flex-col items-center leading-tight">
                                <span>HOVER</span>
                                <span>FOR</span>
                                <span>DETAILS</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 min-h-0 relative">
                {/* Zoom Controls - Horizontal at Top Right */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-1.5">
                    <button onClick={handleZoomIn} className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-xs">+</button>
                    <div className="px-2 py-1 text-center bg-black/50 rounded text-[8px] font-mono text-purple-400 min-w-[32px]">{Math.round(zoom * 100)}%</div>
                    <button onClick={handleZoomOut} className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded font-bold text-xs">-</button>
                    <div className="w-px h-4 bg-zinc-700 mx-1" />
                    <button onClick={handleReset} className="w-6 h-6 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded">
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>

                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{ scale: 3000, center: [-93.25, 46.5] }}
                        width={400}
                        height={600}
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
                                                        fill: '#fbbf24', // Amber/Gold on hover
                                                        stroke: '#ffffff',
                                                        strokeWidth: 1.5,
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    },
                                                    pressed: {
                                                        fill: '#d97706',
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

                            {/* State Outline Overlay */}
                            <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
                                {({ geographies }) => {
                                    const mnState = geographies.find(geo => geo.id === '27');
                                    if (!mnState) return null;
                                    return (
                                        <g key={mnState.rsmKey} className="animate-pulse pointer-events-none">
                                            <Geography
                                                geography={mnState}
                                                style={{
                                                    default: { fill: 'none', stroke: '#a855f7', strokeWidth: 1.5, outline: 'none' },
                                                    hover: { fill: 'none', stroke: '#a855f7', strokeWidth: 1.5, outline: 'none' },
                                                    pressed: { fill: 'none', stroke: '#a855f7', strokeWidth: 1.5, outline: 'none' }
                                                }}
                                            />
                                        </g>
                                    );
                                }}
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </div>
            </div>

            {/* Legend */}
            <div className="flex-none p-2 border-t border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center mb-1">
                    Claim Density
                </div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] text-zinc-600">Low</span>
                    <div className="flex gap-0.5">
                        <div className="w-6 h-3 bg-[#3b0764] rounded-l" />
                        <div className="w-6 h-3 bg-[#581c87]" />
                        <div className="w-6 h-3 bg-[#6b21a8]" />
                        <div className="w-6 h-3 bg-[#9333ea]" />
                        <div className="w-6 h-3 bg-[#d97706]" />
                        <div className="w-6 h-3 bg-[#f59e0b]" />
                        <div className="w-6 h-3 bg-[#fbbf24] rounded-r" />
                    </div>
                    <span className="text-[10px] text-zinc-600">High</span>
                </div>
            </div>
        </div >
    );
}
