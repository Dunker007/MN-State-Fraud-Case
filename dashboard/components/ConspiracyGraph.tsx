"use client";

import React from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import OffenderNode from './penalty-box/OffenderNode';

// --- CUSTOM NODE REGISTRATION ---
const nodeTypes = {
    offender: OffenderNode,
};

// --- INITIAL DATA (SMURF RULE APPLIED FOR PLACEHOLDERS) ---
// Note: Using real data where available from our existing list.
// If any placeholder needed, use "Smurf" names.

// --- INITIAL DATA (Combined Governance + DHS Org Chart) ---
const initialNodes: Node[] = [
    // --- GOVERNANCE LAYER (Top) ---
    {
        id: 'ellison',
        type: 'offender',
        position: { x: 300, y: 50 },
        data: {
            label: 'Keith Ellison',
            title: 'Attorney General',
            risk: 88,
            status: 'WARN',
            failure: 'Delayed Action'
        },
    },
    {
        id: 'walz',
        type: 'offender',
        position: { x: 750, y: 0 }, // Center Top
        data: {
            label: 'Tim Walz',
            title: 'Governor',
            risk: 95,
            status: 'ACTIVE',
            failure: 'Executive Oversight'
        },
    },
    {
        id: 'flanagan',
        type: 'offender',
        position: { x: 1200, y: 50 },
        data: {
            label: 'Peggy Flanagan',
            title: 'Lt. Governor',
            risk: 80,
            status: 'ACTIVE',
            failure: 'Complicity'
        },
    },
    {
        id: 'hortman',
        type: 'offender',
        position: { x: 1500, y: 0 },
        data: {
            label: 'Melissa Hortman',
            title: 'Assassinated DFL Leader',
            risk: 18,
            status: 'NEUTRAL',
            failure: 'Target',
            narrative: "June 2025 assassination — suspect Trump supporter. Conspiracy boosted by Trump Jan 2026."
        },
    },

    // --- DHS LEADERSHIP (Middle - The "Systems Issue" Architects) ---
    {
        id: 'dawn_davis',
        type: 'offender',
        position: { x: 750, y: 300 }, // Center Core
        data: {
            label: 'Dawn Davis',
            title: 'Deputy Inspector General',
            risk: 92,
            status: 'ACTIVE',
            failure: 'Narrative Control',
            title_detail: "Architect of 'Systems Issue' Narrative"
        },
    },
    {
        id: 'megan_thompson',
        type: 'offender',
        position: { x: 400, y: 500 }, // Left Wing
        data: {
            label: 'Megan Thompson',
            title: 'Asst. Deputy IG',
            risk: 75,
            status: 'ACTIVE',
            failure: 'Operational Blindness'
        },
    },
    {
        id: 'josh_quigley',
        type: 'offender',
        position: { x: 1100, y: 500 }, // Right Wing
        data: {
            label: 'Josh Quigley',
            title: 'Asst. Deputy IG',
            risk: 78,
            status: 'ACTIVE',
            failure: 'Systems Neglect' // NS2/Systems under him
        },
    },

    // --- CRITICAL FAILURE POINTS (Bottom) ---
    {
        id: 'compliance',
        type: 'offender',
        position: { x: 200, y: 750 },
        data: {
            label: 'Compliance Mgmt',
            title: 'Kate Bigg (Mgr)',
            risk: 85,
            status: 'CRITICAL',
            failure: 'Overwhelmed Node',
            title_detail: 'No Support Staff'
        },
    },
    {
        id: 'compliance_staff_group',
        type: 'offender',
        position: { x: 200, y: 950 },
        data: {
            label: 'Compliance Staff',
            title: 'Cluster',
            risk: 2,
            status: 'ACTIVE',
            failure: 'Standard Ops',
            title_detail: 'Benefit of Doubt'
        },
    },

    {
        id: 'payments',
        type: 'offender',
        position: { x: 600, y: 750 },
        data: {
            label: 'Payment Ctr',
            title: 'Processors',
            risk: 99,
            status: 'CRITICAL',
            amount: 250000000,
            failure: 'The Spigot'
        },
    },
    {
        id: 'payment_staff_group',
        type: 'offender',
        position: { x: 600, y: 950 },
        data: {
            label: 'Processors',
            title: 'Cluster',
            risk: 2,
            status: 'ACTIVE',
            failure: 'Orders Followed',
            title_detail: 'Benefit of Doubt'
        },
    },

    {
        id: 'research',
        type: 'offender',
        position: { x: 1300, y: 750 },
        data: {
            label: 'Research Ops',
            title: 'Jana Nicolaison',
            risk: 85,
            status: 'ILLUSION',
            failure: 'Rubber Stamp Factory'
        },
    },
    {
        id: 'research_staff_group',
        type: 'offender',
        position: { x: 1300, y: 950 },
        data: {
            label: 'Research Units',
            title: 'High Volume',
            risk: 2,
            status: 'ACTIVE',
            failure: 'Quota Driven',
            title_detail: 'Benefit of Doubt'
        },
    },
];

