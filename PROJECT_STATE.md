# PROJECT_STATE.md — The World We Live In

> Living status document. Updated at every checkpoint. Read this first when resuming.

**Last updated:** 2026-06-18 (Checkpoint C2 — Phase 2 complete & verified)
**Current phase:** Phase 2 done ✅ → next: Phase 3 (procedural low-poly planet prototype)
**Overall status:** 🟢 Healthy. No drift. Build/test/lint green; runtime-verified in a browser preview.

---

## What this project is
Android-first (iOS later) mobile game: a low-poly / voxel-style planetary civilization
survival simulator. Crash-land → survive → gather/hunt/farm/build → recruit NPC survivors →
grow a settlement → advance through civilization eras → emergent social systems
(families, factions, beliefs, governance, laws, economy) → scale to planet/orbit/galaxy.
Offline-first, friend-based multiplayer later, **AdMob ad revenue built in**.

## Stack (locked — see TECH_DECISIONS.md)
TypeScript (strict) · React 18 · Three.js (react-three-fiber) · Zustand · Vite ·
Vitest/ESLint/Prettier · Capacitor (Android first) · AdMob via `@capacitor-community/admob`.
Pure-TS **deterministic sim core** independent of React/DOM/renderer.

## How to run
```
npm install        # once
npm run dev        # Vite dev server (web) — main loop runs the sim
npm run build      # type-check + production build
npm run test       # Vitest unit tests (sim core)
npm run lint       # ESLint
```
Android export is documented for Phase 16 (requires JDK 17 — NOT yet installed on this machine).

## What works right now
- `npm run dev` boots a playable web prototype rendered in **real 3D (react-three-fiber)**:
  a low-poly world (ground, player capsule, per-kind resource meshes) with a working
  **day/night lighting cycle** (verified night→day→night in the browser preview).
- **Mobile camera/input:** touch-friendly camera rig (drag-pan + pinch-zoom via drei
  MapControls); tap a resource node to gather (r3f raycast pointer → `gather` intent).
- HUD overlay (clock, resource tallies, ad button) adapts to portrait/landscape.
- **Monetization verified at runtime:** "Watch ad" → MockAdService → +10 wood (saw 0→10).
- Deterministic sim core: same seed → identical world (proven by tests). Sim core untouched
  by Phase 2 (render/input read snapshots only).
- `npm run test` (23 passing), `npm run build` (tsc + vite; ~989 KB JS / 275 KB gz — three.js
  is heavy, code-splitting deferred to Phase 15), `npm run lint` (clean) — all green.

## Built so far
| Phase | Status | Notes |
|------|--------|-------|
| 0 Inspect + choose stack | ✅ done | Empty workspace, Node 20.11.1, git 2.43, no Godot/Java. Stack = TS/React/Capacitor/AdMob. |
| 1 Runnable skeleton | ✅ done | Vite+React+TS tooling; pure sim core (RNG/clock/World/intents); GameLoop; Zustand bridge; AdService abstraction; HUD. Verified green. |
| 2 Mobile input/camera/orientation | ✅ done | react-three-fiber 3D scene; pure day/night lighting model; drei MapControls camera (pan/pinch); tap-to-gather; responsive HUD. Build/test/lint green + runtime-verified. |
| 3 Procedural planet prototype | ⬜ next | See ROADMAP.md |
| 4–16 | ⬜ not started | See ROADMAP.md |

## What is stubbed (and honestly NOT finished)
- AdService: real AdMob impl deferred; **MockAdService** used in dev/web.
- Save service: interface only so far; real persistence is Phase 12.
- Render: placeholder until react-three-fiber lands (Phase 2/3).
- Multiplayer: interfaces only, never implemented (offline-first), Phase 14.

## What failed / blocked
- None yet. (Android build blocked until JDK 17 installed — not needed before Phase 16.)

## Next exact task
Phase 3 — procedural low-poly planet prototype: add seeded terrain generation (heightmap +
biomes) in the sim core (pure, deterministic), and a chunked low-poly terrain mesh in the r3f
scene that replaces the flat ground plane. Scatter resource nodes by biome. Keep generation in
the sim core (testable) and rendering in the render layer.

Known tunables to revisit: in-world day length is currently ~60s real per day
(TICKS_PER_HOUR=50 @20Hz) — fine for demoing day/night, likely lengthen for real survival in
Phase 4. Bundle code-splitting deferred to Phase 15.

## Current architecture assumptions
- Sim core is deterministic and renderer-agnostic; UI never mutates world directly — it
  dispatches *intents*. Data flows one way: Input → Intent → Sim → State snapshot → UI/Render.
- All monetization goes through `AdService`; gameplay never calls the AdMob SDK directly.
- Save data is versioned JSON with explicit migrations.

## Git / remote
- Local repo: branch `main`. Identity set locally to jojos / co.nosiah@gmail.com
  (change with `git config user.name/user.email` if desired).
- Remote: ✅ **configured & pushed.** `origin` =
  https://github.com/BDookie02/The-Word-We-Live-In.git (note: repo name reads "Word" not
  "World" — rename on GitHub if unintended, then `git remote set-url origin <new>`).
- Push at each checkpoint with `git push`.
