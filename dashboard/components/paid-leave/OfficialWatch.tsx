"use client";

import { useState, useEffect } from 'react';
import { User, Quote, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface Statement {
    date: string;
    quote: string;
    source?: string;
    sourceUrl?: string;
    context?: string;
}

interface Official {
    name: string;
    title: string;
    agency: string;
    image?: string;
    role: 'key_figure' | 'oversight' | 'named_party';
    statements: Statement[];
}

// Curated officials database - can be enhanced with API later
const OFFICIALS_DB: Official[] = [
    {
        name: 'Nicole Varilek',
        title: 'Assistant Commissioner',
        agency: 'MN DEED',
        role: 'key_figure',
        statements: [
            {
                date: '2026-01-02',
                quote: 'We have received 11,883 applications in the first 48 hours of the program.',
                source: 'DEED Press Release',
                sourceUrl: 'https://mn.gov/deed/news/',
                context: 'Program launch metrics'
            },
            {
                date: '2026-01-02',
                quote: '4,005 claims have been approved for payment.',
                source: 'DEED Press Release',
                context: 'Approval rate disclosure'
            }
        ]
    },
    {
        name: 'Tim Walz',
        title: 'Governor',
        agency: 'State of Minnesota',
        role: 'oversight',
        statements: [
            {
                date: '2025-12-30',
                quote: 'Minnesota is leading the nation with this historic paid leave program.',
                source: 'Office of the Governor',
                context: 'Public endorsement'
            }
        ]
    },
    {
        name: 'Matt Varilek',
        title: 'Commissioner',
        agency: 'MN DEED',
        role: 'key_figure',
        statements: [
            {
                date: '2026-01-01',
                quote: 'We are confident in our fraud prevention systems.',
                source: 'Press Conference',
                context: 'Pre-launch assurance'
            }
        ]
    },
    {
        name: 'Jodi Harpstead',
        title: 'Commissioner',
        agency: 'MN DHS',
        role: 'named_party',
        statements: [
            {
                date: '2025-11-15',
                quote: 'Cross-agency coordination is essential for program integrity.',
                source: 'DHS Communication',
                context: 'Inter-agency coordination'
            }
        ]
    }
];

function getRoleBadge(role: Official['role']) {
    switch (role) {
        case 'key_figure':
            return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'KEY FIGURE' };
        case 'oversight':
            return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'OVERSIGHT' };
        case 'named_party':
            return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'NAMED' };
        default:
            return { color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', label: 'TRACKED' };
    }
}

export default function OfficialWatch() {
    const [officials, setOfficials] = useState<Official[]>(OFFICIALS_DB);
    const [selectedOfficial, setSelectedOfficial] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Could add API fetch here for dynamic statement updates
    const refresh = async () => {
        setLoading(true);
        // Simulate API call - in future, fetch from /api/officials endpoint
        await new Promise(r => setTimeout(r, 500));
        setOfficials(OFFICIALS_DB);
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, []);

    const selected = selectedOfficial
        ? officials.find(o => o.name === selectedOfficial)
        : null;

    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-amber-500">OFFICIAL</span>_WATCH
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 text-zinc-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <span className="text-[10px] text-zinc-600 font-mono">
                        {officials.length} TRACKED
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                {selected ? (
                    // Detail View
                    <div className="h-full flex flex-col">
                        <button
                            onClick={() => setSelectedOfficial(null)}
                            className="text-xs text-purple-400 hover:text-purple-300 mb-3 text-left"
                        >
                            ← Back to list
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                <User className="w-6 h-6 text-zinc-500" />
                            </div>
                            <div>
                                <div className="text-white font-bold">{selected.name}</div>
                                <div className="text-xs text-zinc-500 font-mono">
                                    {selected.title} • {selected.agency}
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${getRoleBadge(selected.role).color}`}>
                                {getRoleBadge(selected.role).label}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {selected.statements.map((statement, i) => (
                                <div key={i} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                    <div className="flex items-start gap-2">
                                        <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-zinc-300 text-sm italic">"{statement.quote}"</p>
                                            {statement.context && (
                                                <p className="text-zinc-600 text-[10px] mt-1 font-mono">
                                                    Context: {statement.context}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 text-xs font-mono text-zinc-600">
                                                <span>{statement.date}</span>
                                                {statement.source && (
                                                    <>
                                                        <span>•</span>
                                                        {statement.sourceUrl ? (
                                                            <a
                                                                href={statement.sourceUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-purple-400 hover:underline flex items-center gap-1"
                                                            >
                                                                {statement.source}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <span>{statement.source}</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    // List View
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full overflow-y-auto pr-2">
                        {officials.map((official) => (
                            <button
                                key={official.name}
                                onClick={() => setSelectedOfficial(official.name)}
                                className="border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                        <User className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold truncate">{official.name}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border shrink-0 ${getRoleBadge(official.role).color}`}>
                                                {getRoleBadge(official.role).label}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 font-mono truncate">
                                            {official.title} • {official.agency}
                                        </div>
                                        <div className="text-[10px] text-purple-400 mt-1">
                                            {official.statements.length} statement{official.statements.length !== 1 ? 's' : ''} on record
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center shrink-0">
                <span className="text-[9px] text-zinc-600 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Public record tracking only
                </span>
                <span className="text-[9px] text-zinc-600 font-mono">
                    {officials.reduce((acc, o) => acc + o.statements.length, 0)} total statements
                </span>
            </div>
        </div>
    );
}
