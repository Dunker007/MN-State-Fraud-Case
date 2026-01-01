import { z } from "zod";

// ============================================
// ENTITY SCHEMA - The Core Evidence Unit
// ============================================
export const EntitySchema = z.object({
    id: z.string().regex(/^MN-\d+$/, "Invalid MN license ID format"),
    name: z.string().min(1),
    type: z.string(),
    rawStatus: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    holder: z.string(),
    owner: z.string(),
    address: z.string(),
    city: z.string(),
    status: z.string(),
    state_status: z.string(),
    amount_billed: z.number().nonnegative(),
    risk_score: z.number().nonnegative(),
    red_flag_reason: z.array(z.string()),
    federal_status: z.string(),
    linked_count: z.number().nonnegative(),
    network_ids: z.array(z.string()).optional(),
    address_shared_count: z.number().nonnegative().optional(),
    flag_string: z.string().optional(),
    source_url: z.string().optional(),
    last_verified: z.string().optional(),
    initial_effective_date: z.string().optional(), // Recovered from CSV source
});

export type Entity = z.infer<typeof EntitySchema>;

// ============================================
// TIMELINE EVENT SCHEMA
// ============================================
export const TimelineEventSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    event: z.string(),
    detail: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

// ============================================
// DOCUMENT REFERENCE SCHEMA
// ============================================
export const DocumentSchema = z.object({
    id: z.string().optional(), // Make ID optional as manual entries might not have one
    title: z.string(),
    type: z.string().optional(), // New field for categorization
    description: z.string().optional(),
    size: z.string(),
    url: z.string().optional(),
    path: z.string().optional(), // Local path reference
});

export type Document = z.infer<typeof DocumentSchema>;

// ============================================
// ADDRESS CLUSTER SCHEMA
// ============================================
export const AddressClusterSchema = z.object({
    address: z.string(),
    city: z.string(),
    count: z.number().nonnegative(),
    ids: z.array(z.string()),
});

export type AddressCluster = z.infer<typeof AddressClusterSchema>;

// ============================================
// MASTERLIST ENTITY SCHEMA - Raw DHS Data (Enriched)
// ============================================
export const MasterlistEntitySchema = z.object({
    license_id: z.string(),
    name: z.string(),
    owner: z.string(),
    status: z.string(),
    status_date: z.string(),
    street: z.string(),
    city: z.string(),
    zip: z.string(),
    phone: z.string(),
    county: z.string(),
    service_type: z.string(),
    // Enriched fields (added by merge_owners.js)
    is_ghost_office: z.boolean().optional(),
    has_curated_data: z.boolean().optional(),
    initial_effective_date: z.string().optional(), // Added for Velocity Risk
});

export type MasterlistEntity = z.infer<typeof MasterlistEntitySchema>;

// ============================================
// MASTERLIST DUMP SCHEMA
// ============================================
export const MasterlistDumpSchema = z.object({
    meta: z.object({
        source: z.string(),
        generated: z.string(),
        total_entities: z.number(),
        status_counts: z.record(z.string(), z.number()),
    }),
    entities: z.array(MasterlistEntitySchema),
});

export type MasterlistDump = z.infer<typeof MasterlistDumpSchema>;

// ============================================
// SOURCE SCHEMA
// ============================================
export const SourceSchema = z.object({
    title: z.string(),
    type: z.string(), // Could be enum: REPORT, LEGAL, EVIDENCE, NEWS
    source: z.string(),
});

export type Source = z.infer<typeof SourceSchema>;

// ============================================
// ALIBI ANALYSIS SCHEMA
// ============================================
export const AlibiAnalysisSchema = z.object({
    ID: z.string(),
    NOV_29_STATUS: z.string(),
    DEC_30_STATUS: z.string(),
    CONCLUSION: z.string(),
});

export type AlibiAnalysis = z.infer<typeof AlibiAnalysisSchema>;

// ============================================
// NEWS ITEM SCHEMA
// ============================================
export const BreakingNewsSchema = z.object({
    DATE: z.string(),
    SOURCE: z.string(),
    CONFIRMATION: z.string(),
    NEW_TARGET: z.string(),
    TERROR_NEXUS: z.string(),
    SYSTEM_FAILURE: z.string(),
});

export type BreakingNews = z.infer<typeof BreakingNewsSchema>;

// ============================================
// FULL EVIDENCE DUMP SCHEMA
// ============================================
export const EvidenceDumpSchema = z.object({
    generated_at: z.string(),
    total_entities: z.number(),
    high_risk_address_clusters: z.array(AddressClusterSchema),
    entities: z.array(EntitySchema),
});

export type EvidenceDump = z.infer<typeof EvidenceDumpSchema>;

// ============================================
// UTILITY: Extract date from status string
// ============================================
export function extractDateFromStatus(statusString: string): Date | null {
    // Match patterns like "as of 10/01/2025" or "10/09/2024"
    const datePatterns = [
        /as of (\d{1,2})\/(\d{1,2})\/(\d{4})/i,
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    ];

    for (const pattern of datePatterns) {
        const match = statusString.match(pattern);
        if (match) {
            const [, month, day, year] = match;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    }
    return null;
}

// ============================================
// UTILITY: Parse status for temporal analysis
// ============================================
export function parseStatusWithDate(entity: Entity): {
    entity: Entity;
    parsedDate: Date | null;
    monthKey: string | null;
    isRevoked: boolean;
    isActive: boolean;
    isConditional: boolean;
} {
    const parsedDate = extractDateFromStatus(entity.state_status || entity.rawStatus);
    const statusUpper = entity.status.toUpperCase();

    return {
        entity,
        parsedDate,
        monthKey: parsedDate ? `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}` : null,
        isRevoked: statusUpper.includes('REVOKED') || statusUpper.includes('DENIED'),
        isActive: statusUpper.includes('ACTIVE') && !statusUpper.includes('CONDITIONAL'),
        isConditional: statusUpper.includes('CONDITIONAL') || statusUpper.includes('SUSPENDED'),
    };
}
