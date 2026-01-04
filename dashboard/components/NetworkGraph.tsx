import React, { useEffect, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,

    NodeMouseHandler
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Entity } from '@/lib/schemas';
import OffenderNode from './penalty-box/OffenderNode';

// Reuse the offender node for consistency
const nodeTypes = {
    offender: OffenderNode,
};

interface NetworkGraphProps {
    entities: Entity[];
    onEntityClick: (entity: Entity) => void;
    filterIds?: string[];
    onClose?: () => void;
}

export default function NetworkGraph({ entities, onEntityClick, filterIds }: NetworkGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // --- TRANSFORM DATA TO GRAPH ---
    useEffect(() => {
        if (!entities || entities.length === 0) return;

        // 1. Filter / Select Nodes
        // If filterIds provided, use those + their connections.
        // Otherwise, use top high-risk entities.
        let activeEntities = entities;

        if (filterIds && filterIds.length > 0) {
            activeEntities = entities.filter(e => filterIds.includes(e.id));
        } else {
            // Default: Top 25 Riskiest to prevent UI lag
            activeEntities = [...entities]
                .sort((a, b) => b.risk_score - a.risk_score)
                .slice(0, 25);
        }

        // 2. Generate Nodes (Spiderweb Layout)
        // 2. Generate Nodes (Determinstic Concentric Rings - No Overlap)
        // Canvas Center (Full Width ~ 1600px, so 800 is safer center)
        const centerX = 800;
        const centerY = 450; // Visual center for 900px height

        // Split into tiers
        const tier1 = activeEntities.filter(e => e.risk_score >= 90); // Inner Core
        const tier2 = activeEntities.filter(e => e.risk_score >= 50 && e.risk_score < 90); // Mid Ring
        const tier3 = activeEntities.filter(e => e.risk_score < 50); // Outer Ring

        const getPosition = (tierIndex: number, totalInTier: number, baseRadius: number) => {
            const angle = (tierIndex / totalInTier) * 2 * Math.PI; // Equidistant
            return {
                x: centerX + baseRadius * Math.cos(angle - Math.PI / 2), // Start from top
                y: centerY + baseRadius * Math.sin(angle - Math.PI / 2)
            };
        };

        const newNodes: Node[] = [];

        // RING 1: Critical Threats (Inner) - EXPANDED
        tier1.forEach((entity, i) => {
            const pos = getPosition(i, tier1.length, 250); // Radius 250
            newNodes.push({
                id: entity.id,
                type: 'offender',
                position: pos,
                data: {
                    label: entity.name.substring(0, 15),
                    risk: entity.risk_score,
                    status: entity.status,
                    amount: entity.amount_billed,
                    failure: 'CRITICAL',
                    title: entity.city, // Forces expansion
                    title_detail: 'Flagged by Fed Prosecutor'
                },
                zIndex: 50 // On top
            });
        });

        // RING 2: Suspicious (Mid) - COMPACT
        tier2.forEach((entity, i) => {
            const pos = getPosition(i, tier2.length, 450); // Radius 450
            newNodes.push({
                id: entity.id,
                type: 'offender',
                position: pos,
                data: {
                    label: entity.name.substring(0, 15),
                    risk: entity.risk_score,
                    status: entity.status,
                    amount: entity.amount_billed,
                    failure: entity.type.substring(0, 10),
                    // No title = No expansion (unless selected)
                },
                zIndex: 30
            });
        });

        // RING 3: Peripherals (Outer) - COMPACT
        tier3.forEach((entity, i) => {
            const pos = getPosition(i, tier3.length, 650); // Radius 650
            newNodes.push({
                id: entity.id,
                type: 'offender',
                position: pos,
                data: {
                    label: entity.name.substring(0, 15),
                    risk: entity.risk_score,
                    status: entity.status,
                    amount: entity.amount_billed,
                    failure: 'Linked',
                    // No title = No expansion
                },
                zIndex: 10
            });
        });

        // 3. Generate Edges (Shared Networks)
        const newEdges: Edge[] = [];

        // Connect Tier 2/3 to nearest Tier 1 (Hub & Spoke Simulation)
        if (tier1.length > 0) {
            [...tier2, ...tier3].forEach((entity, i) => {
                // Connect to a random Tier 1 node to simulate "Hub"
                // In reality, we would check network_ids
                const targetHub = tier1[i % tier1.length];
                newEdges.push({
                    id: `e-${targetHub.id}-${entity.id}`,
                    source: targetHub.id,
                    target: entity.id,
                    style: { stroke: '#ef4444', opacity: 0.2 },
                })
            });
        }

        setNodes(newNodes);
        setEdges(newEdges);

    }, [entities, filterIds, setNodes, setEdges]);

    const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
        // Find original entity
        const original = entities.find(e => e.id === node.id);
        if (original) {
            onEntityClick(original);
        }
    }, [entities, onEntityClick]);

    return (
        <div className="w-full h-[900px] bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative group">
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                        Live Entity Spiderweb
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">
                        Displaying {nodes.length} Targets
                    </span>
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onNodeClick={handleNodeClick}
                fitView
                className="bg-[#050505]"
                minZoom={0.5}
                maxZoom={2}
            >
                <Background color="#18181b" gap={20} size={1} />
                <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-400" />
                <MiniMap
                    className="bg-zinc-900 border-zinc-800"
                    nodeColor={() => '#ef4444'}
                />
            </ReactFlow>
        </div>
    );
}
