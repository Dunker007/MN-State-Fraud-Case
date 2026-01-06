"use client";

import { FileText, ExternalLink, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Bill {
    bill_number: string;
    title: string;
    summary?: string;
    status: string;
    last_action?: string;
    last_action_date?: string;
    authors?: string;
    url?: string;
}

// Mock bills for initial display
const MOCK_BILLS: Bill[] = [
    {
        bill_number: 'SF2',
        title: 'Paid Family and Medical Leave Act Amendments',
        summary: 'Modifies eligibility requirements and benefit calculations for the state paid leave program.',
        status: 'In Committee',
        last_action: 'Referred to Labor Committee',
        last_action_date: '2026-01-03',
        authors: 'Sen. Erin Murphy',
        url: 'https://www.revisor.mn.gov/bills/bill.php?b=SF2'
    },
    {
        bill_number: 'HF15',
        title: 'Paid Leave Program Oversight',
        summary: 'Establishes additional reporting requirements and legislative oversight of DEED administration.',
        status: 'Introduced',
        last_action: 'First Reading',
        last_action_date: '2026-01-02',
        authors: 'Rep. Jim Nash',
        url: 'https://www.revisor.mn.gov/bills/bill.php?b=HF15'
    },
    {
        bill_number: 'SF28',
        title: 'Paid Leave Fraud Prevention',
        summary: 'Creates enhanced fraud detection mechanisms and penalties for false claims.',
        status: 'In Committee',
        last_action: 'Hearing scheduled',
        last_action_date: '2026-01-08',
        authors: 'Sen. Julia Coleman',
        url: 'https://www.revisor.mn.gov/bills/bill.php?b=SF28'
    }
];

function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
        case 'passed':
        case 'signed':
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'failed':
        case 'vetoed':
            return <XCircle className="w-4 h-4 text-red-500" />;
        case 'in committee':
        case 'introduced':
            return <Clock className="w-4 h-4 text-amber-500" />;
        default:
            return <AlertTriangle className="w-4 h-4 text-zinc-500" />;
    }
}

function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case 'passed':
        case 'signed':
            return 'text-green-500 bg-green-500/10 border-green-500/30';
        case 'failed':
        case 'vetoed':
            return 'text-red-500 bg-red-500/10 border-red-500/30';
        case 'in committee':
            return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        case 'introduced':
            return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30';
        default:
            return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
    }
}

interface BillTrackerProps {
    bills?: Bill[];
}

export default function BillTracker({ bills = MOCK_BILLS }: BillTrackerProps) {
    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-purple-500">BILL</span>_TRACKER
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono">MN_LEGISLATURE</span>
            </div>

            <div className="space-y-3">
                {bills.map((bill) => (
                    <div
                        key={bill.bill_number}
                        className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold font-mono">{bill.bill_number}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusColor(bill.status)}`}>
                                            {bill.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 className="text-zinc-300 text-sm mt-1">{bill.title}</h4>
                                    {bill.summary && (
                                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{bill.summary}</p>
                                    )}
                                </div>
                            </div>

                            {bill.url && (
                                <a
                                    href={bill.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-400 shrink-0"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-[10px] font-mono text-zinc-600">
                            {bill.authors && <span>BY: {bill.authors}</span>}
                            {bill.last_action && (
                                <span className="flex items-center gap-1">
                                    {getStatusIcon(bill.status)}
                                    {bill.last_action}
                                </span>
                            )}
                            {bill.last_action_date && <span>{bill.last_action_date}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
