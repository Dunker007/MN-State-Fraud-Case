import { type Entity } from '@/lib/schemas';

type SmartQueryConfig = {
    keywords: string[];
    filter?: (entities: Entity[]) => Entity[];
    action?: string;
    headline: string;
};

export const SMART_QUERIES: Record<string, SmartQueryConfig> = {
    federal_targets: {
        keywords: ['fbi', 'raid', 'federal', 'indicted'],
        filter: (entities) => entities.filter(e => e.federal_status !== 'UNKNOWN'),
        headline: 'Entities under federal investigation'
    },

    phoenix_pattern: {
        keywords: ['phoenix', 'rebrand', 'reconstituted', 'successor'],
        filter: (entities) => entities.filter(e =>
            e.red_flag_reason.some(r => r.includes('PHOENIX'))
        ),
        headline: 'Possible shell company rebrands'
    },

    address_cluster: {
        keywords: ['same address', 'shared location', 'cluster', 'suite'],
        action: 'show_clusters',
        headline: 'High-risk address concentrations'
    },

    gap_entities: {
        keywords: ['silence period', 'gap', 'oct 9', 'dec 12', 'hidden'],
        filter: (entities) => entities.filter(e =>
            // Logic: suspended Oct 9 but still showed Active until Dec 12
            // Since we don't have 'history' in the entity object fully, we check for Indicted or specific names
            e.federal_status === 'INDICTED' || e.status.includes('REVOKED')
        ),
        headline: 'Entities operating during the 64-day gap'
    },

    high_risk: {
        keywords: ['high risk', 'dangerous', 'suspicious', 'red flag'],
        filter: (entities) => entities.filter(e => e.risk_score >= 100),
        headline: 'High-Risk Entities (Score 100+)'
    },

    top_billed: {
        keywords: ['follow money', 'top billed', 'highest exposure', 'money', 'expensive'],
        filter: (entities) => [...entities].sort((a, b) => b.amount_billed - a.amount_billed).slice(0, 10),
        headline: 'Top 10 Entities by Estimated Exposure'
    }
};
