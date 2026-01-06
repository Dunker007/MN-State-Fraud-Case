# PAID LEAVE WATCH - LIVE DATA INTEGRATION MASTER PLAN
**Created:** 2026-01-06  
**Last Updated:** 2026-01-06  
**Status:** PHASE 3 COMPLETE ✅

---

## EXECUTIVE SUMMARY

This document outlines the master plan to transform the Paid Leave Sandbox from static/mock data displays to a fully live, data-driven intelligence platform. The goal is to connect every chart, graph, and display element to real, verifiable data sources.

---

## IMPLEMENTATION STATUS

### ✅ Phase 1: Core Data Flow (COMPLETE)
- Created `/api/paid-leave/scrape` endpoint
- Created `/api/legislature/bills` endpoint
- Created `/api/social/pulse` endpoint
- Updated PaidLeaveCharts with live props
- Updated SocialPulse, BillTracker, DataCollectorPanel

### ✅ Phase 2: Legislature & Courts (COMPLETE)
- Created `/api/courts/search` endpoint
- Updated CourtDocket with live API
- Enhanced LiveTicker with cross-API aggregation
- Expanded OfficialWatch with detail views

### ✅ Phase 3: Fraud Pattern Detection (COMPLETE)
- Created `/api/fraud/patterns` endpoint
- Created FraudObservatory component
- 6 pattern types with evidence and risk scores
- Stats bar showing $4M estimated exposure

### 🔄 Phase 4: Geographic Intelligence (NEXT)
- County heat map with real data
- Provider database cross-reference

### 📋 Phase 5: Scheduled Automation (PLANNED)
- Cron jobs for automatic refresh
- Database migration

---

## CURRENT STATE AUDIT

### Components & Their Data Status

| Component | Current State | Data Source | Live Status |
|-----------|---------------|-------------|-------------|
| **InsolvencyCountdown** | ✅ LIVE | `lib/actuary.ts` → `paid-leave-data.json` | WORKING |
| **PaidLeaveCharts** | ✅ LIVE | Props from page + projection | WORKING |
| **FundGauge** | ✅ LIVE | Props from `paid-leave-data.json` | WORKING |
| **PaidLeaveCountyMap** | ⚠️ Mock | Simulated county distribution | NEEDS WORK |
| **VelocityStrip** | ✅ LIVE | Props from actuary calculations | WORKING |
| **ProjectionChart** | ✅ LIVE | Props from snapshots | WORKING |
| **SocialPulse** | ✅ LIVE | `/api/social/pulse` | WORKING |
| **BillTracker** | ✅ LIVE | `/api/legislature/bills` | WORKING |
| **CourtDocket** | ✅ LIVE | `/api/courts/search` | WORKING |
| **OfficialWatch** | ✅ ENHANCED | Curated DB with detail views | WORKING |
| **FraudObservatory** | ✅ LIVE | `/api/fraud/patterns` | WORKING |
| **LiveTicker** | ✅ LIVE | Aggregates all APIs | WORKING |
| **DataCollectorPanel** | ✅ LIVE | Triggers real APIs | WORKING |

---

## DATA SOURCES IDENTIFIED

### Tier 1: Official Government Sources (High Priority)

#### 1. **DEED Press Releases & Updates**
- **URL:** `https://mn.gov/deed/news/`
- **Method:** HTML Scraping with regex patterns
- **Existing Implementation:** `lib/collectors/deed-collector.ts`
- **Data Available:**
  - Fund balance updates
  - Application counts (received, approved, pending)
  - Payout totals
  - Program announcements
- **Collection Frequency:** Every 6 hours
- **Status:** IMPLEMENTED (needs live activation)

#### 2. **Minnesota Revisor - Bill Status**
- **URL:** `https://www.revisor.mn.gov/bills/status_feed.txt`
- **Method:** Delimited text file (updated daily)
- **Data Available:**
  - Bill numbers, titles, status
  - Authors, committees
  - Last action dates
- **Collection Frequency:** Every 12 hours
- **Existing Implementation:** `lib/collectors/legislature-collector.ts`
- **Status:** NEEDS IMPLEMENTATION

#### 3. **Minnesota Courts Public Access (MCRO)**
- **URL:** `https://publicaccess.courts.state.mn.us/`
- **Method:** Scraping (no public API)
- **Data Available:**
  - Case numbers, parties, status
  - Filing dates, court locations
  - Register of actions
- **Collection Frequency:** Every 24 hours
- **Existing Implementation:** `lib/collectors/court-collector.ts`
- **Status:** NEEDS IMPLEMENTATION

### Tier 2: Open Data Portals

