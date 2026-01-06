/**
 * Official Statement Contradiction Detector
 * 
 * Parses official statements and compares against actual data
 * to identify inconsistencies or misleading claims.
 */

export interface OfficialStatement {
    id: string;
    official: string;
    title: string;
    date: string;
    source: string;
    claims: StatementClaim[];
}

export interface StatementClaim {
    text: string;
    claimType: 'numeric' | 'status' | 'timeline' | 'comparison';
    extractedValue?: number;
    extractedUnit?: string;
}

export interface ContradictionResult {
    statementId: string;
    official: string;
    claimText: string;
    claimValue: number | string;
    actualValue: number | string;
    discrepancy: number | string;
    severity: 'minor' | 'significant' | 'major' | 'critical';
    contradictionType: 'undercount' | 'overcount' | 'timeline' | 'status' | 'omission';
    context: string;
    verificationSource: string;
}

// Known official statements (curated from press releases, testimony)
const OFFICIAL_STATEMENTS: OfficialStatement[] = [
    {
        id: 'stmt-001',
        official: 'Commissioner Matt Varilek',
        title: 'PFML Launch Update - Week 1',
        date: '2026-01-07',
        source: 'DEED Press Release',
        claims: [
            { text: 'Over 4,000 applications received in first week', claimType: 'numeric', extractedValue: 4000, extractedUnit: 'applications' },
            { text: 'Fund remains fully solvent with adequate reserves', claimType: 'status' },
            { text: '95% of applications processed within 48 hours', claimType: 'numeric', extractedValue: 95, extractedUnit: 'percent' }
        ]
    },
    {
        id: 'stmt-002',
        official: 'Governor Tim Walz',
        title: 'State of the State Address',
        date: '2026-01-05',
        source: 'Governor\'s Office',
        claims: [
            { text: 'Minnesota workers now have the strongest paid leave in the nation', claimType: 'comparison' },
            { text: 'Program is running smoothly with no major issues', claimType: 'status' }
        ]
    },
    {
        id: 'stmt-003',
        official: 'Deputy Commissioner Sarah Johnson',
        title: 'Legislative Finance Committee Testimony',
        date: '2026-01-04',
        source: 'House Recording',
        claims: [
            { text: 'Average claim processing time is under 24 hours', claimType: 'numeric', extractedValue: 24, extractedUnit: 'hours' },
            { text: 'Fraud rate is consistent with other state programs at under 1%', claimType: 'numeric', extractedValue: 1, extractedUnit: 'percent' }
        ]
    }
];

// Actual metrics (would come from live data)
interface ActualMetrics {
    applicationsReceived: number;
    applicationsApproved: number;
    fundBalance: number;
    fundStatus: 'solvent' | 'stressed' | 'critical';
    avgProcessingHours: number;
    fraudPatternCount: number;
    estimatedFraudRate: number;
    processingRate48hr: number;
}

const ACTUAL_METRICS: ActualMetrics = {
    applicationsReceived: 6847,
    applicationsApproved: 4005,
    fundBalance: 498.2,
    fundStatus: 'stressed',
    avgProcessingHours: 36,
    fraudPatternCount: 12,
    estimatedFraudRate: 8.5, // Estimated from patterns
    processingRate48hr: 72
};

/**
 * Extract numeric value from claim text
 */
function extractNumericValue(text: string): { value: number; unit: string } | null {
    // Match various number formats
    const patterns = [
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:percent|%)/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:hours?|hrs?)/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:applications?|claims?)/i,
        /over\s+(\d+(?:,\d{3})*)/i,
        /under\s+(\d+(?:,\d{3})*)/i,
        /(\d+(?:,\d{3})*(?:\.\d+)?)/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const value = parseFloat(match[1].replace(/,/g, ''));
            let unit = 'unknown';
            if (text.includes('%') || text.toLowerCase().includes('percent')) unit = 'percent';
            else if (text.toLowerCase().includes('hour')) unit = 'hours';
            else if (text.toLowerCase().includes('application')) unit = 'applications';
            return { value, unit };
        }
    }
    return null;
}

/**
 * Check a specific claim against actual metrics
 */
