"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
    Target,
    Shield,
    AlertTriangle,
    UserX,
    Eye,
    FileWarning,
    Search,
    X,
    ChevronRight,
    Calendar,
    Link2,
    ExternalLink
} from 'lucide-react';

interface TargetPerson {
    id: number;
    name: string;
    title: string;
    agency: string;
    status: 'active_investigation' | 'subpoenaed' | 'cooperating' | 'protected' | 'terminated';
    threatLevel: 'critical' | 'high' | 'medium';
    connection: string;
    exposure: string;
    timeline?: { date: string; event: string }[];
    linkedEntities?: string[];
    sources?: { name: string; url?: string }[];
}

const comer7Targets: TargetPerson[] = [
    {
        id: 1,
        name: 'Eric Grumdahl',
        title: 'Assistant Commissioner',
        agency: 'DHS',
        status: 'terminated',
        threatLevel: 'critical',
        connection: 'Directly oversaw $100M housing fraud programs',
        exposure: 'Fired 18 hours before congressional testimony',
        timeline: [
            { date: '2019-07', event: 'Appointed Assistant Commissioner, DHS' },
            { date: '2024-09', event: 'Scheduled to testify before House Oversight' },
            { date: '2025-09-16', event: 'TERMINATED - 18 hours before hearing' },
            { date: '2025-09-17', event: "'Empty Chair' hearing proceeds" }
        ],
        sources: [
            { name: 'House Oversight Committee Record', url: '#' },
            { name: 'Rep. Kristin Robbins Statement', url: '#' }
        ]
    },
    {
        id: 2,
        name: 'Jodi Harpstead',
        title: 'Commissioner (Former)',
        agency: 'DHS',
        status: 'subpoenaed',
        threatLevel: 'critical',
        connection: 'Led DHS during peak fraud period 2019-2025',
        exposure: 'Resigned weeks before expanded federal probe',
        timeline: [
            { date: '2019-07', event: 'Appointed DHS Commissioner' },
            { date: '2021-06', event: 'FOF fraud reaches peak' },
            { date: '2024-12', event: 'Federal probe expands to daycare' },
            { date: '2025-01', event: 'RESIGNED - weeks before probe announcement' }
        ],
        sources: [
            { name: 'DHS Press Release', url: '#' },
            { name: 'DOJ Investigation Files', url: '#' }
        ]
    },
    {
        id: 3,
        name: 'Tiki Brown',
        title: 'Commissioner',
        agency: 'DCYF',
        status: 'active_investigation',
        threatLevel: 'high',
        connection: 'Promoted from DHS Asst. Commissioner to lead new agency',
        exposure: 'Now front-line for Daycare Raids accountability',
        timeline: [
            { date: '2023-01', event: 'Assistant Commissioner, DHS' },
            { date: '2024-07', event: 'DCYF agency created' },
            { date: '2024-12', event: 'Promoted to DCYF Commissioner' },
            { date: '2025-12-30', event: 'Federal daycare raids under her jurisdiction' }
        ],
        sources: [
            { name: "Governor's Office Announcement", url: '#' }
        ]
    },
    {
        id: 4,
        name: 'Mary Cathryn Ricker',
        title: 'Commissioner (Former)',
        agency: 'MDE',
        status: 'subpoenaed',
        threatLevel: 'high',
        connection: 'MDE oversaw Feeding Our Future sponsorship',
        exposure: 'Resigned as FOF fraud spiked Summer 2021',
        timeline: [
            { date: '2019-01', event: 'Appointed MDE Commissioner' },
            { date: '2020-03', event: 'Pandemic food programs expand' },
            { date: '2021-04', event: 'RESIGNED mid-school year' },
            { date: '2021-06', event: 'FOF fraud peaks months later' }
        ],
        sources: [
            { name: 'MDE Records', url: '#' }
        ]
    },
    {
        id: 5,
        name: 'Tony Lourey',
        title: 'Commissioner (Former)',
        agency: 'DHS',
        status: 'cooperating',
        threatLevel: 'medium',
        connection: "First to cite 'unmanageable complexity'",
        exposure: 'Early exit may indicate foreknowledge',
        timeline: [
            { date: '2019-01', event: 'Appointed DHS Commissioner' },
            { date: '2019-07', event: 'RESIGNED after just 6 months' }
        ],
        sources: [
            { name: 'DHS Records', url: '#' }
        ]
    },
    {
        id: 6,
        name: 'Tim Walz',
        title: 'Governor',
        agency: 'State of Minnesota',
        status: 'protected',
        threatLevel: 'critical',
        connection: 'Ultimate authority over all state agencies',
        exposure: 'VP candidacy creates political shield',
        timeline: [
            { date: '2019-01', event: 'Inaugurated as Governor' },
            { date: '2020-03', event: 'Pandemic emergency declared' },
            { date: '2024-08', event: 'Selected as VP candidate' },
            { date: '2024-11', event: 'Presidential election' }
        ],
        sources: [
            { name: 'State of Minnesota Records', url: '#' }
        ]
    },
    {
        id: 7,
        name: 'Peggy Flanagan',
        title: 'Lt. Governor',
        agency: 'State of Minnesota',
        status: 'active_investigation',
        threatLevel: 'high',
        connection: 'Former tribal liaison, social services background',
        exposure: 'May ascend if Walz moves to federal role',
        timeline: [
            { date: '2019-01', event: 'Inaugurated as Lt. Governor' },
            { date: '2024-08', event: 'Potential succession if Walz becomes VP' }
        ],
        sources: [
            { name: 'State Records', url: '#' }
        ]
    },
];

