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
            return 'text-purple-500 bg-purple-500/10 border-purple-500/30';
        default:
            return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/30';
    }
}

interface BillTrackerProps {
    bills?: Bill[];
}

export default function BillTracker({ bills = MOCK_BILLS }: BillTrackerProps) {
    return (
        <div className="bg-black/50 border border-zinc-800 rounded-xl p-4 h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-lg font-bold text-white font-mono">
                    <span className="text-purple-500">BILL</span>_TRACKER
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono">MN_LEGISLATURE</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto min-h-0 pr-2">
                {bills.map((bill) => (
                    <div
                        key={bill.bill_number}
                        className="border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-bold font-mono text-xs">{bill.bill_number}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono border ${getStatusColor(bill.status)}`}>
                                            {bill.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 className="text-zinc-300 text-xs mt-0.5 truncate">{bill.title}</h4>
                                    {bill.summary && (
                                        <p className="text-zinc-500 text-[10px] mt-0.5 truncate">{bill.summary}</p>
                                    )}
                                </div>
                            </div>

                            {bill.url && (
                                <a
                                    href={bill.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 shrink-0"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
