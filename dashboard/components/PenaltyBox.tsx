"use client";

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PENALTY_NODES, PENALTY_EDGES } from '@/lib/penalty-data';

export default function PenaltyBox() {
    const nodes = useMemo(() => PENALTY_NODES, []);
    const edges = useMemo(() => PENALTY_EDGES, []);

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
                    LIVE_RELATIONSHIP_MATRIX
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
                <Background color="#333" gap={30} size={1} variant={'dots' as any} />
                <Controls className="bg-black/50 border border-white/10 fill-white !text-zinc-400" />
                <MiniMap
                    nodeStrokeColor={(n) => {
                        if (n.style?.background) return n.style.background as string;
                        if (n.type === 'input') return '#EF4444';
                        if (n.type === 'output') return '#F59E0B';
                        return '#eee';
                    }}
                    nodeColor={(n) => {
                        if (n.style?.background) return n.style.background as string;
                        return '#333';
                    }}
                    className="!bg-black/80 !border-white/10"
                    maskColor="rgba(0, 0, 0, 0.6)"
                />
            </ReactFlow>

            {/* Footer Overlay - Legend */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none bg-black/60 p-2 rounded border border-white/5 backdrop-blur-md">
                <div className="flex gap-4 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-600 rounded-sm border border-red-500/50"></span> TARGET</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-600 rounded-sm border border-emerald-500/50"></span> FLOW</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-600 rounded-sm border border-amber-500/50"></span> MECH</div>
                </div>
            </div>
        </div>
    );
}
