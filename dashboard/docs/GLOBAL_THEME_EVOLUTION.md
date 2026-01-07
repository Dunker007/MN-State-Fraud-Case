# GLOBAL THEME DOCTRINE: The Living Interface

**Version:** 1.0 (Experimental)
**Philosophy:** The interface is not static. It is a battleground between the *Official Narrative* and the *Forensic Truth*.

## 1. The Visual Tension (The "Trick")
We do not simply pick a color palette. We structure the UI to represent the conflict.

### The "Official" Base (The State)
Represents bureaucracy, status quo, and the "official story."
- **Colors:** Deep Navy (`#0a0e14`), Slate Blue (`#1e293b`), Clean White Text.
- **Typography:** Sans-Serif (Inter/Geist Sans) — Clean, approachable, "safe."
- **Borders:** Thin, subtle, solid lines.
- **Vibe:** "Nothing to see here. Everything is normal."

### The "Opposition" Overlay (The Investigation)
Represents the forensic truth, the whistleblower, and the "Purple" realization.
- **Colors:** Vikings Purple (`#4F2683`), Beacon Gold (`#FFC62F`), Neon Red (Alerts).
- **Typography:** Monospace (Geist Mono/JetBrains) — Raw, data-driven, "hacked."
- **Effects:** Glows, Glitches, Strikethroughs, Overlays.
- **Vibe:** "The data disagrees."

**Usage Rule:**
- Use **State Blue** for containers, static labels, and "expected" data.
- Use **Vikings Purple/Gold** for *deviations*, *fraud indicators*, *whistleblower notes*, and *active inputs*.
- **Subtlety:** The page starts looking "Official." As the user digs deeper (scrolls/clicks), the "Purple" elements take over.

---

## 2. Long-Term: Deterministic Evolution (Future State)
**Concept:** The site's aesthetic is not set by the developer, but by the *Visitor's Truth*.

- **Metric:** "Data Consumed Per View" (DCPV).
- **Behavior:**
    - **Low Engagement:** The site remains "Official Blue" (Safe, standard dashboard).
    - **High Engagement (Deep Dives):** The site "graduates" to "Forensic Purple." The interface reacts to their curiosity.
    - **Unique Visitor Delta:** Every visitor gets a slightly different "mutation" based on aggregate traffic patterns. If the public is angry (high traffic on specific scandals), the site grows darker/redder.

**Current Implementation (Phase 1):**
- Static implementation of the "Blue vs. Purple" tension.
- No dynamic per-visitor mutation yet (requires Vercel Edge Config / Middleware tailored for this).

---

## 3. Style Guide Shortcuts

| Element | Style Class | Meaning |
|---------|-------------|---------|
| **Official Cont.** | `bg-[#0a0e14] border-slate-800` | The Container (State) |
| **Truth Accent** | `border-purple-500/50 text-purple-400` | The Insight (Vance) |
| **Warning** | `text-yellow-500` (Gold) | Caution/Anomaly |
| **Critical** | `text-red-500` | Confirmed Fraud |

