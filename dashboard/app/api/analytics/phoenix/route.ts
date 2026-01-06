import { NextResponse } from 'next/server';
import { detectPhoenixPatterns, getPhoenixStats, PhoenixMatch } from '@/lib/phoenix-detector';

export const dynamic = 'force-dynamic';

/**
 * Phoenix Company Detection API
 * 
 * Detects "phoenix" rebrand patterns where officers of dissolved
 * fraud-linked entities reappear in new entities around PFML launch.
 */

export async function GET() {
    // Run phoenix detection
    const matches = detectPhoenixPatterns();
    const stats = getPhoenixStats(matches);

    // Add severity classification
    const classified = matches.map(match => ({
        ...match,
        severity: match.phoenixScore >= 80 ? 'critical'
            : match.phoenixScore >= 60 ? 'high'
                : match.phoenixScore >= 40 ? 'medium'
                    : 'low'
    }));

    return NextResponse.json({
        success: true,
        matches: classified,
        stats,
        methodology: {
            description: 'Cross-references officers from dissolved fraud-linked entities against new entity filings around PFML launch date',
            factors: [
                'Days between dissolution and new filing',
                'Days before PFML launch of new filing',
                'Dissolution reason (fraud/revoked = higher risk)',
                'Number of prior violations',
                'Entity name stem matching'
            ],
            scoring: 'Weighted algorithm producing 0-100 phoenix score',
            dataSource: 'MN Secretary of State business filings (curated dataset)'
        },
        timestamp: new Date().toISOString()
    });
}
