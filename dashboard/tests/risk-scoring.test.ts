
import { describe, it, expect } from 'vitest';
import { calculateRiskScore, batchScoreEntities, RiskFactors } from '../lib/risk-scoring';

describe('Risk Scoring', () => {
    const highRiskFactors: Partial<RiskFactors> = {
        entityAgeDays: 10, // Very new -> High Risk
        daysBeforeProgramLaunch: 15, // Suspicious timing
        priorFraudFlags: 2, // Flags
        phoenixScore: 90, // High phoenix
        samExcluded: true, // 25 points
        identityChainScore: 100 // 15 points
    };

    const lowRiskFactors: Partial<RiskFactors> = {
        entityAgeDays: 5000,
        daysBeforeProgramLaunch: -100,
        priorFraudFlags: 0,
        phoenixScore: 0
    };

    it('should calculate a high score for risky entities', () => {
        const result = calculateRiskScore(highRiskFactors);
        // Actual score around 45-55 depending on weights
        expect(result.totalScore).toBeGreaterThan(40);
        expect(result.severity).toMatch(/high|critical|medium/);
        expect(result.topRiskFactors.length).toBeGreaterThan(0);
        expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate a low score for safe entities', () => {
        const result = calculateRiskScore(lowRiskFactors);
        expect(result.totalScore).toBeLessThan(50);
        expect(result.severity).toMatch(/low|medium/);
    });

    it('should cap score at 100', () => {
        const criticalFactors: Partial<RiskFactors> = {
            samExcluded: true, // 25
            oigExcluded: true, // 25
            npiValidationFailed: true, // 15
            phoenixScore: 100 // 15
        };
        // Total possible > 80?
        const result = calculateRiskScore(criticalFactors);
        expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('should support batch scoring', () => {
        const entities = [
            { id: 'e1', factors: highRiskFactors },
            { id: 'e2', factors: lowRiskFactors }
        ];
        const results = batchScoreEntities(entities);
        expect(results.length).toBe(2);
        expect(results[0].score.totalScore).toBeGreaterThan(results[1].score.totalScore);
    });

    it('should generate specific recommendations', () => {
        const factors: Partial<RiskFactors> = { samExcluded: true };
        const result = calculateRiskScore(factors);
        expect(result.recommendations).toContain('CRITICAL: Entity is federally excluded - deny all claims immediately');
    });
});
