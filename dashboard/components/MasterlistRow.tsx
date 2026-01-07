"use client";

import { memo } from 'react';
import { AlertTriangle, Ghost } from 'lucide-react';
import { type MasterlistEntity, type Entity } from '@/lib/schemas';

interface MasterlistRowProps {
    row: MasterlistEntity;
    index: number;
    riskScore: number;
    isFocused: boolean;
    getStatusColor: (status: string) => string;
    onSelect: (entity: Entity) => void;
    onHover: (index: number) => void;
}

function MasterlistRow({
    row,
    index,
    riskScore,
    isFocused,
    getStatusColor,
    onSelect,
    onHover
}: MasterlistRowProps) {
    const isHighRisk = riskScore > 50;
    const isGhost = row.is_ghost_office;
    const isPurged = row.status.toUpperCase().includes('REVOKED') || row.status.toUpperCase().includes('DENIED');

    const handleClick = () => {
        onSelect({
            ...row,
            id: `MN-${row.license_id}`,
            type: row.service_type || 'Unknown',
            rawStatus: row.status,
            holder: row.owner || 'Unknown',
            address: row.street || '',
            city: row.city || '',
            status: row.status,
            state_status: row.status_date ? `${row.status} as of ${row.status_date}` : row.status,
            amount_billed: 0,
            risk_score: riskScore,
            red_flag_reason: row.is_ghost_office ? ['Ghost Office Suspected'] : [],
            federal_status: 'Active',
            linked_count: 0,
            initial_effective_date: row.initial_effective_date
        });
    };

    return (
        <tr
            onClick={handleClick}
            onMouseEnter={() => onHover(index)}
            className={`
                border-b border-zinc-800/50 hover:bg-zinc-900/80 transition-all cursor-pointer group
                ${isHighRisk ? 'bg-red-950/10' : ''}
                ${isFocused ? 'bg-neon-blue/10 ring-1 ring-neon-blue/50' : ''}
                ${isPurged ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : ''}
            `}
        >
            {/* License ID */}
            <td className="p-4 font-mono text-xs text-zinc-500 group-hover:text-neon-blue transition-colors">
                MN-{row.license_id}
            </td>

            {/* Risk Score - Enhanced Display */}
            <td className="p-4">
                {(() => {
                    // Severity thresholds: 0-25 low, 26-50 medium, 51-100 high, 101+ critical
                    let severity: 'low' | 'medium' | 'high' | 'critical';
                    let bgColor: string;
                    let textColor: string;
                    let barColor: string;

                    if (riskScore >= 100) {
                        severity = 'critical';
                        bgColor = 'bg-red-950/50';
                        textColor = 'text-red-400';
                        barColor = 'bg-red-500';
                    } else if (riskScore >= 50) {
                        severity = 'high';
                        bgColor = 'bg-orange-950/50';
                        textColor = 'text-orange-400';
                        barColor = 'bg-orange-500';
                    } else if (riskScore >= 25) {
                        severity = 'medium';
                        bgColor = 'bg-yellow-950/50';
                        textColor = 'text-yellow-400';
                        barColor = 'bg-yellow-500';
                    } else {
                        severity = 'low';
                        bgColor = 'bg-zinc-800/50';
                        textColor = 'text-zinc-500';
                        barColor = 'bg-zinc-600';
                    }

                    const barWidth = Math.min(100, (riskScore / 150) * 100);

                    return (
                        <div className={`flex items-center gap-2 px-2 py-1 rounded ${bgColor}`}>
                            <div className="flex-1 min-w-[40px]">
                                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${barColor} transition-all`}
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                            </div>
                            <span className={`font-mono text-xs font-bold ${textColor}`}>
                                {riskScore}
                            </span>
                            {severity !== 'low' && (
                                <span className={`text-[8px] font-bold uppercase ${textColor} hidden lg:inline`}>
                                    {severity}
                                </span>
                            )}
                        </div>
                    );
                })()}
            </td>

            {/* Provider Name */}
            <td className="p-4 font-bold text-white relative">
                <div className="flex items-center gap-2">
                    {row.name}
                    {isGhost && <Ghost className="w-3 h-3 text-purple-400 opacity-70" />}
                </div>
                <div className="text-[10px] text-zinc-500 font-normal mt-0.5">{row.street}, {row.city} {row.zip}</div>
            </td>

            {/* Owner */}
            <td className="p-4 text-xs text-zinc-400">
                {row.owner ? row.owner : <span className="text-zinc-700 italic">Unknown</span>}
            </td>

            {/* License Status */}
            <td className="p-4">
                <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(row.status)}`}>
                    {row.status}
                </span>
            </td>

            {/* Active Age */}
            <td className="p-4 text-center">
                {row.initial_effective_date ? (
                    (() => {
                        const start = new Date(row.initial_effective_date);
                        const checkDate = new Date('2025-12-30');
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
                ) : <span className="text-zinc-700 text-[10px]">—</span>}
            </td>

            {/* Amount Billed (placeholder) */}
            <td className="p-4 text-right font-mono text-zinc-500 text-xs">
                —
            </td>
        </tr>
    );
}

export default memo(MasterlistRow);
