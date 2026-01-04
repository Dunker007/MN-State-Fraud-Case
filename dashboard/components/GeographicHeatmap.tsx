"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { masterlistData, calculateRiskScore } from '@/lib/data';

interface HotspotData {
    city: string;
    x: number; // Percentage from left
    y: number; // Percentage from top
    entityCount: number;
    fraudExposure: number; // in millions
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

// Geographic coordinates for Minnesota cities mapped to SVG viewBox (0-100)
// Based on actual lat/long positions
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
    // Metro Area - Twin Cities
    "MINNEAPOLIS": { x: 52, y: 58 },
    "ST. PAUL": { x: 54, y: 58 },
    "ST PAUL": { x: 54, y: 58 },
    "SAINT PAUL": { x: 54, y: 58 },
    "BLOOMINGTON": { x: 52, y: 61 },
    "BROOKLYN PARK": { x: 50, y: 55 },
    "PLYMOUTH": { x: 49, y: 56 },
    "WOODBURY": { x: 56, y: 58 },
    "MAPLE GROVE": { x: 48, y: 54 },
    "EDEN PRAIRIE": { x: 49, y: 59 },
    "BLAINE": { x: 51, y: 53 },
    "LAKEVILLE": { x: 52, y: 63 },
    "BURNSVILLE": { x: 52, y: 62 },
    "EAGAN": { x: 53, y: 61 },
    "COON RAPIDS": { x: 50, y: 54 },
    "APPLE VALLEY": { x: 53, y: 63 },
    "EDINA": { x: 51, y: 59 },
    "MINNETONKA": { x: 50, y: 58 },
    "ST. LOUIS PARK": { x: 51, y: 58 },
    "ST LOUIS PARK": { x: 51, y: 58 },
    "MAPLEWOOD": { x: 54, y: 57 },
    "RICHFIELD": { x: 52, y: 60 },
    "SHAKOPEE": { x: 49, y: 64 },
    "FRIDLEY": { x: 51, y: 56 },
    "INVER GROVE HEIGHTS": { x: 53, y: 62 },
    "ROSEVILLE": { x: 52, y: 57 },
    "COTTAGE GROVE": { x: 55, y: 62 },
    "BROOKLYN CENTER": { x: 51, y: 56 },
    "SAVAGE": { x: 51, y: 63 },
    "PRIOR LAKE": { x: 50, y: 64 },
    "CHAMPLIN": { x: 50, y: 54 },
    "ANDOVER": { x: 51, y: 52 },
    "CRYSTAL": { x: 51, y: 57 },
    "NEW BRIGHTON": { x: 52, y: 56 },
    "OAKDALE": { x: 55, y: 58 },
    "RAMSEY": { x: 50, y: 52 },
    "WHITE BEAR LAKE": { x: 54, y: 56 },
    "CHANHASSEN": { x: 48, y: 60 },

    // Southern MN
    "ROCHESTER": { x: 58, y: 78 },
    "MANKATO": { x: 43, y: 75 },
    "OWATONNA": { x: 52, y: 76 },
    "ALBERT LEA": { x: 50, y: 85 },
    "AUSTIN": { x: 55, y: 81 },
    "FARIBAULT": { x: 50, y: 72 },
    "NORTHFIELD": { x: 51, y: 70 },
    "WINONA": { x: 65, y: 78 },
    "RED WING": { x: 57, y: 68 },
    "HASTINGS": { x: 55, y: 64 },

    // Central MN
    "ST. CLOUD": { x: 42, y: 44 },
    "ST CLOUD": { x: 42, y: 44 },
    "SAINT CLOUD": { x: 42, y: 44 },
    "ELK RIVER": { x: 49, y: 51 },
    "SARTELL": { x: 42, y: 43 },
    "SAUK RAPIDS": { x: 43, y: 44 },
    "LITTLE FALLS": { x: 40, y: 40 },
    "BRAINERD": { x: 40, y: 35 },
    "BAXTER": { x: 41, y: 35 },
    "MONTICELLO": { x: 46, y: 52 },
    "BUFFALO": { x: 46, y: 53 },
    "BIG LAKE": { x: 47, y: 51 },

    // Northern MN
    "DULUTH": { x: 58, y: 18 },
    "HIBBING": { x: 50, y: 14 },
    "VIRGINIA": { x: 54, y: 15 },
    "CLOQUET": { x: 56, y: 22 },
    "HERMANTOWN": { x: 59, y: 19 },
    "GRAND RAPIDS": { x: 48, y: 20 },
    "BEMIDJI": { x: 35, y: 17 },
    "INTERNATIONAL FALLS": { x: 48, y: 6 },

