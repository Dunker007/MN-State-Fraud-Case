import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface FraudPattern {
    id: string;
    type: 'shell_company' | 'medical_mill' | 'ip_cluster' | 'velocity_spike' | 'address_cluster' | 'identity_chain';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    location?: string;
    timestamp?: string;
    evidence: string[];
    riskScore: number; // 0-100
}

// Pattern detection algorithms would run here
// For now, returning curated patterns based on investigation data

async function detectFraudPatterns(): Promise<FraudPattern[]> {
    const patterns: FraudPattern[] = [];
    const now = new Date();

    // Pattern 1: 55407 Zip Code Cluster
    patterns.push({
        id: 'zip-55407-cluster',
        type: 'shell_company',
        title: '55407 Zip Cluster',
        description: '12 shell companies registered within 30 days of program launch, all filing claims from South Minneapolis zip code.',
        severity: 'critical',
        count: 47,
        location: 'Minneapolis, MN 55407',
        timestamp: now.toISOString(),
        evidence: [
            'All 12 entities registered between Dec 1-28, 2025',
            'Common registered agent: "L. Martinez"',
            'Same bank account suffix pattern detected',
            '47 total claims linked to cluster'
        ],
        riskScore: 92
    });

    // Pattern 2: Medical Certification Mill
    patterns.push({
        id: 'provider-992-11',
        type: 'medical_mill',
        title: 'Provider ID 992-11',
        description: 'Single chiropractor certifying medical claims at 8x the state average rate. All certifications completed same-day.',
        severity: 'high',
        count: 312,
        location: 'St. Paul, MN',
        timestamp: now.toISOString(),
        evidence: [
            '312 certifications in 5 days',
            'State average: 39 per provider',
            'All certifications mark "unable to work 8+ weeks"',
            '100% approval rate on submitted claims'
        ],
        riskScore: 85
    });

    // Pattern 3: IP Cluster
    patterns.push({
        id: 'batch-9921',
        type: 'ip_cluster',
        title: 'Batch #9921 Anomaly',
        description: '156 applications submitted from 3 IP addresses within 2-hour window. Suggests automated submission.',
        severity: 'medium',
        count: 156,
        timestamp: '2026-01-04T02:00:00Z',
        evidence: [
            'IP: 74.125.x.x (VPN detected)',
            'All applications have sequential SSN patterns',
            'Submitted between 02:00-04:00 CST',
            'Browser fingerprints identical'
        ],
        riskScore: 78
    });

    // Pattern 4: Velocity Spike
    patterns.push({
        id: 'overnight-surge',
        type: 'velocity_spike',
        title: 'Overnight Surge',
        description: 'Application velocity 340% above baseline between 2-4 AM CST. Abnormal for legitimate claims.',
        severity: 'high',
        count: 892,
        timestamp: '2026-01-04T03:22:00Z',
        evidence: [
            'Normal 2-4 AM volume: 180 applications',
            'Observed volume: 892 applications',
            'Peak velocity: 7.4 apps/minute',
            'Geographic concentration: Hennepin County'
        ],
        riskScore: 81
    });

    // Pattern 5: Address Cluster
    patterns.push({
        id: 'address-cluster-01',
        type: 'address_cluster',
        title: 'Apartment 4B Network',
        description: '28 applicants claim residence at 3 apartment addresses in downtown Minneapolis, exceeding building capacity.',
        severity: 'medium',
        count: 28,
        location: 'Downtown Minneapolis',
        timestamp: now.toISOString(),
        evidence: [
            'Address 1: 18 applicants (6-unit building)',
            'Address 2: 7 applicants (studio building)',
            'Address 3: 3 applicants (single family home)',
            'No shared employer among applicants'
        ],
        riskScore: 68
    });

    // Pattern 6: Identity Chain
    patterns.push({
        id: 'identity-chain-mjj',
        type: 'identity_chain',
        title: 'MJJ Identity Network',
        description: 'Chain of 8 applicants with sequentially issued SSNs, identical employment histories, same bank routing.',
        severity: 'critical',
        count: 8,
        location: 'Ramsey County',
        timestamp: now.toISOString(),
        evidence: [
            'SSNs issued within 2-week window',
            'All claim same employer (now dissolved)',
            'Bank account opened same day as SSN issuance',
            'Medical certifications from same provider'
        ],
        riskScore: 95
    });

    return patterns;
}

export async function GET() {
    const patterns = await detectFraudPatterns();

    // Calculate aggregate statistics
    const totalCount = patterns.reduce((acc, p) => acc + p.count, 0);
    const criticalCount = patterns.filter(p => p.severity === 'critical').length;
    const avgRiskScore = patterns.reduce((acc, p) => acc + p.riskScore, 0) / patterns.length;

    // Sort by risk score descending
    patterns.sort((a, b) => b.riskScore - a.riskScore);

    return NextResponse.json({
        success: true,
        count: patterns.length,
        patterns,
        stats: {
            totalFlaggedClaims: totalCount,
            criticalPatterns: criticalCount,
            averageRiskScore: Math.round(avgRiskScore),
            estimatedExposure: `$${(totalCount * 2800 / 1000000).toFixed(1)}M` // Avg claim ~$2800
        },
        timestamp: new Date().toISOString()
    });
}
