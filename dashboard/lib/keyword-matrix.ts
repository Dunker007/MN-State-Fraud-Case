/**
 * KEYWORD MATRIX - Single Source of Truth
 * Used by: news-api.ts, news-scraper.ts, hunter-protocol.js
 * 
 * The "Battle-Tested" matrix for hunting MN DHS fraud patterns.
 * Updated: Jan 2026 by Alex Vance
 */

// ============================================
// GDELT-OPTIMIZED KEYWORDS (Quoted for exact matching)
// ============================================
export const KEYWORD_MATRIX_GDELT = {
    highValueTargets: [
        '"Nick Shirley"',
        '"Tim Walz" "Fraud"',
        '"Jodi Harpstead"',
        '"Keith Ellison" "Fraud"',
        '"Feeding Our Future"',
        '"Aimee Bock"',
        '"MN DHS Inspector General"',
        '"Liz Collin" "Alpha News"',
        '"Matt Varilek"',
        '"House Oversight Committee MN Paid Leave"'
    ],
    honeyPots: [
        '"CCAP" "Fraud"',
        '"Child Care Assistance" "Fraud"',
        '"Personal Care Assistant" "Fraud"',
        '"Autism Center" "Investigation"',
        '"Adult Day Care" "Fraud"',
        '"Waivered Services"',
        '"EIDBI" OR "Early Intensive Developmental"',
        '"MFIP Fraud"',
        '"MN Paid Leave"',
        '"Paid Family Leave Minnesota"',
        '"DEED Paid Leave"'
    ],
    mechanisms: [
        '"Ghost Employee"',
        '"Billing for dead"',
        '"Kickback scheme"',
        '"Shell company" "Fraud"',
        '"Identity theft" "Daycare"',
        '"False claims" "Medicaid"',
        '"Wire fraud" "Minnesota"',
        '"Pay-to-play"',
        '"Auto-approval fraud"',
        '"Medical certification scam"',
        '"Leave claim ghost employee"'
    ],
    spiderweb: [
        '"Overseas transfer Minnesota"',
        '"RICO Minnesota"',
        '"Federal indictment Minnesota"',
        '"Whistleblower DHS"',
        '"FBI raid Minnesota"',
        '"US Attorney Minnesota"',
        '"Retaliation DHS employee"',
        '"Paid Leave insolvency"',
        '"DEED audit"',
        '"Paid Leave tax hike"'
    ]
};

// ============================================
// PLAIN KEYWORDS (For local relevance scoring)
// ============================================
export const KEYWORD_MATRIX_PLAIN = {
    highValueTargets: [
        "Nick Shirley",
        "Tim Walz Fraud",
        "Jodi Harpstead",
        "Keith Ellison Fraud",
        "Office of Legislative Auditor OR OLA",
        "MN DHS Inspector General",
        "Kulani Moti",
        "Hennepin County Board Fraud",
        "Feeding Our Future",
        "Aimee Bock",
        "Joe Thompson Prosecutor",
        "Liz Collin Alpha News"
    ],
    honeyPots: [
        "CCAP OR Child Care Assistance Program",
        "Personal Care Assistant OR PCA",
        "Autism Center Investigation",
        "Adult Day Care Fraud",
        "Group Home Violations",
        "Waivered Services",
        "Non-profit grant Misappropriation",
        "Housing Support Hennepin",
        "Early Intensive Developmental and Behavioral Intervention OR EIDBI",
        "MFIP Fraud",
        "SNAP Minnesota"
    ],
    mechanisms: [
        "Ghost Employee",
        "Billing for dead",
        "Kickback scheme",
        "Shell company Minnesota",
        "Identity theft Daycare",
        "False claims Medicaid",
        "Money laundering Minneapolis",
        "Wire fraud Minnesota",
        "Pay-to-play",
        "Background study violation",
        "License revocation DHS",
        "Jury bribe attempt Minnesota",
        "Cash smuggling MSP Airport"
    ],
    spiderweb: [
        "Overseas transfer Minnesota",
        "RICO Minnesota",
        "Federal indictment Minnesota",
        "Whistleblower DHS",
        "FBI raid Minnesota",
        "US Attorney's Office Minnesota",
        "Retaliation DHS employee"
    ]
};

// ============================================
// HUNTER PROTOCOL PHASE NAMES
// ============================================
export const HUNTER_PHASES = {
    0: { name: 'PHASE 1: HIGH VALUE TARGETS (GLOBAL)', key: 'highValueTargets' as const },
    1: { name: 'PHASE 2: HONEY POTS (NATIONAL SCAN)', key: 'honeyPots' as const },
    2: { name: 'PHASE 3: MECHANISMS & TACTICS', key: 'mechanisms' as const },
    3: { name: 'PHASE 4: THE SPIDERWEB (RICO/FBI)', key: 'spiderweb' as const }
};

/**
 * Get current Hunter Protocol phase based on time
 * Rotates every 15 minutes
 */
export function getCurrentHunterPhase(): {
    phaseName: string;
    keywords: string[];
    quarterIndex: number
} {
    const minutes = new Date().getMinutes();
    const quarterIndex = Math.floor(minutes / 15) as 0 | 1 | 2 | 3;
    const phase = HUNTER_PHASES[quarterIndex];

    return {
        phaseName: phase.name,
        keywords: KEYWORD_MATRIX_GDELT[phase.key],
        quarterIndex
    };
}

// ============================================
// RELEVANCE SCORING WEIGHTS
// ============================================
export const FRAUD_SCORING_KEYWORDS = [
    { term: '"Feeding Our Future"', weight: 15 },
    { term: '"Medicaid fraud Minnesota"', weight: 15 },
    { term: 'feeding our future', weight: 10 },
    { term: 'fof fraud', weight: 10 },
    { term: 'grumdahl', weight: 9 },
    { term: 'harpstead', weight: 9 },
    { term: 'aimee bock', weight: 9 },
    { term: 'daycare fraud', weight: 8 },
    { term: 'childcare fraud', weight: 8 },
    { term: '$250 million', weight: 8 },
    { term: 'billion dollar fraud', weight: 8 },
    { term: 'minnesota fraud', weight: 7 },
    { term: 'dhs fraud', weight: 7 },
    { term: 'walz fraud', weight: 7 },
    { term: 'welfare fraud', weight: 6 },
    { term: 'pca fraud', weight: 6 },
    { term: 'home care fraud', weight: 6 },
    { term: 'al-shabaab', weight: 10 },
    { term: 'terror financing', weight: 9 },
    { term: 'federal indictment', weight: 5 },
];

// ============================================
// EXCLUSION KEYWORDS (Sports, Entertainment, etc.)
// ============================================
export const EXCLUDE_KEYWORDS = [
    'nfl', 'nba', 'mlb', 'nhl', 'ncaa', 'super bowl', 'playoffs',
    'vikings', 'twins', 'timberwolves', 'wild', 'gophers',
    'sports', 'game', 'score', 'touchdown', 'basketball', 'baseball', 'hockey',
    'movie', 'film', 'tv show', 'entertainment', 'celebrity', 'actor', 'actress',
    'grammy', 'oscar', 'emmy', 'music video', 'album', 'concert', 'tour',
    'recipe', 'cooking', 'restaurant review', 'food critic', 'weather forecast'
];
