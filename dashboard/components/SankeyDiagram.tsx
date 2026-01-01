"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, Info, Shield } from "lucide-react";
import { PROGRAM_STATS } from "@/lib/high-risk-programs";

interface FlowNode {
    id: string;
    name: string;
    column: number;
    value: number;
    color: string;
    type: "source" | "program" | "entity" | "destination";
    status?: string;
}

interface FlowLink {
    source: string;
    target: string;
    value: number;
    color?: string;
}

// Build nodes from official 14 High-Risk Programs (Gov. Walz Oct 2025)
const nodes: FlowNode[] = [
    // Column 0: Funding Sources
    { id: "federal", name: "Federal Medicaid", column: 0, value: 5200, color: "#3b82f6", type: "source" },
    { id: "state", name: "State Matching", column: 0, value: 2100, color: "#8b5cf6", type: "source" },

    // Column 1: HIGH-RISK PROGRAMS (The Dirty Dozen +2)
    // CRITICAL - Active Raids
    { id: "hss", name: "Housing Stabilization", column: 1, value: 850, color: "#ef4444", type: "program", status: "RAID" },
    { id: "eidbi", name: "Autism (EIDBI)", column: 1, value: 720, color: "#ef4444", type: "program", status: "RAID" },
    { id: "adult-day", name: "Adult Day Care", column: 1, value: 540, color: "#ef4444", type: "program", status: "PAUSED" },
    // HIGH Risk
    { id: "pca", name: "PCA (Ghost Employees)", column: 1, value: 620, color: "#f59e0b", type: "program" },
    { id: "nemt", name: "NEMT (Taxi Fraud)", column: 1, value: 380, color: "#f59e0b", type: "program" },
    { id: "armhs", name: "ARMHS (Mental Health)", column: 1, value: 340, color: "#f59e0b", type: "program" },
    { id: "ics", name: "ICS (Community)", column: 1, value: 280, color: "#f59e0b", type: "program" },
    // ELEVATED (grouped)
    { id: "other-hcbs", name: "Other HCBS (7 more)", column: 1, value: 1000, color: "#eab308", type: "program" },
    // Legitimate
    { id: "legit-programs", name: "Other DHS Programs", column: 1, value: 2570, color: "#22c55e", type: "program" },

    // Column 2: Entity Types
    { id: "legit", name: "Legitimate Providers", column: 2, value: 2570, color: "#22c55e", type: "entity" },
    { id: "fraud_entities", name: "Fraud Networks", column: 2, value: PROGRAM_STATS.totalExposure, color: "#ef4444", type: "entity" },

    // Column 3: Destinations  
    { id: "services", name: "Actual Services", column: 3, value: 2570, color: "#22c55e", type: "destination" },
    { id: "kenya", name: "Kenya (Hawala)", column: 3, value: 1200, color: "#ef4444", type: "destination" },
    { id: "terror", name: "Al-Shabaab/ISIS", column: 3, value: 600, color: "#dc2626", type: "destination" },
    { id: "luxury", name: "Luxury Assets/RE", column: 3, value: 800, color: "#f59e0b", type: "destination" },
    { id: "unknown", name: "Untraceable", column: 3, value: 1130, color: "#6b7280", type: "destination" },
];

const links: FlowLink[] = [
    // Federal → Programs (High Risk flow)  
    { source: "federal", target: "hss", value: 650, color: "#ef4444" },
    { source: "federal", target: "eidbi", value: 550, color: "#ef4444" },
    { source: "federal", target: "adult-day", value: 400, color: "#ef4444" },
    { source: "federal", target: "pca", value: 480, color: "#f59e0b" },
    { source: "federal", target: "nemt", value: 290, color: "#f59e0b" },
    { source: "federal", target: "armhs", value: 260, color: "#f59e0b" },
    { source: "federal", target: "ics", value: 210, color: "#f59e0b" },
    { source: "federal", target: "other-hcbs", value: 760, color: "#eab308" },
    { source: "federal", target: "legit-programs", value: 1600, color: "#22c55e" },

    // State → Programs
    { source: "state", target: "hss", value: 200, color: "#ef4444" },
    { source: "state", target: "eidbi", value: 170, color: "#ef4444" },
    { source: "state", target: "adult-day", value: 140, color: "#ef4444" },
    { source: "state", target: "pca", value: 140, color: "#f59e0b" },
    { source: "state", target: "nemt", value: 90, color: "#f59e0b" },
    { source: "state", target: "armhs", value: 80, color: "#f59e0b" },
    { source: "state", target: "ics", value: 70, color: "#f59e0b" },
    { source: "state", target: "other-hcbs", value: 240, color: "#eab308" },
    { source: "state", target: "legit-programs", value: 970, color: "#22c55e" },

    // Programs → Entities (ALL high-risk goes to fraud)
    { source: "hss", target: "fraud_entities", value: 850, color: "#ef4444" },
    { source: "eidbi", target: "fraud_entities", value: 720, color: "#ef4444" },
    { source: "adult-day", target: "fraud_entities", value: 540, color: "#ef4444" },
    { source: "pca", target: "fraud_entities", value: 620, color: "#f59e0b" },
    { source: "nemt", target: "fraud_entities", value: 380, color: "#f59e0b" },
    { source: "armhs", target: "fraud_entities", value: 340, color: "#f59e0b" },
    { source: "ics", target: "fraud_entities", value: 280, color: "#f59e0b" },
    { source: "other-hcbs", target: "fraud_entities", value: 1000, color: "#eab308" },
    { source: "legit-programs", target: "legit", value: 2570, color: "#22c55e" },

    // Entities → Destinations
    { source: "legit", target: "services", value: 2570, color: "#22c55e" },
    { source: "fraud_entities", target: "kenya", value: 1200, color: "#ef4444" },
    { source: "fraud_entities", target: "terror", value: 600, color: "#dc2626" },
    { source: "fraud_entities", target: "luxury", value: 800, color: "#f59e0b" },
    { source: "fraud_entities", target: "unknown", value: 1130, color: "#6b7280" },
];

