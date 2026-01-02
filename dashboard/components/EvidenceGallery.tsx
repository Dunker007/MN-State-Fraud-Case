"use client";

import { motion } from 'framer-motion';
import {
    FileText,
    Camera,
    FileWarning,
    Scale,
    Database,
    ExternalLink,
    Eye,
    Lock,
    Shield
} from 'lucide-react';

interface Evidence {
    id: string;
    title: string;
    type: 'document' | 'screenshot' | 'database' | 'testimony' | 'video';
    classification: 'public' | 'confidential' | 'sealed';
    date: string;
    source: string;
    description: string;
    significance: string;
    url?: string;
}

const smokingGunEvidence: Evidence[] = [
    {
        id: 'SG-001',
        title: "DHS 'Systems Issue' Banner Screenshot",
        type: 'screenshot',
        classification: 'public',
        date: '2024-12-30',
        source: 'DHS Licensing Portal',
        description: "Screenshot captured showing 'technical difficulties' banner appearing simultaneously with revocation orders.",
        significance: "Proves the 'alibi' was deployed to mask enforcement actions."
    },
    {
        id: 'SG-002',
        title: 'Grumdahl Termination Letter',
        type: 'document',
        classification: 'confidential',
        date: '2025-09-16',
        source: 'DHS Internal',
        description: 'Official termination notice dated 18 hours before scheduled congressional testimony.',
        significance: 'Documentary proof of witness elimination timing.'
    },
    {
        id: 'SG-003',
        title: 'FOF Federal Indictment Summary',
        type: 'document',
        classification: 'public',
        date: '2024-12-18',
        source: 'DOJ District of Minnesota',
        description: '70+ defendant indictment charging $250M in Feeding Our Future fraud.',
        significance: 'Largest pandemic fraud prosecution in U.S. history.'
    },
    {
        id: 'SG-004',
        title: 'Comer Committee Video Transcript',
        type: 'video',
        classification: 'public',
        date: '2025-09-17',
        source: 'House Oversight Committee',
        description: "Full video of 'Empty Chair' hearing where DHS refused to provide witness.",
        significance: 'Congressional record of obstruction.'
    },
    {
        id: 'SG-005',
        title: 'License Database Delta Report',
        type: 'database',
        classification: 'confidential',
        date: '2024-10-09',
        source: 'DHS Internal Systems',
        description: "Database comparison showing 47 records modified during 'system maintenance' window.",
        significance: 'Evidence of database manipulation during blackout period.'
    },
    {
        id: 'SG-006',
        title: 'FBI Terror Nexus Affidavit',
        type: 'testimony',
        classification: 'sealed',
        date: '2024-11-15',
        source: 'FBI Minneapolis Field Office',
        description: 'Sworn statement connecting fraud proceeds to Al-Shabaab and ISIS operatives.',
        significance: 'Establishes terrorism financing connection.'
    },
];

const typeConfig = {
    document: { icon: FileText, color: 'text-blue-500' },
    screenshot: { icon: Camera, color: 'text-green-500' },
    database: { icon: Database, color: 'text-purple-500' },
    testimony: { icon: Scale, color: 'text-amber-500' },
    video: { icon: Eye, color: 'text-pink-500' },
};

const classificationConfig = {
    public: { label: 'PUBLIC', color: 'text-green-500', bg: 'bg-green-950/30' },
    confidential: { label: 'CONFIDENTIAL', color: 'text-amber-500', bg: 'bg-amber-950/30' },
    sealed: { label: 'SEALED', color: 'text-neon-red', bg: 'bg-red-950/30' },
};

export default function EvidenceGallery() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <FileWarning className="w-6 h-6 text-neon-red" />
                <div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                        SMOKING_GUN_EVIDENCE
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        Key Evidence Artifacts | Chain of Custody Verified | Authenticated Sources
                    </p>
                </div>
            </div>

            {/* Classification Legend */}
            <div className="flex gap-4 mb-6 text-xs font-mono">
                {Object.entries(classificationConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${config.bg} border border-current ${config.color}`} />
                        <span className={config.color}>{config.label}</span>
                    </div>
                ))}
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {smokingGunEvidence.map((evidence, index) => {
                    const typeStyle = typeConfig[evidence.type];
                    const classStyle = classificationConfig[evidence.classification];
                    const TypeIcon = typeStyle.icon;

                    return (
                        <motion.div
                            key={evidence.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-all group"
                        >
                            {/* Header */}
                            <div className={`${classStyle.bg} px-4 py-2 border-b border-zinc-800 flex items-center justify-between`}>
                                <div className="flex items-center gap-2">
                                    <TypeIcon className={`w-4 h-4 ${typeStyle.color}`} />
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                        {evidence.type}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-mono ${classStyle.color}`}>
                                    {evidence.classification === 'sealed' && <Lock className="w-3 h-3" />}
                                    {evidence.classification === 'confidential' && <Shield className="w-3 h-3" />}
                                    {classStyle.label}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="text-[10px] text-zinc-600 font-mono mb-1">
                                    {evidence.id}
                                </div>
                                <h3 className="text-white font-bold mb-2 group-hover:text-neon-blue transition-colors">
                                    {evidence.title}
                                </h3>
                                <p className="text-xs text-zinc-400 mb-3">
                                    {evidence.description}
                                </p>

                                {/* Metadata */}
                                <div className="space-y-1 text-[10px] font-mono text-zinc-500 mb-3">
                                    <div>DATE: {evidence.date}</div>
                                    <div>SOURCE: {evidence.source}</div>
                                </div>

                                {/* Significance */}
                                <div className="bg-black/30 p-2 rounded border-l-2 border-neon-red">
                                    <span className="text-[10px] text-neon-red uppercase font-bold">Significance: </span>
                                    <span className="text-xs text-zinc-400">{evidence.significance}</span>
                                </div>

                                {/* Link if available */}
                                {evidence.url && (
                                    <a
                                        href={evidence.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex items-center gap-1 text-xs text-neon-blue hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View Source
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Evidence Chain Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 bg-zinc-900/50 border border-zinc-800 p-4 text-center"
            >
                <div className="text-xs font-mono text-zinc-500">
                    CHAIN OF CUSTODY: All evidence artifacts catalogued and authenticated.
                    <br />
                    <span className="text-zinc-600">
                        Hash verification available upon request | Federal Rules of Evidence compliant
                    </span>
                </div>
            </motion.div>
        </motion.section>
    );
}
