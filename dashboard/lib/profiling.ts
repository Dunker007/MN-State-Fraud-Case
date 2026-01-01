
import { type Entity } from "./schemas";

export interface SuspectProfile {
    name: string;
    total_exposure: number;
    entity_count: number;
    avg_risk_score: number;
    max_risk_score: number;
    entities: Entity[];
    status_distribution: Record<string, number>;
    plausible_deniability: number; // calculated metric (low consistency = high risk)
    all_flags: string[];
}

export function generateSuspectProfiles(entities: Entity[]): SuspectProfile[] {
    const profiles = new Map<string, SuspectProfile>();

    entities.forEach(entity => {
        // Normalize owner name (simple uppercase trim)
        const ownerName = entity.owner.trim().toUpperCase();
        if (ownerName === "UNKNOWN" || ownerName === "N/A") return;

        if (!profiles.has(ownerName)) {
            profiles.set(ownerName, {
                name: ownerName,
                total_exposure: 0,
                entity_count: 0,
                avg_risk_score: 0,
                max_risk_score: 0,
                entities: [],
                status_distribution: {},
                plausible_deniability: 0,
                all_flags: []
            });
        }

        const profile = profiles.get(ownerName)!;

        // Update Stats
        profile.total_exposure += entity.amount_billed;
        profile.entity_count += 1;
        profile.entities.push(entity);
        profile.all_flags.push(...entity.red_flag_reason);
        profile.max_risk_score = Math.max(profile.max_risk_score, entity.risk_score);

        // Update Status Dist
        const status = entity.status.split(' as of')[0];
        profile.status_distribution[status] = (profile.status_distribution[status] || 0) + 1;
    });

    // Final Calculation Pass
    return Array.from(profiles.values()).map(p => {
        p.avg_risk_score = Math.round(p.entities.reduce((acc, e) => acc + e.risk_score, 0) / p.entity_count);

        // Plausible Deniability Score: inversely related to how "messy" their network is.
        // If they have 10 entities and 9 are Active but 1 is Revoked, that's high risk.
        // We'll calculate a "Network Toxicity" score.
        const revokedCount = (p.status_distribution["REVOKED"] || 0) + (p.status_distribution["DENIED"] || 0);
        p.plausible_deniability = Math.round((revokedCount / p.entity_count) * 100);

        return p;
    }).sort((a, b) => b.total_exposure - a.total_exposure); // Default sort by Money
}
