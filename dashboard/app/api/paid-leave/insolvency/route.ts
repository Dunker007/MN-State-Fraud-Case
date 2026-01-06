import { NextRequest, NextResponse } from 'next/server';
import { predictInsolvency, FundSnapshot } from '@/lib/insolvency-predictor';

/**
 * API endpoint for insolvency predictions
 * GET /api/paid-leave/insolvency
 */
export async function GET(request: NextRequest) {
    try {
        // TODO: Replace with actual historical data from database
        // For now, using mock data to demonstrate functionality
        const mockHistoricalData: FundSnapshot[] = generateMockData();

        const prediction = predictInsolvency(mockHistoricalData);

        return NextResponse.json({
            success: true,
            prediction,
            dataPoints: mockHistoricalData.length,
            lastUpdated: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error generating insolvency prediction:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate prediction',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * Generate mock historical data
 * TODO: Replace with actual database queries
 */
function generateMockData(): FundSnapshot[] {
    const snapshots: FundSnapshot[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // 6 months of history

    let balance = 500000000; // Start with $500M
    const dailyBurnRate = 1500000; // $1.5M per day burn

    for (let dayOffset = 0; dayOffset < 180; dayOffset += 7) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + dayOffset);

        balance -= dailyBurnRate * 7; // Weekly data points

        snapshots.push({
            date: date.toISOString(),
            balance: Math.max(0, balance),
            claims: 15000 + Math.floor(Math.random() * 1000),
            contributors: 45000 + Math.floor(Math.random() * 500),
        });
    }

    return snapshots;
}