const initialEdges: Edge[] = [
    // Governance -> DHS
    {
        id: 'e-walz-davis',
        source: 'walz',
        target: 'dawn_davis',
        animated: true,
        label: 'Appointed / Oversaw',
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
    },
    {
        id: 'e-ellison-davis',
        source: 'ellison',
        target: 'dawn_davis',
        label: 'Investigation Scope Limit',
        style: { stroke: '#f59e0b', strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
    },
    {
        id: 'e-flanagan-davis',
        source: 'flanagan',
        target: 'dawn_davis',
        style: { stroke: '#ef4444' },
    },
    {
        id: 'e-walz-hortman',
        source: 'walz',
        target: 'hortman',
        label: 'Baseless Conspiracy Link',
        animated: true,
        style: { stroke: '#ff0000', strokeDasharray: '5,5' },
    },

    // Dawn Davis -> Deputies
    {
        id: 'e-davis-megan',
        source: 'dawn_davis',
        target: 'megan_thompson',
        type: 'smoothstep',
        style: { stroke: '#dc2626' },
    },
    {
        id: 'e-davis-josh',
        source: 'dawn_davis',
        target: 'josh_quigley',
        type: 'smoothstep',
        style: { stroke: '#dc2626' },
    },

    // Deputies -> Failure Points
    {
        id: 'e-megan-comp',
        source: 'megan_thompson',
        target: 'compliance',
        animated: true,
        label: 'Under-resourced',
        style: { stroke: '#ef4444' },
    },
    {
        id: 'e-megan-pay',
        source: 'megan_thompson',
        target: 'payments',
        animated: true,
        label: 'Unchecked Flow',
        style: { stroke: '#ef4444', strokeWidth: 2 },
    },
    {
        id: 'e-josh-res',
        source: 'josh_quigley',
        target: 'research',
        animated: true,
        label: 'High Vol/Low Qual',
        style: { stroke: '#ef4444' },
    },
    // Staff Connections (Green - Grouped)
    {
        id: 'e-comp-staff',
        source: 'compliance',
        target: 'compliance_staff_group',
        style: { stroke: '#10b981', opacity: 0.5 },
    },
    {
        id: 'e-pay-staff',
        source: 'payments',
        target: 'payment_staff_group',
        style: { stroke: '#10b981', opacity: 0.5 },
    },
    {
        id: 'e-res-staff',
        source: 'research',
        target: 'research_staff_group',
        style: { stroke: '#10b981', opacity: 0.5 },
    },
];

interface ConspiracyGraphProps {
    className?: string;
    interactive?: boolean;
}

export default function ConspiracyGraph({ className, interactive = true }: ConspiracyGraphProps) {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);
    const [activeNode, setActiveNode] = React.useState<Node | null>(null);

    const onNodeClick = React.useCallback((event: React.MouseEvent, node: Node) => {
        if (!interactive) return;
        setActiveNode(node);
    }, [interactive]);

    const closeModal = () => setActiveNode(null);

    return (
        <div className={`w-full bg-black/50 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative group ${className || 'h-[600px]'}`}>

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs font-mono text-red-400 uppercase tracking-widest">
                        Live Network Topology
                    </span>
                </div>
            </div>

            {/* MODAL OVERLAY - HORTMAN SPECIAL */}
            {activeNode?.id === 'hortman' && (
                <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg">
                        <button
                            onClick={closeModal}
                            className="absolute -top-12 right-0 text-white/50 hover:text-white px-4 py-2"
                        >
                            CLOSE [X]
                        </button>

                        {/* USER PROVIDED CONTENT */}
                        <div className="bg-black/90 p-6 rounded-xl border border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                            <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-3">
                                <span className="text-3xl">🚨</span> Conspiracy Boost — Jan 3, 2026
                            </h3>
                            <p className="text-white mb-4 leading-relaxed">
                                President Trump re-Truthed a baseless conspiracy post on Truth Social suggesting Gov. Tim Walz ordered the assassination of Rep. Melissa Hortman (June 2025 killing by Trump supporter Vance Boelter).
                            </p>
                            <p className="text-zinc-400 text-sm mb-4 border-l-2 border-red-500/30 pl-4 italic">
                                No evidence links Walz. Federal probe: Boelter acted alone, motivated by anti-Dem views. Highlights how oversight failure narrative escalates.
                            </p>
                            <div className="text-sm text-zinc-500 bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                                <p className="uppercase tracking-widest text-[10px] font-bold mb-2 text-zinc-400">Validated Sources:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                                        <a href="https://www.rawstory.com/trump-tim-walz-assassination/" target="_blank" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Raw Story: Trump Shares Conspiracy Post</a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                                        <a href="https://news.yahoo.com/trump-shares-conspiracy-post-suggesting-234000865.html" target="_blank" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Yahoo News: Trump Suggests Walz Ordered Assassination</a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                                        <span>Federal indictment: Boelter manifesto, hit list (public record).</span>
                                    </li>
                                </ul>
                            </div>
                            <p className="text-center text-cyan-400 mt-6 text-sm font-mono">
                                The real chain: $9B+ diverted while 480 warnings ignored. <br />
                                <a href="/penalty-box" className="underline hover:text-cyan-300 transition-colors">Swipe Left → Penalty Box</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#050505]"
                minZoom={0.5}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                }}
            >
                <Background color="#27272a" gap={20} size={1} />
                <Controls className="bg-zinc-800 border-zinc-700 fill-zinc-400" />
                <MiniMap
                    className="bg-zinc-900 border-zinc-800"
                    nodeColor={(n) => {
                        if (n.type === 'offender') return '#ef4444';
                        return '#fff';
                    }}
                />
            </ReactFlow>
        </div>
    );
}
