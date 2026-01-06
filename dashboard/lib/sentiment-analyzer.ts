/**
 * GDELT Sentiment & Anomaly Analysis
 * 
 * Uses GDELT 2.0 API to monitor:
 * - Tone volatility regarding MN Paid Leave
 * - News frequency spikes
 * - Sentiment correlation with fund metrics
 */

export interface GDELTToneResult {
    date: string;
    articles: number;
    averageTone: number;  // -100 to +100
    toneVolatility: number;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
    topThemes: string[];
}

export interface SentimentAnomaly {
    type: 'spike' | 'crash' | 'volatility' | 'divergence';
    date: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    toneChange: number;  // Day-over-day change
    articleVolume: number;
    recommendation: string;
}

export interface SentimentAnalysisResult {
    currentTone: number;
    trendDirection: 'positive' | 'negative' | 'stable';
    trendStrength: number;  // 0-100
    volatilityScore: number;
    anomalies: SentimentAnomaly[];
    history: GDELTToneResult[];
    correlations: {
        fundBalanceCorrelation: number;
        claimVelocityCorrelation: number;
        fraudPatternCorrelation: number;
    };
}

// GDELT Summary API endpoint
const GDELT_SUMMARY_API = 'https://api.gdeltproject.org/api/v2/summary/summary';

// Simulated historical tone data (would be fetched from GDELT in production)
const HISTORICAL_TONE: GDELTToneResult[] = [
    { date: '2026-01-05', articles: 47, averageTone: -2.3, toneVolatility: 4.2, positiveCount: 12, negativeCount: 28, neutralCount: 7, topThemes: ['insolvency', 'fraud', 'claims'] },
    { date: '2026-01-04', articles: 52, averageTone: -1.8, toneVolatility: 3.8, positiveCount: 15, negativeCount: 30, neutralCount: 7, topThemes: ['launch', 'benefits', 'concerns'] },
    { date: '2026-01-03', articles: 38, averageTone: 1.2, toneVolatility: 2.5, positiveCount: 20, negativeCount: 12, neutralCount: 6, topThemes: ['launch', 'success', 'applications'] },
    { date: '2026-01-02', articles: 89, averageTone: 2.5, toneVolatility: 3.1, positiveCount: 52, negativeCount: 25, neutralCount: 12, topThemes: ['launch', 'celebration', 'workers'] },
    { date: '2026-01-01', articles: 124, averageTone: 4.8, toneVolatility: 2.2, positiveCount: 85, negativeCount: 22, neutralCount: 17, topThemes: ['launch day', 'historic', 'workers rights'] },
    { date: '2025-12-31', articles: 67, averageTone: 3.2, toneVolatility: 2.8, positiveCount: 42, negativeCount: 15, neutralCount: 10, topThemes: ['anticipation', 'ready', 'employers'] },
    { date: '2025-12-30', articles: 45, averageTone: 2.1, toneVolatility: 2.4, positiveCount: 28, negativeCount: 12, neutralCount: 5, topThemes: ['preparation', 'guidance', 'questions'] }
];

/**
 * Detect sentiment anomalies from tone history
 */
export function detectSentimentAnomalies(history: GDELTToneResult[]): SentimentAnomaly[] {
    const anomalies: SentimentAnomaly[] = [];

    if (history.length < 2) return anomalies;

    // Calculate baselines
    const avgTone = history.reduce((sum, h) => sum + h.averageTone, 0) / history.length;
    const avgVolume = history.reduce((sum, h) => sum + h.articles, 0) / history.length;
    const toneStdDev = Math.sqrt(
        history.reduce((sum, h) => sum + Math.pow(h.averageTone - avgTone, 2), 0) / history.length
    );

    for (let i = 0; i < history.length - 1; i++) {
        const current = history[i];
        const previous = history[i + 1];
        const toneChange = current.averageTone - previous.averageTone;

        // Sentiment crash detection (sudden negative shift)
        if (toneChange < -3) {
            const severity = toneChange < -5 ? 'critical'
                : toneChange < -4 ? 'high'
                    : 'medium';
            anomalies.push({
                type: 'crash',
                date: current.date,
                severity,
                description: `Sentiment crashed ${Math.abs(toneChange).toFixed(1)} points in 24 hours`,
                toneChange,
                articleVolume: current.articles,
                recommendation: 'Monitor for escalation, prepare crisis response'
            });
        }

        // Sentiment spike detection (sudden positive shift)
        if (toneChange > 3) {
            anomalies.push({
                type: 'spike',
                date: current.date,
                severity: 'medium',
                description: `Positive sentiment spike of +${toneChange.toFixed(1)} points`,
                toneChange,
                articleVolume: current.articles,
                recommendation: 'Investigate cause - may indicate coordinated PR or genuine improvement'
            });
        }

        // High volatility detection
        if (current.toneVolatility > 4) {
            anomalies.push({
                type: 'volatility',
                date: current.date,
                severity: current.toneVolatility > 5 ? 'high' : 'medium',
                description: `High tone volatility (${current.toneVolatility.toFixed(1)}) indicates conflicting narratives`,
                toneChange,
                articleVolume: current.articles,
                recommendation: 'Identify competing narratives and key influencers'
            });
        }

        // Volume spike with negative sentiment
        if (current.articles > avgVolume * 1.5 && current.averageTone < -2) {
            anomalies.push({
                type: 'divergence',
                date: current.date,
                severity: 'high',
                description: `High coverage volume (${current.articles} articles) with negative sentiment`,
                toneChange,
                articleVolume: current.articles,
                recommendation: 'Major negative news event - review headlines immediately'
            });
        }
    }

    return anomalies;
}

