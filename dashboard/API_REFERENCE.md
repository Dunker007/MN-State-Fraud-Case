# API Reference v1

Base URL: `/api`

Project CrossCheck exposes a read-only API for researchers and investigators. All endpoints are rate-limited to 100 requests per minute.

---

## 📊 Analytics Endpoints

### Get Network Graph
**GET** `/analytics/network`

Returns the node-link structure of the provider network, highlighting risk clusters.

**Response:**
```json
{
  "nodes": [
    { "id": "P1", "label": "Provider A", "riskScore": 85 }
  ],
  "links": [
    { "source": "P1", "target": "P2", "type": "shared_officer" }
  ],
  "metrics": {
    "density": 0.45,
    "clusters": 3
  }
}
```

### Get Phoenix Matches
**GET** `/analytics/phoenix`

Returns list of detected "Phoenix" companies.

**Response:**
```json
[
  {
    "officer": "John Doe",
    "dissolved_entity": "Old Corp LLC",
    "new_entity": "New Corp Inc",
    "phoenix_score": 92,
    "risk_factors": ["Rapid Reappearance", "Prior Fraud"]
  }
]
```

### Get Sentiment Analysis
**GET** `/analytics/sentiment`

Returns GDELT tone volatility data for the last 7 days.

**Response:**
```json
{
  "current_tone": -4.2,
  "volatility": 1.5,
  "history": [
    { "date": "2026-01-01", "tone": -3.8 }
  ]
}
```

---

## 🏛️ Program Data

### Get Paid Leave Snapshots
**GET** `/paid-leave`

Returns historical fund balance and claim velocity.

**Response:**
```json
[
  {
    "date": "2026-01-05",
    "fund_balance_millions": 450.2,
    "claims_received": 1200
  }
]
```

### Get Risk Leaderboard
**GET** `/providers/risk`

Returns top 50 riskiest providers.

**Query Parameters:**
- `limit` (default: 50)
- `min_score` (default: 0)

---

## 📡 Live Streams

### Server-Sent Events (SSE)
**GET** `/sse`

Persistent connection stream for real-time dashboard updates.

**Events:**
- `news_update`: New GDELT article found.
- `fraud_alert`: New high-risk claim detected.
- `system_status`: API health heartbeat.
