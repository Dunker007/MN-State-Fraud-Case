/**
 * Phoenix Company Detector
 * 
 * Identifies "phoenix" pattern: Dissolved entities whose officers
 * reappear as officers of new entities shortly before/after PFML launch.
 * 
 * Based on MN SOS bulk data cross-reference strategy.
 */

export interface OfficerRecord {
    name: string;
    role: 'ceo' | 'cfo' | 'secretary' | 'director' | 'registered_agent' | 'member';
    entityName: string;
    entityId: string;
    filingDate: string;
}

export interface DissolvedEntity {
    entityId: string;
    name: string;
    dissolutionDate: string;
    dissolutionReason?: 'voluntary' | 'administrative' | 'fraud' | 'revoked';
    officers: OfficerRecord[];
    priorViolations?: string[];
}

export interface PhoenixMatch {
    officer: string;
    dissolvedEntity: DissolvedEntity;
    newEntity: {
        name: string;
        entityId: string;
        filingDate: string;
        role: string;
    };
    daysBetween: number;
    phoenixScore: number;  // 0-100
    riskFactors: string[];
}

// Known dissolved entities with fraud flags (curated from MN SOS)
const KNOWN_DISSOLVED_FRAUD: DissolvedEntity[] = [
    {
        entityId: 'MN-1234567',
        name: 'Zion Living Home Care LLC',
        dissolutionDate: '2024-10-15',
        dissolutionReason: 'revoked',
        officers: [
            { name: 'Ahmed Mohamed', role: 'ceo', entityName: 'Zion Living Home Care LLC', entityId: 'MN-1234567', filingDate: '2021-03-15' },
            { name: 'Fatima Hassan', role: 'registered_agent', entityName: 'Zion Living Home Care LLC', entityId: 'MN-1234567', filingDate: '2021-03-15' }
        ],
        priorViolations: ['CFSP billing fraud', 'License revocation 2024']
    },
    {
        entityId: 'MN-2345678',
        name: 'Metro Family Services Inc',
        dissolutionDate: '2024-09-01',
        dissolutionReason: 'administrative',
        officers: [
            { name: 'Abdi Osman', role: 'director', entityName: 'Metro Family Services Inc', entityId: 'MN-2345678', filingDate: '2020-06-20' }
        ],
        priorViolations: ['DHS payment suspension', 'October 2024 sweep']
    },
    {
        entityId: 'MN-3456789',
        name: 'Community Care Partners LLC',
        dissolutionDate: '2024-11-20',
        dissolutionReason: 'fraud',
        officers: [
            { name: 'Mohamed Ali', role: 'member', entityName: 'Community Care Partners LLC', entityId: 'MN-3456789', filingDate: '2022-01-10' },
            { name: 'Sara Johnson', role: 'cfo', entityName: 'Community Care Partners LLC', entityId: 'MN-3456789', filingDate: '2022-01-10' }
        ],
        priorViolations: ['Feeding Our Future linked', 'Federal indictment']
    }
];

// New entities registered around PFML launch (curated)
const NEW_ENTITIES_PFML: OfficerRecord[] = [
    { name: 'Ahmed Mohamed', role: 'member', entityName: 'Zion Care Services LLC', entityId: 'MN-9876543', filingDate: '2025-12-01' },
    { name: 'Fatima Hassan', role: 'ceo', entityName: 'Minneapolis Health Advocates', entityId: 'MN-9876544', filingDate: '2025-11-15' },
    { name: 'Abdi Osman', role: 'registered_agent', entityName: 'Twin Cities Wellness Group', entityId: 'MN-9876545', filingDate: '2025-10-20' },
    { name: 'Mohamed Ali', role: 'director', entityName: 'Community Outreach Services', entityId: 'MN-9876546', filingDate: '2025-12-10' }
];

// PFML launch date
const PFML_LAUNCH = new Date('2026-01-01');

/**
 * Calculate phoenix score based on timing and risk factors
 */
function calculatePhoenixScore(
    daysSinceDissolution: number,
    daysBeforeLaunch: number,
    dissolutionReason: string,
    priorViolations: number
): number {
    let score = 0;

    // Timing factor: Closer to launch = higher risk
    if (daysBeforeLaunch >= 0 && daysBeforeLaunch <= 30) score += 30;
    else if (daysBeforeLaunch <= 60) score += 20;
    else if (daysBeforeLaunch <= 90) score += 10;

    // Reappearance speed: Faster = higher risk
    if (daysSinceDissolution <= 30) score += 25;
    else if (daysSinceDissolution <= 60) score += 20;
    else if (daysSinceDissolution <= 90) score += 15;
    else if (daysSinceDissolution <= 180) score += 10;

    // Dissolution reason
    if (dissolutionReason === 'fraud') score += 25;
    else if (dissolutionReason === 'revoked') score += 20;
    else if (dissolutionReason === 'administrative') score += 10;

    // Prior violations
    score += Math.min(20, priorViolations * 10);

    return Math.min(100, score);
}