#### 4. **Minnesota Geospatial Commons**
- **URL:** `https://gisdata.mn.gov/`
- **Method:** REST API (CKAN-based)
- **Data Available:**
  - County boundaries (for map)
  - Demographics, population data
  - Business registrations by county
- **Use Case:** County heat map enrichment
- **Status:** NOT IMPLEMENTED

#### 5. **Ramsey County Open Data**
- **URL:** `https://opendata.ramseycountymn.gov/`
- **Data Available:**
  - Property records
  - Business data
  - Geographic boundaries
- **Status:** NOT IMPLEMENTED

### Tier 3: News & Social Intelligence

#### 6. **GDELT Project DOC 2.0** (Already Implemented)
- **URL:** `https://api.gdeltproject.org/api/v2/doc/doc`
- **Method:** REST API (FREE)
- **Existing Implementation:** `lib/news-api.ts`
- **Data Available:**
  - Global news articles mentioning Minnesota, fraud, DEED
  - Tone/sentiment scores
  - Article metadata
- **Status:** ✅ FULLY IMPLEMENTED (Hunter Protocol Active)

#### 7. **Reddit API** (Free Tier)
- **URL:** `https://www.reddit.com/r/minnesota/.json`
- **Method:** REST API (Public endpoints, no auth needed for read)
- **Data Available:**
  - Posts mentioning paid leave
  - Community sentiment
  - Trending discussions
- **Status:** NOT IMPLEMENTED

