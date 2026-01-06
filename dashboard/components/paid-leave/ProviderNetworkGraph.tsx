"use client";

import { useState, useEffect, useRef } from 'react';
import { Share2, AlertTriangle, RefreshCw, User, Building2, MapPin, Stethoscope } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    type: 'provider' | 'person' | 'address' | 'entity';
    riskScore?: number;
    group: number;
    x?: number;
    y?: number;
}

interface Link {
    source: string;
    target: string;
    type: 'officer' | 'location' | 'referral' | 'ownership';
    strength: number;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
    stats: {
        totalNodes: number;
        totalLinks: number;
        clusters: number;
        highRiskNodes: number;
    };
}

export default function ProviderNetworkGraph() {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/analytics/network');
            if (response.ok) {
                const result = await response.json();
                processLayout(result.graph);
            }
        } catch (error) {
            console.error('Network graph fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Simple force-ish layout algorithm
    const processLayout = (graph: GraphData) => {
        const width = 600;
        const height = 400;
        const groupCenters = {
            1: { x: width * 0.25, y: height * 0.3 },
            2: { x: width * 0.75, y: height * 0.3 },
            3: { x: width * 0.5, y: height * 0.75 }
        };

        // Assign initial positions based on groups with some noise
        const processedNodes = graph.nodes.map((node, i) => {
            const center = groupCenters[node.group as keyof typeof groupCenters] || { x: width / 2, y: height / 2 };
            const angle = (i * (360 / graph.nodes.length)) * (Math.PI / 180);
            const radius = 60 + Math.random() * 40;

            return {
                ...node,
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius
            };
        });

        setData({ ...graph, nodes: processedNodes });
    };

    const getNodeColor = (type: string) => {
        switch (type) {
            case 'person': return 'fill-blue-500';
            case 'entity': return 'fill-purple-500';
            case 'address': return 'fill-amber-500';
            case 'provider': return 'fill-emerald-500';
            default: return 'fill-zinc-500';
        }
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'person': return User;
            case 'entity': return Building2;
            case 'address': return MapPin;
            case 'provider': return Stethoscope;
            default: return AlertTriangle;
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Provider Network Map
                            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded font-mono">
                                RELATIONSHIPS
                            </span>
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono">
                            Visualizing entity clusters & hidden links
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Graph Visualization */}
            <div className="flex-1 relative bg-zinc-950/50">
                {data ? (
                    <svg
                        ref={svgRef}
                        className="w-full h-full"
                        viewBox="0 0 600 400"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        {/* Links */}
                        {data.links.map((link, i) => {
                            const sourceNode = data.nodes.find(n => n.id === link.source);
                            const targetNode = data.nodes.find(n => n.id === link.target);

                            if (!sourceNode?.x || !targetNode?.x) return null;

                            return (
                                <line
                                    key={`link-${i}`}
                                    x1={sourceNode.x}
                                    y1={sourceNode.y}
                                    x2={targetNode.x}
                                    y2={targetNode.y}
                                    stroke={link.type === 'ownership' ? '#ef4444' : '#52525b'}
                                    strokeWidth={link.strength * 2}
                                    strokeOpacity={0.4}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {data.nodes.map((node) => {
                            if (!node.x || !node.y) return null;
                            const isHighRisk = (node.riskScore || 0) > 70;
                            const Icon = getNodeIcon(node.type);

                            return (
                                <g
                                    key={node.id}
                                    transform={`translate(${node.x},${node.y})`}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    {/* Halo for high risk */}
                                    {isHighRisk && (
                                        <circle
                                            r="18"
                                            className="fill-red-500/20 animate-pulse"
                                        />
                                    )}

                                    {/* Node Circle */}
                                    <circle
                                        r="12"
                                        className={`${getNodeColor(node.type)}`}
                                    />

                                    {/* Icon (Simplified as text for SVG or foreignObject if needed, using simple circle color for now) */}

                                    {/* Label on hover */}
                                    {hoveredNode?.id === node.id && (
                                        <foreignObject x="15" y="-10" width="150" height="100" className="overflow-visible pointer-events-none z-50">
                                            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-xl text-xs">
                                                <div className="font-bold text-white mb-1">{node.label}</div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-zinc-400 capitalize">{node.type}</span>
                                                    {(node.riskScore || 0) > 0 && (
                                                        <span className={`font-mono font-bold ${(node.riskScore || 0) > 70 ? 'text-red-500' : 'text-amber-500'}`}>
                                                            RISK: {node.riskScore}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                        Loading network data...
                    </div>
                )}

                {/* Stats Overlay */}
                {data && (
                    <div className="absolute bottom-4 left-4 flex gap-4 pointer-events-none">
                        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400">
                            {data.stats.totalNodes} NODES
                        </div>
                        <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-400">
                            {data.stats.clusters} CLUSTERS
                        </div>
                        <div className="bg-red-900/50 backdrop-blur border border-red-800 rounded px-2 py-1 text-[10px] text-red-400 font-bold">
                            {data.stats.highRiskNodes} HIGH RISK
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded p-2 text-[10px] space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-zinc-400">Person</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-zinc-400">Entity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-zinc-400">Address</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-zinc-400">Provider</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
