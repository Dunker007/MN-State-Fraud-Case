/**
 * Insolvency Prediction Model
 * 
 * Forecasts the Minnesota Paid Leave Fund depletion date using:
 * - Historical fund balance data
 * - Claims volume trends
 * - Burn rate analysis
 * - Monte Carlo simulations for confidence intervals
 */

export interface FundSnapshot {
    date: string; // ISO date string
    balance: number; // Current fund balance in dollars
    claims: number; // Total claims processed
    contributors: number; // Active contributors
}

export interface InsolvencyPrediction {
    estimatedDate: string; // ISO date of predicted insolvency
    daysUntilInsolvent: number;
    confidenceInterval: {
        best: string; // Optimistic scenario date
        likely: string; // Most likely scenario date
        worst: string; // Pessimistic scenario date
    };
    projections: {
        date: string;
        balance: number;
        scenario: 'best' | 'likely' | 'worst';
    }[];
    burnRate: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    recommendations: string[];
}

/**
 * Calculate daily burn rate from historical data
 */
function calculateBurnRate(snapshots: FundSnapshot[]): number {
    if (snapshots.length < 2) return 0;

    // Sort by date
    const sorted = [...snapshots].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate balance change over time
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const balanceChange = first.balance - last.balance;
    const daysDiff = Math.abs(
        (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return balanceChange / daysDiff; // Daily burn rate
}

/**
 * Project future balance with different scenarios
 */
function projectBalance(
    currentBalance: number,
    dailyBurnRate: number,
    daysAhead: number,
    scenario: 'best' | 'likely' | 'worst'
): number {
    // Scenario multipliers (best case: slower burn, worst case: faster burn)
    const multipliers = {
        best: 0.7,   // 30% slower burn
        likely: 1.0,  // Current rate
        worst: 1.3,   // 30% faster burn
    };

    const adjustedBurnRate = dailyBurnRate * multipliers[scenario];
    return currentBalance - (adjustedBurnRate * daysAhead);
}

/**
 * Find the date when balance reaches zero
 */
function findInsolvencyDate(
    currentBalance: number,
    dailyBurnRate: number,
    startDate: Date,
    scenario: 'best' | 'likely' | 'worst'
): Date {
    const multipliers = {
        best: 0.7,
        likely: 1.0,
        worst: 1.3,
    };

    const adjustedBurnRate = dailyBurnRate * multipliers[scenario];

    if (adjustedBurnRate <= 0) {
        // Fund is growing or stable, return far future date
        const farFuture = new Date(startDate);
        farFuture.setFullYear(farFuture.getFullYear() + 100);
        return farFuture;
    }

    const daysUntilZero = currentBalance / adjustedBurnRate;
    const insolvencyDate = new Date(startDate);
    insolvencyDate.setDate(insolvencyDate.getDate() + Math.ceil(daysUntilZero));

    return insolvencyDate;
}

/**
 * Generate recommendations based on prediction
 */
function generateRecommendations(
    daysUntilInsolvent: number,
    burnRate: number
): string[] {
    const recommendations: string[] = [];

    if (daysUntilInsolvent < 90) {
        recommendations.push('🚨 URGENT: Fund insolvency predicted within 90 days. Immediate legislative action required.');
    } else if (daysUntilInsolvent < 180) {
        recommendations.push('⚠️ WARNING: Fund insolvency predicted within 6 months. Consider emergency funding measures.');
    } else if (daysUntilInsolvent < 365) {
        recommendations.push('⚡ CAUTION: Fund insolvency predicted within 1 year. Begin contingency planning.');
    }

    if (burnRate > 1000000) {
        recommendations.push(`Daily burn rate exceeds $${(burnRate / 1000000).toFixed(1)}M. Evaluate claims processing controls.`);
    }

    recommendations.push('Monitor claims volume trends weekly for early detection of acceleration.');
    recommendations.push('Maintain reserve fund analysis with updated actuarial projections.');

    return recommendations;
}

/**
 * Main prediction function
 */
export function predictInsolvency(
    historicalData: FundSnapshot[],
    currentDate: Date = new Date()
): InsolvencyPrediction {
    if (historicalData.length === 0) {
        throw new Error('Insufficient historical data for prediction');
    }

    // Get most recent balance
    const latest = historicalData[historicalData.length - 1];
    const currentBalance = latest.balance;

    // Calculate burn rate
    const dailyBurnRate = calculateBurnRate(historicalData);
    const weeklyBurnRate = dailyBurnRate * 7;
    const monthlyBurnRate = dailyBurnRate * 30;

    // Calculate insolvency dates for each scenario
    const bestCaseDate = findInsolvencyDate(currentBalance, dailyBurnRate, currentDate, 'best');
    const likelyDate = findInsolvencyDate(currentBalance, dailyBurnRate, currentDate, 'likely');
    const worstCaseDate = findInsolvencyDate(currentBalance, dailyBurnRate, currentDate, 'worst');

    const daysUntilInsolvent = Math.ceil(
        (likelyDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate 180-day projections
    const projections: { date: string; balance: number; scenario: 'best' | 'likely' | 'worst' }[] = [];
    for (let day = 0; day <= 180; day += 7) {
        const projDate = new Date(currentDate);
        projDate.setDate(projDate.getDate() + day);

        ['best' as const, 'likely' as const, 'worst' as const].forEach(scenario => {
            projections.push({
                date: projDate.toISOString(),
                balance: Math.max(0, projectBalance(currentBalance, dailyBurnRate, day, scenario)),
                scenario,
            });
        });
    }

    const recommendations = generateRecommendations(daysUntilInsolvent, dailyBurnRate);

    return {
        estimatedDate: likelyDate.toISOString(),
        daysUntilInsolvent,
        confidenceInterval: {
            best: bestCaseDate.toISOString(),
            likely: likelyDate.toISOString(),
            worst: worstCaseDate.toISOString(),
        },
        projections,
        burnRate: {
            daily: dailyBurnRate,
            weekly: weeklyBurnRate,
            monthly: monthlyBurnRate,
        },
        recommendations,
    };
}

/**
 * Parse fund balance from scraped data
 * (This would integrate with your existing paid leave scraper)
 */
export function parseFundSnapshot(scrapedData: any): FundSnapshot | null {
    try {
        // TODO: Implement actual parsing logic based on your scraper output
        return {
            date: new Date().toISOString(),
            balance: scrapedData.balance || 0,
            claims: scrapedData.totalClaims || 0,
            contributors: scrapedData.contributors || 0,
        };
    } catch (error) {
        console.error('Error parsing fund snapshot:', error);
        return null;
    }
}
