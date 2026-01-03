"use client";

import { useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Node, Edge, useNodesState, useEdgesState, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PlayerCardNode from './penalty-box/PlayerCardNode';

// Define Custom Node Types
const nodeTypes = {
    playerCard: PlayerCardNode,
};

function PenaltyBoxContent() {
    // State for React Flow
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    // Officials Data "The Lineup"
    const officials = useMemo(() => [
        { id: 'oz-walz', name: 'GOV. TIM WALZ', title: 'Governor', risk: 99, failure: 'Executive Oversight Failure', pos: { x: 0, y: 0 } },
        { id: 'oz-ellison', name: 'AG KEITH ELLISON', title: 'Attorney General', risk: 95, failure: 'Prosecutorial Delay', pos: { x: -250, y: -200 } },
        { id: 'oz-harpstead', name: 'JODI HARPSTEAD', title: 'DHS Commissioner', risk: 92, failure: 'Systemic Control Collapse', pos: { x: 250, y: -200 } },
        { id: 'oz-moti', name: 'KULANI MOTI', title: 'DHS Inspector General', risk: 88, failure: 'Audit Mechanism Failure', pos: { x: -250, y: 200 } },
        { id: 'oz-varilek', name: 'MATT VARILEK', title: 'DEED Commissioner', risk: 85, failure: 'Grant Oversight Gaps', pos: { x: 250, y: 200 } },
        { id: 'oz-evans', name: 'JUDY EVANS', title: 'Fraud Unit Chief', risk: 82, failure: 'Investigation Bottleneck', pos: { x: 0, y: 350 } },
        { id: 'oz-ola', name: 'OLA OFFICE', title: 'Legislative Audit', risk: 75, failure: 'Delayed Report Release', pos: { x: 0, y: -350 } },
    ], []);

    useEffect(() => {
        // Map Officials to React Flow Nodes
        const flowNodes: Node[] = officials.map((official) => ({
            id: official.id,
            type: 'playerCard',
            position: official.pos,
            data: {
                label: official.name,
                title: official.title,
                failure: official.failure,
                risk: official.risk,
            },
        }));

        // Create "Passing Lanes"
        const flowEdges: Edge[] = officials
            .filter(o => o.id !== 'oz-walz')
            .map((o) => ({
                id: `pass-${o.id}`,
                source: 'oz-walz',
                target: o.id,
                animated: true,
                style: {
                    stroke: 'white',
                    strokeWidth: 2,
                    strokeDasharray: '5,5',
                    opacity: 0.3
                }
            }));

        setNodes(flowNodes);
        setEdges(flowEdges);

    }, [officials, setNodes, setEdges]);

    return (
        <section className="relative w-full h-[800px] border border-white/10 rounded-xl bg-black overflow-hidden shadow-2xl flex flex-col group">
            {/* Video Hero Background */}
            <video
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 mix-blend-screen"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/assets/videos/penalty-hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay + Title (Bottom Left as requested) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-0 pointer-events-none"></div>

            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white z-20 pointer-events-none">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight glitch-effect">
                    The Penalty Box
                </h1>
                <p className="text-2xl md:text-4xl mt-2 opacity-90 text-red-500 font-mono">
                    Chain of Failure
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mt-4">
                    <span className="px-2 py-0.5 bg-blue-950/50 border border-blue-500/30 text-blue-400 rounded font-bold uppercase">
                        ACTIVE ROSTER: {officials.length}
                    </span>
                </div>
            </div>

            {/* Desktop View: The Rink Graph (Z-10) */}
            <div className="hidden md:block flex-1 relative z-10">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    colorMode="dark"
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    className="font-mono"
                    translateExtent={[[-1000, -1000], [1000, 1000]]}
                >
                    <Controls className="bg-black/50 border border-white/10 fill-white !text-zinc-400" />
                </ReactFlow>
            </div>

            {/* Mobile View: Stacked Cards (Z-10) */}
            <div className="md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-transparent relative z-10">
                {officials.map(official => (
                    <div key={official.id} className="transform scale-90 origin-top-left">
                        <PlayerCardNode
                            data={{
                                label: official.name,
                                title: official.title,
                                failure: official.failure,
                                risk: official.risk
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Mobile Play Button (optional from snippet, visual only as autoplay is on) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 md:hidden pointer-events-none">
                <button className="text-white text-6xl">▶</button>
            </div>

        </section>
    );
}

// Wrap with Provider to prevent context errors
export default function PenaltyBox() {
    return (
        <ReactFlowProvider>
            <PenaltyBoxContent />
        </ReactFlowProvider>
    );
}
