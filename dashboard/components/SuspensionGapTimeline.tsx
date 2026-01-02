"use client";

import { AlertTriangle, EyeOff, Calendar, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { gapAnalysis } from '@/lib/gap_data';

interface SuspensionGapTimelineProps {
    selectedDay: number;
    setSelectedDay: (day: number) => void;
}

export default function SuspensionGapTimeline({ selectedDay, setSelectedDay }: SuspensionGapTimelineProps) {
    const currentData = gapAnalysis.daily_data[selectedDay];

    return (
        <section className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <EyeOff className="w-6 h-6 text-neon-red" />
                    <div>
                        <h2 className="text-xl font-bold text-white font-mono uppercase">
                            The Data Gap // Silence Period
                        </h2>
                        <p className="text-xs text-zinc-500 font-mono">
                            Oct 9, 2024 — Dec 12, 2024 (64 Days)
                        </p>
                    </div>
                </div>

                <div className="bg-black/40 border border-zinc-800 p-6 rounded-lg mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-zinc-700 via-red-900/50 to-zinc-700 -z-10" />

                        {/* Start Node */}
                        <div className="relative text-center w-full md:w-auto">
                            <div className="w-4 h-4 rounded-full bg-zinc-600 border-4 border-black mx-auto mb-2" />
                            <div className="text-xs text-zinc-500 font-mono mb-1">OCT 9, 2024</div>
                            <div className="text-sm font-bold text-white bg-zinc-900/80 px-2 py-1 rounded inline-block">
                                Secret Suspension
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2 max-w-[150px] mx-auto">
                                DHS internally halts payments to 14 entities. No public notice.
                            </p>
                        </div>

                        {/* Middle - The Gap */}
                        <div className="flex-1 bg-red-950/20 border-x border-dashed border-red-900/30 h-24 flex items-center justify-center rounded relative w-full md:w-auto my-4 md:my-0">
                            <div className="text-center">
                                <div className="text-2xl font-black text-neon-red font-mono animate-pulse">
                                    64 DAYS
                                </div>
                                <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold">
                                    Public Blindspot
                                </div>
                            </div>
                        </div>

                        {/* End Node */}
                        <div className="relative text-center w-full md:w-auto">
                            <div className="w-4 h-4 rounded-full bg-neon-green border-4 border-black mx-auto mb-2" />
                            <div className="text-xs text-zinc-500 font-mono mb-1">DEC 12, 2024</div>
                            <div className="text-sm font-bold text-white bg-zinc-900/80 px-2 py-1 rounded inline-block">
                                Public Announcement
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2 max-w-[150px] mx-auto">
                                AG announces indictments. Statuses finally update to Suspended.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-amber-900/10 border border-amber-900/20 p-4 rounded flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-500 mb-1">Operational Anomaly</h4>
                            <p className="text-xs text-amber-200/70 leading-relaxed">
                                During this 64-day window, entities retained Active status in the public database, potentially allowing them to engage with other lenders or parents unaware of the pending action.
                            </p>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded">
                        <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase">Evidence Log</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-zinc-500 border-b border-zinc-800/50 pb-1">
                                <span>14 Entities Marked &apos;Suspended&apos; (Internal)</span>
                                <span className="font-mono">Oct 09</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500 border-b border-zinc-800/50 pb-1">
                                <span>Zero Public Notifications Issued</span>
                                <span className="font-mono">Oct-Nov</span>
                            </div>
                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>Mass Status Update Batch</span>
                                <span className="font-mono">Dec 12</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Day Detail View */}
                <div className="bg-black/50 border border-zinc-800 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-zinc-800">
                        <div className="text-3xl font-black text-white font-mono opacity-20">
                            DAY {currentData.day_number}
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-white">{currentData.date}</div>
                            <div className={`text-[10px] font-mono border px-1 rounded inline-block mt-1 ${currentData.public_knew ? 'border-neon-blue text-neon-blue' : 'border-red-500 text-red-500'}`}>
                                {currentData.public_knew ? 'PUBLIC AWARE' : 'PUBLIC BLIND'}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Event Title */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 leading-tight">
                                {currentData.event_title || 'Standard Operation'}
                            </h3>
                            {currentData.event_type === 'SILENCE' && (
                                <p className="text-sm text-zinc-400 italic">
                                    Business as usual. No warnings issued.
                                </p>
                            )}
                        </div>

                        {/* Key Details */}
                        <div>
                            <h4 className="text-xs text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Daily Log
                            </h4>
                            <ul className="space-y-2">
                                {currentData.key_details.map((detail, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-zinc-300">
                                        <div className="w-1 h-1 rounded-full bg-zinc-500 mt-1.5 flex-shrink-0" />
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Stats */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Entities Active</span>
                                <span className="text-white font-mono">{currentData.entities_still_active}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">Daily Volume (Est)</span>
                                <span className="text-white font-mono">${currentData.estimated_daily_transactions.toLocaleString()}</span>
                            </div>
                            {currentData.children_in_affected_programs && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-500">Children at Risk</span>
                                    <span className="text-amber-500 font-mono">{currentData.children_in_affected_programs}</span>
                                </div>
                            )}
                        </div>

                        {/* Reality vs Public */}
                        <div className="bg-amber-900/10 border border-amber-900/30 p-3 rounded">
                            <h4 className="text-xs text-amber-500 font-bold uppercase mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3" />
                                Reality vs Public View
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <div className="text-[9px] text-zinc-500 mb-1">PUBLIC SAW</div>
                                    <div className="text-green-500 font-bold bg-green-950/30 px-2 py-1 rounded text-center">
                                        ACTIVE
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-zinc-500 mb-1">REALITY</div>
                                    <div className="text-red-500 font-bold bg-red-950/30 px-2 py-1 rounded text-center">
                                        {currentData.event_type === 'SUSPENSION' || currentData.day_number > 0 ? 'SUSPENDED' : 'ACTIVE'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                            <button
                                onClick={() => setSelectedDay(Math.max(0, selectedDay - 1))}
                                disabled={selectedDay === 0}
                                className="p-2 hover:bg-zinc-800 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <div className="text-xs font-mono text-zinc-500">
                                {selectedDay + 1} / 64
                            </div>
                            <button
                                onClick={() => setSelectedDay(Math.min(63, selectedDay + 1))}
                                disabled={selectedDay === 63}
                                className="p-2 hover:bg-zinc-800 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
