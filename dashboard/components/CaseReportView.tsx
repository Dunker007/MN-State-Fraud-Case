"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, User, Clipboard, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BoardItem {
    id: string;
    type: 'entity' | 'person' | 'pattern' | 'note' | 'custom';
    title: string;
    subtitle?: string;
    description?: string;
    color: string;
    links: Array<{ type: string; label: string; action: () => void }>;
    metadata?: Record<string, unknown>;
}

export default function CaseReportView() {
    const [boardName, setBoardName] = useState('Investigation Case File');
    const [items, setItems] = useState<BoardItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('investigation_board');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setItems(data.items || []);
                setBoardName(data.name || 'Investigation Case File');
            } catch (e) {
                console.error('Failed to load case data', e);
            }
        }
        setLoading(false);
    }, []);

    const groupedItems = {
        targets: items.filter(i => i.type === 'entity' || i.type === 'person' || i.type === 'custom'),
        evidence: items.filter(i => i.type === 'pattern' || i.type === 'note'),
    };

    if (loading) return <div className="p-8 text-zinc-500">Loading case file...</div>;

    return (
        <div className="min-h-screen bg-white text-black p-8 font-serif print:p-0">
            {/* Screen-only Controls */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href="/" className="flex items-center gap-2 text-zinc-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <div className="flex gap-4">
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Confidential Data
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-black text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        Print Case File
                    </button>
                </div>
            </div>

            {/* Application Paper */}
            <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-xl p-12 min-h-[1100px] print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <header className="border-b-4 border-black pb-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{boardName}</h1>
                            <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">Case Report # {Date.now().toString().slice(-6)}</div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block border-2 border-red-600 text-red-600 px-3 py-1 font-bold text-xs uppercase transform -rotate-2">
                                For Official Use Only
                            </div>
                            <div className="mt-2 text-xs text-zinc-500">
                                Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Executive Summary Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold bg-black text-white px-4 py-1 inline-block mb-4 uppercase">Executive Summary</h2>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        <div className="bg-zinc-50 p-4 border border-zinc-200">
                            <div className="text-xs uppercase text-zinc-500 font-bold mb-1">Items Tracked</div>
                            <div className="text-3xl font-bold">{items.length}</div>
                        </div>
                        <div className="bg-zinc-50 p-4 border border-zinc-200">
                            <div className="text-xs uppercase text-zinc-500 font-bold mb-1">Entities/Targets</div>
                            <div className="text-3xl font-bold">{groupedItems.targets.length}</div>
                        </div>
                        <div className="bg-zinc-50 p-4 border border-zinc-200">
                            <div className="text-xs uppercase text-zinc-500 font-bold mb-1">Evidence/Patterns</div>
                            <div className="text-3xl font-bold">{groupedItems.evidence.length}</div>
                        </div>
                    </div>
                    <p className="text-zinc-700 leading-relaxed border-l-4 border-zinc-300 pl-4 italic">
                        This report contains aggregated intelligence regarding detected fraud patterns, entity relationships, and risk indicators.
                        The information below is compiled from the MnFraud investigation dashboard and should be treated as sensitive intelligence.
                    </p>
                </section>

                {/* Targets Section */}
                {groupedItems.targets.length > 0 && (
                    <section className="mb-10 page-break-inside-avoid">
                        <h2 className="text-xl font-bold bg-zinc-800 text-white px-4 py-1 inline-block mb-6 uppercase">Primary Targets & Entities</h2>
                        <div className="space-y-4">
                            {groupedItems.targets.map(item => (
                                <div key={item.id} className="border border-zinc-300 p-4 flex gap-4">
                                    <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center border border-zinc-200 flex-shrink-0">
                                        {item.type === 'person' ? <User className="w-6 h-6 text-zinc-400" /> : <Shield className="w-6 h-6 text-zinc-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <span className="text-xs font-mono bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{item.type.toUpperCase()}</span>
                                        </div>
                                        {item.subtitle && <div className="text-sm font-bold text-zinc-600 mb-1">{item.subtitle}</div>}
                                        {item.description && <div className="text-sm text-zinc-800 leading-relaxed">{item.description}</div>}

                                        {/* Metadata Table */}
                                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                                            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-zinc-50 p-2 border border-zinc-100">
                                                {Object.entries(item.metadata).map(([k, v]) => (
                                                    <div key={k} className="flex">
                                                        <span className="font-bold text-zinc-500 w-24 capitalize">{k.replace('_', ' ')}:</span>
                                                        <span className="truncate flex-1">{String(v)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Evidence & Notes Section */}
                {groupedItems.evidence.length > 0 && (
                    <section className="mb-10 page-break-inside-avoid">
                        <h2 className="text-xl font-bold bg-zinc-800 text-white px-4 py-1 inline-block mb-6 uppercase">Evidence, Patterns & Notes</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {groupedItems.evidence.map(item => (
                                <div key={item.id} className="border-l-4 border-zinc-800 pl-4 py-2">
                                    <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                        {item.type === 'pattern' ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clipboard className="w-4 h-4 text-zinc-400" />}
                                        {item.title}
                                    </h3>
                                    {item.subtitle && <p className="text-xs uppercase font-bold text-zinc-500 mt-1">{item.subtitle}</p>}
                                    {item.description && <p className="text-sm text-zinc-800 mt-2 whitespace-pre-line">{item.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t border-zinc-300 pt-6 mt-12 flex justify-between text-xs text-zinc-400 uppercase tracking-widest font-bold">
                    <div>Project Glass House</div>
                    <div>Confidential // Internal Distribution Only</div>
                    <div>Page 1 of 1</div>
                </footer>
            </div>
        </div>
    );
}