const statusConfig = {
    active_investigation: {
        label: 'UNDER INVESTIGATION',
        color: 'text-amber-500',
        bg: 'bg-amber-950/20',
        icon: Search,
    },
    subpoenaed: {
        label: 'SUBPOENAED',
        color: 'text-neon-red',
        bg: 'bg-red-950/20',
        icon: FileWarning,
    },
    cooperating: {
        label: 'COOPERATING',
        color: 'text-blue-500',
        bg: 'bg-blue-950/20',
        icon: Shield,
    },
    protected: {
        label: 'POLITICALLY PROTECTED',
        color: 'text-purple-500',
        bg: 'bg-purple-950/20',
        icon: Shield,
    },
    terminated: {
        label: 'TERMINATED',
        color: 'text-zinc-500',
        bg: 'bg-zinc-900/50',
        icon: UserX,
    },
};

const threatConfig = {
    critical: { color: 'bg-neon-red', pulse: true },
    high: { color: 'bg-amber-500', pulse: false },
    medium: { color: 'bg-yellow-600', pulse: false },
};

export default function Comer7Tracker() {
    const [selectedTarget, setSelectedTarget] = useState<TargetPerson | null>(null);

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <Target className="w-6 h-6 text-neon-red" />
                <div>
                    <h2 className="text-2xl font-bold text-white font-mono tracking-tight">
                        THE_COMER_7
                    </h2>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        House Oversight Committee Primary Targets | Click for details
                    </p>
                </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-950/30 border border-red-900/50 p-4 mb-6 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-neon-red flex-shrink-0" />
                <p className="text-xs font-mono text-red-200">
                    <span className="text-neon-red font-bold">CONGRESSIONAL OVERSIGHT ACTIVE:</span>
                    {' '}These individuals have been identified in House Oversight Committee proceedings
                    as persons of interest in the Minnesota Fraud Investigation.
                </p>
            </div>

            {/* Target Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comer7Targets.map((target, index) => {
                    const status = statusConfig[target.status];
                    const threat = threatConfig[target.threatLevel];
                    const StatusIcon = status.icon;

                    return (
                        <motion.button
                            key={target.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedTarget(target)}
                            className={`${status.bg} border border-zinc-800 rounded overflow-hidden hover:border-zinc-500 hover:scale-[1.02] transition-all group text-left`}
                        >
                            {/* Threat Level Bar */}
                            <div className={`h-1 ${threat.color} ${threat.pulse ? 'animate-pulse' : ''}`} />

                            <div className="p-4">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-white font-bold">{target.name}</h3>
                                        <p className="text-xs text-zinc-500 font-mono">{target.title}</p>
                                        <p className="text-[10px] text-zinc-600 font-mono">{target.agency}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className={`inline-flex items-center gap-1 ${status.color} text-[10px] font-mono px-2 py-0.5 border border-current rounded mb-3`}>
                                    {status.label}
                                </div>

                                {/* Connection */}
                                <div className="text-xs text-zinc-400 mb-2">
                                    <span className="text-zinc-600">CONNECTION: </span>
                                    {target.connection}
                                </div>

                                {/* Click hint */}
                                <div className="text-[10px] text-zinc-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click for full dossier →
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Analysis Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 bg-zinc-900/50 border border-zinc-800 p-4"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-400 uppercase">Committee Focus Areas</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-neon-red font-mono">
                            {comer7Targets.filter(t => t.threatLevel === 'critical').length}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase">Critical Targets</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-500 font-mono">
                            {comer7Targets.filter(t => t.status === 'subpoenaed').length}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase">Subpoenaed</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-zinc-500 font-mono">
                            {comer7Targets.filter(t => t.status === 'terminated').length}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase">Terminated</div>
                    </div>
                </div>
            </motion.div>

            {/* Target Detail Modal */}
            <AnimatePresence>
                {selectedTarget && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTarget(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className={`${statusConfig[selectedTarget.status].bg} p-4 border-b border-zinc-800`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className={`h-1 w-20 ${threatConfig[selectedTarget.threatLevel].color} rounded mb-3`} />
                                        <h2 className="text-2xl font-bold text-white">{selectedTarget.name}</h2>
                                        <p className="text-sm text-zinc-400">{selectedTarget.title} • {selectedTarget.agency}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTarget(null)}
                                        className="p-2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                                {/* Status & Connection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-4 rounded border border-zinc-800">
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Status</div>
                                        <div className={`font-bold ${statusConfig[selectedTarget.status].color}`}>
                                            {statusConfig[selectedTarget.status].label}
                                        </div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded border border-zinc-800">
                                        <div className="text-xs text-zinc-500 uppercase mb-1">Threat Level</div>
                                        <div className={`font-bold ${selectedTarget.threatLevel === 'critical' ? 'text-neon-red' :
                                            selectedTarget.threatLevel === 'high' ? 'text-amber-500' : 'text-yellow-500'
                                            }`}>
                                            {selectedTarget.threatLevel.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                {/* Connection & Exposure */}
                                <div className="space-y-3">
                                    <div className="bg-zinc-800/50 p-3 rounded">
                                        <span className="text-xs text-zinc-500">CONNECTION: </span>
                                        <span className="text-sm text-white">{selectedTarget.connection}</span>
                                    </div>
                                    <div className="bg-red-950/30 p-3 rounded border-l-2 border-neon-red">
                                        <span className="text-xs text-neon-red font-bold">EXPOSURE: </span>
                                        <span className="text-sm text-red-200">{selectedTarget.exposure}</span>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {selectedTarget.timeline && (
                                    <div>
                                        <h3 className="text-xs text-zinc-500 uppercase mb-3 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Timeline
                                        </h3>
                                        <div className="space-y-2 border-l-2 border-zinc-700 pl-4">
                                            {selectedTarget.timeline.map((event, i) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-zinc-700 border-2 border-zinc-900" />
                                                    <div className="text-[10px] text-zinc-500 font-mono">{event.date}</div>
                                                    <div className="text-sm text-zinc-300">{event.event}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sources */}
                                {selectedTarget.sources && (
                                    <div>
                                        <h3 className="text-xs text-zinc-500 uppercase mb-3 flex items-center gap-2">
                                            <Link2 className="w-4 h-4" />
                                            Sources
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedTarget.sources.map((source, i) => (
                                                <a
                                                    key={i}
                                                    href={source.url}
                                                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {source.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.section>
    );
}
