# Provider Data Pipeline

## Overview

This system automates the collection, storage, and querying of MN DHS provider license data.

## Data Flow

```
┌─────────────────────┐     ┌───────────────────┐     ┌────────────────────┐
│ MN Geospatial       │────▶│  masterlist.csv   │────▶│  provider_db.json  │
│ Commons Dataset     │     │  (seed data)      │     │  (queryable DB)    │
└─────────────────────┘     └───────────────────┘     └────────────────────┘
                                                               │
                                                               ▼
┌─────────────────────┐     ┌───────────────────┐     ┌────────────────────┐
│ DHS License Lookup  │◀────│  provider-scraper │────▶│  Enriched Data     │
│ Portal              │     │  (status/violat.) │     │  + Violations      │
└─────────────────────┘     └───────────────────┘     └────────────────────┘
```

## Source Data

### Primary Seed: MN Geospatial Commons
- **URL**: https://gisdata.mn.gov/dataset/econ-child-care
- **Format**: CSV/Shapefile
- **Records**: ~10-11k active + historical child care providers
- **Fields**: name, address, license_number, type, county, capacity, etc.

### Enrichment Source: DHS License Lookup
- **URL Pattern**: `https://licensinglookup.dhs.state.mn.us/Details.aspx?l={license_number}`
- **Data**: License status, violations, closure dates

## API Endpoints

### GET /api/providers

| Action | Description | Example |
|--------|-------------|---------|
| `?action=stats` | Database statistics | Total providers, by status, by county |
| `?action=query` | Query with filters | `&status=Closed&county=Hennepin` |
| `?action=closed` | Closed licenses summary | By county, service type, recent closures |
| `?action=violations` | High-violation providers | `&minViolations=3` |
| `?action=needs-scrape` | Providers needing refresh | `&maxAgeDays=30` |
| `?action=export` | Export data | `&format=csv` |
| `?action=lookup` | Single provider | `&licenseId=1127400` |

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (Active, Closed, Revoked, etc.) |
| `county` | string | Filter by county |
| `serviceType` | string | Filter by service type |
| `hasViolations` | boolean | Filter by violation status |
| `isClosed` | boolean | Filter closed licenses only |
| `minViolations` | number | Minimum violation count |
| `sortBy` | string | Field to sort by |
| `sortOrder` | asc/desc | Sort direction |
| `limit` | number | Max results |
| `offset` | number | Pagination offset |

### POST /api/providers

| Action | Description | Body |
|--------|-------------|------|
| `?action=import` | Import from masterlist | Empty body |
| `?action=scrape` | Scrape specific licenses | `{ "licenseIds": ["123", "456"] }` |
| `?action=scrape-sample` | Scrape test sample | `?size=5` |
| `?action=scrape-single` | Scrape single license | `?licenseId=1127400` |

## Scraping Configuration

```typescript
const CONFIG = {
    minDelay: 1500,      // 1.5 seconds between requests
    maxDelay: 3000,      // 3 seconds maximum delay  
    maxRetries: 3,       // Retries on failure
    retryDelay: 5000,    // 5 second retry wait
};
```

**Rate Limiting:**
- Random delay between requests (1.5-3 seconds)
- Random User-Agent rotation
- Automatic retry with backoff on failures
- CAPTCHA/block detection

## Database Schema

### ProviderRecord

| Field | Type | Description |
|-------|------|-------------|
| `license_id` | string | **Primary Key** |
| `name` | string | Provider name |
| `owner` | string | Owner name |
| `status` | string | Current status |
| `status_date` | string | Status change date |
| `is_closed` | boolean | Closed flag |
| `closure_date` | string | Closure date |
| `violation_count` | number | Total violations |
| `violation_summary` | string | Brief summary |
| `has_violations` | boolean | Violation flag |
| `street` | string | Street address |
| `city` | string | City |
| `zip` | string | ZIP code |
| `county` | string | County |
| `phone` | string | Phone number |
| `service_type` | string | Service type |
| `capacity` | number | Licensed capacity |
| `source_url` | string | DHS lookup URL |
| `first_seen` | ISO date | When first added |
| `last_checked` | ISO date | Last scrape time |
| `last_updated` | ISO date | Last field change |
| `is_ghost_office` | boolean | Flag for analysis |
| `needs_review` | boolean | Manual review flag |

## Usage Examples

### Initialize Database
```bash
# Import from masterlist
curl -X POST "http://localhost:3000/api/providers?action=import"
```

### Query Closed Licenses
```bash
# Get all closed in Hennepin County
curl "http://localhost:3000/api/providers?action=query&isClosed=true&county=Hennepin"
```

### Scrape Sample
```bash
# Scrape 5 providers for testing
curl -X POST "http://localhost:3000/api/providers?action=scrape-sample&size=5"
```

### Export CSV
```bash
# Download full export
curl "http://localhost:3000/api/providers?action=export&format=csv" > providers.csv
```

## Refresh Cadence

| Type | Frequency | Method |
|------|-----------|--------|
| Full Refresh | Monthly/Quarterly | Import + Full Scrape |
| Incremental | Weekly | Scrape stale records only |
| On-Demand | As needed | Single provider lookup |

## Files

| File | Purpose |
|------|---------|
| `lib/provider-scraper.ts` | Scraping engine with rate limiting |
| `lib/provider-db.ts` | Database operations and queries |
| `lib/provider_db.json` | JSON database file |
| `lib/masterlist.csv` | Seed data from GeoSpatial Commons |
| `app/api/providers/route.ts` | API endpoint |

## Current Stats

- **Total Providers**: 19,419
- **Closed Licenses**: 1,226
- **Counties**: 87

---

*Last Updated: 2026-01-05*
