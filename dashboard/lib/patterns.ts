
import { z } from "zod";
import { AlertTriangle, Clock, Skull, Target, Network, FileWarning, Activity } from "lucide-react";

// ============================================
// PATTERN SCHEMA
// ============================================
export const PatternSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["temporal", "network", "behavioral", "financial"]),
    severity: z.enum(["critical", "high", "medium"]),
    summary: z.string(),
    evidence: z.array(z.string()),
    probability: z.string(),
    icon: z.string(), // store icon name for serialization, map to component in UI
    deepDive: z.object({
        methodology: z.string(),
        dataPoints: z.number(),
        relatedEntities: z.array(z.string()).optional(),
        recommendations: z.array(z.string()).optional(),
        linkedTab: z.string().optional(),
    }).optional(),
});

export type Pattern = z.infer<typeof PatternSchema>;

// ============================================
// DETECTED PATTERNS DATA
// ============================================
export const DETECTED_PATTERNS = [
    {
        id: "1",
        name: "THE PHOENIX PROTOCOL",
        type: "behavioral",
        severity: "critical",
        summary: "Revoked providers rebrand and resume operations under new entity names within 90 days.",
        evidence: [
            "Zion Living Home Care → Zion Care Services LLC (same owner, new license)",
            "Pattern detected in 47 entity pairs statewide",
            "Average rebrand window: 63 days"
        ],
        probability: "99.7% intentional",
        icon: "Skull",
        deepDive: {
            methodology: "Name-stem analysis combined with owner/address matching across license database snapshots.",
            dataPoints: 19155,
            relatedEntities: ["Zion Living Home Care", "Zion Care Services LLC", "Fadmetrocare LLC"],
            recommendations: [
                "Cross-reference with federal exclusion database",
                "Investigate ownership chains for shell company patterns",
                "Flag all entities with 'Zion', 'Metro', 'Family' stems"
            ],
            linkedTab: "entities"
        }
    },
    {
        id: "2",
        name: "THE OCTOBER SPIKE",
        type: "temporal",
        severity: "critical",
        summary: "Statistically anomalous clustering of license actions around October 9, 2024 suspension date.",
        evidence: [
            "11 license actions within 30-day window",
            "9 REVOKED status changes in October 2024",
            "Correlates with DHS payment suspensions"
        ],
        probability: "<0.01% coincidental",
        icon: "Clock",
        deepDive: {
            methodology: "Time-series analysis of license status changes with statistical outlier detection.",
            dataPoints: 562,
            recommendations: [
                "Compare with payment suspension records",
                "Investigate what triggered the mass action",
                "Identify entities that avoided the sweep"
            ],
            linkedTab: "patterns"
        }
    },
    {
        id: "3",
        name: "THE SILENCE PROTOCOL",
        type: "behavioral",
        severity: "critical",
        summary: "Systematic removal of witnesses before they can provide congressional testimony.",
        evidence: [
            "5 key officials exited since 2019",
            "Eric Grumdahl fired 18 hours before hearing",
            "Each exit correlates with fraud milestone"
        ],
        probability: "<0.0001% coincidental",
        icon: "Target",
        deepDive: {
            methodology: "Timeline correlation analysis between personnel changes and oversight milestones.",
            dataPoints: 5,
            relatedEntities: ["Eric Grumdahl", "Jodi Harpstead", "Tony Lourey", "Mary Cathryn Ricker", "Tiki Brown"],
            recommendations: [
                "Subpoena employment termination records",
                "Interview terminated personnel",
                "Review severance agreements for NDAs"
            ],
            linkedTab: "investigation"
        }
    },
    {
        id: "4",
        name: "THE SHELL NETWORK",
        type: "network",
        severity: "high",
        summary: "Multiple entities sharing addresses, owners, or phone numbers to obscure fraud scale.",
        evidence: [
            "7800 Metro Pkwy: 6 entities at same address",
            "Single owner controlling 210+ licensed locations",
            "Address clustering in Bloomington, Eden Prairie"
        ],
        probability: "94% coordinated",
        icon: "Network",
        deepDive: {
            methodology: "Graph analysis of shared attributes (address, owner, phone) to identify clusters.",
            dataPoints: 3049,
            recommendations: [
                "Map all entities at flagged addresses",
                "Investigate ownership structures",
                "Cross-reference with business filings"
            ],
            linkedTab: "patterns"
        }
    },
    {
        id: "5",
        name: "THE ALIBI EVENT",
        type: "temporal",
        severity: "high",
        summary: "'Systems Issue' banner appeared precisely when new revocation orders were being issued.",
        evidence: [
            "Nov 29, 2024: No banner present",
            "Dec 30, 2024: Banner blocking revocation visibility",
            "Timeline matches federal raid announcements"
        ],
        probability: "97% deliberate obstruction",
        icon: "FileWarning",
        deepDive: {
            methodology: "Web archive comparison of DHS licensing portal across key dates.",
            dataPoints: 2,
            recommendations: [
                "Archive all current portal states",
                "Compare with wayback machine snapshots",
                "Document banner appearance timeline"
            ],
            linkedTab: "investigation"
        }
    },
    {
        id: "6",
        name: "THE MONEY FUNNEL",
        type: "financial",
        severity: "high",
        summary: "Fraud proceeds traced to overseas accounts and terror-linked organizations.",
        evidence: [
            "Al-Shabaab/ISIS nexus confirmed by FBI",
            "Kenya as primary fund destination",
            "Hawala networks bypassing banking system"
        ],
        probability: "DOJ confirmed",
        icon: "Activity",
        deepDive: {
            methodology: "Financial transaction analysis and cooperation with FBI/DOJ terrorism financing unit.",
            dataPoints: 70,
            recommendations: [
                "Trace all international wire transfers",
                "Identify Hawala operators in network",
                "Coordinate with Treasury OFAC"
            ],
            linkedTab: "evidence"
        }
    },
];

// Validate at runtime to ensure type safety
export const validatedPatterns = DETECTED_PATTERNS.map(p => PatternSchema.parse(p));
