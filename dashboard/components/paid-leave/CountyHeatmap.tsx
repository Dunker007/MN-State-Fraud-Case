"use client";

import { useState } from 'react';

// Simplified Minnesota county data with coordinates for a grid-based heatmap
// Full SVG map would be ideal but this provides quick visualization
const COUNTIES = [
    { id: 'hennepin', name: 'Hennepin', claims: 2847, x: 3, y: 4 },
    { id: 'ramsey', name: 'Ramsey', claims: 1923, x: 4, y: 4 },
    { id: 'dakota', name: 'Dakota', claims: 1456, x: 4, y: 5 },
    { id: 'anoka', name: 'Anoka', claims: 1234, x: 4, y: 3 },
    { id: 'washington', name: 'Washington', claims: 987, x: 5, y: 4 },
    { id: 'scott', name: 'Scott', claims: 654, x: 3, y: 5 },
    { id: 'olmsted', name: 'Olmsted', claims: 543, x: 6, y: 6 },
    { id: 'stearns', name: 'Stearns', claims: 432, x: 2, y: 3 },
    { id: 'duluth', name: 'St. Louis', claims: 398, x: 4, y: 1 },
    { id: 'wright', name: 'Wright', claims: 321, x: 2, y: 4 },
    { id: 'carver', name: 'Carver', claims: 287, x: 2, y: 5 },
    { id: 'blue_earth', name: 'Blue Earth', claims: 234, x: 3, y: 7 },
    { id: 'clay', name: 'Clay', claims: 198, x: 0, y: 3 },
    { id: 'crow_wing', name: 'Crow Wing', claims: 176, x: 3, y: 2 },
    { id: 'otter_tail', name: 'Otter Tail', claims: 154, x: 1, y: 2 },
];

interface CountyHeatmapProps {
    onCountySelect?: (county: typeof COUNTIES[0] | null) => void;
}

export default function CountyHeatmap({ onCountySelect }: CountyHeatmapProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);

    const maxClaims = Math.max(...COUNTIES.map(c => c.claims));
    const topCounties = [...COUNTIES].sort((a, b) => b.claims - a.claims).slice(0, 5);

    const getIntensity = (claims: number) => {
        const ratio = claims / maxClaims;
        if (ratio > 0.7) return 'bg-red-500';
        if (ratio > 0.4) return 'bg-amber-500';
        if (ratio > 0.2) return 'bg-cyan-500';
        return 'bg-cyan-900';
    };

    const handleClick = (county: typeof COUNTIES[0]) => {
        setSelected(county.id);
        onCountySelect?.(county);
    };

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-cyan-500">CLAIM_DENSITY</span>_BY_COUNTY
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-3 h-3 bg-cyan-900 rounded"></span>
                    <span className="text-zinc-600">Low</span>
                    <span className="w-3 h-3 bg-cyan-500 rounded"></span>
                    <span className="text-zinc-600">Med</span>
                    <span className="w-3 h-3 bg-amber-500 rounded"></span>
                    <span className="text-zinc-600">High</span>
                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                    <span className="text-zinc-600">Critical</span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Map Grid */}
                <div className="col-span-8 relative">
                    <div className="grid grid-cols-7 gap-1 aspect-[7/8]">
                        {Array.from({ length: 56 }).map((_, i) => {
                            const x = i % 7;
                            const y = Math.floor(i / 7);
                            const county = COUNTIES.find(c => c.x === x && c.y === y);

                            if (!county) {
                                return (
                                    <div
                                        key={i}
                                        className="aspect-square bg-zinc-900/30 rounded"
                                    />
                                );
                            }

                            return (
                                <div
                                    key={county.id}
                                    onClick={() => handleClick(county)}
                                    onMouseEnter={() => setHovered(county.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    className={`
                                        aspect-square rounded cursor-pointer transition-all
                                        ${getIntensity(county.claims)}
                                        ${selected === county.id ? 'ring-2 ring-white scale-110 z-10' : ''}
                                        ${hovered === county.id ? 'brightness-125' : ''}
                                    `}
                                    title={`${county.name}: ${county.claims.toLocaleString()} claims`}
                                />
                            );
                        })}
                    </div>

                    {/* Tooltip */}
                    {hovered && (
                        <div className="absolute top-2 left-2 bg-black/90 border border-zinc-700 px-2 py-1 rounded text-xs font-mono">
                            {COUNTIES.find(c => c.id === hovered)?.name}: {COUNTIES.find(c => c.id === hovered)?.claims.toLocaleString()} claims
                        </div>
                    )}
                </div>

                {/* Top 5 List */}
                <div className="col-span-4 space-y-2">
                    <div className="text-[10px] text-zinc-500 font-mono mb-2">TOP_CLAIM_COUNTIES</div>
                    {topCounties.map((county, i) => (
                        <div
                            key={county.id}
                            onClick={() => handleClick(county)}
                            className={`
                                flex items-center justify-between p-2 rounded cursor-pointer
                                border border-zinc-800 hover:border-cyan-800 transition-colors
                                ${selected === county.id ? 'bg-cyan-950/30 border-cyan-500' : 'bg-black/30'}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-600 text-xs">#{i + 1}</span>
                                <span className="text-white text-sm font-mono">{county.name}</span>
                            </div>
                            <span className={`text-sm font-bold font-mono ${i === 0 ? 'text-red-500' : 'text-cyan-400'}`}>
                                {county.claims.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
