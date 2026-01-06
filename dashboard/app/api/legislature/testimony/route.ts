import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Legislative Testimony Tracker API
 * 
 * Monitors committee hearings and floor sessions for keywords related to
 * Paid Leave program performance, fraud, and funding.
 */

interface TestimonySnippet {
    id: string;
    speaker: string;
    role: string;
    committee: string;
    date: string;
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'concerned';
    keywords: string[];
    timestamp: string; // Video timestamp
}

// Simulated hearing data
const HEARINGS: TestimonySnippet[] = [
    {
        id: 'h-001',
        speaker: 'Rep. Dave Baker',
        role: 'Minority Lead',
        committee: 'Workforce Development Finance and Policy',
        date: '2026-02-15',
        text: 'I am hearing from constituents that their applications have been pending for over 6 weeks. Is the department aware of these backlogs?',
        sentiment: 'concerned',
        keywords: ['applications', 'backlog', 'delay'],
        timestamp: '1:14:30'
    },
    {
        id: 'h-002',
        speaker: 'Comm. Matt Varilek',
        role: 'DEED Commissioner',
        committee: 'Workforce Development Finance and Policy',
        date: '2026-02-15',
        text: 'We have seen higher volume than anticipated, but fraud controls are catching 99% of suspicious claims before payment.',
        sentiment: 'positive',
        keywords: ['volume', 'fraud', 'payment'],
        timestamp: '1:16:45'
    },
    {
        id: 'h-003',
        speaker: 'Sen. Kari Dziedzic',
        role: 'Majority Leader',
        committee: 'Jobs and Economic Development',
        date: '2026-02-10',
        text: 'The fund balance is healthy and tracking ahead of actuarial projections. This is a success story for Minnesota families.',
        sentiment: 'positive',
        keywords: ['fund balance', 'projections', 'success'],
        timestamp: '0:45:20'
    },
    {
        id: 'h-004',
        speaker: 'Testifier (NFIB)',
        role: 'Business Group',
        committee: 'Jobs and Economic Development',
        date: '2026-02-10',
        text: 'Small businesses are struggling with the reporting requirements. The portal is down frequently.',
        sentiment: 'negative',
        keywords: ['reporting', 'portal', 'down'],
        timestamp: '1:30:15'
    }
];

export async function GET() {
    return NextResponse.json({
        success: true,
        hearings: HEARINGS,
        stats: {
            totalSnippets: HEARINGS.length,
            sentimentRatio: {
                positive: HEARINGS.filter(h => h.sentiment === 'positive').length,
                negative: HEARINGS.filter(h => h.sentiment === 'negative').length,
                concerned: HEARINGS.filter(h => h.sentiment === 'concerned').length,
            }
        },
        timestamp: new Date().toISOString()
    });
}
