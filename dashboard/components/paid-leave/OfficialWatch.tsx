"use client";

import { User, Quote, ExternalLink } from 'lucide-react';

interface Official {
    name: string;
    title: string;
    agency: string;
    statements: Array<{
        date: string;
        quote: string;
        source?: string;
        sourceUrl?: string;
    }>;
}

const OFFICIALS: Official[] = [
    {
        name: 'Nicole Varilek',
        title: 'Assistant Commissioner',
        agency: 'MN DEED',
        statements: [
            {
                date: '2026-01-02',
                quote: 'We have received 11,883 applications in the first 48 hours of the program.',
                source: 'DEED Press Release',
                sourceUrl: 'https://mn.gov/deed/news/'
            },
            {
                date: '2026-01-02',
                quote: '4,005 claims have been approved for payment.',
                source: 'DEED Press Release'
            }
        ]
    },
    {
        name: 'Tim Walz',
        title: 'Governor',
        agency: 'State of Minnesota',
        statements: [
            {
                date: '2025-12-30',
                quote: 'Minnesota is leading the nation with this historic paid leave program.',
                source: 'Office of the Governor'
            }
        ]
    }
];

export default function OfficialWatch() {
    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-amber-500">OFFICIAL</span>_WATCH
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono">PUBLIC_RECORD_TRACKING</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[250px] overflow-y-auto scrollbar-hide">
                {OFFICIALS.map((official) => (
                    <div key={official.name} className="border border-zinc-800 rounded-lg overflow-hidden">
                        {/* Official Header */}
                        <div className="flex items-center gap-3 p-3 bg-zinc-900/50">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                <User className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div>
                                <div className="text-white font-bold">{official.name}</div>
                                <div className="text-xs text-zinc-500 font-mono">
                                    {official.title} • {official.agency}
                                </div>
                            </div>
                        </div>

                        {/* Statements */}
                        <div className="divide-y divide-zinc-800">
                            {official.statements.map((statement, i) => (
                                <div key={i} className="p-3 hover:bg-zinc-900/30 transition-colors">
                                    <div className="flex items-start gap-2">
                                        <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                                        <div>
                                            <p className="text-zinc-300 text-sm italic">"{statement.quote}"</p>
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
                ))}
            </div>
        </div>
    );
}
