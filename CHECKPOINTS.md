# CHECKPOINTS.md — The World We Live In

Append-only checkpoint log. Newest at top. Each entry = a verifiable save point.

---

## C0 — Planning + Phase 1 skeleton — 2026-06-18
**Phase:** 0 (complete) → 1 (in progress)
**What was built:**
- Phase 0 workspace inspection: empty dir; Node 20.11.1, npm 10.2.4, git 2.43 present;
  no Godot, no Java. Stack chosen (TS/React/Three.js/Capacitor/AdMob) per user redirect.
- Six planning/checkpoint docs created: PROJECT_STATE, ROADMAP, ARCHITECTURE,
  TECH_DECISIONS, CHECKPOINTS, RESUME_PROMPT.
- (Phase 1, in progress) project scaffold + deterministic sim core + state bridge +
  ad-service abstraction. See PROJECT_STATE.md for the live status.

**Files changed:** PROJECT_STATE.md, ROADMAP.md, ARCHITECTURE.md, TECH_DECISIONS.md,
CHECKPOINTS.md, RESUME_PROMPT.md (+ scaffold files once Phase 1 lands — recorded next entry).

**What works:** docs in place; toolchain verified available.
**What is stubbed:** everything gameplay (Phase 1 just establishing skeleton).
**What failed:** nothing. Android build not attempted (out of scope until Phase 16; JDK absent).
**Validation run:** Phase-1 `build`/`test`/`lint` results recorded in the C1 entry.
**Next exact task:** complete Phase 1 scaffold, get build/test/lint green, git init + commit.

**Git:** repo initialized locally on branch `main`; no remote yet (awaiting user GitHub access).
