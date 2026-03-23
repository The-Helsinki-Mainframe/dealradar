# DealRadar — Working Rules & Workflow

> These rules govern how Archie and Turkish work on DealRadar. They exist because the system
> has failed silently in the past. These rules prevent that from happening again.
> **These rules are binding. They do not get relaxed between sessions.**

---

## The Golden Rules

1. **Source data is never overwritten.** `source_*` columns are immutable. Only the scraper writes them. Never normalisation, never geocoding.

2. **Nothing reaches Davis unverified.** Before any issue is closed or any result posted to Davis: Archie has checked it himself. Not assumed. Checked.

3. **Turkish reviews every phase gate.** Before Davis signs off on a phase, Turkish reviews the deliverables and writes his verdict in the gate issue. No exceptions.

4. **Bugs that fail silently are the worst kind.** Every DB-writing operation has a transaction boundary and a sanity assertion. If something looks wrong, it aborts and alerts — it does not commit and continue.

5. **Decisions are logged.** Every architectural decision goes in `DECISIONS.md` with date, options considered, and outcome. "Why did we do it this way?" always has an answer.

---

## How Issues Work

### Opening an Issue
- Every piece of work has a GitHub issue before any code is written
- Issue must include: scope, acceptance criteria, Davis input required (yes/no)
- Turkish review issues must be opened at the end of every phase

### Working an Issue
- Archie works the issue, writes notes in comments as he goes
- If something unexpected is found: stop, comment on the issue, flag to Davis before proceeding
- Never silently expand scope — open a new issue instead

### Closing an Issue
Before closing any issue, Archie must fill in the **"What Was Done"** section:
- What was changed (files, DB migrations, queries)
- How it was verified (specific queries run, outputs checked)
- Any edge cases or caveats
- Confirmation that acceptance criteria are met (tick each box)

Davis reviews the "What Was Done" section, not just the checkbox.

### Turkish Gate Issues
- Turkish is briefed with full context (current state, what was built, what Archie verified)
- Turkish reviews and writes his verdict in the issue
- Turkish may request changes before approving
- Only after Turkish approves does Davis sign off

---

## How Turkish Is Kept in the Loop

Turkish is spawned via `sessions_spawn` with `model="anthropic/claude-opus-4-6"` and given:
1. This WORKFLOW.md
2. The relevant ROADMAP.md section
3. The specific issue(s) being reviewed
4. Archie's "What Was Done" writeups
5. Any DB queries and their outputs

Turkish's role is to challenge, not just approve. If something looks wrong architecturally, Turkish says so. His verdict is written into the gate issue so there's a permanent record.

**Turkish is not a rubber stamp.** If Turkish flags a problem, it gets fixed before the phase closes.

---

## How Davis Is Kept in the Loop

- Phase gates require Davis sign-off — a comment on the gate issue confirming he's satisfied
- Items marked `davis-decision-required` are flagged in Discord when they're ready for input
- Davis never gets raw data or half-baked results — always a clean summary with the acceptance criteria ticked

---

## How Decisions Are Made

1. Issue is flagged `davis-decision-required`
2. Archie presents the options clearly with a recommendation
3. Turkish may weigh in if it's architectural
4. Davis decides
5. Decision logged in `DECISIONS.md`
6. Archie proceeds

No proceeding before a decision is made. No assuming what Davis would want.

---

## Hotfix Protocol

If something breaks in production (scraper fails, data corruption, wrong counts):
1. Immediately post what happened in #dealradar with the specific error
2. Do NOT silently fix and move on — document what broke and why
3. Fix, verify the fix, post confirmation
4. Open a GitHub issue tagged `post-mortem` with root cause and prevention measure
5. If the root cause reveals a gap in the roadmap, add an issue

---

## Session Continuity

Archie resets between sessions. The files don't. At the start of every session working on DealRadar:
1. Read `memory/projects/dealradar/MEMORY.md`
2. Read `ROADMAP.md` — know which phase is active and what's open
3. Read `DECISIONS.md` — know what's been decided and why
4. Check open GitHub issues for the current phase

This workflow document is the contract. It doesn't expire between sessions.
