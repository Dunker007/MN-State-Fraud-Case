"use client";

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { evidenceData } from '@/lib/data';

// --- CUSTOM NODES could be defined here or imported if complex ---

export default function PenaltyBox() {
    // 1. DATA PROCESSING: Filter High Risk Entites from Simulated Evidence + Masterlist
    // We want a "Penalty Box" of the worst offenders. 
    // Let's take the forensicReport entities (which are the 61 curated ones) as they are the "Active Investigation" targets.
    // Plus maybe the top 20 from Masterlist by risk score to fill it out.

    const nodes: Node[] = useMemo(() => {
        // A. Curated Targets (High Fidelity)
        const curatedNodes = evidenceData.entities.map((entity, index) => {
            // Fix: risk_score is likely a number in the schema, but if string handle it. 
            // Checking schema, it's often number, but if mocked as string "95%", we handle it.
            // But usually evidenceData.entities comes from schema where it is number.
            // Let's assume it might be number or string.
            const rawRisk = entity.risk_score as number | string;
            const riskScore = typeof rawRisk === 'string' ? parseInt(rawRisk.replace('%', '')) : rawRisk;

            // Layout Concept: Spiral or Random placement for now
            const angle = (index / evidenceData.entities.length) * 2 * Math.PI;
            const radius = 200 + (Math.random() * 100);

            return {
                id: entity.id,
                position: {
                    x: 400 + Math.cos(angle) * (radius * (index % 2 === 0 ? 1 : 1.5)),
                    y: 300 + Math.sin(angle) * (radius * (index % 2 === 0 ? 1 : 1.5))
                },
                data: { label: entity.name, risk: riskScore },
                style: {
                    background: riskScore > 90 ? '#ef4444' : riskScore > 75 ? '#f59e0b' : '#3b82f6',
                    color: '#fff',
                    border: riskScore > 90 ? '2px solid #fff' : '1px solid #777',
                    boxShadow: riskScore > 90 ? '0 0 15px #ef4444' : 'none',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    textAlign: 'center' as const,
                },
            };
        });

        // B. Center Node: The Audit / CrossCheck Logic
        const centerNode = {
            id: 'crosscheck-core',
            position: { x: 400, y: 300 },
            data: { label: 'CROSSCHECK CORE' },
            style: {
                background: '#000',
                color: '#fff',
                border: '2px solid #a855f7',
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                zIndex: 10,
                boxShadow: '0 0 30px #a855f7'
            }
        };

        return [centerNode, ...curatedNodes];
    }, []);

    const edges: Edge[] = useMemo(() => {
        // Connect everyone to the core for visual anchor
        return nodes.filter(n => n.id !== 'crosscheck-core').map(n => ({
            id: `e-core-${n.id}`,
            source: 'crosscheck-core',
            target: n.id,
            animated: true,
            style: { stroke: '#ffffff20' }
        }));
    }, [nodes]);

    return (
        <div className="w-full h-[600px] border border-white/10 rounded-xl bg-black/40 overflow-hidden relative group backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent z-10"></div>

            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h2 className="text-xl font-black italic tracking-tighter text-white">
                    <span className="text-red-600 mr-2">///</span>
                    PENALTY BOX
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    ACTIVE_TARGET_CLUSTERS
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                colorMode="dark"
                fitView
                attributionPosition="bottom-right"
                className="font-mono"
            >
                <Background color="#333" gap={30} size={1} variant={BackgroundVariant.Dots} />
                <Controls className="bg-black/50 border border-white/10 fill-white !text-zinc-400" />
            </ReactFlow>

            {/* Footer Overlay - Legend */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-black/60 p-2 rounded border border-white/5 backdrop-blur-md">
                <div className="flex gap-4 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-600 rounded-full border border-red-500/50 shadow-[0_0_5px_#ef4444]"></span> CRITICAL (&gt;90)</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-600 rounded-full border border-amber-500/50"></span> SUSPICIOUS (&gt;75)</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-600 rounded-full border border-purple-500/50 shadow-[0_0_10px_#a855f7]"></span> CORE LOGIC</div>
                </div>
            </div>
        </div>
    );
}
