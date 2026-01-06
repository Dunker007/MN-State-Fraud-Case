"use client";

import { Scale, ExternalLink, Clock, AlertTriangle } from 'lucide-react';

interface CourtCase {
    case_number: string;
    title: string;
    court?: string;
    status: string;
    filing_date?: string;
    parties?: string;
    summary?: string;
    url?: string;
}

// Mock court cases
const MOCK_CASES: CourtCase[] = [
    {
        case_number: '27-CV-26-1001',
        title: 'State of Minnesota v. ABC Medical Billing LLC',
        court: 'Hennepin County District Court',
        status: 'Active',
        filing_date: '2026-01-03',
        parties: 'State of Minnesota, ABC Medical Billing LLC',
        summary: 'Fraud investigation related to medical certification for paid leave claims.',
        url: 'https://pa.courts.state.mn.us/CaseSearch'
    },
    {
        case_number: '62-CV-26-0087',
        title: 'DEED v. Multiple Respondents (Consolidated)',
        court: 'Ramsey County District Court',
        status: 'Pending',
        filing_date: '2026-01-02',
        parties: 'MN DEED, Multiple Respondents',
        summary: 'Consolidated action against alleged shell companies submitting fraudulent claims.'
    }
];

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        case 'pending':
            return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30';
        case 'closed':
            return 'text-green-500 bg-green-500/10 border-green-500/30';
        case 'dismissed':
            return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
        default:
            return 'text-red-500 bg-red-500/10 border-red-500/30';
    }
}

interface CourtDocketProps {
    cases?: CourtCase[];
}

export default function CourtDocket({ cases = MOCK_CASES }: CourtDocketProps) {
    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-amber-500">COURT</span>_DOCKET
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono">MN_COURTS_PA</span>
            </div>

            <div className="space-y-3">
                {cases.map((courtCase) => (
                    <div
                        key={courtCase.case_number}
                        className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                                    <Scale className="w-5 h-5 text-amber-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-bold font-mono text-sm">{courtCase.case_number}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusColor(courtCase.status)}`}>
                                            {courtCase.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 className="text-zinc-300 text-sm mt-1">{courtCase.title}</h4>
                                    {courtCase.summary && (
                                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{courtCase.summary}</p>
                                    )}
                                </div>
                            </div>

                            {courtCase.url && (
                                <a
                                    href={courtCase.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-400 shrink-0"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-zinc-600">
                            {courtCase.court && <span>{courtCase.court}</span>}
                            {courtCase.filing_date && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Filed: {courtCase.filing_date}
                                </span>
                            )}
                        </div>
                    </div>
                ))}

                {cases.length === 0 && (
                    <div className="text-center py-8 text-zinc-600">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No related court cases found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
