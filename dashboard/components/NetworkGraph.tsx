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
    onOwnerClick?: (owner: string) => void;
    filterIds?: string[];
    onClose?: () => void;
}

export default function NetworkGraph({ entities, onEntityClick, onOwnerClick, filterIds }: NetworkGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // --- TRANSFORM DATA TO GRAPH ---
    useEffect(() => {
        if (!entities || entities.length === 0) return;

        // 1. Filter Logic: Determine which entities to show
        let activeEntities: Entity[] = [];

        if (filterIds && filterIds.length > 0) {
            // SHOW MODE: Specific IDs requested (finding a network)
            // Strategy:
            // 1. Get initial targets
            // 2. Find their owners
            // 3. Find ALL entities belonging to those owners (Expand the network)
            const targets = entities.filter(e => filterIds.includes(e.id));
            const targetOwners = new Set(targets.map(t => t.owner).filter(o => o && o !== 'UNKNOWN' && o.length > 0));

            // Add all entities that share an owner with the targets
            activeEntities = entities.filter(e => filterIds.includes(e.id) || (e.owner && targetOwners.has(e.owner)));
        } else {
            // EXPLORE MODE: Show top risk clusters
            // Strategy: Show entities with high risk OR part of a large cluster
            activeEntities = [...entities]
                .sort((a, b) => b.risk_score - a.risk_score)
                .slice(0, 40); // Increased limit for better context
        }

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const validEntityIds = new Set(activeEntities.map(e => e.id));

        // 2. Group by Owner (identify clusters)
        const clusters = new Map<string, Entity[]>();
        const soloEntities: Entity[] = [];

        activeEntities.forEach(e => {
            if (e.owner && e.owner !== 'UNKNOWN' && e.owner.trim() !== '') {
                if (!clusters.has(e.owner)) clusters.set(e.owner, []);
                clusters.get(e.owner)?.push(e);
            } else {
                soloEntities.push(e);
            }
        });

        // 3. Layout Configuration
        const centerX = 800; // Visual center
        const centerY = 450;

        // --- CLUSTER LAYOUT (Hub & Spoke) ---
        // Arrange owners in a circle/grid, then their entities around them
        const clusterKeys = Array.from(clusters.keys());

        // Sort clusters by risk density (sum of child risks) to put "bad" networks in middle
        clusterKeys.sort((a, b) => {
            const riskA = clusters.get(a)?.reduce((sum, e) => sum + e.risk_score, 0) || 0;
            const riskB = clusters.get(b)?.reduce((sum, e) => sum + e.risk_score, 0) || 0;
            return riskB - riskA;
        });

        const clusterRadius = 400; // Radius for placing Owner Hubs

        clusterKeys.forEach((owner, i) => {
            const children = clusters.get(owner) || [];

            // 3a. Create OWNER HUB Node
            if (children.length > 1) {
                // Determine Hub Position (Spiral or Circle)
                const angle = (i / Math.max(1, clusterKeys.length)) * 2 * Math.PI;
                // Move inner/outer based on index to avoid perfect circle
                const r = i < 4 ? 200 : clusterRadius;

                const hubX = centerX + Math.cos(angle) * r;
                const hubY = centerY + Math.sin(angle) * r;
                const hubId = `owner-${owner.replace(/\s+/g, '-')}`;

                const avgRisk = Math.round(children.reduce((acc, c) => acc + c.risk_score, 0) / children.length);

                newNodes.push({
                    id: hubId,
                    type: 'offender', // Reusing offender node but styled as Boss
                    position: { x: hubX, y: hubY },
                    data: {
                        label: owner,
                        risk: avgRisk,
                        status: 'NETWORK HEAD',
                        amount: children.reduce((acc, c) => acc + (c.amount_billed || 0), 0),
                        title: 'NETWORK HUB',
                        title_detail: `${children.length} Linked Entities`,
                        failure: 'COMMON OWNER'
                    },
                    zIndex: 100, // Top
                });

                // 3b. Place CHILDREN around Hub
                const childRadius = 120; // Distance from hub
                children.forEach((child, j) => {
                    const childAngle = (j / children.length) * 2 * Math.PI;
                    newNodes.push({
                        id: child.id,
                        type: 'offender',
                        position: {
                            x: hubX + Math.cos(childAngle) * childRadius,
                            y: hubY + Math.sin(childAngle) * childRadius
                        },
                        data: {
                            label: child.name.substring(0, 15),
                            risk: child.risk_score,
                            status: child.status,
                            amount: child.amount_billed,
                            title: child.city,
                            failure: child.type.substring(0, 12)
                        },
                        zIndex: 50
                    });

                    // Edge: Hub -> Child
                    newEdges.push({
                        id: `e-${hubId}-${child.id}`,
                        source: hubId,
                        target: child.id,
                        animated: true,
                        style: { stroke: '#f59e0b', strokeWidth: 2, opacity: 0.6 }
                    });
                });

            } else {
                // Single entity with an owner - treat as Solo for now to avoid clutter
                // or just place specific node
                children.forEach(c => soloEntities.push(c));
            }
        });

        // 4. SOLO ENTITIES LAYOUT (Outer Ring / Scatter)
        const soloRadius = 600;
        soloEntities.forEach((entity, k) => {
            const angle = (k / Math.max(1, soloEntities.length)) * 2 * Math.PI;
            // Add some jitter
            const jitter = (k % 2 === 0 ? 50 : -50);

            newNodes.push({
                id: entity.id,
                type: 'offender',
                position: {
                    x: centerX + Math.cos(angle) * (soloRadius + jitter),
                    y: centerY + Math.sin(angle) * (soloRadius + jitter)
                },
                data: {
                    label: entity.name.substring(0, 15),
                    risk: entity.risk_score,
                    status: entity.status,
                    amount: entity.amount_billed,
                    title: entity.city,
                    failure: entity.type.substring(0, 12)
                },
                zIndex: 10
            });
        });

        // 5. Connect Solos if they match filter (artificial highlighting)
        // (Optional: skipped for now to keep graph clean)

        setNodes(newNodes);
        setEdges(newEdges);

    }, [entities, filterIds, setNodes, setEdges]);

    const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
        // Detect Owner Hub
        if (node.id.startsWith('owner-')) {
            if (onOwnerClick && node.data.label) {
                onOwnerClick(node.data.label as string);
            }
            return;
        }

        // Detect Regular Entity
        const original = entities.find(e => e.id === node.id);
        if (original) {
            onEntityClick(original);
        }
    }, [entities, onEntityClick, onOwnerClick]);

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