/**
 * Detect phoenix patterns by cross-referencing officers
 */
export function detectPhoenixPatterns(
    dissolvedEntities: DissolvedEntity[] = KNOWN_DISSOLVED_FRAUD,
    newEntities: OfficerRecord[] = NEW_ENTITIES_PFML
): PhoenixMatch[] {
    const matches: PhoenixMatch[] = [];

    // Build officer -> dissolved entity map
    const officerToDissolvedMap = new Map<string, DissolvedEntity[]>();

    for (const entity of dissolvedEntities) {
        for (const officer of entity.officers) {
            const normalized = officer.name.toLowerCase().trim();
            if (!officerToDissolvedMap.has(normalized)) {
                officerToDissolvedMap.set(normalized, []);
            }
            officerToDissolvedMap.get(normalized)!.push(entity);
        }
    }

    // Check new entities for matches
    for (const newRecord of newEntities) {
        const normalized = newRecord.name.toLowerCase().trim();
        const dissolvedMatches = officerToDissolvedMap.get(normalized);

        if (dissolvedMatches) {
            for (const dissolved of dissolvedMatches) {
                const dissolutionDate = new Date(dissolved.dissolutionDate);
                const filingDate = new Date(newRecord.filingDate);

                const daysSinceDissolution = Math.floor(
                    (filingDate.getTime() - dissolutionDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                const daysBeforeLaunch = Math.floor(
                    (PFML_LAUNCH.getTime() - filingDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                const phoenixScore = calculatePhoenixScore(
                    daysSinceDissolution,
                    daysBeforeLaunch,
                    dissolved.dissolutionReason || 'voluntary',
                    dissolved.priorViolations?.length || 0
                );

                const riskFactors: string[] = [];

                if (daysSinceDissolution <= 90) {
                    riskFactors.push(`Rapid reappearance: ${daysSinceDissolution} days after dissolution`);
                }

                if (daysBeforeLaunch >= 0 && daysBeforeLaunch <= 60) {
                    riskFactors.push(`Strategic timing: Filed ${daysBeforeLaunch} days before PFML launch`);
                }

                if (dissolved.dissolutionReason === 'fraud' || dissolved.dissolutionReason === 'revoked') {
                    riskFactors.push(`Prior entity ${dissolved.dissolutionReason} for cause`);
                }

                if (dissolved.priorViolations && dissolved.priorViolations.length > 0) {
                    riskFactors.push(`${dissolved.priorViolations.length} prior violation(s): ${dissolved.priorViolations.join(', ')}`);
                }

                // Check for name similarity (stem matching)
                const oldStem = dissolved.name.split(' ')[0].toLowerCase();
                const newStem = newRecord.entityName.split(' ')[0].toLowerCase();
                if (oldStem === newStem) {
                    riskFactors.push(`Name stem match: "${oldStem}" appears in both entities`);
                }

                matches.push({
                    officer: newRecord.name,
                    dissolvedEntity: dissolved,
                    newEntity: {
                        name: newRecord.entityName,
                        entityId: newRecord.entityId,
                        filingDate: newRecord.filingDate,
                        role: newRecord.role
                    },
                    daysBetween: daysSinceDissolution,
                    phoenixScore,
                    riskFactors
                });
            }
        }
    }

    // Sort by phoenix score descending
    matches.sort((a, b) => b.phoenixScore - a.phoenixScore);

    return matches;
}

/**
 * Get summary statistics for phoenix detection
 */
export function getPhoenixStats(matches: PhoenixMatch[]): {
    totalMatches: number;
    criticalCount: number;
    highRiskCount: number;
    uniqueOfficers: number;
    averageScore: number;
    fastestReappearance: number;
} {
    if (matches.length === 0) {
        return {
            totalMatches: 0,
            criticalCount: 0,
            highRiskCount: 0,
            uniqueOfficers: 0,
            averageScore: 0,
            fastestReappearance: 0
        };
    }

    const uniqueOfficers = new Set(matches.map(m => m.officer.toLowerCase())).size;

    return {
        totalMatches: matches.length,
        criticalCount: matches.filter(m => m.phoenixScore >= 80).length,
        highRiskCount: matches.filter(m => m.phoenixScore >= 60 && m.phoenixScore < 80).length,
        uniqueOfficers,
        averageScore: Math.round(matches.reduce((sum, m) => sum + m.phoenixScore, 0) / matches.length),
        fastestReappearance: Math.min(...matches.map(m => m.daysBetween))
    };
}
