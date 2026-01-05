# Automation Tasks & Ideas

*Ideas emerge through discovery - document them as they arise*

---

## ✅ COMPLETED

### DHS Site Monitoring System
- [x] **DHS Excuse Tracker API** (`/api/dhs-monitor`)
  - Real-time site status checking
  - Excuse pattern detection (15+ patterns)
  - Historical incident logging
  - Wayback Machine integration
  
- [x] **Excuse Tracker UI** (`components/ExcuseTracker.tsx`)
  - Live status display
  - Excuse frequency tracking
  - Historical Wayback data
  - News correlation button

- [x] **News Correlation API** (`/api/news-correlation`)
  - GDELT integration for news search
  - Correlates incidents with press coverage
  - Suspicious timing detection

- [x] **Daily Snapshot Script** (`scripts/daily-snapshot.ps1`)
  - Runs every 12 hours (3-week intensive period)
  - HTML capture with excuse detection
  - Link change monitoring (new/removed links)
  - Wayback archival requests
  - CSV logging

- [x] **Bulk Wayback Downloader** (`scripts/bulk-wayback-download.ps1`)
  - [x] Downloaded 328 historical Wayback snapshots (2007-2026)
  - [x] Generated excuse timeline spanning 19 years
  - [x] Saved 41 historical documents (PDF/Excel)
  - [x] **Visual Capture Phase** (309 screenshots generated)

- [x] **Master Census Collector** (`scripts/master-census-sweep.ps1`)
  - [x] Successfully swept all 87 Minnesota counties
  - [x] Captured 22,000+ provider records in CSV format
  - [x] Integrated into Dashboard Masterlist

- [x] **License Verifier** (`components/LicenseVerifier.tsx`)
  - DHS license lookup automation
  - Manual CSV fallback when blocked
  - Database comparison

---

## 🔄 IN PROGRESS

### Overnight Data Haul (Complete)
- [x] 328 Wayback snapshots archived
- [x] 41 Historical documents recovered
- [x] 87 County master census database built
- [x] Visual Capture Rendering (9% complete and running)

---

## 📋 TODO - Future Automation Ideas

### Monitoring Enhancements
- [ ] **Multi-page monitoring** - Track Results.aspx, Details.aspx, etc.
- [ ] **Screenshot capture** - Use Playwright for actual screenshots, not just HTML
- [ ] **Archive.today integration** - Pull from both Wayback AND Archive.today
- [ ] **Memento Time Travel API** - Aggregate multiple archive sources

### Alert System
- [ ] **Email alerts** - Send notification when excuses detected
- [ ] **Slack/Discord webhook** - Real-time alerts to team
- [ ] **Dashboard notification badge** - Show unread incidents
- [ ] **SMS alerts** - For critical findings

### Analysis Tools
- [ ] **Excuse pattern visualization** - Chart excuses over time
- [ ] **News correlation timeline** - Visual overlay of excuses vs news
- [ ] **Anomaly detection** - ML-based pattern recognition
- [ ] **Weekend/holiday analysis** - Do outages cluster on specific days?

### Data Collection
- [ ] **Provider status tracking** - Daily snapshot of all 19k+ providers
- [ ] **License change detection** - Alert when provider status changes
- [ ] **Violation scraping** - Track Licensing Actions/Maltreatment data
- [ ] **FOIA request automation** - Template and track requests

### Third-Party Monitoring
- [ ] **Minnesota IT Status** - Monitor mn.gov status pages
- [ ] **MNIT Twitter/X** - Track outage announcements
- [ ] **DHS press releases** - Scrape official announcements
- [ ] **Legislative calendar** - Correlate with hearings/sessions

### Evidence Preservation
- [ ] **IPFS archival** - Immutable storage of evidence
- [ ] **Blockchain timestamp** - Proof of capture time
- [ ] **PDF generation** - Convert HTML to timestamped PDFs
- [ ] **Video recording** - Browser session recordings

---

## 💡 Discovered Patterns (Document as found)

### Known DHS Excuses (as of 2026-01-04)
1. CAPTCHA_BLOCK - "apologize for the inconvenience"
2. BOT_DETECTION - "activity and behavior made us think bot"
3. SYSTEMS_ISSUE - "DHS is aware of a systems issue"
4. DOCUMENTS_NOT_POSTING - "preventing documents from posting"
5. MNIT_BLAME - "working with MNIT to resolve"
6. PAPER_FALLBACK - "hard copies being mailed"
7. RADWARE_SECURITY - Radware/perfdrive blocking
8. MAINTENANCE - general maintenance
9. TECHNICAL_DIFFICULTIES - "experiencing difficulties"

### Archive Coverage
- Wayback Machine: 310+ snapshots (2007-present)
- Archive.today: 22 snapshots (2016-present)
- Most captures during 2015-2016 peak

---

*Last updated: 2026-01-04 07:50*