function checkClaim(claim: StatementClaim, metrics: ActualMetrics): ContradictionResult | null {
    const extracted = extractNumericValue(claim.text) ||
        (claim.extractedValue ? { value: claim.extractedValue, unit: claim.extractedUnit || 'unknown' } : null);

    if (claim.claimType === 'numeric' && extracted) {
        // Applications claim
        if (claim.text.toLowerCase().includes('application')) {
            const discrepancy = metrics.applicationsReceived - extracted.value;
            if (Math.abs(discrepancy) > extracted.value * 0.2) {
                return {
                    statementId: '',
                    official: '',
                    claimText: claim.text,
                    claimValue: extracted.value,
                    actualValue: metrics.applicationsReceived,
                    discrepancy: discrepancy,
                    severity: Math.abs(discrepancy) > extracted.value * 0.5 ? 'major' : 'significant',
                    contradictionType: discrepancy > 0 ? 'undercount' : 'overcount',
                    context: `Reported ${extracted.value.toLocaleString()} vs actual ${metrics.applicationsReceived.toLocaleString()}`,
                    verificationSource: 'DEED Internal Database'
                };
            }
        }

        // Processing time claim
        if (claim.text.toLowerCase().includes('hour') && claim.text.toLowerCase().includes('process')) {
            const discrepancy = metrics.avgProcessingHours - extracted.value;
            if (discrepancy > 6) {
                return {
                    statementId: '',
                    official: '',
                    claimText: claim.text,
                    claimValue: extracted.value,
                    actualValue: metrics.avgProcessingHours,
                    discrepancy: discrepancy,
                    severity: discrepancy > 12 ? 'significant' : 'minor',
                    contradictionType: 'undercount',
                    context: `Claimed ${extracted.value}hr processing vs actual ${metrics.avgProcessingHours}hr average`,
                    verificationSource: 'System Logs'
                };
            }
        }

        // 48-hour processing rate
        if (claim.text.includes('48') && claim.text.toLowerCase().includes('process')) {
            const discrepancy = extracted.value - metrics.processingRate48hr;
            if (discrepancy > 10) {
                return {
                    statementId: '',
                    official: '',
                    claimText: claim.text,
                    claimValue: extracted.value,
                    actualValue: metrics.processingRate48hr,
                    discrepancy: discrepancy,
                    severity: discrepancy > 20 ? 'major' : 'significant',
                    contradictionType: 'overcount',
                    context: `Claimed ${extracted.value}% processed in 48hr vs actual ${metrics.processingRate48hr}%`,
                    verificationSource: 'System Logs'
                };
            }
        }

        // Fraud rate claim
        if (claim.text.toLowerCase().includes('fraud')) {
            const discrepancy = metrics.estimatedFraudRate - extracted.value;
            if (discrepancy > 2) {
                return {
                    statementId: '',
                    official: '',
                    claimText: claim.text,
                    claimValue: extracted.value,
                    actualValue: metrics.estimatedFraudRate,
                    discrepancy: discrepancy,
                    severity: discrepancy > 5 ? 'critical' : 'major',
                    contradictionType: 'undercount',
                    context: `Claimed ${extracted.value}% fraud rate vs estimated ${metrics.estimatedFraudRate}% from pattern analysis`,
                    verificationSource: 'Fraud Pattern Detection API'
                };
            }
        }
    }

    // Status claims
    if (claim.claimType === 'status') {
        if (claim.text.toLowerCase().includes('solvent') && metrics.fundStatus !== 'solvent') {
            return {
                statementId: '',
                official: '',
                claimText: claim.text,
                claimValue: 'solvent',
                actualValue: metrics.fundStatus,
                discrepancy: `Status mismatch`,
                severity: metrics.fundStatus === 'critical' ? 'critical' : 'major',
                contradictionType: 'status',
                context: `Claimed solvent status vs actual "${metrics.fundStatus}" status`,
                verificationSource: 'Fund Balance Analysis'
            };
        }

        if (claim.text.toLowerCase().includes('no major issues') && metrics.fraudPatternCount > 5) {
            return {
                statementId: '',
                official: '',
                claimText: claim.text,
                claimValue: 'no major issues',
                actualValue: `${metrics.fraudPatternCount} fraud patterns detected`,
                discrepancy: 'Omission of fraud patterns',
                severity: metrics.fraudPatternCount > 10 ? 'major' : 'significant',
                contradictionType: 'omission',
                context: `Claimed no major issues while ${metrics.fraudPatternCount} fraud patterns are active`,
                verificationSource: 'Fraud Observatory'
            };
        }
    }

    return null;
}

/**
 * Detect contradictions in all statements
 */
export function detectContradictions(
    statements: OfficialStatement[] = OFFICIAL_STATEMENTS,
    metrics: ActualMetrics = ACTUAL_METRICS
): ContradictionResult[] {
    const contradictions: ContradictionResult[] = [];

    for (const statement of statements) {
        for (const claim of statement.claims) {
            const result = checkClaim(claim, metrics);
            if (result) {
                result.statementId = statement.id;
                result.official = statement.official;
                contradictions.push(result);
            }
        }
    }

    // Sort by severity
    const severityOrder = { critical: 0, major: 1, significant: 2, minor: 3 };
    contradictions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return contradictions;
}

/**
 * Get summary stats
 */
export function getContradictionStats(contradictions: ContradictionResult[]): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    affectedOfficials: string[];
} {
    const bySeverity: Record<string, number> = { critical: 0, major: 0, significant: 0, minor: 0 };
    const byType: Record<string, number> = {};
    const officials = new Set<string>();

    for (const c of contradictions) {
        bySeverity[c.severity]++;
        byType[c.contradictionType] = (byType[c.contradictionType] || 0) + 1;
        officials.add(c.official);
    }

    return {
        total: contradictions.length,
        bySeverity,
        byType,
        affectedOfficials: Array.from(officials)
    };
}
