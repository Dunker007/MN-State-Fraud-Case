"use client";

import { memo } from 'react';
import { AlertTriangle, CheckCircle, Share2, CheckSquare, Square } from 'lucide-react';
import { type Entity } from '@/lib/schemas';

interface RiskTableRowProps {
    row: Entity;
    index: number;
    isSelected: boolean;
    isFocused: boolean;
    onSelect: (id: string, e: React.MouseEvent) => void;
    onClick: (entity: Entity) => void;
    onHover: (index: number) => void;
}

function RiskTableRow({
    row,
    index,
    isSelected,
    isFocused,
    onSelect,
    onClick,
    onHover
}: RiskTableRowProps) {
    const isPurged = row.status === "PURGED" || row.status === "REVOKED" || row.status.includes("DENIED");
    const isIndicted = row.federal_status === "INDICTED";

    return (
        <tr
            onClick={() => onClick(row)}
            onMouseEnter={() => onHover(index)}
            className={`
                border-b border-zinc-800/50 hover:bg-zinc-900/80 transition-all cursor-pointer group
                ${isSelected ? 'bg-blue-900/20' : ''}
                ${isFocused ? 'bg-neon-blue/10 ring-1 ring-neon-blue/50' : ''}
                ${isPurged ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}
                ${isIndicted ? 'bg-red-950/10' : ''}
            `}
        >
            {/* Checkbox */}
            <td className="p-4 bg-transparent">
                <button onClick={(e) => onSelect(row.id, e)} className="text-zinc-500 hover:text-white transition-colors">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-neon-blue" /> : <Square className="w-4 h-4" />}
                </button>
            </td>

            {/* ID */}
            <td className="p-4 text-zinc-500 font-mono text-xs group-hover:text-neon-blue transition-colors border-r border-zinc-800/20">
                {row.id}
            </td>

            {/* Red Flags */}
            <td className="p-4">
                {row.risk_score > 0 ? (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${row.risk_score > 100 ? 'text-neon-red animate-pulse' : 'text-amber-500'}`} />
                        <span className="text-[10px] text-zinc-600 hidden group-hover:inline">
                            {row.red_flag_reason?.[0]}
                        </span>
                    </div>
                ) : (
                    <CheckCircle className="w-4 h-4 text-green-900" />
                )}
            </td>

            {/* Risk Score */}
            <td className="p-4 font-bold">
                <span className={`${row.risk_score > 100 ? 'text-neon-red' : row.risk_score > 50 ? 'text-amber-500' : 'text-zinc-600'}`}>
                    {row.risk_score}
                </span>
            </td>

            {/* Entity / Location */}
            <td className="p-4 font-medium text-white group-hover:text-neon-blue transition-colors relative">
                <div>{row.name}</div>
                <div className="text-[10px] text-zinc-600 font-normal mt-0.5">{row.address}, {row.city}</div>
                {isIndicted && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </td>

            {/* Network / Owner */}
            <td className="p-4 text-zinc-400 text-xs border-l border-zinc-800/20">
                <div className="flex flex-col">
                    <span className="truncate max-w-[120px]" title={row.owner}>{row.owner}</span>
                    {row.linked_count > 1 && (
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1 mt-1">
                            <Share2 className="w-3 h-3" />
                            {row.linked_count} LINKS
                        </span>
                    )}
                </div>
            </td>

            {/* Federal Status */}
            <td className="p-4">
                {row.federal_status === "INDICTED" ? (
                    <span className="bg-red-950 text-red-500 text-[10px] font-bold px-2 py-1 border border-red-900 animate-pulse">
                        INDICTED
                    </span>
                ) : (
                    <span className="text-zinc-700 text-[10px]">—</span>
                )}
            </td>

            {/* State Status */}
            <td className="p-4">
                <span className={`text-[10px] px-2 py-0.5 rounded ${isPurged
                    ? 'text-red-400 bg-red-950/20 border border-red-900/30'
                    : 'text-green-600 bg-green-950/10 border border-green-900/30'
                    }`}>
                    {row.status}
                </span>
            </td>

            {/* Active Age */}
            <td className="p-4 text-center">
                {row.initial_effective_date ? (
                    (() => {
                        const start = new Date(row.initial_effective_date);
                        const checkDate = new Date("2025-12-30");
                        const days = Math.floor((checkDate.getTime() - start.getTime()) / (1000 * 3600 * 24));
                        const isNew = days < 45;

                        return (
                            <div className="flex flex-col items-center">
                                <span className={`font-mono font-bold text-xs ${isNew ? 'text-neon-red animate-pulse' : 'text-zinc-500'}`}>
                                    {days}d
                                </span>
                                {isNew && <span className="text-[9px] text-red-400 font-bold uppercase">VELOCITY</span>}
                            </div>
                        );
                    })()
                ) : <span className="text-zinc-700 text-[10px]">N/A</span>}
            </td>

            {/* Exposure */}
            <td className="p-4 text-right font-mono text-zinc-500 text-xs text-white">
                ${row.amount_billed.toLocaleString()}
            </td>
        </tr>
    );
}

export default memo(RiskTableRow);
