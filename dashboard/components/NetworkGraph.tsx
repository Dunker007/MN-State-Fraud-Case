"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Network, ZoomIn, ZoomOut, Maximize2, X, Skull } from "lucide-react";
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { type Entity } from "@/lib/schemas";

interface NetworkGraphProps {
    entities: Entity[];
    centerEntityId?: string;
    filterIds?: string[]; // IDs to exclusively show
    onEntityClick: (entity: Entity) => void;
    onClose?: () => void;
}

interface Node {
    id: string;
    name: string;
    risk: number;
    x: number;
    y: number;
    isCenter: boolean;
    status: string;
    owner: string;
    isSIP?: boolean;
}

interface Edge {
    from: string;
    to: string;
    type: "network" | "owner"; // Track connection type
}

export default function NetworkGraph({ entities, centerEntityId, filterIds, onEntityClick, onClose }: NetworkGraphProps) {
    const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
    const [isExpanded, setIsExpanded] = useState(!!filterIds);
    const [hoveredOwner, setHoveredOwner] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // SIP Mode state
    const [viewMode, setViewMode] = useState<"entity" | "sip">("entity");
    const [selectedSIP, setSelectedSIP] = useState<string | null>(null);

    // Keyboard navigation for presentation mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isExpanded) return;

            switch (e.key) {
                case 'Escape':
                    if (onClose) onClose();
                    setIsExpanded(false);
                    break;
                case '+':
                case '=':
                    transformRef.current?.zoomIn();
                    break;
                case '-':
                    transformRef.current?.zoomOut();
                    break;
                case '0':
                    transformRef.current?.resetTransform();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded, onClose]);

    // SIP Mode: Calculate owner-centric networks
    const getSIPNetwork = (owner: string) => {
        const ownedEntities = entities.filter(e => e.owner === owner);
        return {
            center: owner,
            entities: ownedEntities,
            totalRisk: ownedEntities.reduce((sum, e) => sum + e.risk_score, 0),
            totalExposure: ownedEntities.reduce((sum, e) => sum + e.amount_billed, 0),
            hasRevoked: ownedEntities.some(e => e.status.includes("REVOKED")),
            hasActive: ownedEntities.some(e => e.status.includes("ACTIVE"))
        };
    };

    // Get top SIPs (owners with most entities)
    const topSIPs = useMemo(() => {
        const ownerMap = new Map<string, number>();
        entities.forEach(e => {
            if (e.owner && e.owner !== "UNKNOWN" && e.owner.trim() !== "") {
                ownerMap.set(e.owner, (ownerMap.get(e.owner) || 0) + 1);
            }
        });
        return Array.from(ownerMap.entries())
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([owner, count]) => ({ owner, count, ...getSIPNetwork(owner) }));
    }, [entities]);

    // Build network graph data
    const { nodes, edges } = useMemo(() => {
        // MODE: SIP (Sensitive Information Person) - Owner-centric view
        if (viewMode === "sip" && selectedSIP) {
            const network = getSIPNetwork(selectedSIP);
            const centerX = 200;
            const centerY = 150;
            const radius = 120;

            const sipNode: Node = {
                id: `SIP_${selectedSIP}`,
                name: selectedSIP,
                risk: network.totalRisk / network.entities.length, // Average risk
                x: centerX,
                y: centerY,
                isCenter: true,
                status: "SIP",
                owner: selectedSIP,
                isSIP: true
            };

            const entityNodes: Node[] = network.entities.map((entity, index) => {
                const angle = (index / network.entities.length) * Math.PI * 2;
                return {
                    id: entity.id,
                    name: entity.name.length > 20 ? entity.name.substring(0, 20) + '...' : entity.name,
                    risk: entity.risk_score,
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius,
                    isCenter: false,
                    status: entity.status,
                    owner: entity.owner
                };
            });

            const sipEdges: Edge[] = network.entities.map(e => ({
                from: `SIP_${selectedSIP}`,
                to: e.id,
                type: "owner" as const
            }));

            return {
                nodes: [sipNode, ...entityNodes],
                edges: sipEdges
            };
        }

        // ENTITY MODES: Standard views
        let displayEntities = entities;

        // MODE 1: FILTERED VIEW (Kingpin Mode)
        if (filterIds && filterIds.length > 0) {
            displayEntities = entities.filter(e => filterIds.includes(e.id));
        }
        // MODE 2: DEFAULT VIEW (Top Connected)
        else {
            const connectedEntities = entities.filter(e =>
                e.network_ids && e.network_ids.length > 0
            );
            if (connectedEntities.length === 0) return { nodes: [], edges: [] };

            const topEntities = connectedEntities
                .sort((a, b) => (b.network_ids?.length || 0) - (a.network_ids?.length || 0))
                .slice(0, 20);

            displayEntities = topEntities;
            if (centerEntityId) {
                const centerEntity = entities.find(e => e.id === centerEntityId);
                if (centerEntity && !topEntities.find(e => e.id === centerEntityId)) {
                    displayEntities = [centerEntity, ...topEntities.slice(0, 19)];
                }
            }
        }

        // Create nodes
        const nodeMap = new Map<string, Node>();
        const centerX = 200;
        const centerY = 150;
        const radius = filterIds ? 140 : 120; // Spread out more in focused mode

        displayEntities.forEach((entity, index) => {
            const angle = (index / displayEntities.length) * Math.PI * 2 - Math.PI / 2;
            const isCenter = entity.id === centerEntityId || (filterIds ? index === 0 : index === 0);

            nodeMap.set(entity.id, {
                id: entity.id,
                name: entity.name.length > 20 ? entity.name.substring(0, 20) + '...' : entity.name,
                risk: entity.risk_score,
                x: isCenter ? centerX : centerX + Math.cos(angle) * (radius + (index % 2 * 20)), // Jitter radius
                y: isCenter ? centerY : centerY + Math.sin(angle) * (radius + (index % 2 * 20)),
                isCenter,
                status: entity.status,
                owner: entity.owner
            });
        });

        const edges: Edge[] = [];
        const edgeSet = new Set<string>();

        // Create edges
        displayEntities.forEach(entity => {
            // 1. Explicit Network Links
            entity.network_ids?.forEach(peerId => {
                if (nodeMap.has(peerId)) {
                    const edgeKey = [entity.id, peerId].sort().join("-");
                    if (!edgeSet.has(edgeKey)) {
                        edgeSet.add(edgeKey);
                        edges.push({ from: entity.id, to: peerId, type: "network" });
                    }
                }
            });

            // 2. Implicit Owner Links (Only in filtered mode to avoid hairball)
            if (filterIds) {
                displayEntities.forEach(peer => {
                    if (entity.id !== peer.id && entity.owner === peer.owner) {
                        const edgeKey = [entity.id, peer.id].sort().join("-");
                        if (!edgeSet.has(edgeKey)) {
                            edgeSet.add(edgeKey);
                            edges.push({ from: entity.id, to: peer.id, type: "owner" });
                        }
                    }
                });
            }
        });

        return { nodes: Array.from(nodeMap.values()), edges };
    }, [entities, centerEntityId, filterIds, viewMode, selectedSIP]);

    // Effect to reset zoom/expand when filter changes
    useEffect(() => {
        if (filterIds) {
            setIsExpanded(true);
            transformRef.current?.setTransform(0, 0, 1.2);
        } else {
            transformRef.current?.resetTransform();
        }
    }, [filterIds]);

    const getNodeColor = (risk: number, status: string) => {
        if (status.includes("REVOKED") || status.includes("DENIED")) return "#ef4444";
        if (risk > 80) return "#ef4444";
        if (risk > 50) return "#f59e0b";
        return "#22c55e";
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`py-6 flex flex-col h-full ${isExpanded ? 'fixed inset-0 z-50 bg-black/95 p-8 backdrop-blur-sm' : ''}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Network className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-bold text-white font-mono">
                        {filterIds ? "EMPIRE_VISUALIZER // LINK_ANALYSIS" : "NETWORK_GRAPH"}
                    </h2>
                    <span className="text-xs text-zinc-500 font-mono">
                        {nodes.length} nodes | {edges.length} connections
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => transformRef.current?.zoomOut()}
                        className="p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-zinc-500 font-mono w-12 text-center">
                        ZOOM
                    </span>
                    <button
                        onClick={() => transformRef.current?.zoomIn()}
                        className="p-1 text-zinc-500 hover:text-white transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            if (isExpanded && onClose) onClose();
                            setIsExpanded(!isExpanded); // Toggle UI state
                        }}
                        className="p-1 text-zinc-500 hover:text-white transition-colors ml-2"
                    >
                        {isExpanded ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* View Mode Toggle and SIP Selector */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <button
                        onClick={() => setViewMode("entity")}
                        className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${viewMode === "entity"
                            ? "bg-neon-blue text-black"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                    >
                        ENTITY VIEW
                    </button>
                    <button
                        onClick={() => setViewMode("sip")}
                        className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${viewMode === "sip"
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                    >
                        SIP MODE
                    </button>
                </div>

                {viewMode === "sip" && (
                    <div className="p-3 bg-purple-950/30 border border-purple-600/30 rounded">
                        <p className="text-xs text-purple-200 mb-3">
                            <strong>SIP Mode:</strong> Select a SIP (Sensitive Information Person) to view their specific network.
                        </p>
                        <div className="max-h-20 overflow-y-auto space-y-1 custom-scrollbar">
                            {topSIPs.map(sip => (
                                <button
                                    key={sip.owner}
                                    onClick={() => setSelectedSIP(sip.owner)}
                                    className={`w-full text-left p-2 rounded text-xs transition-colors ${selectedSIP === sip.owner
                                        ? "bg-purple-600 text-white"
                                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono truncate">{sip.owner}</span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[10px] text-zinc-400">{sip.count} entities</span>
                                            {sip.hasRevoked && sip.hasActive && (
                                                <div title="Has both revoked AND active entities">
                                                    <Skull className="w-3 h-3 text-red-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Graph Container */}
            <div className={`bg-black border border-zinc-800 rounded overflow-hidden flex flex-col flex-1 w-full ${isExpanded ? 'max-h-[85vh]' : 'min-h-0'}`}>
                {nodes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-500">
                        <div className="text-center">
                            <Network className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No network connections to visualize</p>
                            <p className="text-xs mt-1">Entities with shared owners/addresses will appear here</p>
                        </div>
                    </div>
                ) : (
                    <TransformWrapper
                        ref={transformRef}
                        centerOnInit={true}
                        initialScale={1.4}
                        minScale={0.5}
                        maxScale={4}
                        wheel={{ step: 0.1 }}
                    >
                        <TransformComponent
                            wrapperClass="w-full h-full"
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentClass="w-full h-full"
                        >
                            <svg
                                viewBox="0 0 400 300"
                                className="w-full h-full"
                            >
                                {/* Grid background */}
                                <defs>
                                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1f1f" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />

                                {/* Edges */}
                                {edges.map((edge, i) => {
                                    const fromNode = nodes.find(n => n.id === edge.from);
                                    const toNode = nodes.find(n => n.id === edge.to);
                                    if (!fromNode || !toNode) return null;

                                    // Highlight edges connected to hovered owner
                                    const isHighlighted = hoveredOwner &&
                                        (fromNode.owner === hoveredOwner || toNode.owner === hoveredOwner);

                                    const isOwnerEdge = edge.type === "owner";

                                    return (
                                        <line
                                            key={i}
                                            x1={fromNode.x}
                                            y1={fromNode.y}
                                            x2={toNode.x}
                                            y2={toNode.y}
                                            stroke={isHighlighted ? "#f59e0b" : isOwnerEdge ? "#ef4444" : "#374151"}
                                            strokeWidth={isHighlighted ? "2.5" : isOwnerEdge ? "1.5" : "1"}
                                            strokeDasharray={isOwnerEdge ? "4 2" : "0"}
                                            opacity={hoveredOwner ? (isHighlighted ? 1 : 0.15) : (isOwnerEdge ? 0.6 : 0.5)}
                                            className="transition-all duration-200"
                                        />
                                    );
                                })}

                                {/* Nodes */}
                                {nodes.map((node) => {
                                    const isOwnerHighlighted = hoveredOwner === node.owner;
                                    const shouldDim = hoveredOwner && !isOwnerHighlighted;

                                    return (
                                        <g
                                            key={node.id}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const entity = entities.find(e => e.id === node.id);
                                                if (entity) onEntityClick(entity);
                                            }}
                                            onMouseEnter={() => setHoveredOwner(node.owner)}
                                            onMouseLeave={() => setHoveredOwner(null)}
                                            style={{ opacity: shouldDim ? 0.2 : 1, transition: 'opacity 0.2s' }}
                                        >
                                            {/* SIP Node Special Rendering */}
                                            {node.isSIP ? (
                                                <>
                                                    {/* Pulsing outer glow */}
                                                    <circle
                                                        cx={node.x}
                                                        cy={node.y}
                                                        r={35}
                                                        fill="rgb(147, 51, 234)"
                                                        opacity="0.2"
                                                        className="animate-pulse"
                                                    />
                                                    {/* Main SIP circle */}
                                                    <circle
                                                        cx={node.x}
                                                        cy={node.y}
                                                        r={25}
                                                        fill="rgb(147, 51, 234)"
                                                        stroke="rgb(192, 132, 252)"
                                                        strokeWidth={3}
                                                    />
                                                    {/* SIP Label */}
                                                    <text
                                                        x={node.x}
                                                        y={node.y}
                                                        textAnchor="middle"
                                                        dy=".3em"
                                                        fontSize="10"
                                                        fill="white"
                                                        fontWeight="bold"
                                                        fontFamily="monospace"
                                                    >
                                                        SIP
                                                    </text>
                                                    {/* Owner name below */}
                                                    <text
                                                        x={node.x}
                                                        y={node.y + 40}
                                                        textAnchor="middle"
                                                        fill="#c084fc"
                                                        fontSize="7"
                                                        fontFamily="monospace"
                                                        fontWeight="bold"
                                                    >
                                                        {node.name.length > 25 ? node.name.substring(0, 25) + '...' : node.name}
                                                    </text>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Glow effect for center or highlighted */}
                                                    {(node.isCenter || isOwnerHighlighted) && (
                                                        <circle
                                                            cx={node.x}
                                                            cy={node.y}
                                                            r={isOwnerHighlighted ? 16 : 20}
                                                            fill={isOwnerHighlighted ? "#f59e0b" : getNodeColor(node.risk, node.status)}
                                                            opacity="0.3"
                                                            className="animate-pulse"
                                                        />
                                                    )}

                                                    {/* Node circle */}
                                                    <circle
                                                        cx={node.x}
                                                        cy={node.y}
                                                        r={node.isCenter ? 12 : 8}
                                                        fill={getNodeColor(node.risk, node.status)}
                                                        stroke={isOwnerHighlighted ? "#f59e0b" : "#000"}
                                                        strokeWidth={isOwnerHighlighted ? 3 : 2}
                                                        className="transition-all duration-200"
                                                    />

                                                    {/* Label */}
                                                    <text
                                                        x={node.x}
                                                        y={node.y + (node.isCenter ? 25 : 18)}
                                                        textAnchor="middle"
                                                        fill={isOwnerHighlighted ? "#f59e0b" : "#9ca3af"}
                                                        fontSize="6"
                                                        fontFamily="monospace"
                                                        fontWeight={isOwnerHighlighted ? "bold" : "normal"}
                                                    >
                                                        {node.name}
                                                    </text>

                                                    {/* Risk score */}
                                                    <text
                                                        x={node.x}
                                                        y={node.y + 3}
                                                        textAnchor="middle"
                                                        fill="#000"
                                                        fontSize="6"
                                                        fontWeight="bold"
                                                        fontFamily="monospace"
                                                    >
                                                        {node.risk}
                                                    </text>
                                                </>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </TransformComponent>
                    </TransformWrapper>
                )
                }
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-3 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High Risk / Revoked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-[2px] bg-zinc-600" />
                    <span>Network Link</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0 border-t-2 border-dashed border-red-500" />
                    <span>Same Owner</span>
                </div>
                {isExpanded && (
                    <div className="hidden md:flex items-center gap-4 ml-auto text-zinc-600">
                        <span>ESC: Close</span>
                        <span>+/-: Zoom</span>
                        <span>0: Reset</span>
                    </div>
                )}
            </div>
        </motion.section >
    );
}
