# PROJECT_STATE.md — The World We Live In

> Living status document. Updated at every checkpoint. Read this first when resuming.

**Last updated:** 2026-06-18 (Checkpoint C0 — planning + Phase 1 skeleton)
**Current phase:** Phase 1 — runnable project skeleton
**Overall status:** 🟢 Healthy. No drift.

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
- (filled in at each checkpoint — see "Built so far" below)

## Built so far
| Phase | Status | Notes |
|------|--------|-------|
| 0 Inspect + choose stack | ✅ done | Empty workspace, Node 20.11.1, git 2.43, no Godot/Java. Stack = TS/React/Capacitor/AdMob. |
| 1 Runnable skeleton | 🔧 in progress | Build tooling + deterministic sim core + state bridge + ad-service abstraction + minimal HUD. |
| 2–16 | ⬜ not started | See ROADMAP.md |

## What is stubbed (and honestly NOT finished)
- AdService: real AdMob impl deferred; **MockAdService** used in dev/web.
- Save service: interface only so far; real persistence is Phase 12.
- Render: placeholder until react-three-fiber lands (Phase 2/3).
- Multiplayer: interfaces only, never implemented (offline-first), Phase 14.

## What failed / blocked
- None yet. (Android build blocked until JDK 17 installed — not needed before Phase 16.)

## Next exact task
Finish Phase 1: scaffold project, install deps, get `npm run build`/`test`/`lint` green,
init git, commit. Then Phase 2 (mobile input + camera + portrait/landscape).

## Current architecture assumptions
- Sim core is deterministic and renderer-agnostic; UI never mutates world directly — it
  dispatches *intents*. Data flows one way: Input → Intent → Sim → State snapshot → UI/Render.
- All monetization goes through `AdService`; gameplay never calls the AdMob SDK directly.
- Save data is versioned JSON with explicit migrations.

## Git / remote
- Local repo: initialized at checkpoint C0. Branch `main`.
- Remote: **NOT configured.** Needs user to create a GitHub repo + grant access. See RESUME_PROMPT.md.
