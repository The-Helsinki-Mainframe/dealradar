# DealRadar — Audit & Roadmap

> **Architecture review:** Turkish (Claude Opus)
> **Execution:** Archie
> **Sign-off:** Davis
> **Started:** 2026-03-23
> **Tracking:** [GitHub Issues](https://github.com/The-Helsinki-Mainframe/dealradar/issues)

---

## Why This Exists

DealRadar was producing incorrect data silently. Reports showed >100% normalisation rates. 435 unresolved addresses appeared as 1. Scrapers failed for two nights without anyone knowing. Pipeline reports never delivered since launch. This roadmap is the structured fix — executed piece by piece, with Turkish reviewing every phase and Davis signing off before we move on.

**Core principle:** Source data is sacred. What SS.com/City24 show is recorded exactly as-is, permanently. Our normalisation, geocoding, and matching operate on separate columns. They never overwrite source truth.

---

## Phase 0 — Observability & Trust Foundation
**Goal:** Never fail silently.
**Status:** 🔵 In Progress

| # | Issue | Status | Davis Input? |
|---|-------|--------|:---:|
| [0.1](https://github.com/The-Helsinki-Mainframe/dealradar/issues/1) | Pipeline health monitoring — per-step status & Discord alerts | ✅ Done 2026-03-23 | No |
| [0.2](https://github.com/The-Helsinki-Mainframe/dealradar/issues/2) | Transaction safety audit — every DB-writing function | ✅ Done 2026-03-23 | No |
| [0.3](https://github.com/The-Helsinki-Mainframe/dealradar/issues/3) | Pipeline ordering fix — dedup after all scrapers complete | ✅ Done 2026-03-23 | No |
| [0.4](https://github.com/The-Helsinki-Mainframe/dealradar/issues/4) | **Turkish gate: Phase 0 sign-off** | ✅ Done 2026-03-23 | ✅ |

---

## Phase 1 — Data Provenance: Source vs Normalised Separation
**Goal:** Source data is immutable.
**Status:** ✅ Complete — 2026-03-23

| # | Issue | Status | Davis Input? |
|---|-------|--------|:---:|
| [1.1](https://github.com/The-Helsinki-Mainframe/dealradar/issues/5) | Schema migration — add immutable source_* columns | ✅ Done 2026-03-23 | ✅ |
| [1.2](https://github.com/The-Helsinki-Mainframe/dealradar/issues/6) | Coordinate separation — capture SS.com/City24 source map coords | ✅ Done 2026-03-23 | No |
| [1.3](https://github.com/The-Helsinki-Mainframe/dealradar/issues/7) | Field completeness audit — all sources vs DB | ✅ Done 2026-03-23 | ✅ |
| [1.4](https://github.com/The-Helsinki-Mainframe/dealradar/issues/8) | **Turkish gate: Phase 1 sign-off** | ✅ Done 2026-03-23 | ✅ |

---

## Phase 2 — Data Integrity & Correctness
**Goal:** Every record is trustworthy, or explicitly flagged.
**Status:** 🔄 IN PROGRESS (Turkish gate pending)

| # | Issue | Status | Davis Input? |
|---|-------|--------|:---:|
| [2.1](https://github.com/The-Helsinki-Mainframe/dealradar/issues/9) | Normalisation tier definitions — fix unresolved address reporting | ✅ Closed | ✅ |
| [2.2](https://github.com/The-Helsinki-Mainframe/dealradar/issues/10) | URL integrity check — detect and handle URL reuse | ✅ Closed | ✅ |
| [2.3](https://github.com/The-Helsinki-Mainframe/dealradar/issues/11) | Manual overrides audit — verify all 109 entries | ✅ Closed | ✅ |
| [2.3b](https://github.com/The-Helsinki-Mainframe/dealradar/issues/24) | Manual override submission & integration workflow | ✅ Closed | ✅ |
| [2.4](https://github.com/The-Helsinki-Mainframe/dealradar/issues/12) | Historic data completeness — identify and recover | ✅ Closed | ✅ |
| [2.5](https://github.com/The-Helsinki-Mainframe/dealradar/issues/13) | **Turkish gate: Phase 2 sign-off** | 🔄 In Review | ✅ |

---

## Phase 3 — Dedup & Cross-Source Matching Audit
**Goal:** Verify dedup and matching actually work.
**Status:** ⚪ Not Started

| # | Issue | Status | Davis Input? |
|---|-------|--------|:---:|
| [3.1](https://github.com/The-Helsinki-Mainframe/dealradar/issues/14) | Within-source dedup audit — sample review with Davis | Open | ✅ |
| [3.2](https://github.com/The-Helsinki-Mainframe/dealradar/issues/15) | Cross-source matching audit — sample review with Davis | Open | ✅ |
| [3.3](https://github.com/The-Helsinki-Mainframe/dealradar/issues/16) | Izsoles matching audit | Open | No |
| [3.4](https://github.com/The-Helsinki-Mainframe/dealradar/issues/17) | **Turkish gate: Phase 3 sign-off** | Open | ✅ |

---

## Phase 4 — Daily Report & Reporting Standards
**Goal:** Every number in the report corresponds to something Davis can verify.
**Status:** ⚪ Not Started

| # | Issue | Status | Davis Input? |
|---|-------|--------|:---:|
| [4.1](https://github.com/The-Helsinki-Mainframe/dealradar/issues/18) | Report definition document — exact definition for every metric | Open | ✅ |
| [4.2](https://github.com/The-Helsinki-Mainframe/dealradar/issues/19) | Report QA checklist — automated sanity checks before delivery | Open | No |
| [4.3](https://github.com/The-Helsinki-Mainframe/dealradar/issues/20) | Report format revision — align with what Davis wants | Open | ✅ |
| [4.4](https://github.com/The-Helsinki-Mainframe/dealradar/issues/21) | **Turkish gate: Phase 4 sign-off** | Open | ✅ |

---

## Phase 5 — Continuous QA Workflow
**Goal:** Nothing reaches Davis unverified.
**Status:** ⚪ Not Started (ongoing)

| # | Issue | Status | Davis Input? |
|---|-------|--------|:---:|
| [5.1](https://github.com/The-Helsinki-Mainframe/dealradar/issues/22) | Pre-delivery checklist — Archie QA process | Open | No |
| [5.2](https://github.com/The-Helsinki-Mainframe/dealradar/issues/23) | Regression test suite — core pipeline logic | Open | No |
| [5.3](https://github.com/The-Helsinki-Mainframe/dealradar/issues/25) | Build reusable audit tooling — deterministic QA scripts | Open | No |

---

## Timeline

```
Phase 0 (Observability)     ████████░░░░░░░░░░░░░░░░░░░░  Week 1–2
Phase 1 (Data Provenance)           ████████████░░░░░░░░  Week 2–4
Phase 2 (Data Integrity)                    ████████████  Week 4–6
Phase 3 (Dedup Audit)                               ████  Week 6–7
Phase 4 (Reporting)                                   ██  Week 7–8
Phase 5 (Continuous QA)     ██████████████████████████    Ongoing
```

---

## Davis Sign-Offs Pending

1. **[1.1]** Column naming: do current `street`/`house_number` become `source_*` or `normalised_*`?
2. **[1.3]** Field audit matrix: which missing fields are worth capturing?
3. **[2.1]** Normalisation tier definitions (Gold/Silver/Bronze/Unresolved)
4. **[2.3]** Manual override workflow: how corrections are submitted and validated
5. **[2.4]** Recovery approach for historic listings with incomplete data
6. **[4.1]** Every report metric definition reviewed and confirmed
7. **[3.1/3.2]** Sample duplicate and cross-match pairs reviewed

---

*This document is updated by Archie as issues are closed. Never edit the acceptance criteria of an open issue without Turkish review.*
