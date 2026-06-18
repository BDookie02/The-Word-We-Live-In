# CHECKPOINTS.md — The World We Live In

Append-only checkpoint log. Newest at top. Each entry = a verifiable save point.

---

## C1 — Phase 1 complete & verified — 2026-06-18
**Phase:** 1 (runnable skeleton) — ✅ done
**What was built:**
- Build tooling: Vite + React 18 + strict TS + Vitest + ESLint (flat config, with a
  sim-core import-purity rule) + Prettier. `package.json` scripts: dev/build/test/lint/format.
- Deterministic sim core (`src/sim`): seeded mulberry32 RNG, SimClock (tick→calendar/day-night),
  World aggregate (demo resource nodes, `gather` + `grantCache` intents, snapshot), barrel.
- Driver + bridge: `GameLoop` (fixed-timestep accumulator) and a Zustand store wiring
  snapshots→UI and intents→sim.
- Monetization: `AdService` interface + `MockAdService` (dev/web) + `AdMobService` stub seam;
  `useRewardedAd` hook; HUD "watch ad → +resources" opt-in flow.
- UI: `App` (loop lifecycle), `Hud`, placeholder SVG `WorldView` (tap-to-gather, day/night tint),
  responsive CSS (safe-area insets, portrait/landscape, 44px touch targets).
- Preliminary `SaveService` (stores seed for "continue"; full schema deferred to Phase 12).

**Files changed:** +scaffold (40 files committed; see `git show --stat b5e4f0c`).
**What works:** dev prototype runs; deterministic worlds; rewarded-ad reward flow end-to-end (mock).
**What is stubbed (honest):** AdMob real impl (seam only), full save schema, 3D render
(placeholder SVG), multiplayer (none). Render swaps to react-three-fiber in Phase 2/3.
**What failed:** nothing. Two lint/tsc nits found & fixed during verification (unused field;
triple-slash ref; underscore-arg lint rule added).
**Validation run:** `npm run test` → 18/18 pass · `npm run build` → tsc + vite OK (150 KB / 49 KB gz)
· `npm run lint` → clean. Android export NOT attempted (Phase 16; JDK 17 not installed).
**Next exact task:** Phase 2 — react-three-fiber scene + camera rig + touch/gesture input layer.
**Git:** committed `b5e4f0c` on `main`. No remote yet (awaiting user GitHub access).

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
