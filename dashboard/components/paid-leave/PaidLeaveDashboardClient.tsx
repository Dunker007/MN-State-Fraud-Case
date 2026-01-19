'use client';

import { useState } from 'react';
import FundGauge from '@/components/paid-leave/FundGauge';
import PaidLeaveCountyMap from '@/components/paid-leave/PaidLeaveCountyMap';
import FraudObservatory from '@/components/paid-leave/FraudObservatory';
import OfficialWatch from '@/components/paid-leave/OfficialWatch';
import BillTracker from '@/components/paid-leave/BillTracker';
import CourtDocket from '@/components/paid-leave/CourtDocket';
import SocialPulse from '@/components/paid-leave/SocialPulse';
import DataCollectorPanel from '@/components/paid-leave/DataCollectorPanel';
import InsolvencySimulator from '@/components/paid-leave/InsolvencySimulator';
import PhoenixDetector from '@/components/paid-leave/PhoenixDetector';
import SentimentPanel from '@/components/paid-leave/SentimentPanel';
import ProviderNetworkGraph from '@/components/paid-leave/ProviderNetworkGraph';
import TestimonyTracker from '@/components/paid-leave/TestimonyTracker';
import DashboardGrid from '@/components/paid-leave/DashboardGrid';
import PaidLeaveCharts from '@/components/PaidLeaveCharts';
import InsolvencyPredictor from '@/components/InsolvencyPredictor';
import { PaidLeaveDatabase } from '@/lib/paid-leave-types';
import { ProjectionResult } from '@/lib/actuary';

interface PaidLeaveDashboardClientProps {
    dbData: PaidLeaveDatabase | null;
    projection: ProjectionResult;
    currentBalance: number;
    initialBalance: number;
}

export default function PaidLeaveDashboardClient({
    dbData,
    projection,
    currentBalance,
    initialBalance
}: PaidLeaveDashboardClientProps) {
    const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
    const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

    // Handler for county selection (drill-down)
    const handleCountySelect = (fips: string, name: string) => {
        // Toggle selection
        setSelectedCounty(prev => prev === fips ? null : fips);
    };

    // Handler for fraud pattern selection
    const handlePatternSelect = (patternId: string | null) => {
        setSelectedPattern(patternId);
    };

    // Instantiate widgets with interactivity
    const widgets = {
        countyMap: (
            <PaidLeaveCountyMap
                onCountySelect={handleCountySelect}
                selectedCounty={selectedCounty}
            />
        ),
        charts: (
            <div className="flex gap-6 h-full">
                <div className="flex-grow">
                    <PaidLeaveCharts
                        snapshots={dbData?.snapshots}
                        projection={projection}
                        lastUpdated={dbData?.meta?.last_updated}
                    />
                </div>
                <div className="w-[80px] shrink-0">
                    <FundGauge currentBalance={currentBalance} initialBalance={initialBalance} />
                </div>
            </div>
        ),
        insolvencyPredictor: <InsolvencyPredictor />,
        socialPulse: <SocialPulse />,
        billTracker: <BillTracker />,
        officialWatch: <OfficialWatch />,
        courtDocket: <CourtDocket />,
        fraudObservatory: (
            <FraudObservatory
                onPatternSelect={handlePatternSelect}
            />
        ),
        insolvencySimulator: <InsolvencySimulator />,
        phoenixDetector: <PhoenixDetector />,
        sentimentPanel: <SentimentPanel />,
        // Pass selections to Provider Network for filtering
        providerNetwork: (
            <ProviderNetworkGraph
                filterRegion={selectedCounty}
            />
        ),
        testimonyTracker: <TestimonyTracker />,
        dataCollectors: <DataCollectorPanel />,
        keyMetrics: null
    };

    return (
        <DashboardGrid widgets={widgets} />
    );
}
