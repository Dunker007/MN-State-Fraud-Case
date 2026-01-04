import React, { useState } from 'react';
import { FileText, Mic, Download, Search, File } from 'lucide-react';

interface EvidenceItem {
    id: string;
    title: string;
    type: 'pdf' | 'audio' | 'image' | 'doc';
    date: string;
    size: string;
    description: string;
    url: string;
    tags: string[];
}

const evidenceRegistry: EvidenceItem[] = [
    {
        id: 'ev-001',
        title: 'The Active Deception',
        type: 'pdf',
        date: '2024-12-15',
        size: '13.8 MB',
        description: 'Comprehensive analysis of the fraud mechanics and cover-up attempts.',
        url: '/assets/evidence/The_Active_Deception.pdf',
        tags: ['strategy', 'fraud', 'cover-up']
    },
    {
        id: 'ev-002',
        title: 'Whistleblower Warning: System Failure',
        type: 'pdf',
        date: '2024-11-20',
        size: '7.7 MB',
        description: 'Internal memos detailing the collapse of oversight mechanisms.',
        url: '/assets/evidence/Whistleblower_Warning_Unheeded_System_Failure_Crisis.pdf',
        tags: ['whistleblower', 'internal', 'failure']
    },
    {
        id: 'ev-003',
        title: 'Minnesota DHS Org Chart (Full)',
        type: 'pdf',
        date: '2024-01-01',
        size: '2.8 MB',
        description: 'Official hierarchy showing the chain of command during the fraud period.',
        url: '/assets/evidence/Minnesota _ DHS.pdf',
        tags: ['org-chart', 'dhs', 'structure']
    },
    {
        id: 'ev-004',
        title: 'RICO Case Strategy Analysis',
        type: 'audio',
        date: '2025-01-02',
        size: '21.7 MB',
        description: 'Audio briefing on potential RICO predicates and policy failures.',
        url: '/assets/evidence/RICO_Case_Strategy_Minnesota_Fraud_Policy_Failures.m4a',
        tags: ['legal', 'rico', 'audio']
    },
    {
        id: 'ev-005',
        title: 'MN Billion-Dollar Medicaid Failure',
        type: 'audio',
        date: '2025-01-02',
        size: '24.8 MB',
        description: 'Deep dive into the financial flows and lack of controls.',
        url: '/assets/evidence/Minnesota_s_Billion-Dollar_Medicaid_Fraud_Failure.m4a',
        tags: ['finance', 'medicaid', 'audio']
    }
];

export default function EvidenceLocker() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);

    const filteredEvidence = evidenceRegistry.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType ? item.type === filterType : true;
        return matchesSearch && matchesType;
    });

    return (
        <div className="w-full bg-black/40 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg">
                        <File className="w-5 h-5 text-neon-blue" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-wider text-sm">Evidence Locker</h3>
                        <p className="text-zinc-500 text-xs font-mono">{filteredEvidence.length} Files Secured</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search evidence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-700 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-600"
                        />
                    </div>

                    {/* Filter Toggles */}
                    <div className="flex bg-black/50 rounded-lg p-1 border border-zinc-800">
                        <button
                            onClick={() => setFilterType(null)}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!filterType ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setFilterType('pdf')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterType === 'pdf' ? 'bg-red-900/50 text-red-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            DOCS
                        </button>
                        <button
                            onClick={() => setFilterType('audio')}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${filterType === 'audio' ? 'bg-blue-900/50 text-blue-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            AUDIO
                        </button>
                    </div>
                </div>
            </div>

            {/* List View */}
            <div className="divide-y divide-zinc-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredEvidence.map((item) => (
                    <div key={item.id} className="group flex items-center gap-4 p-4 hover:bg-zinc-900/30 transition-colors">
                        {/* Icon */}
                        <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center border
                            ${item.type === 'pdf' ? 'bg-red-950/20 border-red-900/30 text-red-500' : 'bg-blue-950/20 border-blue-900/30 text-blue-500'}
                        `}>
                            {item.type === 'pdf' ? <FileText className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition-colors">
                                    {item.title}
                                </h4>
                                {item.tags.map(tag => (
                                    <span key={tag} className="hidden md:inline-block px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-500 font-mono uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-zinc-500 truncate">{item.description}</p>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="flex items-center gap-4 text-right">
                            <div className="hidden md:block">
                                <div className="text-[10px] font-mono text-zinc-400">{item.date}</div>
                                <div className="text-[10px] font-mono text-zinc-600">{item.size}</div>
                            </div>

                            <a
                                href={item.url}
                                download
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-all"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}

                {filteredEvidence.length === 0 && (
                    <div className="p-12 text-center text-zinc-600 font-mono text-xs">
                        No evidence found matching protocol parameters.
                    </div>
                )}
            </div>
        </div>
    );
}
