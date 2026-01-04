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
        title_detail?: string;
        failure?: string;
        narrative?: string; // Long-form description (e.g. conspiracy details)
    };
    selected?: boolean;
}

const OffenderNode = ({ data, selected }: OffenderNodeProps) => {
    const { label, risk, status, amount, title, title_detail, failure, narrative } = data;

    // Determine Threat Level Visuals
    const isCritical = risk >= 75; // Red: Serious Allegations
    const isMedium = risk >= 10 && risk < 75; // Amber: Supervisor / Caution
    const isSafe = risk < 10; // Green: Benefit of the Doubt

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
                    : isMedium
                        ? 'bg-amber-950/80 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                }
                ${isRevoked ? 'grayscale-[0.5]' : ''}
            `}>
                {/* Status Indicator Icon */}
                {isRevoked ? (
                    <Skull className="w-8 h-8 text-zinc-400" />
                ) : isCritical ? (
                    <Lock className="w-8 h-8 text-red-500 animate-pulse" />
                ) : isMedium ? (
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                ) : (
                    <Scale className="w-8 h-8 text-emerald-400" />
                )}

                {/* Risk Badge */}
                <div className={`
                    absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                    text-[9px] font-black font-mono border
                    ${isCritical ? 'bg-red-600 border-red-400 text-white' :
                        isMedium ? 'bg-amber-600 border-amber-400 text-black' :
                            'bg-emerald-600 border-emerald-400 text-white'}
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

            {/* Expansion Details (Auto-show for high risk, selected, or if narrative specific hover) */}
            {(selected || risk > 80 || title) && (
                <div className="absolute top-full mt-1 flex flex-col items-center gap-1 min-w-[140px] z-50">
                    {/* Official Title */}
                    {title && (
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 bg-black/50 px-1.5 rounded border border-white/5">
                            {title}
                        </span>
                    )}

                    {/* Extra Detail (e.g. Narrative Architect) */}
                    {title_detail && (
                        <span className="text-[7px] italic text-zinc-400 bg-black/30 px-1 rounded max-w-[150px] text-center">
                            {title_detail}
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

                    {/* Narrative Description (New Feature) */}
                    {narrative && (
                        <div className="mt-2 p-2 bg-zinc-900 border border-red-500/30 rounded text-center w-[200px] shadow-xl">
                            <p className="text-[9px] text-zinc-300 leading-tight">
                                {narrative}
                            </p>
                        </div>
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
