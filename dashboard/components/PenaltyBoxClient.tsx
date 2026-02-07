
"use client";

import { useState } from 'react';
import { AlertOctagon, Ban, AlertTriangle, Gavel, Skull, MapPin, Calendar, ExternalLink, LayoutGrid, Layers } from 'lucide-react';
import Link from 'next/link';
import WhistleblowerFeed from '@/components/WhistleblowerFeed';
import PenaltyBoxTriage from '@/components/PenaltyBoxTriage';
import { MasterlistEntity } from '@/lib/types';

interface PenaltyBoxClientProps {
    candidates: MasterlistEntity[];
}

export default function PenaltyBoxClient({ candidates }: PenaltyBoxClientProps) {
    const [view, setView] = useState<'gallery' | 'triage'>('gallery');

    return (
        <>
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black italic text-zinc-400 uppercase tracking-tighter flex items-center gap-2">
                    <Skull className="w-6 h-6 text-red-800" />
                    {view === 'gallery' ? 'Rogues Gallery' : 'Enforcement Triage'}
                </h2>

                <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
                    <button
                        onClick={() => setView('gallery')}
                        className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs transition-all ${view === 'gallery' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        GALLERY
                    </button>
                    <button
                        onClick={() => setView('triage')}
                        className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs transition-all ${view === 'triage' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Layers className="w-4 h-4" />
                        SWIPE TRIAGE
                    </button>
                </div>
            </div>

            {view === 'triage' ? (
                <div className="py-12">
                    <PenaltyBoxTriage candidates={candidates} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {candidates.map((entity) => {
                        const isRevoked = (entity.status || '').toUpperCase().includes('REVOKED');
                        const isDenied = (entity.status || '').toUpperCase().includes('DENIED');
                        const isSuspended = (entity.status || '').toUpperCase().includes('SUSPENDED');

                        return (
                            <div
                                key={entity.license_id}
                                className={`
                                    group relative overflow-hidden rounded-sm border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20
                                    ${isRevoked ? 'bg-red-950/20 border-red-600/50 hover:border-red-500' : ''}
                                    ${isDenied ? 'bg-orange-950/20 border-orange-600/50 hover:border-orange-500' : ''}
                                    ${isSuspended ? 'bg-yellow-950/20 border-yellow-600/50 hover:border-yellow-500' : ''}
                                    ${(!isRevoked && !isDenied && !isSuspended) ? 'bg-zinc-900/50 border-zinc-700' : ''}
                                `}
                            >
                                {/* Banner Area */}
                                <div className="h-32 bg-black/50 relative border-b border-red-900/20 flex flex-col items-center justify-center p-4">
                                    <div className="w-full h-full absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ff0000_10px,#ff0000_11px)]" />

                                    {isRevoked && <Ban className="w-16 h-16 text-red-600 opacity-80" />}
                                    {isDenied && <AlertOctagon className="w-16 h-16 text-orange-600 opacity-80" />}
                                    {isSuspended && <AlertTriangle className="w-16 h-16 text-yellow-600 opacity-80" />}

                                    {/* STAMP */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] border-4 border-current px-4 py-1 font-black text-2xl uppercase tracking-widest opacity-90 mix-blend-overlay">
                                        <span className={
                                            isRevoked ? 'text-red-500 border-red-500' :
                                                isDenied ? 'text-orange-500 border-orange-500' :
                                                    'text-yellow-500 border-yellow-500'
                                        }>
                                            {entity.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5 flex flex-col gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg md:text-xl text-white leading-tight mb-1 group-hover:text-red-400 transition-colors">
                                            {entity.name}
                                        </h3>
                                        <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                                            <span className="bg-zinc-800 px-1 rounded text-zinc-300">MN-{entity.license_id}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <Gavel className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-zinc-500 text-xs block uppercase">Owner</span>
                                                <span className="text-zinc-300 font-medium truncate block max-w-[150px]">{entity.owner || 'UNKNOWN'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-zinc-500 text-xs block uppercase">Status Date</span>
                                                <span className="text-zinc-300 font-medium font-mono">
                                                    {entity.status_date || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-zinc-500 text-xs block uppercase">Location</span>
                                                <span className="text-zinc-300 truncate block max-w-[200px]">
                                                    {entity.city}, MN
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-auto border-t border-white/5">
                                        <Link
                                            href={`/provider/${entity.license_id}`}
                                            className="flex items-center justify-between w-full px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-red-950 hover:border-red-800 rounded transition-all group/btn"
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover/btn:text-red-400">View Dossier</span>
                                            <ExternalLink className="w-3 h-3 text-zinc-600 group-hover/btn:text-red-400" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
