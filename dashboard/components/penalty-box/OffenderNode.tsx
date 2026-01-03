import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, Scale, AlertTriangle, Skull } from 'lucide-react';

interface OffenderNodeProps {
    data: {
        label: string;
        risk: number;
        status?: string;
        amount?: number;
        title?: string;
        failure?: string;
    };
    selected?: boolean;
}

const OffenderNode = ({ data, selected }: OffenderNodeProps) => {
    const { label, risk, status, amount, title, failure } = data;

    // Determine Threat Level Visuals
    const isCritical = risk >= 90;
    const isHigh = risk >= 75 && risk < 90;

    // "Sentencing" Status
    const isRevoked = status?.includes('REVOKED') || status?.includes('DENIED');

    return (
        <div className={`
            relative group flex flex-col items-center justify-center
            transition-all duration-300 ease-out
            ${selected ? 'scale-125 z-50' : 'scale-100 z-10'}
        `}>
            {/* "Containment Field" - The Node Body */}
            <div className={`
                relative w-16 h-16 rounded-xl flex items-center justify-center
                backdrop-blur-md border-[1.5px]
                ${isCritical
                    ? 'bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : isHigh
                        ? 'bg-amber-950/80 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900/80 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                }
                ${isRevoked ? 'grayscale-[0.5]' : ''}
            `}>
                {/* Status Indicator Icon */}
                {isRevoked ? (
                    <Skull className="w-8 h-8 text-zinc-400" />
                ) : isCritical ? (
                    <Lock className="w-8 h-8 text-red-500 animate-pulse" />
                ) : isHigh ? (
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                ) : (
                    <Scale className="w-8 h-8 text-blue-400" />
                )}

                {/* Risk Badge */}
                <div className={`
                    absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                    text-[9px] font-black font-mono border
                    ${isCritical ? 'bg-red-600 border-red-400 text-white' : 'bg-black border-zinc-700 text-white'}
                `}>
                    {risk}
                </div>
            </div>

            {/* Label Plate */}
            <div className={`
                mt-2 px-2 py-0.5 rounded bg-black/80 border border-white/10
                text-[8px] font-mono tracking-wider uppercase text-center max-w-[120px] truncate
                ${selected ? 'text-white border-white/30' : 'text-zinc-500'}
            `}>
                {label}
            </div>

            {/* Expansion Details (Auto-show for high risk or selected) */}
            {(selected || risk > 80 || title) && (
                <div className="absolute top-full mt-1 flex flex-col items-center gap-1 min-w-[140px]">
                    {/* Official Title */}
                    {title && (
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 bg-black/50 px-1.5 rounded border border-white/5">
                            {title}
                        </span>
                    )}

                    {/* Key Failure Mode (The "Charge") */}
                    {failure && (
                        <span className={`
                            text-[8px] font-bold px-2 py-0.5 rounded border mb-1 whitespace-nowrap
                            ${isCritical
                                ? 'text-red-400 bg-red-950/80 border-red-900/50'
                                : 'text-amber-400 bg-amber-950/80 border-amber-900/50'}
                         `}>
                            {failure}
                        </span>
                    )}

                    {/* Financial Impact (if applicable) */}
                    {amount && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/50 px-1 rounded border border-emerald-900/30">
                            ${(amount / 1000000).toFixed(1)}M
                        </span>
                    )}
                </div>
            )}

            {/* Connection Handles (Invisible but necessary for edges) */}
            <Handle type="target" position={Position.Top} className="opacity-0" />
            <Handle type="source" position={Position.Bottom} className="opacity-0" />
        </div>
    );
};

export default memo(OffenderNode);
