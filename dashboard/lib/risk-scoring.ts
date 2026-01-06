/**
 * Fraud Risk Scoring Algorithm
 * 
 * Calculates risk scores (0-100) based on multiple weighted factors.
 * Higher scores indicate higher fraud probability.
 */

export interface RiskFactors {
    // Entity Age Factors
    entityAgeDays: number;               // Days since business registration
    daysBeforeProgramLaunch: number;     // Days between registration and PFML launch

    // Provider Certification Factors
    certificationRate: number;           // Medical certs per provider (vs state avg)
    sameDayCertificationRate: number;    // % of same-day certifications

    // Geographic Factors
    claimDensityZScore: number;          // Deviation from county average
    addressClusterCount: number;         // Multiple entities at same address

    // Velocity Factors
    applicationVelocity: number;         // Apps/hour vs baseline
    offHoursPercentage: number;          // % submitted 2-6 AM

    // Identity/Network Factors
    identityChainScore: number;          // SSN/bank pattern matching (0-100)
    sharedBankCount: number;             // Entities sharing bank accounts
    officerOverlapCount: number;         // Shared officers with flagged entities

    // Historical Factors
    priorDenialCount: number;            // Previous claim denials
    priorFraudFlags: number;             // Historical fraud flags
    phoenixScore: number;                 // Phoenix company probability (0-100)

    // External Validation
    npiValidationFailed: boolean;        // NPI not found in registry
    samExcluded: boolean;                 // SAM.gov excluded entity
    oigExcluded: boolean;                 // OIG LEIE excluded
}

interface WeightConfig {
    weight: number;
    maxContribution: number;
}

// Scoring weights (total should enable 100 max score)
const WEIGHTS: Record<keyof RiskFactors, WeightConfig> = {
    entityAgeDays: { weight: 0.5, maxContribution: 8 },
    daysBeforeProgramLaunch: { weight: 0.3, maxContribution: 5 },
    certificationRate: { weight: 0.8, maxContribution: 12 },
    sameDayCertificationRate: { weight: 0.6, maxContribution: 8 },
    claimDensityZScore: { weight: 0.4, maxContribution: 6 },
    addressClusterCount: { weight: 0.7, maxContribution: 10 },
    applicationVelocity: { weight: 0.6, maxContribution: 8 },
    offHoursPercentage: { weight: 0.5, maxContribution: 6 },
    identityChainScore: { weight: 1.0, maxContribution: 15 },
    sharedBankCount: { weight: 0.8, maxContribution: 10 },
    officerOverlapCount: { weight: 0.9, maxContribution: 12 },
    priorDenialCount: { weight: 0.4, maxContribution: 5 },
    priorFraudFlags: { weight: 0.7, maxContribution: 10 },
    phoenixScore: { weight: 0.9, maxContribution: 15 },
    npiValidationFailed: { weight: 1.0, maxContribution: 15 },
    samExcluded: { weight: 1.0, maxContribution: 25 },
    oigExcluded: { weight: 1.0, maxContribution: 25 }
};

