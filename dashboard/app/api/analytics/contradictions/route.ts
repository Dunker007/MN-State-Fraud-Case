import { NextResponse } from 'next/server';
import { detectContradictions, getContradictionStats } from '@/lib/contradiction-detector';

export const dynamic = 'force-dynamic';

/**
 * Statement Contradiction API
 * 
 * Compares official statements against actual program data
 * to identify discrepancies and potential misinformation.
 */

export async function GET() {
    // Detect contradictions
    const contradictions = detectContradictions();
    const stats = getContradictionStats(contradictions);

    // Generate overall assessment
    let overallAssessment: 'accurate' | 'minor_discrepancies' | 'significant_concerns' | 'major_contradictions' = 'accurate';

    if (stats.bySeverity.critical > 0) overallAssessment = 'major_contradictions';
    else if (stats.bySeverity.major > 0) overallAssessment = 'significant_concerns';
    else if (stats.total > 0) overallAssessment = 'minor_discrepancies';

    // Generate recommendations
    const recommendations: string[] = [];

    if (stats.bySeverity.critical > 0) {
        recommendations.push('CRITICAL: Immediate fact-check required on critical discrepancies');
    }
    if (stats.byType.undercount > 0) {
        recommendations.push('Review undercount claims - officials may be using outdated data');
    }
    if (stats.byType.omission > 0) {
        recommendations.push('Omission detected - key information not being disclosed');
    }
    if (stats.byType.overcount > 0) {
        recommendations.push('Overcount claims detected - verify data sources');
    }

    if (recommendations.length === 0) {
        recommendations.push('Official statements align with current data');
    }

    return NextResponse.json({
        success: true,
        overallAssessment,
        stats,
        contradictions: contradictions.map(c => ({
            ...c,
            badge: c.severity === 'critical' ? '🚨 CRITICAL'
                : c.severity === 'major' ? '⚠️ MAJOR'
                    : c.severity === 'significant' ? '⚡ SIGNIFICANT'
                        : 'ℹ️ MINOR'
        })),
        recommendations,
        methodology: {
            description: 'Parses official statements for numeric and status claims, cross-references against live program data',
            claimTypes: ['numeric', 'status', 'timeline', 'comparison'],
            contradictionTypes: ['undercount', 'overcount', 'timeline', 'status', 'omission'],
            dataSources: [
                'DEED Internal Database',
                'System Logs',
                'Fund Balance Analysis',
                'Fraud Observatory'
            ]
        },
        timestamp: new Date().toISOString()
    });
}
