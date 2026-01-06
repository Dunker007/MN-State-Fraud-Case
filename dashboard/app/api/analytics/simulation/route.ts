import { NextResponse } from 'next/server';
import { runMonteCarloSimulation, paramsFromSnapshots, MonteCarloParams } from '@/lib/monte-carlo';
import { PaidLeaveSnapshot } from '@/lib/paid-leave-types';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// Cache results for 1 hour
let cachedResult: { data: object; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function loadSnapshots(): Promise<PaidLeaveSnapshot[]> {
    try {
        const dataPath = path.join(process.cwd(), 'lib', 'paid-leave-data.json');
        const data = JSON.parse(await fs.readFile(dataPath, 'utf-8'));
        return data.snapshots || [];
    } catch {
        return [];
    }
}

export async function GET(request: Request) {
    // Check cache
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
        return NextResponse.json(cachedResult.data);
    }

    // Parse optional query params for custom simulation
    const { searchParams } = new URL(request.url);
    const customBalance = searchParams.get('balance');
    const customBurnRate = searchParams.get('burnRate');
    const customFraudRate = searchParams.get('fraudRate');

    // Load snapshots for baseline params
    const snapshots = await loadSnapshots();

    // Generate params (use custom if provided)
    let params: MonteCarloParams;

    if (customBalance || customBurnRate || customFraudRate) {
        // Custom simulation
        const baseParams = paramsFromSnapshots(snapshots);
        params = {
            currentBalance: customBalance ? parseFloat(customBalance) : baseParams.currentBalance,
            baseBurnRate: customBurnRate ? parseFloat(customBurnRate) : baseParams.baseBurnRate,
            claimVelocityVariance: baseParams.claimVelocityVariance,
            approvalRateVariance: baseParams.approvalRateVariance,
            fraudRateImpact: customFraudRate ? parseFloat(customFraudRate) : baseParams.fraudRateImpact,
            simulationCount: 10000
        };
    } else {
        params = paramsFromSnapshots(snapshots);
    }

    // Run simulation
    const startTime = Date.now();
    const result = runMonteCarloSimulation(params);
    const computeTime = Date.now() - startTime;

    const response = {
        success: true,
        params,
        results: {
            median: result.median.toISOString(),
            percentile10: result.percentile10.toISOString(),
            percentile25: result.percentile25.toISOString(),
            percentile75: result.percentile75.toISOString(),
            percentile90: result.percentile90.toISOString(),
            percentile95: result.percentile95.toISOString(),
            meanDays: result.meanDays,
            standardDeviation: result.standardDeviation,
            probabilities: {
                before30Days: Math.round(result.probabilityBefore30Days * 100),
                before60Days: Math.round(result.probabilityBefore60Days * 100),
                before90Days: Math.round(result.probabilityBefore90Days * 100)
            },
            distribution: result.distribution,
            confidence: result.confidence
        },
        meta: {
            simulationCount: 10000,
            computeTimeMs: computeTime,
            snapshotCount: snapshots.length,
            timestamp: new Date().toISOString()
        }
    };

    // Cache result (only for default params)
    if (!customBalance && !customBurnRate && !customFraudRate) {
        cachedResult = { data: response, timestamp: Date.now() };
    }

    return NextResponse.json(response);
}

// POST for custom simulations with body params
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const params: MonteCarloParams = {
            currentBalance: body.currentBalance || 500,
            baseBurnRate: body.baseBurnRate || 8.0,
            claimVelocityVariance: body.claimVelocityVariance || 0.2,
            approvalRateVariance: body.approvalRateVariance || 0.1,
            fraudRateImpact: body.fraudRateImpact || 0.1,
            simulationCount: Math.min(body.simulationCount || 10000, 50000) // Cap at 50k
        };

        const startTime = Date.now();
        const result = runMonteCarloSimulation(params);
        const computeTime = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            params,
            results: {
                median: result.median.toISOString(),
                percentile10: result.percentile10.toISOString(),
                percentile25: result.percentile25.toISOString(),
                percentile75: result.percentile75.toISOString(),
                percentile90: result.percentile90.toISOString(),
                percentile95: result.percentile95.toISOString(),
                meanDays: result.meanDays,
                standardDeviation: result.standardDeviation,
                probabilities: {
                    before30Days: Math.round(result.probabilityBefore30Days * 100),
                    before60Days: Math.round(result.probabilityBefore60Days * 100),
                    before90Days: Math.round(result.probabilityBefore90Days * 100)
                },
                distribution: result.distribution,
                confidence: result.confidence
            },
            meta: {
                simulationCount: params.simulationCount,
                computeTimeMs: computeTime,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Invalid request'
        }, { status: 400 });
    }
}
