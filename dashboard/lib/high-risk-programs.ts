
/**
 * Official 14 High-Risk DHS Programs
 * Source: Governor Walz Executive Order - October 29, 2025
 * Audit: Optum third-party review initiated
 * Status: 90-day pre-payment review pause (started late Oct 2025)
 */

export interface HighRiskProgram {
    id: string;
    name: string;
    shortName: string;
    category: 'HCBS' | 'Medical' | 'Housing' | 'Other';
    riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED';
    status: 'ACTIVE_RAID' | 'PAUSED' | 'UNDER_AUDIT' | 'MONITORING';
    fraudType: string;
    estimatedExposure: number; // in millions
    notes: string;
}

export const HIGH_RISK_PROGRAMS: HighRiskProgram[] = [
    {
        id: 'hss',
        name: 'Housing Stabilization Services',
        shortName: 'HSS',
        category: 'Housing',
        riskLevel: 'CRITICAL',
        status: 'ACTIVE_RAID',
        fraudType: 'Shell Companies, Phantom Services',
        estimatedExposure: 850,
        notes: 'GROUND ZERO - Current federal raid target. Dec 2025 arrests.'
    },
    {
        id: 'eidbi',
        name: 'Early Intensive Developmental and Behavioral Intervention',
        shortName: 'EIDBI (Autism)',
        category: 'HCBS',
        riskLevel: 'CRITICAL',
        status: 'ACTIVE_RAID',
        fraudType: 'Billing for Non-Existent Patients',
        estimatedExposure: 720,
        notes: 'Autism Services - Major Somali network nexus. Licensing paused 2 years.'
    },
    {
        id: 'adult-day',
        name: 'Adult Day Services',
        shortName: 'Adult Day Care',
        category: 'HCBS',
        riskLevel: 'CRITICAL',
        status: 'PAUSED',
        fraudType: 'Ghost Clients, Inflated Hours',
        estimatedExposure: 540,
        notes: "Licensing paused for 2 YEARS. Alpha News exposed viral video."
    },
    {
        id: 'nemt',
        name: 'Non-Emergency Medical Transportation',
        shortName: 'NEMT (Taxi Fraud)',
        category: 'Medical',
        riskLevel: 'HIGH',
        status: 'UNDER_AUDIT',
        fraudType: 'Fake Rides, Kickbacks',
        estimatedExposure: 380,
        notes: "The 'Taxi' fraud - fake trip logs, non-existent routes."
    },
    {
        id: 'pca',
        name: 'Personal Care Assistance',
        shortName: 'PCA',
        category: 'HCBS',
        riskLevel: 'HIGH',
        status: 'UNDER_AUDIT',
        fraudType: 'Ghost Employees, Time Fraud',
        estimatedExposure: 620,
        notes: "Classic 'Ghost Employee' scheme - caregivers who don't exist."
    },
    {
        id: 'ics',
        name: 'Integrated Community Supports',
        shortName: 'ICS',
        category: 'HCBS',
        riskLevel: 'HIGH',
        status: 'UNDER_AUDIT',
        fraudType: 'Overbilling, Duplicate Claims',
        estimatedExposure: 280,
        notes: 'Overlapping services billed to multiple programs.'
    },
    {
        id: 'armhs',
        name: 'Adult Rehabilitative Mental Health Services',
        shortName: 'ARMHS',
        category: 'HCBS',
        riskLevel: 'HIGH',
        status: 'UNDER_AUDIT',
        fraudType: 'Upcoding, Phantom Sessions',
        estimatedExposure: 340,
        notes: 'Mental health sessions that never occurred.'
    },
    {
        id: 'cfss',
        name: 'Community First Services and Supports',
        shortName: 'CFSS',
        category: 'HCBS',
        riskLevel: 'ELEVATED',
        status: 'MONITORING',
        fraudType: 'Self-Reporting Abuse',
        estimatedExposure: 190,
        notes: 'Minimal on-site verification enables fraud.'
    },
    {
        id: 'peer-recovery',
        name: 'Peer Recovery Services',
        shortName: 'Peer Recovery',
        category: 'HCBS',
        riskLevel: 'ELEVATED',
        status: 'MONITORING',
        fraudType: 'Fake Peer Counselors',
        estimatedExposure: 120,
        notes: "Unlicensed 'peers' billing for sessions."
    },
    {
        id: 'recup-care',
        name: 'Recuperative Care Services',
        shortName: 'Recup Care',
        category: 'Medical',
        riskLevel: 'ELEVATED',
        status: 'MONITORING',
        fraudType: 'Extended Stay Fraud',
        estimatedExposure: 95,
        notes: 'Patients kept longer than medically necessary.'
    },
    {
        id: 'ihs',
        name: 'Individualized Home Supports',
        shortName: 'IHS',
        category: 'HCBS',
        riskLevel: 'ELEVATED',
        status: 'MONITORING',
        fraudType: 'Inflated Hours',
        estimatedExposure: 140,
        notes: 'Home support hours exaggerated or fabricated.'
    },
    {
        id: 'adult-companion',
        name: 'Adult Companion Services',
        shortName: 'Adult Companion',
        category: 'HCBS',
        riskLevel: 'ELEVATED',
        status: 'MONITORING',
        fraudType: 'Family Billing Abuse',
        estimatedExposure: 85,
        notes: 'Family members billing for normal activities.'
    },
    {
        id: 'irts',
        name: 'Intensive Residential Treatment Services',
        shortName: 'IRTS',
        category: 'HCBS',
        riskLevel: 'ELEVATED',
        status: 'UNDER_AUDIT',
        fraudType: 'Bed Stacking',
        estimatedExposure: 210,
        notes: 'More patients billed than facility can hold.'
    },
    {
        id: 'customized-living',
        name: 'Customized Living',
        shortName: 'Waiver Services',
        category: 'HCBS',
        riskLevel: 'ELEVATED',
        status: 'MONITORING',
        fraudType: 'Service Bundling Fraud',
        estimatedExposure: 160,
        notes: 'Grouped with waiver services to obscure billing.'
    },
];

// Calculate totals
export const PROGRAM_STATS = {
    totalPrograms: HIGH_RISK_PROGRAMS.length,
    totalExposure: HIGH_RISK_PROGRAMS.reduce((sum, p) => sum + p.estimatedExposure, 0),
    criticalCount: HIGH_RISK_PROGRAMS.filter(p => p.riskLevel === 'CRITICAL').length,
    activeRaids: HIGH_RISK_PROGRAMS.filter(p => p.status === 'ACTIVE_RAID').length,
    hcbsCount: HIGH_RISK_PROGRAMS.filter(p => p.category === 'HCBS').length,
};

// Get programs by risk level
export function getProgramsByRisk(level: HighRiskProgram['riskLevel']) {
    return HIGH_RISK_PROGRAMS.filter(p => p.riskLevel === level);
}

// Get programs by status
export function getProgramsByStatus(status: HighRiskProgram['status']) {
    return HIGH_RISK_PROGRAMS.filter(p => p.status === status);
}

// Color mappings
export const RISK_COLORS = {
    CRITICAL: '#ef4444',
    HIGH: '#f59e0b',
    ELEVATED: '#eab308',
};

export const STATUS_COLORS = {
    ACTIVE_RAID: '#dc2626',
    PAUSED: '#f59e0b',
    UNDER_AUDIT: '#3b82f6',
    MONITORING: '#6b7280',
};
