# Minnesota State Fraud Investigation

## Repository Purpose
This repository contains **raw evidence files** and a **live investigation dashboard** for tracking fraud patterns in Minnesota state programs.

## Structure
- **Root**: Evidence files (PDFs, CSVs, audio, video, manifests)
- **/dashboard**: Live Next.js dashboard with GDELT Hunter Protocol integration

## Dashboard Features
- **Power Play Press**: Real-time GDELT news feed with rotating Hunter Protocol phases
- **Paid Leave Watch**: Insolvency tracking and fraud pattern detection  
- **Intel Feed**: Live news aggregation with deduplication
- **Evidence Visualization**: Interactive org charts and penalty box networks
- **Database**: Query 19,506 entities from complete DHS licensing database

## Running the Dashboard
```bash
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` to access the live dashboard.

## Evidence Archive
- **Masterlist**: 19,506 entities (147,484 records)
- **Forensic Report**: 2,831 curated high-risk entities
- **Documents**: 11 evidence files (audio, video, PDF, CSV)
- **Total Size**: 1.248 GB

All raw investigation materials are maintained in the repository root for archival and reference purposes.

---

**Last Updated**: January 2, 2026  
**Repository**: github.com/Dunker007/MN-State-Fraud-Case
