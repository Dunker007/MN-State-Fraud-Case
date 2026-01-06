export interface PaidLeaveSnapshot {
    date: string;
    fund_balance_millions: number;
    claims_received: number;
    claims_approved: number;
    claims_denied: number;
    claims_pending: number;
    total_payout_millions: number;
    burn_rate_daily_millions: number;
    notes?: string;
    source_url?: string;
}

export interface PaidLeaveDatabase {
    meta: {
        last_updated: string;
        version: string;
    };
    snapshots: PaidLeaveSnapshot[];
}
