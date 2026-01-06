import { NextResponse } from 'next/server';
import { analyzeSentiment, fetchGDELTSummary } from '@/lib/sentiment-analyzer';

export const dynamic = 'force-dynamic';

/**
 * Sentiment Analysis API
 * 
 * Analyzes GDELT tone data for anomaly detection and trend analysis.
 * Useful for monitoring public perception around PFML program.
 */

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    // Optionally fetch fresh GDELT data
    let freshData = null;
    if (refresh) {
        freshData = await fetchGDELTSummary();
    }

    // Run sentiment analysis
    const analysis = analyzeSentiment();

    // If we got fresh data, prepend it
    if (freshData) {
        analysis.history.unshift(freshData);
        analysis.currentTone = freshData.averageTone;
    }

    // Calculate alert status
    let alertLevel: 'normal' | 'elevated' | 'critical' = 'normal';
    const criticalAnomalies = analysis.anomalies.filter(a => a.severity === 'critical').length;
    const highAnomalies = analysis.anomalies.filter(a => a.severity === 'high').length;

    if (criticalAnomalies > 0) alertLevel = 'critical';
    else if (highAnomalies > 0 || analysis.currentTone < -3) alertLevel = 'elevated';

    return NextResponse.json({
        success: true,
        alertLevel,
        analysis: {
            currentTone: Math.round(analysis.currentTone * 10) / 10,
            toneInterpretation: analysis.currentTone > 2 ? 'Generally Positive'
                : analysis.currentTone > -2 ? 'Mixed/Neutral'
                    : 'Predominantly Negative',
            trendDirection: analysis.trendDirection,
            trendStrength: analysis.trendStrength,
            volatilityScore: analysis.volatilityScore,
            volatilityInterpretation: analysis.volatilityScore > 40 ? 'High - Conflicting narratives'
                : analysis.volatilityScore > 25 ? 'Moderate'
                    : 'Low - Consistent coverage'
        },
        anomalies: analysis.anomalies,
        correlations: {
            fundBalance: {
                value: analysis.correlations.fundBalanceCorrelation,
                interpretation: analysis.correlations.fundBalanceCorrelation > 0
                    ? 'Positive sentiment tracks with fund stability'
                    : 'Negative correlation - scrutiny increases as fund depletes'
            },
            fraudPatterns: {
                value: analysis.correlations.fraudPatternCorrelation,
                interpretation: analysis.correlations.fraudPatternCorrelation > 0.3
                    ? 'Strong correlation - fraud reports driving negative coverage'
                    : 'Weak correlation'
            }
        },
        history: analysis.history.slice(0, 7), // Last 7 days
        insights: generateInsights(analysis),
        source: 'GDELT 2.0 / Curated Dataset',
        timestamp: new Date().toISOString()
    });
}

function generateInsights(analysis: ReturnType<typeof analyzeSentiment>): string[] {
    const insights: string[] = [];

    if (analysis.currentTone < -2) {
        insights.push('⚠️ Current sentiment is predominantly negative - consider proactive communications');
    }

    if (analysis.trendDirection === 'negative' && analysis.trendStrength > 30) {
        insights.push('📉 Sentiment trending downward - monitor for escalation');
    }

    if (analysis.volatilityScore > 40) {
        insights.push('🔀 High volatility indicates competing narratives in media coverage');
    }

    const crashes = analysis.anomalies.filter(a => a.type === 'crash');
    if (crashes.length > 0) {
        insights.push(`🚨 ${crashes.length} sentiment crash event(s) detected in recent coverage`);
    }

    if (analysis.correlations.fraudPatternCorrelation > 0.4) {
        insights.push('🔗 Strong correlation between fraud reports and negative coverage');
    }

    if (insights.length === 0) {
        insights.push('✅ Sentiment metrics within normal parameters');
    }

    return insights;
}
