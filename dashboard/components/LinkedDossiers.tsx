import React from 'react';
import { FileText, ExternalLink, Scale } from 'lucide-react';

interface Dossier {
    id: string;
    name: string;
    role: string;
    risk: number; // 0-100
    status: string;
    allegations: string[];
    evidenceLinks: { title: string; url: string }[];
}

const dossiers: Dossier[] = [
    {
        id: 'walz',
        name: 'Tim Walz',
        role: 'Governor',
        risk: 95,
        status: 'Active Investigation',
        allegations: [
            'Executive Oversight Failure',
            'Appointed Dawn Davis despite red flags',
            'Failed to act on OLA warnings for 18 months'
        ],
        evidenceLinks: [
            { title: 'OLA Report 2024', url: '#' },
            { title: 'Email Chain: "The optics are bad"', url: '#' }
        ]
    },
    {
        id: 'davis',
        name: 'Dawn Davis',
        role: 'Deputy Inspector General',
        risk: 92,
        status: 'Active Investigation',
        allegations: [
            'Architect of "Systems Issue" narrative',
            'Directed staff to ignore fraud flags',
            ' dismantled internal controls'
        ],
        evidenceLinks: [
            { title: 'Org Chart: The Power Structure', url: '/assets/evidence/org chart.pdf' }
        ]
    },
    {
        id: 'bigg',
        name: 'Kate Bigg',
        role: 'Compliance Manager',
        risk: 85,
        status: 'Under Review',
        allegations: [
            'Managed the "Choke Point" of compliance',
            'Failed to report systemic backlog',
            'Operated with zero support staff (negligence)'
        ],
        evidenceLinks: []
    },
    {
        id: 'nicolaison',
        name: 'Jana Nicolaison',
        role: 'Research Operations Manager',
        risk: 85,
        status: 'Under Review',
        allegations: [
            'Oversaw "Rubber Stamp" research factory',
            'Processed 10,000+ apps with minimal verification',
            'Prioritized speed over accuracy (Fraud Enabler)'
        ],
        evidenceLinks: []
    }
];

export default function LinkedDossiers() {
    return (
        <div className="w-full mt-12 mb-20">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-3">
                <span className="text-red-600">LINKED</span> <span className="text-white">DOSSIERS</span>
                <span className="text-xs font-normal font-mono text-zinc-500 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-full not-italic tracking-normal">
                    Subjects with Allegations
                </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dossiers.map((d) => (
                    <div key={d.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-red-500/50 transition-colors group">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">{d.name}</h4>
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{d.role}</p>
                            </div>
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center font-black font-mono text-xs border
                                ${d.risk >= 90 ? 'bg-red-600 border-red-400 text-white' : 'bg-amber-600 border-amber-400 text-black'}
                            `}>
                                {d.risk}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/30 border border-red-900/50 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                <Scale className="w-3 h-3" />
                                {d.status}
                            </span>
                        </div>

                        {/* Allegations List */}
                        <div className="mb-4">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Key Allegations</p>
                            <ul className="space-y-1.5">
                                {d.allegations.map((a, i) => (
                                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                                        <span className="text-red-500 mt-0.5">›</span>
                                        {a}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Evidence Links */}
                        {d.evidenceLinks.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-zinc-800">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Corroborating Evidence</p>
                                <div className="space-y-1">
                                    {d.evidenceLinks.map((link, i) => (
                                        <a key={i} href={link.url} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                            <FileText className="w-3 h-3" />
                                            {link.title}
                                            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
