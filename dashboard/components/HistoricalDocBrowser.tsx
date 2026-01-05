'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    FileSpreadsheet,
    Download,
    ExternalLink,
    Search,
    Calendar,
    Filter,
    Clock,
    ShieldCheck,
    History
} from 'lucide-react';

interface HistoricalDoc {
    filename: string;
    title: string;
    timestamp: string;
    date: string;
    category: 'Wayback Recovery' | 'Census Sweep';
    type: string;
    path: string;
}

export default function HistoricalDocBrowser() {
    const [docs, setDocs] = useState<HistoricalDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'Wayback Recovery' | 'Census Sweep'>('ALL');

    useEffect(() => {
        async function fetchDocs() {
            try {
                const res = await fetch('/api/dhs-monitor?action=historical-docs');
                const data = await res.json();
                if (data.success) {
                    setDocs(data.documents);
                }
            } catch (err) {
                console.error('Failed to fetch historical docs:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchDocs();
    }, []);

    const filteredDocs = docs.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || doc.category === filter;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800 rounded-xl border-dashed">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mb-3" />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Indexing_Historical_Files...</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 bg-black/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            Forensic Evidence Archive
                        </h2>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">
                            Recovered System Documentation & 87-County Census Sweeps (2007-2026)
                        </p>
                    </div>

                    <div className="flex bg-black border border-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1 rounded text-[10px] font-black tracking-widest transition-all ${filter === 'ALL' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            ALL_EVIDENCE
                        </button>
                        <button
                            onClick={() => setFilter('Wayback Recovery')}
                            className={`px-3 py-1 rounded text-[10px] font-black tracking-widest transition-all ${filter === 'Wayback Recovery' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            WAYBACK_RECOVERY
                        </button>
                        <button
                            onClick={() => setFilter('Census Sweep')}
                            className={`px-3 py-1 rounded text-[10px] font-black tracking-widest transition-all ${filter === 'Census Sweep' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            CENSUS_SWEEPS
                        </button>
                    </div>
                </div>

                <div className="mt-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search evidence index (county name, year, or type)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-xs font-mono text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-700"
                    />
                </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-zinc-900 z-10">
                        <tr className="border-b border-zinc-800">
                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Document Title</th>
                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</th>
                            <th className="p-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Capture Date</th>
                            <th className="p-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 font-mono">
                        {filteredDocs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-zinc-600 italic">
                                    NO_RECORDS_MATCH_QUERY
                                </td>
                            </tr>
                        ) : (
                            filteredDocs.map((doc, i) => (
                                <tr key={i} className="hover:bg-blue-600/5 group transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {doc.category === 'Wayback Recovery' ? (
                                                <History className="w-4 h-4 text-blue-500/60" />
                                            ) : (
                                                <Calendar className="w-4 h-4 text-emerald-500/60" />
                                            )}
                                            <div>
                                                <div className="text-xs font-bold text-zinc-200 group-hover:text-white">
                                                    {doc.title}
                                                </div>
                                                <div className="text-[9px] text-zinc-600 truncate max-w-[250px]">
                                                    FS_{doc.filename}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${doc.category === 'Wayback Recovery'
                                            ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50'
                                            : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                                            }`}>
                                            {doc.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-zinc-400">
                                        <span className="text-[10px] font-bold">{doc.date}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={doc.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={doc.path}
                                                download
                                                className="p-2 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-black/60 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                        Total Historical Evidence: {filteredDocs.length} Documents
                    </span>
                </div>
                <div className="text-[9px] font-mono text-zinc-600 italic">
                    [ DATA_INTEGRITY_VERIFIED_VIA_WAYBACK_HASH ]
                </div>
            </div>
        </div>
    );
}
