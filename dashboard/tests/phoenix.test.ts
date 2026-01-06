
import { describe, it, expect } from 'vitest';
import { detectPhoenixPatterns, DissolvedEntity, OfficerRecord } from '../lib/phoenix-detector';

describe('Phoenix Detector', () => {
    const dissolved: DissolvedEntity[] = [
        {
            entityId: 'D1',
            name: 'Bad Corp',
            dissolutionDate: '2024-01-01',
            dissolutionReason: 'fraud',
            officers: [
                { name: 'John Doe', role: 'ceo', entityName: 'Bad Corp', entityId: 'D1', filingDate: '2022-01-01' }
            ]
        }
    ];

    const newEntities: OfficerRecord[] = [
        { name: 'John Doe', role: 'ceo', entityName: 'New Bad Corp', entityId: 'N1', filingDate: '2024-02-01' }, // 30 days later
        { name: 'Jane Smith', role: 'ceo', entityName: 'Good Corp', entityId: 'N2', filingDate: '2024-02-01' }
    ];

    it('should detect matching officers from dissolved entities', () => {
        const matches = detectPhoenixPatterns(dissolved, newEntities);
        expect(matches.length).toBe(1);
        expect(matches[0].officer).toBe('John Doe');
        expect(matches[0].dissolvedEntity.name).toBe('Bad Corp');
        expect(matches[0].newEntity.name).toBe('New Bad Corp');
    });

    it('should calculate high score for fraud dissolution + rapid reappearance', () => {
        const matches = detectPhoenixPatterns(dissolved, newEntities);
        const match = matches[0];
        // 30 days gap -> High score
        // Fraud reason -> High score
        expect(match.phoenixScore).toBeGreaterThan(40);
        expect(match.riskFactors).toContainEqual(expect.stringMatching(/Rapid reappearance/));
    });

    it('should not match unrelated officers', () => {
        const matches = detectPhoenixPatterns(dissolved, newEntities);
        const janeMatch = matches.find(m => m.officer === 'Jane Smith');
        expect(janeMatch).undefined;
    });

    it('should match name stems if similar', () => {
        // Mock simple case where names are stemmed
        // "Bad Corp" stemmed -> "bad"
        // "New Bad Corp" stemmed -> "new" (Actually logic is split(' ')[0])
        // If "Bad Corp" vs "Bad Systems", stems "bad" === "bad".
        const d: DissolvedEntity[] = [{
            entityId: 'D2', name: 'Alpha Solutions', dissolutionDate: '2024-01-01', officers: [
                { name: 'Bob', role: 'ceo', entityName: 'Alpha Solutions', entityId: 'D2', filingDate: '2022-01-01' }
            ]
        }];
        const n: OfficerRecord[] = [
            { name: 'Bob', role: 'ceo', entityName: 'Alpha Tech', entityId: 'N3', filingDate: '2024-02-01' }
        ];
        const matches = detectPhoenixPatterns(d, n);
        expect(matches[0].riskFactors).toContainEqual(expect.stringMatching(/Name stem match/));
    });
});
