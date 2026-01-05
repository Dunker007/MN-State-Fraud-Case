/**
 * Schema Validation Tests
 * Tests the Zod schemas that validate all evidence data
 * Critical for ensuring data integrity in the forensic investigation
 */

import { describe, it, expect } from 'vitest';
import {
    EntitySchema,
    TimelineEventSchema,
    MasterlistEntitySchema,
    extractDateFromStatus,
    parseStatusWithDate,
} from '@/lib/schemas';

describe('EntitySchema', () => {
    it('validates a correctly formatted entity', () => {
        const validEntity = {
            id: 'MN-123456',
            name: 'Test Provider',
            type: 'Provider',
            rawStatus: 'Active',
            holder: 'John Doe',
            owner: 'Jane Doe',
            address: '123 Main St',
            city: 'Minneapolis',
            status: 'ACTIVE',
            state_status: 'Active as of 01/01/2025',
            amount_billed: 150000,
            risk_score: 45,
            red_flag_reason: ['High billing volume'],
            federal_status: 'UNDER_REVIEW',
            linked_count: 3,
        };

        const result = EntitySchema.safeParse(validEntity);
        expect(result.success).toBe(true);
    });

    it('rejects entity with invalid ID format', () => {
        const invalidEntity = {
            id: 'INVALID-123', // Should be MN-XXXXX
            name: 'Test Provider',
            type: 'Provider',
            rawStatus: 'Active',
            holder: 'John Doe',
            owner: 'Jane Doe',
            address: '123 Main St',
            city: 'Minneapolis',
            status: 'ACTIVE',
            state_status: 'Active',
            amount_billed: 150000,
            risk_score: 45,
            red_flag_reason: [],
            federal_status: 'CLEAR',
            linked_count: 0,
        };

        const result = EntitySchema.safeParse(invalidEntity);
        expect(result.success).toBe(false);
    });

    it('rejects entity with negative amount_billed', () => {
        const invalidEntity = {
            id: 'MN-123456',
            name: 'Test Provider',
            type: 'Provider',
            rawStatus: 'Active',
            holder: 'John Doe',
            owner: 'Jane Doe',
            address: '123 Main St',
            city: 'Minneapolis',
            status: 'ACTIVE',
            state_status: 'Active',
            amount_billed: -5000, // Invalid: negative
            risk_score: 45,
            red_flag_reason: [],
            federal_status: 'CLEAR',
            linked_count: 0,
        };

        const result = EntitySchema.safeParse(invalidEntity);
        expect(result.success).toBe(false);
    });
});

describe('TimelineEventSchema', () => {
    it('validates correctly formatted date', () => {
        const validEvent = {
            date: '2024-10-09',
            event: 'Secret Suspension',
            detail: 'DHS quietly suspends payments',
        };

        const result = TimelineEventSchema.safeParse(validEvent);
        expect(result.success).toBe(true);
    });

    it('rejects incorrectly formatted date', () => {
        const invalidEvent = {
            date: '10-09-2024', // Wrong format, should be YYYY-MM-DD
            event: 'Test Event',
            detail: 'Test detail',
        };

        const result = TimelineEventSchema.safeParse(invalidEvent);
        expect(result.success).toBe(false);
    });
});

describe('MasterlistEntitySchema', () => {
    it('validates a DHS provider record', () => {
        const validProvider = {
            license_id: '12345',
            name: 'Test Daycare',
            owner: 'Jane Smith',
            status: 'ACTIVE',
            status_date: '01/15/2025',
            street: '456 Oak Ave',
            city: 'St. Paul',
            zip: '55101',
            phone: '651-555-1234',
            county: 'Ramsey',
            service_type: 'Child Care Center',
        };

        const result = MasterlistEntitySchema.safeParse(validProvider);
        expect(result.success).toBe(true);
    });

    it('accepts optional ghost office flag', () => {
        const ghostOffice = {
            license_id: '99999',
            name: 'Suspicious LLC',
            owner: 'UNKNOWN',
            status: 'REVOKED',
            status_date: '12/01/2024',
            street: '000 Fake St',
            city: 'Nowhere',
            zip: '00000',
            phone: '',
            county: 'Hennepin',
            service_type: 'Adult Day Services',
            is_ghost_office: true,
            has_curated_data: true,
        };

        const result = MasterlistEntitySchema.safeParse(ghostOffice);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.is_ghost_office).toBe(true);
        }
    });
});

describe('extractDateFromStatus', () => {
    it('extracts date from "as of" format', () => {
        const status = 'Active as of 10/01/2025';
        const date = extractDateFromStatus(status);

        expect(date).not.toBeNull();
        expect(date?.getFullYear()).toBe(2025);
        expect(date?.getMonth()).toBe(9); // October (0-indexed)
        expect(date?.getDate()).toBe(1);
    });

    it('extracts date from standalone format', () => {
        const status = 'Revoked 12/15/2024';
        const date = extractDateFromStatus(status);

        expect(date).not.toBeNull();
        expect(date?.getFullYear()).toBe(2024);
        expect(date?.getMonth()).toBe(11); // December
        expect(date?.getDate()).toBe(15);
    });

    it('returns null for status without date', () => {
        const status = 'ACTIVE';
        const date = extractDateFromStatus(status);

        expect(date).toBeNull();
    });
});

describe('parseStatusWithDate', () => {
    it('correctly identifies revoked status', () => {
        const entity = {
            id: 'MN-123456',
            name: 'Revoked Provider',
            type: 'Provider',
            rawStatus: 'Revoked as of 10/09/2024',
            holder: 'Test',
            owner: 'Test',
            address: '123 Main',
            city: 'Minneapolis',
            status: 'REVOKED',
            state_status: 'Revoked as of 10/09/2024',
            amount_billed: 1000000,
            risk_score: 100,
            red_flag_reason: ['License revoked'],
            federal_status: 'INDICTED',
            linked_count: 5,
        };

        const parsed = parseStatusWithDate(entity);

        expect(parsed.isRevoked).toBe(true);
        expect(parsed.isActive).toBe(false);
        expect(parsed.parsedDate).not.toBeNull();
        expect(parsed.monthKey).toBe('2024-10');
    });

    it('correctly identifies active status', () => {
        const entity = {
            id: 'MN-789012',
            name: 'Active Provider',
            type: 'Provider',
            rawStatus: 'Active',
            holder: 'Test',
            owner: 'Test',
            address: '456 Oak',
            city: 'St. Paul',
            status: 'ACTIVE',
            state_status: 'Active as of 01/01/2025',
            amount_billed: 50000,
            risk_score: 10,
            red_flag_reason: [],
            federal_status: 'CLEAR',
            linked_count: 0,
        };

        const parsed = parseStatusWithDate(entity);

        expect(parsed.isActive).toBe(true);
        expect(parsed.isRevoked).toBe(false);
        expect(parsed.isConditional).toBe(false);
    });
});
