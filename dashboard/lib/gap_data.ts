
export interface DailyGapData {
    date: string;
    day_number: number;
    event_type: "SUSPENSION" | "SILENCE" | "FBI_RAID" | "PUBLIC_ANNOUNCEMENT" | "NORMAL";
    event_title?: string;
    entities_affected?: number;
    entities_still_active: number;
    public_knew: boolean;
    estimated_daily_transactions: number;
    children_in_affected_programs?: number;
    key_details: string[];
}

const START_DATE = new Date("2024-10-09");
const END_DATE = new Date("2024-12-12");

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

const SPECIAL_EVENTS: Record<string, Partial<DailyGapData>> = {
    "2024-10-09": {
        event_type: "SUSPENSION",
        event_title: "Secret Suspension Order",
        key_details: [
            "DHS internally suspends 14 entities",
            "No public announcement",
            "State website still shows 'Active' status"
        ]
    },
    "2024-11-15": {
        event_type: "FBI_RAID",
        event_title: "Federal Raids Begin",
        estimated_daily_transactions: 85000,
        key_details: [
            "FBI raids Prestige Health Services",
            "State website STILL shows 'Active'",
            "Media reports raids but can't verify licenses"
        ]
    },
    "2024-12-12": {
        event_type: "PUBLIC_ANNOUNCEMENT",
        event_title: "AG Announces Indictments",
        public_knew: true,
        key_details: [
            "First public acknowledgment",
            "Statuses finally update to 'Suspended'",
            "64 days after internal action"
        ]
    }
};

const generateDailyData = (): DailyGapData[] => {
    const days: DailyGapData[] = [];
    const totalDays = 64;

    for (let i = 0; i <= totalDays; i++) {
        const currentDate = addDays(START_DATE, i);
        const dateStr = formatDate(currentDate);
        const special = SPECIAL_EVENTS[dateStr];

        const baseData: DailyGapData = {
            date: dateStr,
            day_number: i,
            event_type: "SILENCE",
            entities_still_active: 14,
            public_knew: false,
            estimated_daily_transactions: 45000 + (Math.random() * 5000), // Fluctuation
            children_in_affected_programs: 230,
            key_details: [
                "Parents continue enrolling children",
                "Providers continue billing state",
                "Public has no way to know"
            ]
        };

        if (special) {
            days.push({ ...baseData, ...special });
        } else {
            days.push(baseData);
        }
    }
    return days;
};

export const gapAnalysis = {
    gap_start: "2024-10-09",
    gap_end: "2024-12-12",
    total_days: 64,
    daily_data: generateDailyData(),
    aggregate_impact: {
        total_transactions_during_gap: 3200000,
        children_potentially_affected: 450,
        entities_protected: 14,
        news_mentions_during_gap: 3,
        public_tips_received: 0
    }
};