/**
 * Analyze sentiment trends and correlations
 */
export function analyzeSentiment(
    history: GDELTToneResult[] = HISTORICAL_TONE,
    fundMetrics?: { balanceChange: number; claimVelocity: number; patternCount: number }
): SentimentAnalysisResult {
    if (history.length === 0) {
        return {
            currentTone: 0,
            trendDirection: 'stable',
            trendStrength: 0,
            volatilityScore: 0,
            anomalies: [],
            history: [],
            correlations: {
                fundBalanceCorrelation: 0,
                claimVelocityCorrelation: 0,
                fraudPatternCorrelation: 0
            }
        };
    }

    const currentTone = history[0].averageTone;

    // Calculate trend
    const recentAvg = history.slice(0, 3).reduce((s, h) => s + h.averageTone, 0) / 3;
    const olderAvg = history.slice(3).reduce((s, h) => s + h.averageTone, 0) / Math.max(1, history.length - 3);
    const trendDiff = recentAvg - olderAvg;

    let trendDirection: 'positive' | 'negative' | 'stable' = 'stable';
    if (trendDiff > 1) trendDirection = 'positive';
    else if (trendDiff < -1) trendDirection = 'negative';

    const trendStrength = Math.min(100, Math.abs(trendDiff) * 20);

    // Calculate overall volatility
    const volatilityScore = Math.round(
        history.reduce((sum, h) => sum + h.toneVolatility, 0) / history.length * 10
    );

    // Detect anomalies
    const anomalies = detectSentimentAnomalies(history);

    // Calculate correlations (simulated - would use real data)
    const correlations = {
        fundBalanceCorrelation: currentTone > 0 ? 0.3 : -0.4,
        claimVelocityCorrelation: -0.25,
        fraudPatternCorrelation: currentTone < 0 ? 0.55 : 0.2
    };

    return {
        currentTone,
        trendDirection,
        trendStrength,
        volatilityScore,
        anomalies,
        history,
        correlations
    };
}

/**
 * Fetch fresh data from GDELT (would be used in production)
 */
export async function fetchGDELTSummary(query: string = 'Minnesota "Paid Leave"'): Promise<GDELTToneResult | null> {
    try {
        const url = new URL(GDELT_SUMMARY_API);
        url.searchParams.set('d', query);
        url.searchParams.set('mode', 'ToneChart');
        url.searchParams.set('format', 'json');
        url.searchParams.set('timespan', '24h');

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'ProjectCrosscheck/2.0 (Research)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('[GDELT] API error:', response.status);
            return null;
        }

        const data = await response.json();

        // Parse GDELT response format
        return {
            date: new Date().toISOString().split('T')[0],
            articles: data.timeline?.[0]?.value || 0,
            averageTone: data.tone?.[0]?.value || 0,
            toneVolatility: Math.abs(data.tone?.[0]?.value - (data.tone?.[1]?.value || 0)),
            positiveCount: Math.round((data.timeline?.[0]?.value || 0) * 0.4),
            negativeCount: Math.round((data.timeline?.[0]?.value || 0) * 0.4),
            neutralCount: Math.round((data.timeline?.[0]?.value || 0) * 0.2),
            topThemes: ['paid leave', 'minnesota', 'workers']
        };
    } catch (error) {
        console.error('[GDELT] Fetch error:', error);
        return null;
    }
}
