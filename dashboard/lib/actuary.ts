import { PaidLeaveSnapshot } from './paid-leave-types';

export interface ProjectionResult {
    currentBurnRateDaily: number;
    projectedInsolvencyDate: Date;
    daysUntilInsolvency: number;
    confidence: 'high' | 'medium' | 'low';
}

/**
 * Calculates the projected insolvency date based on the recent trend.
 * Uses a weighted average of recent burn rates (if available) or a default assumption.
 */
export function calculateProjection(snapshots: PaidLeaveSnapshot[], defaultBurnRateDailyMillions = 2.8): ProjectionResult {
    if (!snapshots || snapshots.length === 0) {
        // Fallback if no data
        return generateFallbackProjection(500, defaultBurnRateDailyMillions);
    }

    // Sort by date ascending (oldest first) for trend analysis
    const sorted = [...snapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const currentBalance = latest.fund_balance_millions;

    let burnRate = defaultBurnRateDailyMillions;

    // If we have at least 2 points, calculate actual velocity
    if (sorted.length >= 2) {
        // Simple linear regression or delta between first and last for now
        // TODO: Upgrade to weighted regression for Phase 3
        const oldest = sorted[0];
        const daysDiff = (new Date(latest.date).getTime() - new Date(oldest.date).getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff > 0) {
            const balanceDiff = oldest.fund_balance_millions - latest.fund_balance_millions;
            // If balance went UP (tax intake), we need logic for that. 
            // For now, assume it goes down or uses payouts if balance is static.

            if (balanceDiff > 0) {
                burnRate = balanceDiff / daysDiff;
            } else {
                // If balance is static (no update yet), look at payout total
                const payoutDiff = latest.total_payout_millions - oldest.total_payout_millions;
                if (payoutDiff > 0) {
                    burnRate = payoutDiff / daysDiff;
                }
            }
        }
    }

    // Safety clamp: If burn rate is 0 or negative (impossible in launch phase), use default
    if (burnRate <= 0.1) burnRate = defaultBurnRateDailyMillions;

    return generateFallbackProjection(currentBalance, burnRate);
}

function generateFallbackProjection(currentBalance: number, dailyBurn: number): ProjectionResult {
    const daysRemaining = currentBalance / dailyBurn;
    const now = new Date();
    const insolvencyDate = new Date(now.getTime() + (daysRemaining * 24 * 60 * 60 * 1000));

    return {
        currentBurnRateDaily: dailyBurn,
        projectedInsolvencyDate: insolvencyDate,
        daysUntilInsolvency: Math.floor(daysRemaining),
        confidence: 'medium' // Standard confidence
    };
}
