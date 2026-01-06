import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Data Export API
 * Supports CSV and JSON formats for all panels
 */

interface ExportParams {
    format: 'csv' | 'json';
}

// Fetch data from all relevant endpoints
async function fetchAllData(baseUrl: string) {
    const endpoints = [
        { name: 'paidLeave', endpoint: '/api/paid-leave' },
        { name: 'patterns', endpoint: '/api/fraud/patterns' },
        { name: 'bills', endpoint: '/api/legislature/bills' },
        { name: 'courts', endpoint: '/api/courts/search' },
        { name: 'geo', endpoint: '/api/geo/counties' },
        { name: 'simulation', endpoint: '/api/analytics/simulation' }
    ];

    const results: Record<string, unknown> = {};

    for (const { name, endpoint } of endpoints) {
        try {
            const response = await fetch(`${baseUrl}${endpoint}`);
            if (response.ok) {
                results[name] = await response.json();
            }
        } catch {
            results[name] = null;
        }
    }

    return results;
}

function convertToCSV(data: Record<string, unknown>): string {
    const lines: string[] = [];

    // Header
    lines.push('# Paid Leave Watch Data Export');
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push('# Source: Project CrossCheck');
    lines.push('');

    // Paid Leave Data
    if (data.paidLeave && typeof data.paidLeave === 'object') {
        const pl = data.paidLeave as Record<string, unknown>;
        lines.push('## PAID LEAVE FUND STATUS');
        lines.push('metric,value');
        if (pl.current && typeof pl.current === 'object') {
            const current = pl.current as Record<string, unknown>;
            lines.push(`fund_balance_millions,${current.fund_balance_millions || 'N/A'}`);
            lines.push(`claims_received,${current.claims_received || 'N/A'}`);
            lines.push(`claims_approved,${current.claims_approved || 'N/A'}`);
            lines.push(`total_payout_millions,${current.total_payout_millions || 'N/A'}`);
        }
        lines.push('');
    }

    // Fraud Patterns
    if (data.patterns && typeof data.patterns === 'object') {
        const pat = data.patterns as Record<string, unknown>;
        lines.push('## FRAUD PATTERNS');
        lines.push('id,type,title,severity,risk_score,flagged_claims,estimated_exposure');
        if (Array.isArray(pat.patterns)) {
            for (const p of pat.patterns) {
                lines.push(`${p.id},${p.type},${p.title},${p.severity},${p.riskScore},${p.flaggedClaims},${p.estimatedExposure}`);
            }
        }
        lines.push('');
    }

    // Legislative Bills
    if (data.bills && typeof data.bills === 'object') {
        const b = data.bills as Record<string, unknown>;
        lines.push('## LEGISLATIVE BILLS');
        lines.push('bill_number,title,status,last_action');
        if (Array.isArray(b.bills)) {
            for (const bill of b.bills) {
                lines.push(`${bill.bill_number},"${bill.title}",${bill.status},"${bill.last_action || 'N/A'}"`);
            }
        }
        lines.push('');
    }

    // Court Cases
    if (data.courts && typeof data.courts === 'object') {
        const c = data.courts as Record<string, unknown>;
        lines.push('## COURT CASES');
        lines.push('case_number,title,status,court');
        if (Array.isArray(c.cases)) {
            for (const case_ of c.cases) {
                lines.push(`${case_.case_number},"${case_.title}",${case_.status},${case_.court}`);
            }
        }
        lines.push('');
    }

    // Geographic Data (Top 10 counties)
    if (data.geo && typeof data.geo === 'object') {
        const g = data.geo as Record<string, unknown>;
        lines.push('## TOP 10 COUNTIES BY CLAIMS');
        lines.push('county,claims');
        if (Array.isArray(g.counties)) {
            for (const county of g.counties.slice(0, 10)) {
                lines.push(`${county.name},${county.claims}`);
            }
        }
        lines.push('');
    }

    // Simulation Results
    if (data.simulation && typeof data.simulation === 'object') {
        const s = data.simulation as Record<string, unknown>;
        const results = s.results as Record<string, unknown> | undefined;
        lines.push('## MONTE CARLO SIMULATION');
        lines.push('metric,value');
        if (results) {
            lines.push(`median_insolvency_date,${results.median || 'N/A'}`);
            lines.push(`mean_days,${results.meanDays || 'N/A'}`);
            lines.push(`std_deviation,${results.standardDeviation || 'N/A'}`);
            const probs = results.probabilities as Record<string, unknown> | undefined;
            if (probs) {
                lines.push(`probability_before_30_days,${probs.before30Days}%`);
                lines.push(`probability_before_60_days,${probs.before60Days}%`);
                lines.push(`probability_before_90_days,${probs.before90Days}%`);
            }
        }
        lines.push('');
    }

    return lines.join('\n');
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ format: string }> }
) {
    const { format } = await params;

    if (format !== 'csv' && format !== 'json') {
        return NextResponse.json({
            success: false,
            error: 'Invalid format. Use csv or json'
        }, { status: 400 });
    }

    // Get base URL
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // Fetch all data
    const data = await fetchAllData(baseUrl);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (format === 'json') {
        return new NextResponse(JSON.stringify({
            exportDate: new Date().toISOString(),
            source: 'Paid Leave Watch - Project CrossCheck',
            disclaimer: 'Data from public sources. Projections are illustrative.',
            data
        }, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="paidleavewatch-export-${timestamp}.json"`
            }
        });
    }

    // CSV format
    const csv = convertToCSV(data);

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="paidleavewatch-export-${timestamp}.csv"`
        }
    });
}
