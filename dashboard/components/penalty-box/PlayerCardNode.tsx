import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, AlertTriangle } from 'lucide-react';

interface PlayerCardProps {
    data: {
        label: string; // Name
        title: string;
        failure: string;
        risk: number;
        status?: string;
    };
    selected?: boolean;
}

const PlayerCardNode = ({ data, selected }: PlayerCardProps) => {
    const { label, title, failure, risk } = data;

    // Visual Logic
    const isCritical = risk >= 90;

    return (
        <div className={`
            relative w-[220px] bg-[#0a0a0a] rounded-lg overflow-hidden
            transition-all duration-300 group
            ${selected
                ? 'ring-2 ring-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110 z-50'
                : 'ring-1 ring-white/10 hover:ring-white/30 hover:scale-105 z-10'
            }
        `}>
            {/* Header / "Jersey" Bar */}
            <div className={`
                h-1.5 w-full
                ${isCritical ? 'bg-red-600 shadow-[0_0_10px_#ef4444]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}
            `} />

            <div className="p-3 space-y-2">
                {/* Top Row: Icon + Risk Score */}
                <div className="flex justify-between items-start">
                    <div className={`
                        p-1.5 rounded-md border
                        ${isCritical ? 'bg-red-950/30 border-red-900/50 text-red-500' : 'bg-amber-950/30 border-amber-900/50 text-amber-500'}
                    `}>
                        {isCritical ? <Lock size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">RISK</span>
                        <span className={`text-xl font-black font-mono leading-none ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                            {risk}
                        </span>
                    </div>
                </div>

                {/* Name & Title */}
                <div>
                    <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-0.5 opacity-80">
                        {title}
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase leading-tight tracking-tight">
                        {label}
                    </h3>
                </div>

                {/* "The Charge" / Failure Mode */}
                <div className={`
                    mt-2 py-1.5 px-2 rounded border border-dashed
                    ${isCritical ? 'bg-red-950/10 border-red-900/30' : 'bg-amber-950/10 border-amber-900/30'}
                `}>
                    <div className="text-[8px] text-zinc-500 font-mono uppercase mb-0.5">Primary Failure</div>
                    <div className={`
                        text-[10px] font-semibold leading-snug
                        ${isCritical ? 'text-red-400' : 'text-amber-400'}
                    `}>
                        {failure}
                    </div>
                </div>
            </div>

            {/* Decorative "Ice" Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none opacity-50" />

            {/* Handles */}
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
            <Handle type="source" position={Position.Left} className="opacity-0" />
            <Handle type="target" position={Position.Right} className="opacity-0" />
        </div>
    );
};

export default memo(PlayerCardNode);