#### 8. **Twitter/X API** (Limited Free Tier)
- **Method:** v2 API (requires auth)
- **Data Available:**
  - Real-time mentions
  - Hashtag tracking (#MNPaidLeave)
  - Sentiment analysis
- **Status:** PREVIOUSLY ATTEMPTED (API limits)

---

## IMPLEMENTATION PHASES

### Phase 1: Core Data Flow (IMMEDIATE - 1-2 Days)

**Goal:** Get real data flowing to all critical displays

#### 1.1 Fix PaidLeaveCharts.tsx to Use Live Data
```typescript
// Instead of hardcoded projectionData, pass from page props
interface Props {
    snapshots: PaidLeaveSnapshot[];
}
export default function PaidLeaveCharts({ snapshots }: Props) {
    const chartData = snapshots.map(s => ({
        month: s.date,
        balance: s.fund_balance_millions,
        claims: s.claims_received / 1000
    }));
    // ...
}
```

#### 1.2 Activate DEED Collector for Production
- Enable real fetch in `deed-collector.ts` (disable simulation mode)
- Add scheduled scraping via `/api/paid-leave/scrape` endpoint
- Store results in `paid-leave-data.json`

#### 1.3 Create Data Refresh Cron Job
```typescript
// api/cron/refresh-data/route.ts
// Runs every 6 hours via Vercel Cron
export async function GET() {
    await deedCollector.collect();
    await legislatureCollector.collect();
    // ...
}
```

### Phase 2: Legislature & Courts (Days 3-4)

#### 2.1 Legislature Bill Tracker API
Create `/api/legislature/bills` endpoint:
```typescript
// Fetch from revisor.mn.gov/bills/status_feed.txt
// Parse delimited format
// Filter for "paid leave" keywords
// Return structured Bill[]
```

#### 2.2 Court Docket Scraper
Create `/api/courts/search` endpoint:
```typescript
// Query MCRO for cases with keywords:
// "DEED", "paid leave", "fraud", "benefits"
// Parse HTML results
// Return structured CourtCase[]
```

### Phase 3: Social Intelligence (Days 5-6)

#### 3.1 Reddit Integration
```typescript
// lib/collectors/reddit-collector.ts
const subreddits = ['minnesota', 'twincities', 'Minneapolis'];
const keywords = ['paid leave', 'DEED', 'varilek', 'fraud'];
// Fetch and filter posts
// Calculate sentiment (positive/negative word counts)
```

#### 3.2 Enhanced SocialPulse Component
- Connect to Reddit API
- Add GDELT tone scores
- Display real mentions with timestamps

### Phase 4: Geographic Intelligence (Days 7-8)

#### 4.1 County Map Data Enhancement
```typescript
// lib/collectors/geo-collector.ts
// Fetch from MN Geospatial Commons:
// - County populations
// - Business registrations per county
// - Unemployment rates per county
// Cross-reference with claim concentrations
```

#### 4.2 Heat Map Color Coding
- Use actual claim density data when available
- Fall back to population-weighted estimation
- Add tooltip with county statistics

### Phase 5: Fraud Pattern Detection (Week 2)

#### 5.1 Pattern Analysis Engine
```typescript
// lib/fraud-patterns.ts
interface FraudPattern {
    type: 'shell_company' | 'medical_mill' | 'ip_cluster' | 'velocity_spike';
    score: number; // 0-100 risk score
    evidence: string[];
    location?: string;
}

// Analyze claim data for:
// - Zip code clustering
// - Provider certification rates
// - Time-of-day submission patterns
// - Common addresses/owners
```

---

## NEW API ENDPOINTS REQUIRED

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/paid-leave` | GET | Return all snapshots ✅ EXISTS |
| `/api/paid-leave/scrape` | POST | Trigger DEED scrape |
| `/api/legislature/bills` | GET | Fetch paid leave related bills |
| `/api/courts/search` | GET | Search court cases |
| `/api/social/pulse` | GET | Aggregate social mentions |
| `/api/geo/counties` | GET | County statistics |
| `/api/fraud/patterns` | GET | Detected fraud patterns |
| `/api/cron/refresh` | GET | Scheduled data refresh |

---

## DATA PERSISTENCE STRATEGY

### Current: JSON Files
- `lib/paid-leave-data.json` - Snapshots
- Simple, works for MVP

### Future: Database Migration
Consider migrating to:
- **SQLite** (via `better-sqlite3`) - Zero config, file-based
- **Turso** (SQLite edge) - Free tier, global replication
- **Supabase** (PostgreSQL) - Free tier, real-time subscriptions

### Data Schema
```sql
-- snapshots table
CREATE TABLE snapshots (
    id INTEGER PRIMARY KEY,
    date DATE UNIQUE,
    fund_balance_millions REAL,
    claims_received INTEGER,
    claims_approved INTEGER,
    claims_denied INTEGER,
    claims_pending INTEGER,
    total_payout_millions REAL,
    burn_rate_daily_millions REAL,
    notes TEXT,
    source_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- bills table
CREATE TABLE bills (
    bill_number TEXT PRIMARY KEY,
    title TEXT,
    status TEXT,
    last_action TEXT,
    last_action_date DATE,
    authors TEXT,
    url TEXT,
    updated_at TIMESTAMP
);

-- court_cases table
CREATE TABLE court_cases (
    case_number TEXT PRIMARY KEY,
    title TEXT,
    court TEXT,
    status TEXT,
    filing_date DATE,
    parties TEXT,
    summary TEXT,
    url TEXT,
    updated_at TIMESTAMP
);

-- social_mentions table
CREATE TABLE social_mentions (
    id TEXT PRIMARY KEY,
    platform TEXT,
    sentiment TEXT,
    text TEXT,
    author TEXT,
    timestamp TIMESTAMP,
    url TEXT
);
```

---

## EXISTING MAIN SITE ASSETS TO LEVERAGE

From reviewing the main dashboard codebase:

### Already Available
1. **GDELT Integration** (`lib/news-api.ts`) - Production ready, Hunter Protocol active
2. **Provider Database** (`lib/provider_db.json`) - 16MB of provider data
3. **Masterlist** (`lib/masterlist.json`) - 9.8MB enriched entity data
4. **Evidence Dump** (`lib/evidence_dump.json`) - 3.8MB investigative data
5. **Keyword Matrix** (`lib/keyword-matrix.ts`) - Search patterns for fraud detection
6. **Deduplication** (`lib/deduplication.ts`) - Entity matching algorithms
7. **Org Chart Data** (`lib/org-data.ts`) - DHS organizational structure

### Can Be Cross-Referenced
- Provider locations → County map heat data
- Entity names → Court case matching
- Officials → Bill sponsorship tracking

---

## SECURITY CONSIDERATIONS

1. **Rate Limiting**: Implement exponential backoff for all scrapers
2. **Caching**: Cache responses for 5-15 minutes to reduce load
3. **Error Handling**: Graceful degradation if source is unavailable
4. **Data Freshness Indicators**: Show last updated timestamps on all displays
5. **Disclaimer**: Maintain "Experimental" zone for unverified data

---

## SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Data staleness | < 6 hours for DEED data |
| API reliability | 99% uptime on scrapers |
| Component coverage | 100% live data (no mock) |
| User-facing freshness | Timestamps on all displays |

---

## NEXT IMMEDIATE ACTIONS

1. [ ] Update `PaidLeaveCharts` to accept dynamic data props
2. [ ] Enable real fetch in `deed-collector.ts`
3. [ ] Create `/api/paid-leave/scrape` endpoint
4. [ ] Create `/api/legislature/bills` endpoint
5. [ ] Integrate Reddit public API for SocialPulse
6. [ ] Add last-updated timestamps to all panels
7. [ ] Wire DataCollectorPanel buttons to actual endpoints

---

*This plan transforms Paid Leave Watch from a demonstration into a living intelligence platform.*