export interface RiskScoreResult {
    totalScore: number;              // 0-100
    severity: 'low' | 'medium' | 'high' | 'critical';
    breakdown: {
        factor: string;
        rawValue: number | boolean;
        contribution: number;
        maxPossible: number;
    }[];
    topRiskFactors: string[];
    recommendations: string[];
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Calculate individual factor contribution
 */
function calculateFactorScore(
    factor: keyof RiskFactors,
    value: number | boolean,
    config: WeightConfig
): number {
    // Handle boolean factors
    if (typeof value === 'boolean') {
        return value ? config.maxContribution : 0;
    }

    // Factor-specific scoring logic
    let normalized: number;

    switch (factor) {
        case 'entityAgeDays':
            // Newer entities = higher risk (< 90 days = max risk)
            normalized = Math.max(0, 1 - (value / 365));
            break;

        case 'daysBeforeProgramLaunch':
            // Registered just before launch = suspicious (< 30 days = max)
            normalized = value >= 0 && value < 90 ? 1 - (value / 90) : 0;
            break;

        case 'certificationRate':
            // Higher than average = risk (3x avg = max)
            normalized = Math.min(1, (value - 1) / 7); // 8x avg = max
            break;

        case 'sameDayCertificationRate':
            // High same-day rate = suspicious
            normalized = value; // Already 0-1
            break;

        case 'claimDensityZScore':
            // High z-score = outlier
            normalized = Math.min(1, Math.abs(value) / 3);
            break;

        case 'addressClusterCount':
            // More entities at address = risk (5+ = max)
            normalized = Math.min(1, value / 5);
            break;

        case 'applicationVelocity':
            // High velocity = suspicious (3x baseline = max)
            normalized = Math.min(1, (value - 1) / 2);
            break;

        case 'offHoursPercentage':
            // High off-hours = suspicious
            normalized = value; // Already 0-1
            break;

        case 'identityChainScore':
        case 'phoenixScore':
            // Already 0-100, normalize to 0-1
            normalized = value / 100;
            break;

        case 'sharedBankCount':
            // More shared = risk (3+ = max)
            normalized = Math.min(1, value / 3);
            break;

        case 'officerOverlapCount':
            // Any overlap = risk (2+ = max)
            normalized = Math.min(1, value / 2);
            break;

        case 'priorDenialCount':
            // More denials = risk (3+ = max)
            normalized = Math.min(1, value / 3);
            break;

        case 'priorFraudFlags':
            // Any flags = serious (2+ = max)
            normalized = Math.min(1, value / 2);
            break;

        default:
            normalized = 0;
    }

    return normalized * config.weight * config.maxContribution;
}

/**
 * Calculate comprehensive risk score
 */
export function calculateRiskScore(factors: Partial<RiskFactors>): RiskScoreResult {
    const breakdown: RiskScoreResult['breakdown'] = [];
    let totalScore = 0;
    let factorsUsed = 0;

    for (const [key, config] of Object.entries(WEIGHTS)) {
        const factor = key as keyof RiskFactors;
        const value = factors[factor];

        if (value !== undefined && value !== null) {
            const contribution = calculateFactorScore(factor, value, config);
            totalScore += contribution;
            factorsUsed++;

            breakdown.push({
                factor: key,
                rawValue: value,
                contribution: Math.round(contribution * 100) / 100,
                maxPossible: config.maxContribution
            });
        }
    }

    // Cap at 100
    totalScore = Math.min(100, Math.round(totalScore));

    // Determine severity
    let severity: RiskScoreResult['severity'];
    if (totalScore >= 80) severity = 'critical';
    else if (totalScore >= 60) severity = 'high';
    else if (totalScore >= 40) severity = 'medium';
    else severity = 'low';

    // Sort breakdown by contribution
    breakdown.sort((a, b) => b.contribution - a.contribution);

    // Top risk factors
    const topRiskFactors = breakdown
        .filter(b => b.contribution > 0)
        .slice(0, 5)
        .map(b => b.factor);

    // Generate recommendations based on top factors
    const recommendations = generateRecommendations(topRiskFactors, factors);

    // Confidence based on data completeness
    let confidence: 'high' | 'medium' | 'low';
    const completeness = factorsUsed / Object.keys(WEIGHTS).length;
    if (completeness >= 0.7) confidence = 'high';
    else if (completeness >= 0.4) confidence = 'medium';
    else confidence = 'low';

    return {
        totalScore,
        severity,
        breakdown,
        topRiskFactors,
        recommendations,
        confidence
    };
}

/**
 * Generate actionable recommendations based on risk factors
 */
function generateRecommendations(
    topFactors: string[],
    factors: Partial<RiskFactors>
): string[] {
    const recs: string[] = [];

    if (topFactors.includes('samExcluded') || topFactors.includes('oigExcluded')) {
        recs.push('CRITICAL: Entity is federally excluded - deny all claims immediately');
    }

    if (topFactors.includes('npiValidationFailed')) {
        recs.push('Verify NPI with provider - potential ghost provider');
    }

    if (topFactors.includes('phoenixScore') && (factors.phoenixScore || 0) > 50) {
        recs.push('Cross-reference with dissolved entities - potential phoenix company');
    }

    if (topFactors.includes('officerOverlapCount')) {
        recs.push('Map full corporate network - shared officers with flagged entities');
    }

    if (topFactors.includes('identityChainScore')) {
        recs.push('Request additional identity documentation - pattern anomalies detected');
    }

    if (topFactors.includes('certificationRate')) {
        recs.push('Audit medical certifications from this provider');
    }

    if (topFactors.includes('addressClusterCount')) {
        recs.push('Physical site inspection recommended - multiple entities at address');
    }

    if (topFactors.includes('applicationVelocity') || topFactors.includes('offHoursPercentage')) {
        recs.push('Review submission patterns for automation indicators');
    }

    if (recs.length === 0) {
        recs.push('Standard processing - no elevated risk factors detected');
    }

    return recs;
}

/**
 * Batch score multiple entities
 */
export function batchScoreEntities(
    entities: { id: string; factors: Partial<RiskFactors> }[]
): { id: string; score: RiskScoreResult }[] {
    return entities.map(entity => ({
        id: entity.id,
        score: calculateRiskScore(entity.factors)
    }));
}
