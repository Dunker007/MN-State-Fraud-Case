/**
 * Data Loading Tests
 * Tests the core data loading and utility functions
 * Ensures the masterlist and evidence data loads correctly
 */

import { describe, it, expect } from 'vitest';
import {
    masterlistData,
    evidenceData,
    searchMasterlist,
    getMasterlistEntity,
    getMasterlistStats,
    getGhostOffices,
    calculateRiskScore,
    getTopSIPs,
} from '@/lib/data';

describe('Masterlist Data Loading', () => {
    it('loads masterlist with expected structure', () => {
        expect(masterlistData).toBeDefined();
        expect(masterlistData.meta).toBeDefined();
        expect(masterlistData.entities).toBeDefined();
        expect(Array.isArray(masterlistData.entities)).toBe(true);
    });

    it('has meta information', () => {
        expect(masterlistData.meta.total_entities).toBeGreaterThan(0);
        expect(masterlistData.meta.source).toBeDefined();
        expect(masterlistData.meta.generated).toBeDefined();
        expect(masterlistData.meta.status_counts).toBeDefined();
    });

    it('entities have required fields', () => {
        const firstEntity = masterlistData.entities[0];
        expect(firstEntity.license_id).toBeDefined();
        expect(firstEntity.name).toBeDefined();
        expect(firstEntity.status).toBeDefined();
        expect(firstEntity.city).toBeDefined();
        expect(firstEntity.county).toBeDefined();
    });
});

describe('Evidence Data Loading', () => {
    it('loads evidence data with expected structure', () => {
        expect(evidenceData).toBeDefined();
        expect(evidenceData.entities).toBeDefined();
        expect(evidenceData.BREAKING_NEWS).toBeDefined();
        expect(evidenceData.timeline).toBeDefined();
    });

    it('has curated high-risk entities', () => {
        expect(Array.isArray(evidenceData.entities)).toBe(true);
        // Curated entities should have enriched data
        if (evidenceData.entities.length > 0) {
            expect(evidenceData.entities[0].source_url).toBeDefined();
            expect(evidenceData.entities[0].last_verified).toBeDefined();
        }
    });
});

describe('searchMasterlist', () => {
    it('returns empty array for short queries', () => {
        const result = searchMasterlist('a');
        expect(result).toEqual([]);
    });

    it('finds providers by name', () => {
        // Search for a common term that should exist
        const result = searchMasterlist('care', 10);
        expect(result.length).toBeGreaterThan(0);
        expect(result.length).toBeLessThanOrEqual(10);
    });

    it('respects the limit parameter', () => {
        const result = searchMasterlist('care', 5);
        expect(result.length).toBeLessThanOrEqual(5);
    });

    it('searches across multiple fields', () => {
        // Search by city - should match city field
        const result = searchMasterlist('Minneapolis', 5);
        if (result.length > 0) {
            const hasMinneapolis = result.some(
                e => e.city.toLowerCase().includes('minneapolis') ||
                    e.name.toLowerCase().includes('minneapolis')
            );
            expect(hasMinneapolis).toBe(true);
        }
    });
});

describe('getMasterlistEntity', () => {
    it('returns undefined for non-existent ID', () => {
        const result = getMasterlistEntity('NONEXISTENT-99999999');
        expect(result).toBeUndefined();
    });

    it('finds entity by exact license ID', () => {
        // Get a known license ID from the first entity
        const firstEntity = masterlistData.entities[0];
        const result = getMasterlistEntity(firstEntity.license_id);
        expect(result).toBeDefined();
        expect(result?.license_id).toBe(firstEntity.license_id);
    });
});

describe('getMasterlistStats', () => {
    it('returns expected statistics structure', () => {
        const stats = getMasterlistStats();
        expect(stats.total).toBeGreaterThan(0);
        expect(stats.statusCounts).toBeDefined();
        expect(stats.generated).toBeDefined();
    });

    it('status counts sum to total', () => {
        const stats = getMasterlistStats();
        const countSum = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);
        expect(countSum).toBe(stats.total);
    });
});

describe('getGhostOffices', () => {
    it('returns array of entities', () => {
        const ghostOffices = getGhostOffices();
        expect(Array.isArray(ghostOffices)).toBe(true);
    });

    it('all returned entities have ghost flag', () => {
        const ghostOffices = getGhostOffices();
        ghostOffices.forEach(entity => {
            expect(entity.is_ghost_office).toBe(true);
        });
    });
});

describe('calculateRiskScore', () => {
    it('returns 0 for low-risk active provider', () => {
        const lowRiskEntity = {
            license_id: '12345',
            name: 'Safe Provider',
            owner: 'Known Owner',
            status: 'ACTIVE',
            status_date: '01/01/2020',
            street: '123 Main',
            city: 'Minneapolis',
            zip: '55401',
            phone: '612-555-1234',
            county: 'Hennepin',
            service_type: 'Child Care Center',
        };

        const score = calculateRiskScore(lowRiskEntity);
        expect(score).toBe(0);
    });

    it('returns high score for revoked provider', () => {
        const revokedEntity = {
            license_id: '99999',
            name: 'Bad Provider',
            owner: 'UNKNOWN',
            status: 'REVOKED',
            status_date: '12/01/2024',
            street: '000 Fake',
            city: 'Nowhere',
            zip: '00000',
            phone: '',
            county: 'Hennepin',
            service_type: 'Adult Day Services',
            is_ghost_office: true,
            has_curated_data: true,
        };

        const score = calculateRiskScore(revokedEntity);
        expect(score).toBeGreaterThan(100); // REVOKED (100) + ghost (30) + curated (25) + service type
    });

    it('caps score at 200', () => {
        const maxRiskEntity = {
            license_id: '99999',
            name: 'Max Risk',
            owner: 'UNKNOWN',
            status: 'REVOKED', // 100
            status_date: new Date().toLocaleDateString(), // Recent = +15
            street: '000 Fake',
            city: 'Nowhere',
            zip: '00000',
            phone: '',
            county: 'Hennepin',
            service_type: 'Adult Day Services EIDBI Autism', // High risk
            is_ghost_office: true, // +30
            has_curated_data: true, // +25
        };

        const score = calculateRiskScore(maxRiskEntity);
        expect(score).toBeLessThanOrEqual(200);
    });
});

describe('getTopSIPs', () => {
    it('returns array of owners with counts', () => {
        const sips = getTopSIPs(10);
        expect(Array.isArray(sips)).toBe(true);
        if (sips.length > 0) {
            expect(sips[0].owner).toBeDefined();
            expect(sips[0].count).toBeDefined();
            expect(sips[0].risk).toBeDefined();
        }
    });

    it('only includes multi-entity owners', () => {
        const sips = getTopSIPs(50);
        sips.forEach(sip => {
            expect(sip.count).toBeGreaterThan(1);
        });
    });

    it('respects limit parameter', () => {
        const sips = getTopSIPs(5);
        expect(sips.length).toBeLessThanOrEqual(5);
    });

    it('is sorted by count descending', () => {
        const sips = getTopSIPs(20);
        for (let i = 1; i < sips.length; i++) {
            expect(sips[i - 1].count).toBeGreaterThanOrEqual(sips[i].count);
        }
    });
});
