/**
 * Monte Carlo Simulation for Fund Insolvency Projection
 * 
 * Runs 10,000 simulations with variable parameters to generate
 * probability distribution of insolvency dates.
 */

import { PaidLeaveSnapshot } from './paid-leave-types';

export interface MonteCarloParams {
    currentBalance: number;           // Current fund balance in millions
    baseBurnRate: number;             // Base daily burn rate in millions
    claimVelocityVariance: number;    // Variance in claim velocity (0-1)
    approvalRateVariance: number;     // Variance in approval rate (0-1)
    fraudRateImpact: number;          // Additional burn from fraud (0-1)
    simulationCount?: number;          // Number of simulations to run
}

export interface MonteCarloResult {
    median: Date;                      // 50th percentile
    percentile10: Date;                // Optimistic (10th percentile)
    percentile25: Date;                // 25th percentile
    percentile75: Date;                // 75th percentile
    percentile90: Date;                // Pessimistic (90th percentile)
    percentile95: Date;                // Worst case (95th percentile)
    meanDays: number;                  // Mean days to insolvency
    standardDeviation: number;         // Standard deviation in days
    probabilityBefore90Days: number;   // Probability of insolvency < 90 days
    probabilityBefore60Days: number;   // Probability of insolvency < 60 days
    probabilityBefore30Days: number;   // Probability of insolvency < 30 days
    distribution: number[];            // Days distribution for charting
    confidence: 'high' | 'medium' | 'low';
}

// Box-Muller transform for normal distribution
function randomNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Run Monte Carlo simulation
 */
export function runMonteCarloSimulation(params: MonteCarloParams): MonteCarloResult {
    const {
        currentBalance,
        baseBurnRate,
        claimVelocityVariance,
        approvalRateVariance,
        fraudRateImpact,
        simulationCount = 10000
    } = params;

    const daysToInsolvency: number[] = [];

    for (let i = 0; i < simulationCount; i++) {
        // Generate random variations
        const velocityMultiplier = randomNormal(1, claimVelocityVariance);
        const approvalMultiplier = randomNormal(1, approvalRateVariance);
        const fraudMultiplier = 1 + (Math.random() * fraudRateImpact);

        // Calculate daily burn with variations
        const adjustedBurnRate = baseBurnRate *
            clamp(velocityMultiplier, 0.5, 2.0) *
            clamp(approvalMultiplier, 0.7, 1.3) *
            clamp(fraudMultiplier, 1.0, 1.5);

        // Calculate days until fund exhaustion
        const days = Math.max(1, Math.floor(currentBalance / adjustedBurnRate));
        daysToInsolvency.push(days);
    }

    // Sort for percentile calculations
    daysToInsolvency.sort((a, b) => a - b);

    // Calculate statistics
    const sum = daysToInsolvency.reduce((a, b) => a + b, 0);
    const meanDays = sum / simulationCount;

    const squaredDiffs = daysToInsolvency.map(d => Math.pow(d - meanDays, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / simulationCount;
    const standardDeviation = Math.sqrt(variance);

    // Percentile helper
    const percentile = (p: number): number => {
        const idx = Math.floor((p / 100) * simulationCount);
        return daysToInsolvency[clamp(idx, 0, simulationCount - 1)];
    };

    // Convert days to dates
    const now = new Date();
    const daysToDate = (days: number): Date => {
        return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    };

    // Calculate probabilities
    const probabilityBefore30Days = daysToInsolvency.filter(d => d < 30).length / simulationCount;
    const probabilityBefore60Days = daysToInsolvency.filter(d => d < 60).length / simulationCount;
    const probabilityBefore90Days = daysToInsolvency.filter(d => d < 90).length / simulationCount;

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'high';
    if (standardDeviation > meanDays * 0.5) confidence = 'low';
    else if (standardDeviation > meanDays * 0.25) confidence = 'medium';

    // Create distribution histogram (50 buckets)
    const maxDays = percentile(99);
    const bucketSize = Math.max(1, Math.ceil(maxDays / 50));
    const distribution = new Array(50).fill(0);
    for (const days of daysToInsolvency) {
        const bucket = Math.min(49, Math.floor(days / bucketSize));
        distribution[bucket]++;
    }

    return {
        median: daysToDate(percentile(50)),
        percentile10: daysToDate(percentile(10)),
        percentile25: daysToDate(percentile(25)),
        percentile75: daysToDate(percentile(75)),
        percentile90: daysToDate(percentile(90)),
        percentile95: daysToDate(percentile(95)),
        meanDays: Math.round(meanDays),
        standardDeviation: Math.round(standardDeviation),
        probabilityBefore30Days,
        probabilityBefore60Days,
        probabilityBefore90Days,
        distribution,
        confidence
    };
}

/**
 * Generate Monte Carlo params from snapshots
 */
export function paramsFromSnapshots(
    snapshots: PaidLeaveSnapshot[],
    fraudRate: number = 0.1
): MonteCarloParams {
    if (!snapshots || snapshots.length === 0) {
        // Default fallback params
        return {
            currentBalance: 500,
            baseBurnRate: 8.0,
            claimVelocityVariance: 0.2,
            approvalRateVariance: 0.1,
            fraudRateImpact: fraudRate
        };
    }

    const latest = snapshots[0];

    // Calculate historical velocity variance if we have enough data
    let velocityVariance = 0.2; // Default
    if (snapshots.length >= 3) {
        const claims = snapshots.map(s => s.claims_received || 0);
        const mean = claims.reduce((a, b) => a + b, 0) / claims.length;
        if (mean > 0) {
            const variance = claims.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / claims.length;
            velocityVariance = Math.min(0.5, Math.sqrt(variance) / mean);
        }
    }

    return {
        currentBalance: latest.fund_balance_millions,
        baseBurnRate: (latest.total_payout_millions || 0) > 0
            ? latest.total_payout_millions / Math.max(1, snapshots.length)
            : 8.0,
        claimVelocityVariance: velocityVariance,
        approvalRateVariance: 0.1,
        fraudRateImpact: fraudRate
    };
}