const columnLabels = ["FUNDING SOURCE", "14 HIGH-RISK PROGRAMS", "ENTITIES", "DESTINATION"];

export default function SankeyDiagram() {
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [hoveredLink, setHoveredLink] = useState<{ source: string; target: string } | null>(null);

    // Calculate node positions
    const columns = [0, 1, 2, 3];
    const columnWidth = 200;
    const diagramWidth = 950; // Increased from 750 for full width
    const diagramHeight = 375; // Balanced height for viewing flows and stats
    const nodeWidth = 24; // Increased from 16 for more visibility
    const nodePadding = 10; // Increased from 8

    // Get nodes by column
    const getNodesInColumn = (col: number) => nodes.filter(n => n.column === col);

    // Calculate Y positions for each column
    const getNodePositions = () => {
        const positions: Record<string, { x: number; y: number; height: number }> = {};

        columns.forEach(col => {
            const colNodes = getNodesInColumn(col);
            const totalValue = colNodes.reduce((sum, n) => sum + n.value, 0);
            const availableHeight = diagramHeight - (colNodes.length - 1) * nodePadding;

            let currentY = 0;
            colNodes.forEach(node => {
                const height = (node.value / totalValue) * availableHeight;
                positions[node.id] = {
                    x: col * (diagramWidth / 3.2), // Better column spacing
                    y: currentY,
                    height: Math.max(height, 20), // Minimum height increased
                };
                currentY += height + nodePadding;
            });
        });

        return positions;
    };

    const nodePositions = getNodePositions();

    // Check if a link is highlighted
    const isLinkHighlighted = (link: FlowLink) => {
        if (hoveredNode) {
            return link.source === hoveredNode || link.target === hoveredNode;
        }
        if (hoveredLink) {
            return link.source === hoveredLink.source && link.target === hoveredLink.target;
        }
        return true;
    };

    // Format currency
    const formatMoney = (value: number) => {
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`;
        return `$${value}M`;
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                        <h2 className="text-lg font-bold text-white font-mono">MONEY_FLOW_SANKEY</h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            14 High-Risk HCBS Programs → Fraud Networks → Destinations
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500 animate-pulse" />
                        <span className="text-zinc-400">Active Raid</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500" />
                        <span className="text-zinc-400">High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        <span className="text-zinc-400">Legitimate</span>
                    </div>
                </div>
            </div>

            {/* Sankey Diagram */}
            <div className="bg-black border border-zinc-800 rounded-lg p-6 overflow-x-auto">

                <svg width={diagramWidth + 40} height={diagramHeight + 40} className="mx-auto">
                    <g transform="translate(20, 30)">
                        {/* Column Headers - aligned with bars */}
                        {columnLabels.map((label, i) => (
                            <text
                                key={i}
                                x={i * (diagramWidth / 3.2)}
                                y={-22}
                                fill={i === 1 ? '#ef4444' : '#a1a1aa'}
                                fontSize="11"
                                fontFamily="monospace"
                                fontWeight="bold"
                                style={{ textTransform: 'uppercase' }}
                            >
                                {label}
                            </text>
                        ))}
                        {/* Links */}
                        {links.map((link, i) => {
                            const sourcePos = nodePositions[link.source];
                            const targetPos = nodePositions[link.target];

                            if (!sourcePos || !targetPos) return null;

                            // Calculate link thickness based on value (wider flows)
                            const linkHeight = Math.max((link.value / 600) * 35, 3);

                            // Calculate Y offset within node
                            const sourceY = sourcePos.y + sourcePos.height / 2;
                            const targetY = targetPos.y + targetPos.height / 2;

                            const highlighted = isLinkHighlighted(link);

                            return (
                                <g key={i}>
                                    <motion.path
                                        d={`
                                            M ${sourcePos.x + nodeWidth} ${sourceY}
                                            C ${sourcePos.x + nodeWidth + 80} ${sourceY},
                                              ${targetPos.x - 80} ${targetY},
                                              ${targetPos.x} ${targetY}
                                        `}
                                        fill="none"
                                        stroke={link.color || "#374151"}
                                        strokeWidth={linkHeight}
                                        strokeOpacity={highlighted ? 0.7 : 0.15}
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.2, delay: i * 0.02 }}
                                        onMouseEnter={() => setHoveredLink({ source: link.source, target: link.target })}
                                        onMouseLeave={() => setHoveredLink(null)}
                                        className="cursor-pointer transition-all"
                                    />
                                    {/* Tooltip on hover */}
                                    {hoveredLink?.source === link.source && hoveredLink?.target === link.target && (
                                        <text
                                            x={(sourcePos.x + targetPos.x + nodeWidth) / 2}
                                            y={(sourceY + targetY) / 2 - 10}
                                            fill="#fff"
                                            fontSize="11"
                                            fontFamily="monospace"
                                            fontWeight="bold"
                                            textAnchor="middle"
                                            className="pointer-events-none"
                                        >
                                            {formatMoney(link.value)}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node, i) => {
                            const pos = nodePositions[node.id];
                            if (!pos) return null;

                            const isHighlighted = !hoveredNode || hoveredNode === node.id ||
                                links.some(l =>
                                    (l.source === hoveredNode && l.target === node.id) ||
                                    (l.target === hoveredNode && l.source === node.id)
                                );

                            return (
                                <g
                                    key={node.id}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    className="cursor-pointer"
                                >
                                    <motion.rect
                                        x={pos.x}
                                        y={pos.y}
                                        width={nodeWidth}
                                        height={pos.height}
                                        fill={node.color}
                                        opacity={isHighlighted ? 1 : 0.3}
                                        rx={3}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.6, delay: i * 0.02 }}
                                        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                                    />
                                    {/* Glow effect on hover */}
                                    {isHighlighted && hoveredNode === node.id && (
                                        <rect
                                            x={pos.x - 2}
                                            y={pos.y - 2}
                                            width={nodeWidth + 4}
                                            height={pos.height + 4}
                                            fill="none"
                                            stroke={node.color}
                                            strokeWidth={2}
                                            strokeOpacity={0.5}
                                            rx={3}
                                        />
                                    )}
                                    {/* Status badge for raids */}
                                    {node.status === "RAID" && (
                                        <circle
                                            cx={pos.x + nodeWidth + 6}
                                            cy={pos.y + 6}
                                            r={4}
                                            fill="#ef4444"
                                            className="animate-pulse"
                                        />
                                    )}
                                    <text
                                        x={pos.x + nodeWidth + 10}
                                        y={pos.y + pos.height / 2 - 6}
                                        fill={isHighlighted ? "#fff" : "#666"}
                                        fontSize="10"
                                        fontFamily="monospace"
                                        fontWeight={isHighlighted ? "bold" : "normal"}
                                        dominantBaseline="middle"
                                    >
                                        {node.name}
                                    </text>
                                    <text
                                        x={pos.x + nodeWidth + 10}
                                        y={pos.y + pos.height / 2 + 8}
                                        fill={isHighlighted ? "#a1a1aa" : "#555"}
                                        fontSize="9"
                                        fontFamily="monospace"
                                        dominantBaseline="middle"
                                    >
                                        {formatMoney(node.value)}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>

            {/* Key Findings - Updated with real data */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-950/20 border border-red-900/50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-neon-red animate-pulse" />
                        <span className="text-xs text-zinc-400 uppercase font-mono">Ground Zero</span>
                    </div>
                    <div className="text-lg font-bold text-neon-red font-mono">HSS + EIDBI</div>
                    <p className="text-xs text-zinc-500 mt-1">Dec 2025 FBI Raids Active</p>
                </div>
                <div className="bg-red-950/20 border border-red-900/50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-neon-red" />
                        <span className="text-xs text-zinc-400 uppercase font-mono">Terror Link</span>
                    </div>
                    <div className="text-xl font-bold text-neon-red font-mono">$600M+</div>
                    <p className="text-xs text-zinc-500 mt-1">Al-Shabaab / ISIS nexus</p>
                </div>
                <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-zinc-400 uppercase font-mono">Hawala</span>
                    </div>
                    <div className="text-xl font-bold text-amber-500 font-mono">$1.2B+</div>
                    <p className="text-xs text-zinc-500 mt-1">Kenya via informal channels</p>
                </div>
                <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-zinc-400 uppercase font-mono">Optum Audit</span>
                    </div>
                    <div className="text-xl font-bold text-blue-400 font-mono">14 Programs</div>
                    <p className="text-xs text-zinc-500 mt-1">90-day pause Oct 2025</p>
                </div>
            </div>
        </motion.section>
    );
}
