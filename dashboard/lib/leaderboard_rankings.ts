
import { type Entity } from "./schemas";
import { type AddressCluster } from "./schemas";

export interface RankedEntity extends Entity {
    rank: number;
    is_group?: boolean;
    group_count?: number;
}

export interface NetworkKingpin {
    rank: number;
    owner: string;
    entities: string[];
    total_risk: number;
    total_exposure: number;
}

export interface LeaderboardData {
    highest_risk: RankedEntity[];
    phoenix_patterns: RankedEntity[];
    largest_exposure: RankedEntity[];
    network_kingpins: NetworkKingpin[];
    address_clusters: AddressCluster[];
}

export function generateLeaderboards(entities: Entity[], clusters: AddressCluster[]): LeaderboardData {
    // Helper to group by Owner or First Name Word
    const getGroupKey = (e: Entity) => {
        if (e.owner && e.owner !== "Unknown" && e.owner !== "HIDDEN") return e.owner;
        // Fallback: Group by first word of name (e.g. "Dungarvin", "Divine") if > 3 chars
        const firstWord = e.name.split(' ')[0].toUpperCase();
        if (firstWord.length > 3) return firstWord;
        return e.id; // No grouping
    };

    const groupedMap = new Map<string, RankedEntity>();

    entities.forEach(e => {
        const key = getGroupKey(e);

        if (!groupedMap.has(key)) {
            groupedMap.set(key, {
                ...e,
                rank: 0,
                is_group: false,
                group_count: 1,
                name: key === e.owner ? `${key} Network` : e.name // If grouping by owner, rename. If by name, keep.
            });
        } else {
            const group = groupedMap.get(key)!;
            group.is_group = true;
            group.group_count = (group.group_count || 1) + 1;
            group.amount_billed += e.amount_billed; // Sum exposure
            group.risk_score = Math.max(group.risk_score, e.risk_score); // Max risk

            // If the group name is just the First Word (e.g. "DUNGARVIN"), maybe make it presentable?
            // If we are grouping by name, we stick to the first entity found's name or the shared prefix.
            if (key !== e.owner && !group.name.toUpperCase().startsWith(key)) {
                // Checking consistency
            }
        }
    });

    const groupedEntities = Array.from(groupedMap.values());

    return {
        highest_risk: groupedEntities
            .sort((a, b) => b.risk_score - a.risk_score)
            .slice(0, 10)
            .map((e, i) => ({ ...e, rank: i + 1 })),

        phoenix_patterns: groupedEntities
            .filter(e => e.red_flag_reason.some(r => r.toUpperCase().includes("PHOENIX") || r.toUpperCase().includes("REBRAND")))
            .sort((a, b) => b.risk_score - a.risk_score)
            .slice(0, 10)
            .map((e, i) => ({ ...e, rank: i + 1 })),

        largest_exposure: groupedEntities
            .sort((a, b) => b.amount_billed - a.amount_billed)
            .slice(0, 10)
            .map((e, i) => ({ ...e, rank: i + 1 })),

        network_kingpins: calculateNetworkKingpins(entities),

        address_clusters: clusters
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
    };
}

function calculateNetworkKingpins(entities: Entity[]): NetworkKingpin[] {
    const ownerMap = new Map<string, Omit<NetworkKingpin, 'rank'>>();

    entities.forEach(e => {
        if (!e.owner || e.owner === "Unknown" || e.owner === "HIDDEN") return;

        if (!ownerMap.has(e.owner)) {
            ownerMap.set(e.owner, {
                owner: e.owner,
                entities: [],
                total_risk: 0,
                total_exposure: 0
            });
        }
        const owner = ownerMap.get(e.owner)!;
        owner.entities.push(e.id);
        owner.total_risk += e.risk_score;
        owner.total_exposure += e.amount_billed;
    });

    return Array.from(ownerMap.values())
        .filter(o => o.entities.length > 1)
        .sort((a, b) => b.total_risk - a.total_risk)
        .sort((a, b) => b.entities.length - a.entities.length)
        .slice(0, 10)
        .map((o, i) => ({ ...o, rank: i + 1 }));
}