    // Western MN
    "MOORHEAD": { x: 20, y: 35 },
    "WILLMAR": { x: 32, y: 52 },
    "ALEXANDRIA": { x: 33, y: 40 },
    "FERGUS FALLS": { x: 25, y: 30 },
    "DETROIT LAKES": { x: 25, y: 25 },
    "MARSHALL": { x: 30, y: 68 },
    "HUTCHINSON": { x: 41, y: 59 },
    "WORTHINGTON": { x: 28, y: 82 },
    "NEW ULM": { x: 38, y: 70 },
};

const riskColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#eab308',
    low: '#22c55e',
};

interface GeographicHeatmapProps {
    entities?: Array<{ city?: string; risk_score?: number }>;
    onCitySelect?: (city: string) => void;
}

export default function GeographicHeatmap({ entities: _entities, onCitySelect }: GeographicHeatmapProps) {
    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<HotspotData | null>(null);

    // Calculate top 50 cities from real masterlist data
    const topCities = useMemo(() => {
        const cityCounts: Record<string, { count: number; totalRisk: number }> = {};

        masterlistData.entities.forEach(e => {
            const city = e.city?.toUpperCase() || 'UNKNOWN';
            if (!cityCounts[city]) {
                cityCounts[city] = { count: 0, totalRisk: 0 };
            }
            cityCounts[city].count++;
            cityCounts[city].totalRisk += calculateRiskScore(e);
        });

        return Object.entries(cityCounts)
            .filter(([city]) => city !== 'UNKNOWN')
            .map(([city, data]) => ({
                city,
                entityCount: data.count,
                avgRisk: data.totalRisk / data.count,
                fraudExposure: (data.count * 0.8), // Estimated exposure in millions
                riskLevel:
                    data.totalRisk / data.count > 60 ? 'critical' :
                        data.totalRisk / data.count > 40 ? 'high' :
                            data.totalRisk / data.count > 20 ? 'medium' : 'low' as 'critical' | 'high' | 'medium' | 'low'
            }))
            .sort((a, b) => b.entityCount - a.entityCount)
            .slice(0, 50);
    }, []);

    // Map cities to their geographic coordinates
    const enrichedHotspots = useMemo(() => {
        return topCities
            .map(city => {
                const coords = CITY_COORDINATES[city.city];

                // Skip cities without coordinates
                if (!coords) {
                    return null;
                }

                return {
                    city: city.city,
                    x: coords.x,
                    y: coords.y,
                    entityCount: city.entityCount,
                    fraudExposure: city.fraudExposure,
                    riskLevel: city.riskLevel
                };
            })
            .filter((h): h is HotspotData => h !== null);
    }, [topCities]);

    const maxExposure = Math.max(...enrichedHotspots.map(h => h.fraudExposure));

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-lg font-bold text-white font-mono">GEOGRAPHIC_HEATMAP</h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            Drag to pan • Scroll to zoom • Click hotspots for details
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-zinc-400">Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-zinc-400">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-zinc-400">Medium</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Container with Pan/Zoom */}
                <div className="lg:col-span-2 bg-black border border-zinc-800 rounded-lg relative overflow-hidden">
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.5}
                        maxScale={4}
                        centerOnInit={true}
                        wheel={{ step: 0.1 }}
                        pinch={{ step: 5 }}
                        doubleClick={{ disabled: false }}
                        panning={{ disabled: false }}
                    >
                        {({ zoomIn, zoomOut, resetTransform, instance }) => {
                            // Determine how many cities to show based on zoom level
                            const currentZoom = instance.transformState.scale;
                            const citiesToShow =
                                currentZoom >= 3 ? 50 :
                                    currentZoom >= 2 ? 30 :
                                        currentZoom >= 1.5 ? 20 :
                                            currentZoom >= 1 ? 10 : 5;

                            // Get visible hotspots based on zoom
                            const visibleHotspots = enrichedHotspots.slice(0, Math.min(citiesToShow, enrichedHotspots.length));

                            return (
                                <>
                                    {/* Zoom Controls */}
                                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                        <button
                                            onClick={() => zoomIn()}
                                            className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded transition-colors backdrop-blur-sm"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4 h-4 text-white" />
                                        </button>
                                        <button
                                            onClick={() => zoomOut()}
                                            className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded transition-colors backdrop-blur-sm"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4 h-4 text-white" />
                                        </button>
                                        <button
                                            onClick={() => resetTransform()}
                                            className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded transition-colors backdrop-blur-sm"
                                            title="Reset View"
                                        >
                                            <Maximize2 className="w-4 h-4 text-white" />
                                        </button>
                                        <div className="mt-2 px-2 py-1 bg-black/80 border border-zinc-700 rounded text-[10px] text-zinc-400 font-mono text-center">
                                            {citiesToShow} cities
                                        </div>
                                    </div>

                                    <TransformComponent
                                        wrapperStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <div className="w-full h-80 flex items-center justify-center">
                                            {/* Minnesota Outline SVG - More Accurate Shape */}
                                            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                                                {/* Accurate MN state outline - simplified but recognizable */}
                                                <path
                                                    d="M 49,6 L 50,6 L 51,7 L 52,7 L 53,8 L 54,8 L 54,10 L 70,10 L 70,12 L 72,14 L 73,15 L 74,17 L 75,19 L 76,22 L 76,25 L 75,28 L 74,30 L 73,32 L 72,35 L 71,38 L 70,42 L 69,46 L 68,50 L 67,54 L 66,58 L 65,62 L 64,66 L 63,70 L 62,74 L 61,78 L 60,82 L 59,86 L 58,90 L 57,93 L 56,95 L 54,95 L 52,95 L 50,95 L 48,95 L 46,95 L 44,95 L 42,95 L 40,95 L 38,95 L 36,95 L 34,95 L 32,95 L 30,95 L 28,95 L 26,95 L 24,95 L 22,95 L 20,95 L 20,93 L 19,91 L 19,89 L 18,87 L 18,85 L 18,83 L 19,81 L 19,79 L 20,77 L 20,75 L 21,73 L 22,71 L 22,69 L 22,67 L 21,65 L 20,63 L 19,61 L 18,59 L 18,57 L 19,55 L 20,53 L 20,51 L 20,49 L 19,47 L 18,45 L 18,43 L 19,41 L 20,39 L 21,37 L 22,35 L 22,33 L 22,31 L 21,29 L 20,27 L 19,25 L 19,23 L 20,21 L 21,19 L 22,17 L 23,15 L 24,13 L 25,11 L 27,10 L 30,10 L 33,10 L 36,10 L 39,10 L 42,10 L 45,10 L 48,10 Z"
                                                    fill="#0a0a0a"
                                                    stroke="#2a2a2a"
                                                    strokeWidth="0.5"
                                                />

                                                {/* Grid lines */}
                                                {[20, 40, 60, 80].map(y => (
                                                    <line key={`h${y}`} x1="18" y1={y} x2="76" y2={y} stroke="#1a1a1a" strokeWidth="0.2" />
                                                ))}
                                                {[25, 35, 45, 55, 65].map(x => (
                                                    <line key={`v${x}`} x1={x} y1="6" x2={x} y2="95" stroke="#1a1a1a" strokeWidth="0.2" />
                                                ))}

                                                {/* Hotspots - Scale Independent */}
                                                {visibleHotspots.map((hotspot, i) => {
                                                    // Base size in pixels (stays constant regardless of zoom)
                                                    const baseSize = 0.8;
                                                    const maxSize = 1.8;
                                                    const size = baseSize + (hotspot.fraudExposure / maxExposure) * (maxSize - baseSize);

                                                    // Counter-scale to keep dots same visual size
                                                    const visualScale = 1 / currentZoom;
                                                    const scaledSize = size * visualScale;

                                                    const isHovered = hoveredCity === hotspot.city;
                                                    const isSelected = selectedCity?.city === hotspot.city;

                                                    return (
                                                        <g
                                                            key={hotspot.city}
                                                            onMouseEnter={() => setHoveredCity(hotspot.city)}
                                                            onMouseLeave={() => setHoveredCity(null)}
                                                            onClick={() => setSelectedCity(hotspot)}
                                                            className="cursor-pointer"
                                                        >
                                                            {/* Pulse ring for critical */}
                                                            {hotspot.riskLevel === 'critical' && (
                                                                <motion.circle
                                                                    cx={hotspot.x}
                                                                    cy={hotspot.y}
                                                                    r={scaledSize + (1.5 * visualScale)}
                                                                    fill="none"
                                                                    stroke={riskColors[hotspot.riskLevel]}
                                                                    strokeWidth={0.3 * visualScale}
                                                                    initial={{ opacity: 0.5, scale: 1 }}
                                                                    animate={{ opacity: 0, scale: 1.5 }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                />
                                                            )}

                                                            {/* Glow effect */}
                                                            <circle
                                                                cx={hotspot.x}
                                                                cy={hotspot.y}
                                                                r={scaledSize + (0.8 * visualScale)}
                                                                fill={riskColors[hotspot.riskLevel]}
                                                                opacity={0.2}
                                                            />

                                                            {/* Main dot */}
                                                            <motion.circle
                                                                cx={hotspot.x}
                                                                cy={hotspot.y}
                                                                r={isHovered || isSelected ? scaledSize * 1.5 : scaledSize}
                                                                fill={riskColors[hotspot.riskLevel]}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: i * 0.05, type: 'spring' }}
                                                            />

                                                            {/* City label on hover */}
                                                            {(isHovered || isSelected) && (
                                                                <text
                                                                    x={hotspot.x}
                                                                    y={hotspot.y - scaledSize - (1.5 * visualScale)}
                                                                    fill="white"
                                                                    fontSize={2.5 * visualScale}
                                                                    textAnchor="middle"
                                                                    fontFamily="monospace"
                                                                >
                                                                    {hotspot.city}
                                                                </text>
                                                            )}
                                                        </g>
                                                    );
                                                })}

                                                {/* Metro area box */}
                                                <rect
                                                    x="45"
                                                    y="50"
                                                    width="15"
                                                    height="15"
                                                    fill="none"
                                                    stroke="#ef4444"
                                                    strokeWidth="0.3"
                                                    strokeDasharray="1"
                                                    opacity="0.5"
                                                />
                                                <text x="52.5" y="49" fill="#ef4444" fontSize="2" textAnchor="middle" fontFamily="monospace">
                                                    METRO AREA
                                                </text>
                                            </svg>
                                        </div>
                                    </TransformComponent>
                                </>
                            );
                        }}
                    </TransformWrapper>
                </div>

                {/* Details Panel */}
                <div className="space-y-4">
                    {/* Selected City Details */}
                    {selectedCity ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold font-mono">{selectedCity.city}</h3>
                                <div
                                    className={`px-2 py-1 rounded text-xs font-mono uppercase`}
                                    style={{
                                        backgroundColor: `${riskColors[selectedCity.riskLevel]}20`,
                                        color: riskColors[selectedCity.riskLevel],
                                        border: `1px solid ${riskColors[selectedCity.riskLevel]}50`
                                    }}
                                >
                                    {selectedCity.riskLevel}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Entities:</span>
                                    <span className="text-white font-mono">{selectedCity.entityCount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Est. Exposure:</span>
                                    <span className="text-neon-red font-mono">${selectedCity.fraudExposure.toFixed(1)}M</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded overflow-hidden">
                                    <motion.div
                                        className="h-full"
                                        style={{ backgroundColor: riskColors[selectedCity.riskLevel] }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(selectedCity.fraudExposure / maxExposure) * 100}%` }}
                                    />
                                </div>

                                {onCitySelect && (
                                    <button
                                        onClick={() => onCitySelect(selectedCity.city)}
                                        className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-2 font-mono"
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                        View All Entities in {selectedCity.city}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 text-center text-zinc-500">
                            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Click a hotspot to view details</p>
                        </div>
                    )}

                    {/* Top 50 Cities - Scrollable */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900/90 backdrop-blur-sm">
                            <h4 className="text-xs text-zinc-500 uppercase font-mono flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Top 50 Fraud Hotspots (Live Data)
                            </h4>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                            <div className="p-4 space-y-2">
                                {topCities.map((hotspot, i) => (
                                    <button
                                        key={hotspot.city}
                                        onClick={() => {
                                            const visualMatch = enrichedHotspots.find(h =>
                                                h.city.toUpperCase().includes(hotspot.city) ||
                                                hotspot.city.includes(h.city.toUpperCase())
                                            );
                                            if (visualMatch) setSelectedCity(visualMatch);
                                        }}
                                        className="w-full flex items-center justify-between p-2 bg-black/30 rounded hover:bg-black/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-zinc-500 font-mono text-xs w-8 flex-shrink-0">{i + 1}.</span>
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: riskColors[hotspot.riskLevel] }}
                                            />
                                            <span className="text-sm text-white truncate font-mono">{hotspot.city}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-xs text-zinc-400 font-mono">
                                                {hotspot.entityCount.toLocaleString()}
                                            </span>
                                            <span className="text-xs text-zinc-600 font-mono">
                                                ${hotspot.fraudExposure.toFixed(1)}M
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-950/20 border border-red-900/50 p-3 rounded text-center">
                            <div className="text-xl font-bold text-neon-red font-mono">
                                {topCities.filter(h => h.riskLevel === 'critical').length}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">Critical Zones</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded text-center">
                            <div className="text-xl font-bold text-white font-mono">
                                {topCities.reduce((sum, h) => sum + h.entityCount, 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">Total Entities</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
