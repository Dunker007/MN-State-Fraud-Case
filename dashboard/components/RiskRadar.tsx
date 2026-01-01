"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radar as RadarIcon,
    AlertTriangle,
    Shield,
    Target,
    Building,
    Calendar,
    ExternalLink,
    Siren,
    ShieldAlert,
    FileSearch
} from "lucide-react";
import {
    HIGH_RISK_PROGRAMS,
    PROGRAM_STATS,
    RISK_COLORS,
    STATUS_COLORS,
    type HighRiskProgram
} from "@/lib/high-risk-programs";
import ClaimProofButton from "./ClaimProofButton";

export default function RiskRadar() {
    const [selectedProgram, setSelectedProgram] = useState<HighRiskProgram | null>(null);
    const [filterRisk, setFilterRisk] = useState<string>("all");

    // Filter programs
    const filteredPrograms = filterRisk === "all"
        ? HIGH_RISK_PROGRAMS
        : HIGH_RISK_PROGRAMS.filter(p => p.riskLevel === filterRisk);

    // Calculate radar positions (circular layout)
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;

    const getProgramNumber = (id: string): number => {
        // Left column (1-7)
        const programMap: Record<string, number> = {
            "hss": 1,              // Red
            "eidbi": 2,            // Orange
            "adult-day": 3,        // Yellow
            "nemt": 4,             // Green
            "pca": 5,              // Blue
            "ics": 6,              // Indigo
            "armhs": 7,            // Violet
            // Right column (8-14)
            "cfss": 8,             // Red
            "peer-recovery": 9,    // Orange
            "recup-care": 10,      // Yellow
            "ihs": 11,             // Green
            "adult-companion": 12, // Blue
            "irts": 13,            // Indigo
            "customized-living": 14 // Violet
        };
        return programMap[id] || 0;
    };

    const getProgramColor = (id: string): string => {
        const num = getProgramNumber(id);

        // Pastel ROYGBIV for 1-7, Bold ROYGBIV for 8-14
        const pastelROYGBIV = [
            "#fca5a5",  // 1: Pastel Red (red-300)
            "#fdba74",  // 2: Pastel Orange (orange-300)
            "#fde047",  // 3: Pastel Yellow (yellow-300)
            "#86efac",  // 4: Pastel Green (green-300)
            "#93c5fd",  // 5: Pastel Blue (blue-300)
            "#a5b4fc",  // 6: Pastel Indigo (indigo-300)
            "#d8b4fe"   // 7: Pastel Violet (purple-300)
        ];

        const boldROYGBIV = [
            "#dc2626",  // 8: Bold Red (red-600)
            "#ea580c",  // 9: Bold Orange (orange-600)
            "#ca8a04",  // 10: Bold Yellow (yellow-600)
            "#16a34a",  // 11: Bold Green (green-600)
            "#2563eb",  // 12: Bold Blue (blue-600)
            "#4f46e5",  // 13: Bold Indigo (indigo-600)
            "#9333ea"   // 14: Bold Violet (purple-600)
        ];

        if (num >= 1 && num <= 7) {
            return pastelROYGBIV[num - 1];
        } else if (num >= 8 && num <= 14) {
            return boldROYGBIV[num - 8];
        }

        return "#6b7280"; // gray-500 fallback
    };

    const getRadarPosition = (index: number, total: number, riskLevel: string) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        // Distance from center based on risk level
        const radiusMultiplier = riskLevel === "CRITICAL" ? 0.3 : riskLevel === "HIGH" ? 0.6 : 0.85;
        const radius = maxRadius * radiusMultiplier;
        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
        };
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <RadarIcon className="w-6 h-6 text-red-500" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono">RISK_RADAR</h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            14 High-Risk Programs (Gov. Walz EO 25-06)
                        </p>
                    </div>
                    <ClaimProofButton
                        compact
                        claim={{
                            id: "14-high-risk-programs",
                            type: "pattern",
                            statement: "14 High-Risk Programs identified under Gov. Walz Executive Order",
                            evidence: {
                                primary_source: "Governor Tim Walz Executive Order 25-06",
                                verification_url: "https://mn.gov/governor/",
                                calculation: {
                                    critical_programs: "Housing, EIDBI, PCA, Adult Day Care",
                                    high_programs: "NEMT, CFSS, ARMHS, ICS",
                                    elevated_programs: "IRTS, IHS, SLS, TBI, CADI/CAC, CDCS",
                                    total_count: 14
                                }
                            },
                            verification_steps: [
                                "Review Governor's Executive Order 25-06 dated Oct 29, 2025",
                                "Cross-reference with DHS published audit list",
                                "Verify Optum third-party auditor engagement"
                            ],
                            legal_citation: "MN Executive Order 25-06"
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    {["all", "CRITICAL", "HIGH", "ELEVATED"].map(level => (
                        <button
                            key={level}
                            onClick={() => setFilterRisk(level)}
                            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${filterRisk === level
                                ? level === "all"
                                    ? "bg-zinc-700 text-white"
                                    : `text-white`
                                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                                }`}
                            style={filterRisk === level && level !== "all" ? {
                                backgroundColor: `${RISK_COLORS[level as keyof typeof RISK_COLORS]}30`,
                                borderColor: RISK_COLORS[level as keyof typeof RISK_COLORS],
                                border: '1px solid'
                            } : {}}
                        >
                            {level === "all" ? "ALL" : level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-950/30 border border-red-900/50 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-neon-red font-mono">{PROGRAM_STATS.totalPrograms}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">High-Risk Programs</div>
                </div>
                <div className="bg-red-950/30 border border-red-900/50 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-neon-red font-mono">${(PROGRAM_STATS.totalExposure / 1000).toFixed(1)}B</div>
                    <div className="text-[10px] text-zinc-500 uppercase">Total Exposure</div>
                </div>
                <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-amber-500 font-mono">{PROGRAM_STATS.activeRaids}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">Active Raids</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded text-center">
                    <div className="text-2xl font-bold text-white font-mono">{PROGRAM_STATS.hcbsCount}/14</div>
                    <div className="text-[10px] text-zinc-500 uppercase">HCBS Programs</div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Radar Visualization */}
                <div className="bg-black border border-zinc-800 rounded-lg p-6 relative">
                    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
                        {/* Background rings */}
                        {[0.3, 0.6, 0.85, 1].map((r, i) => (
                            <circle
                                key={i}
                                cx={centerX}
                                cy={centerY}
                                r={maxRadius * r}
                                fill="none"
                                stroke="#222"
                                strokeWidth="1"
                            />
                        ))}
                        {/* Axes */}
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <line
                                key={i}
                                x1={centerX}
                                y1={centerY}
                                x2={Number((centerX + Math.cos(i * Math.PI / 3) * maxRadius).toFixed(2))}
                                y2={Number((centerY + Math.sin(i * Math.PI / 3) * maxRadius).toFixed(2))}
                                stroke="#222"
                                strokeWidth="1"
                            />
                        ))}


                        {/* Risk level labels */}
                        <text x={centerX} y={centerY - maxRadius * 0.15} fill="#ef4444" fontSize="10" textAnchor="middle" fontFamily="monospace">CRITICAL</text>
                        <text x={centerX} y={centerY - maxRadius * 0.45} fill="#f59e0b" fontSize="10" textAnchor="middle" fontFamily="monospace">HIGH</text>
                        <text x={centerX} y={centerY - maxRadius * 0.72} fill="#eab308" fontSize="10" textAnchor="middle" fontFamily="monospace">ELEVATED</text>

                        {/* Crosshairs */}
                        <line x1={centerX} y1={centerY - maxRadius} x2={centerX} y2={centerY + maxRadius} stroke="#333" strokeWidth="0.5" />
                        <line x1={centerX - maxRadius} y1={centerY} x2={centerX + maxRadius} y2={centerY} stroke="#333" strokeWidth="0.5" />

                        {/* Sweep animation */}
                        <line
                            x1={centerX}
                            y1={centerY}
                            x2={centerX}
                            y2={centerY - maxRadius}
                            stroke="rgba(239, 68, 68, 0.3)"
                            strokeWidth="2"
                        >
                            <animateTransform
                                attributeName="transform"
                                attributeType="XML"
                                type="rotate"
                                from={`0 ${centerX} ${centerY}`}
                                to={`360 ${centerX} ${centerY}`}
                                dur="4s"
                                repeatCount="indefinite"
                            />
                        </line>


                        {/* Program dots */}
                        {filteredPrograms.map((program, i) => {
                            const pos = getRadarPosition(i, filteredPrograms.length, program.riskLevel);
                            const isSelected = selectedProgram?.id === program.id;
                            const isRaid = program.status === "ACTIVE_RAID";
                            const size = program.riskLevel === "CRITICAL" ? 12 : program.riskLevel === "HIGH" ? 10 : 8;

                            return (
                                <g
                                    key={program.id}
                                    onClick={() => setSelectedProgram(program)}
                                    className="cursor-pointer"
                                >
                                    {/* Pulse for raids */}
                                    {isRaid && (
                                        <motion.circle
                                            cx={pos.x.toFixed(4)}
                                            cy={pos.y.toFixed(4)}
                                            r={size + 8}
                                            fill="none"
                                            stroke={getProgramColor(program.id)}
                                            strokeWidth="2"
                                            initial={{ opacity: 0.8, scale: 1 }}
                                            animate={{ opacity: 0, scale: 1.5 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}

                                    {/* Glow */}
                                    <circle
                                        cx={pos.x.toFixed(4)}
                                        cy={pos.y.toFixed(4)}
                                        r={size + 4}
                                        fill={getProgramColor(program.id)}
                                        opacity={0.2}
                                    />

                                    {/* Main dot */}
                                    <motion.circle
                                        cx={pos.x.toFixed(4)}
                                        cy={pos.y.toFixed(4)}
                                        r={isSelected ? size + 2 : size}
                                        fill={getProgramColor(program.id)}
                                        stroke={isSelected ? "#fff" : "none"}
                                        strokeWidth={2}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.05, type: "spring" }}
                                    />

                                    {/* Number Label */}
                                    <text
                                        x={pos.x.toFixed(4)}
                                        y={pos.y.toFixed(4)}
                                        dy="0.35em"
                                        textAnchor="middle"
                                        fill="#000000"
                                        fontSize={size - 2}
                                        fontWeight="bold"
                                        pointerEvents="none"
                                        style={{ fontFamily: 'monospace' }}
                                    >
                                        {getProgramNumber(program.id)}
                                    </text>

                                    {/* Label on hover/select */}
                                    {isSelected && (
                                        <text
                                            x={pos.x.toFixed(4)}
                                            y={(pos.y - size - 8).toFixed(4)}
                                            fill="white"
                                            fontSize="10"
                                            textAnchor="middle"
                                            fontFamily="monospace"
                                        >
                                            {program.shortName}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Center target */}
                        <circle cx={centerX} cy={centerY} r={8} fill="#1a1a1a" stroke="#ef4444" strokeWidth="2" />
                        <circle cx={centerX} cy={centerY} r={3} fill="#ef4444" />
                    </svg>

                    {/* Legend - 14 High-Risk Programs */}
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase">DIRTY DOZEN +2</h4>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                                <div className="flex items-center gap-1">
                                    <Siren className="w-3 h-3 text-red-500" />
                                    <span>Raid</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-amber-500" />
                                    <span>Paused</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileSearch className="w-3 h-3 text-blue-500" />
                                    <span>Audit</span>
                                </div>
                            </div>
                        </div><div className="grid grid-cols-2 gap-x-4 text-[10px] font-mono">
                            {/* Left Column: Programs 1-7 (Pastel ROYGBIV) */}
                            <div className="space-y-1">
                                {[...HIGH_RISK_PROGRAMS]
                                    .sort((a, b) => getProgramNumber(a.id) - getProgramNumber(b.id))
                                    .slice(0, 7)
                                    .map((program) => {
                                        const num = getProgramNumber(program.id);
                                        const color = getProgramColor(program.id);
                                        return (
                                            <div
                                                key={program.id}
                                                className="flex items-center gap-2 py-0.5 hover:brightness-125 transition-all cursor-pointer"
                                                onClick={() => setSelectedProgram(program)}
                                            >
                                                <span
                                                    className="font-bold w-5 h-5 flex items-center justify-center rounded text-[9px] text-black flex-shrink-0"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {num}
                                                </span>
                                                <span className="text-zinc-400 truncate flex-1">{program.shortName}</span>
                                                {program.status === "ACTIVE_RAID" && <Siren className="w-3 h-3 text-red-500 flex-shrink-0" />}
                                                {program.status === "PAUSED" && <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                                                {program.status === "UNDER_AUDIT" && <FileSearch className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                                            </div>
                                        );
                                    })}
                            </div>
                            {/* Right Column: Programs 8-14 (Bold ROYGBIV) */}
                            <div className="space-y-1">
                                {[...HIGH_RISK_PROGRAMS]
                                    .sort((a, b) => getProgramNumber(a.id) - getProgramNumber(b.id))
                                    .slice(7, 14)
                                    .map((program) => {
                                        const num = getProgramNumber(program.id);
                                        const color = getProgramColor(program.id);
                                        return (
                                            <div
                                                key={program.id}
                                                className="flex items-center gap-2 py-0.5 hover:brightness-125 transition-all cursor-pointer"
                                                onClick={() => setSelectedProgram(program)}
                                            >
                                                <span
                                                    className="font-bold w-5 h-5 flex items-center justify-center rounded text-[9px] text-white flex-shrink-0"
                                                    style={{ backgroundColor: color }}
                                                >
                                                    {num}
                                                </span>
                                                <span className="text-zinc-400 truncate flex-1">{program.shortName}</span>
                                                {program.status === "ACTIVE_RAID" && <Siren className="w-3 h-3 text-red-500 flex-shrink-0" />}
                                                {program.status === "PAUSED" && <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                                                {program.status === "UNDER_AUDIT" && <FileSearch className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Program Details / List - Moved below radar */}
                <div className="space-y-4">
                    {/* Selected Program Detail */}
                    <AnimatePresence mode="wait">
                        {selectedProgram ? (
                            <motion.div
                                key={selectedProgram.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-zinc-900/50 border rounded-lg p-4"
                                style={{ borderColor: `${RISK_COLORS[selectedProgram.riskLevel]}50` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-white font-bold">{selectedProgram.name}</h3>
                                        <p className="text-xs text-zinc-500 font-mono">{selectedProgram.shortName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span
                                            className="px-2 py-1 text-[10px] font-mono rounded uppercase"
                                            style={{
                                                backgroundColor: `${RISK_COLORS[selectedProgram.riskLevel]}20`,
                                                color: RISK_COLORS[selectedProgram.riskLevel],
                                            }}
                                        >
                                            {selectedProgram.riskLevel}
                                        </span>
                                        <span
                                            className="px-2 py-1 text-[10px] font-mono rounded uppercase"
                                            style={{
                                                backgroundColor: `${STATUS_COLORS[selectedProgram.status]}20`,
                                                color: STATUS_COLORS[selectedProgram.status],
                                            }}
                                        >
                                            {selectedProgram.status.replace("_", " ")}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Category:</span>
                                        <span className="text-white font-mono">{selectedProgram.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Fraud Type:</span>
                                        <span className="text-amber-500 font-mono">{selectedProgram.fraudType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Est. Exposure:</span>
                                        <span className="text-neon-red font-mono font-bold">${selectedProgram.estimatedExposure}M</span>
                                    </div>
                                    <div className="pt-2 border-t border-zinc-800">
                                        <p className="text-xs text-zinc-400 italic">{selectedProgram.notes}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 text-center"
                            >
                                <Target className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                                <p className="text-sm text-zinc-500">Click a program on the radar to view details</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Program List */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                            <h4 className="text-xs text-zinc-500 uppercase font-mono flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                The "Dirty Dozen" (+2)
                            </h4>
                            <span className="text-[10px] text-zinc-600 font-mono">Optum Audit Active</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {[...filteredPrograms]
                                .sort((a, b) => b.estimatedExposure - a.estimatedExposure)
                                .map((program, i) => (
                                    <button
                                        key={program.id}
                                        onClick={() => setSelectedProgram(program)}
                                        className={`w-full flex items-center gap-3 p-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors text-left ${selectedProgram?.id === program.id ? 'bg-zinc-800/50' : ''
                                            }`}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full ${program.status === "ACTIVE_RAID" ? 'animate-pulse' : ''}`}
                                            style={{ backgroundColor: RISK_COLORS[program.riskLevel] }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{program.shortName}</p>
                                            <p className="text-[10px] text-zinc-500 truncate">{program.fraudType}</p>
                                        </div>
                                        <span className="text-xs text-zinc-500 font-mono">${program.estimatedExposure}M</span>
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Optum Audit Notice */}
                    <div className="bg-blue-950/20 border border-blue-900/50 p-3 rounded text-xs">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-mono uppercase">Optum Audit Active</span>
                        </div>
                        <p className="text-zinc-400">
                            90-day pre-payment review pause started Oct 2025. All 14 HCBS programs under third-party audit after DHS admitted internal controls failed.
                        </p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
