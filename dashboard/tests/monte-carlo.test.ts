
import { describe, it, expect } from 'vitest';
import { runMonteCarloSimulation, paramsFromSnapshots, MonteCarloParams } from '../lib/monte-carlo';
import { PaidLeaveSnapshot } from '../lib/paid-leave-types';

describe('Monte Carlo Simulation', () => {
    const mockParams: MonteCarloParams = {
        currentBalance: 500,
        baseBurnRate: 10,
        claimVelocityVariance: 0.2,
        approvalRateVariance: 0.1,
        fraudRateImpact: 0.1,
        simulationCount: 100 // Low count for speed
    };

    it('should return a valid result with required fields', () => {
        const result = runMonteCarloSimulation(mockParams);
        expect(result).toBeDefined();
        expect(result.meanDays).toBeGreaterThan(0);
        expect(result.distribution.length).toBe(50);
        expect(result.confidence).toMatch(/high|medium|low/);
    });

    it('should calculate mean days roughly correct', () => {
        // 500 / 10 = 50 days (adjusted by variance)
        // With variances centered around 1, mean should be close to 50
        const result = runMonteCarloSimulation({ ...mockParams, simulationCount: 1000 });
        // Allow broad range due to randomness and multipliers
        expect(result.meanDays).toBeGreaterThan(20);
        expect(result.meanDays).toBeLessThan(80);
    });

    it('should handle insolvency (balance too low)', () => {
        const poorParams = { ...mockParams, currentBalance: 1, baseBurnRate: 10 };
        const result = runMonteCarloSimulation(poorParams);
        expect(result.meanDays).toBe(1); // Min day is 1
    });

    it('should derive params from snapshots', () => {
        const date = new Date().toISOString();
        const snapshots: PaidLeaveSnapshot[] = [
            { date, fund_balance_millions: 600, total_payout_millions: 12, claims_received: 100, claims_approved: 80, claims_denied: 20, claims_pending: 0, burn_rate_daily_millions: 0.4 },
            { date, fund_balance_millions: 612, total_payout_millions: 10, claims_received: 90, claims_approved: 72, claims_denied: 18, claims_pending: 0, burn_rate_daily_millions: 0.33 },
            { date, fund_balance_millions: 622, total_payout_millions: 8, claims_received: 80, claims_approved: 64, claims_denied: 16, claims_pending: 0, burn_rate_daily_millions: 0.26 },
        ];
        const params = paramsFromSnapshots(snapshots);
        expect(params.currentBalance).toBe(600);
        expect(params.baseBurnRate).toBe(4); // 12 / 3 ? No, code is latest.total_payout / max(1, length) ? 
        // Code: latest.total_payout_millions / Math.max(1, snapshots.length)
        // latest is snapshots[0] (600, 12). length is 3.
        // 12 / 3 = 4.
        expect(params.baseBurnRate).toBe(4);
        expect(params.claimVelocityVariance).toBeGreaterThan(0);
    });
});
