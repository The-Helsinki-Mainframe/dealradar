# DealRadar — Decision Log

> Every architectural or product decision is logged here with date, options considered, and outcome.
> This answers "why did we do it this way?" for any future session.

---

## Template

```
## YYYY-MM-DD — [Decision Title]
**Status:** Decided / Pending
**Decided by:** Davis / Turkish / Archie
**Context:** Why this decision was needed.
**Options considered:**
1. Option A — pros/cons
2. Option B — pros/cons
**Decision:** What was chosen and why.
**Consequences:** What this affects.
```

---

## 2026-03-23 — Source/Normalised Column Separation

**Status:** Architecture approved, implementation pending Davis column-naming decision
**Decided by:** Turkish (architecture), Davis decision pending on naming
**Context:** The current schema overwrites `street` and `house_number` with detail-page data, and coordinates are a single field overwritten by geocoding. After normalisation runs, you cannot answer "what did SS.com actually say?" This is a data provenance failure.
**Options considered:**
1. Keep single columns, add provenance flags — simpler schema, but still mixes source and derived data
2. Add separate `source_*` columns for immutable source data, keep `*_normalised` for our processed data — clean separation, slightly more complex schema
**Decision:** Option 2. Source columns are immutable. Normalisation writes to separate columns. Neither touches the other. UI shows source data. VZD matching uses normalised data only.
**Consequences:** Schema migration required. Scrapers updated to write to `source_*`. Normaliser updated to never touch `source_*`.
**Open:** Davis must decide whether current `street`/`house_number` become `source_*` or `normalised_*`. Turkish recommendation: rename to `source_*`.

---

## 2026-03-23 — Manual Overrides Scope

**Status:** Pending Davis confirmation
**Context:** 109 manual address overrides exist in `manual_address_overrides`. Davis raised the question of whether these affect UI display or VZD matching only.
**Davis's stated intent:** Overrides affect VZD alignment only, not UI display. UI shows source data exactly as on SS.com/City24.
**Decision:** Pending formal confirmation from Davis. Captured here for tracking.

---

## 2026-03-23 — Pipeline Timeout: SS.com

**Status:** Decided
**Decided by:** Archie (based on Davis feedback)
**Context:** SS.com incremental scraper had a 90-minute timeout. With 498 listings to detail-scrape (two nights' backlog), it timed out before completing.
**Decision:** SS.com pipeline timeout set to `None` — the incremental scraper is self-terminating, never goes runaway, and should never be killed mid-run.
**Consequences:** SS.com stage will run until complete regardless of duration. Other stages have not been changed.

---

## 2026-03-22 — VZD Normalisation Resolution Chain Order

**Status:** Decided
**Decided by:** Turkish
**Context:** Multiple normalisation strategies existed with unclear precedence. Turkish mandated a specific order to minimise false resolutions.
**Decision:** Resolution chain (in order):
1. Manual override
2. Exact VZD match
3. Canonical candidates
4. Korpuss fallback (plain → variants)
5. Apartment-in-house stripping (Fix 5)
6. Reverse suffix fallback (Fix 4)
7. AI
8. vzd_no_building / street_only
**Consequences:** New confidence tags: `vzd_stripped_suffix`, `vzd_stripped_apartment`. Both treated as resolved but flagged for future self-healing when VZD registers the address.

---

## 2026-03-19 — City24 Scope: All Latvia vs Riga Only

**Status:** Decided
**Decided by:** Davis
**Context:** City24 API returns all-Latvia listings. Pipeline originally filtered by bounding box (Riga area). This was brittle and excluded some Riga listings near the boundary.
**Decision:** City24 scraper fetches all Latvia (`address[cc]=2`). Pipeline filters by `city_name = 'Rīga'` everywhere. Non-Riga data retained in DB permanently — pipeline ignores it. Never use geo bbox.
**Consequences:** DB contains non-Riga City24 data. All pipeline queries must filter `city_name = 'Rīga'`.
