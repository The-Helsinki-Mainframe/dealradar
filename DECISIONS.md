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

## 2026-03-23 — Phase 2 Sign-Offs (Davis)

**Status:** Decided
**Decided by:** Davis (with Turkish architecture review)

### [2.1] Normalisation Tier Definitions
**Decision:** Four tiers adopted:
- 🟢 Gold — exact VZD match
- 🟡 Silver — resolved with caveats (`vzd_stripped_suffix`, `vzd_stripped_apartment`, `vzd_ambiguous_korpuss`, AI-confirmed)
- 🟠 Bronze — geocoded only, no VZD match
- 🔴 Unresolved — `vzd_no_building`, `street_only`
**Consequences:** Daily report and unresolved address tab must use these tier definitions. All address reporting queries updated to classify by tier.

### [2.2] URL Integrity
**Decision:** Option (b) — flag URL reuse and preserve both records. No silent merging.
**Sequencing:** 2.2 runs AFTER 2.4 backfill, using the mismatch report as primary evidence.
**Consequences:** URL reuse detection is empirical (from backfill mismatch data), not theoretical. Avoids building infrastructure blind.

### [2.3] Manual Override Lifecycle
**Decision:**
- `--revalidate` skips rows with active overrides entirely (not "clear then re-apply")
- Weekly override health audit query: orphaned / mismatched / suspect categories
- Import workflow: URL-only input from Davis → script resolves URL→listing_id → validates → writes. listing_id never accepted from human-authored files.
- `import_batch_id` + `created_at` columns to be added to `manual_address_overrides`
- Unique constraint on `(listing_id)` where `is_active=TRUE`
- **First action:** audit existing 109 overrides for suspect entries (URL mismatch) before any Phase 2 execution

### [2.4] Historic Data Backfill
**Decision:**
- Active listings (`is_listed=TRUE`): fetch detail page, write NULL fields only. Never overwrite existing `source_*` data.
- Inactive listings (`is_listed=FALSE`): fetch and compare only — no writes. Results stored in staging table/report. Targeted writes only after Davis reviews and signs off per batch.
- Mismatch tiers: Definite reuse (skip+flag critical) / Probable reuse (skip+flag review) / Likely variation (write+log)
- `source_detail_backfilled_at TIMESTAMPTZ` column added to distinguish backfill fetches from live scraper fetches
- Rate limit: 1–2 req/sec with jitter. Active listings first.
- Sequencing: 2.3 and 2.4 run in parallel → 2.2 uses 2.4 mismatch output

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

---

## 2026-03-23 — Phase 0 Turkish Caveats (Sanity Assertion Justifications)

**Status:** Decided
**Decided by:** Turkish (review) + Archie (implementation)
**Context:** Turkish flagged that `write_confirmed`, `write_review_queue`, `write_iz_confirmed`, `write_groups`, and `stamp_initial_duplicate` have rollbacks but no sanity assertions, potentially violating Golden Rule #4.
**Decision:** Sanity assertions are not applicable to these functions. All are additive writes (INSERT/UPDATE of new rows). They cannot cause mass data loss. Pipeline-level sanity checks on the output tables (configured in STAGES[] in pipeline.py) cover count assertions at the orchestrator level. This is explicitly documented in each function's docstring.
**Consequences:** Any future bulk-mutation function must have a sanity assertion. Additive-only functions are exempt if pipeline-level sanity covers the output table.

---

## 2026-03-23 — upsert_run Transaction Safety

**Status:** Decided
**Decided by:** Turkish (review) + Archie (implementation)
**Context:** Turkish flagged `upsert_run` in pipeline.py had no rollback or sanity assertion.
**Decision:** Wrapped in try/except with rollback. Pipeline continues if run metadata write fails — losing metadata does not justify aborting the actual scraper work. Logs at ERROR level. No Discord alert (called mid-stage, would create a feedback loop with alert_stage_failure).

---

## 2026-03-23 — source_detail_scraped_at Added to SS.com Listings

**Status:** Decided
**Decided by:** Turkish (recommended), Davis (approved)
**Context:** SS.com detail page fields (source_address_raw, source_series, source_amenities, source_floor_raw, source_cadastre_number) are scraped on a different schedule than index fields — only on new listings and price changes. The existing scraped_at column reflects index scraping only. Without a separate timestamp, you cannot determine from the data which listings have detail coverage.
**Decision:** Add source_detail_scraped_at TIMESTAMPTZ to listings table. Scraper sets it whenever it fetches the detail page. NULL = index data only, never detail-scraped.
**Consequences:** Enables audit queries like "what % of active listings have detail data?" and targeting of one-off backfill runs.
