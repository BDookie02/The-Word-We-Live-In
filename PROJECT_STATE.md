# PROJECT_STATE.md — The World We Live In

> Living status document. Updated at every checkpoint. Read this first when resuming.

**Last updated:** 2026-06-18 (Checkpoint C7 — Phase 7 complete & verified)
**Current phase:** Phase 7 done ✅ → next: Phase 8 (settlement construction + job assignment)
**Overall status:** 🟢 Healthy. No drift. Build/test/lint green; app boots clean (preview screenshot tool still timing out — verified via console + 78 tests).

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
- `npm run dev` boots a playable web prototype rendered in **real 3D (react-three-fiber)**
  over a **procedurally generated low-poly planet**: seeded heightmap terrain with biomes
  (water/sand/grass/forest/rock/snow), a water plane at sea level, faceted flat-shaded look,
  and a working **day/night lighting cycle**.
- **Procedural generation lives in the sim core** (`src/sim/planet`): deterministic value
  noise + fBm → heightmap + biomes; resource nodes are scattered onto land and chosen by
  biome, seated on the surface via bilinear height sampling. Same seed → identical planet.
- **Player movement + survival loop:** tap the ground to move (terrain-follow, with a target
  marker); survival needs (health/hunger/thirst/energy) decay per tick in the sim core; eat
  food to relieve hunger, drink at the shoreline to relieve thirst; energy drains while moving
  and recovers while idle; health drains when a need is empty → **collapse**, which offers a
  rewarded-ad **revive**. Needs bars + Eat/Drink actions in the HUD.
- **Inventory + crafting:** item model (resources/materials/tools) + count inventory in the
  sim core; data-driven recipes (plank, rope, sharp_stone → axe/pickaxe/spear); `craft` intent
  consumes inputs and yields outputs; matching tools double gather yield (axe→wood, pickaxe→
  stone). HUD shows the inventory; a crafting panel lists recipes with affordability.
- **AI assistant + objectives:** ~13 small auto-tracked objectives (gather/craft/eat/drink
  milestones) that complete against world state each tick, grant one-time rewards, and are
  announced by the scripted "ARIA" assistant. HUD has an assistant banner (latest message) and
  a Tasks panel (progress bars). Assistant also gives intro guidance + low-need warnings.
- **NPC survivors:** ~4 NPCs with needs + a utility-AI loop (seek water/food, do assigned task,
  else wander), self-sustaining at shorelines/food nodes. A relationship graph grows affinity
  from proximity. Walk near + tap an NPC to recruit; recruited NPCs accept a gather task that
  deposits resources into the shared stockpile. NPCs render in 3D (green=recruited, amber=wild);
  a People/roster panel shows status, affinity, and task assignment.
- **Mobile camera/input:** touch-friendly camera rig (drag-pan + pinch-zoom via drei
  MapControls); tap a resource node to gather, tap ground to move.
- HUD overlay (clock, needs, inventory, actions, crafting panel) adapts to portrait/landscape.
- **Monetization** verified at runtime earlier: "Watch ad" → MockAdService → +10 wood;
  revive flow uses the `reward_revive` placement.
- `npm run test` (78 passing), `npm run build` (tsc + vite; ~1.01 MB JS / 282 KB gz — three.js
  is heavy, code-splitting deferred to Phase 15), `npm run lint` (clean) — all green.

## Built so far
| Phase | Status | Notes |
|------|--------|-------|
| 0 Inspect + choose stack | ✅ done | Empty workspace, Node 20.11.1, git 2.43, no Godot/Java. Stack = TS/React/Capacitor/AdMob. |
| 1 Runnable skeleton | ✅ done | Vite+React+TS tooling; pure sim core (RNG/clock/World/intents); GameLoop; Zustand bridge; AdService abstraction; HUD. Verified green. |
| 2 Mobile input/camera/orientation | ✅ done | react-three-fiber 3D scene; pure day/night lighting model; drei MapControls camera (pan/pinch); tap-to-gather; responsive HUD. Build/test/lint green + runtime-verified. |
| 3 Procedural planet prototype | ✅ done | Seeded value-noise/fBm heightmap + biomes (sim core); faceted low-poly terrain mesh + water; biome-based node placement on the surface. Build/test/lint green + runtime-verified. |
| 4 Player movement + survival loop | ✅ done | Tap-to-move (terrain-follow); pure needs system (health/hunger/thirst/energy) + eat/drink; collapse + ad-revive; HUD needs bars. Build/test/lint green + runtime-verified. |
| 5 Inventory, tools, gathering, crafting | ✅ done | Item model + inventory; data-driven recipes; craft intent; tool-doubled gather; HUD inventory + crafting panel. Build/test/lint green; app boots clean. |
| 6 AI assistant dialogue/objectives | ✅ done | Auto-tracked objective system + rewards; scripted ARIA message feed (intro/warnings/completions); HUD assistant banner + Tasks panel. Build/test/lint green; app boots clean. |
| 7 NPC survivors: needs, relationships, tasks | ✅ done | NPC agents + utility AI; relationship/affinity graph; recruit (proximity) + assignable gather tasks → stockpile; NPC rendering + roster panel. Build/test/lint green; app boots clean. |
| 8 Settlement construction + job assignment | ⬜ next | See ROADMAP.md |
| 9–16 | ⬜ not started | See ROADMAP.md |

## What is stubbed (and honestly NOT finished)
- AdService: real AdMob impl deferred; **MockAdService** used in dev/web.
- Save service: interface only so far; real persistence is Phase 12.
- Render: placeholder until react-three-fiber lands (Phase 2/3).
- Multiplayer: interfaces only, never implemented (offline-first), Phase 14.

## What failed / blocked
- None yet. (Android build blocked until JDK 17 installed — not needed before Phase 16.)

## Next exact task
Phase 8 — settlement construction + job assignment. Add a building model in the sim core
(data-driven structure defs with build costs; e.g. campfire, shelter/hut, storage, farm plot),
a `placeBuilding` intent (consumes stockpile resources, sites a structure on the terrain), and
construction state (built vs in-progress). Add "jobs" tied to buildings (e.g. assign an NPC to a
farm → produces food over time; builder NPC completes in-progress structures). Render structures
in 3D and add a build menu + tap-to-place. Keep building/job rules pure + unit-tested.

Known tunables to revisit: day length ~3 min real/day (TICKS_PER_HOUR=150). Survival/craft/NPC
balance first-pass. NPCs don't permanently die yet. Terrain is a single mesh (chunking/LOD =
Phase 13). Bundle code-splitting = Phase 15. NOTE: the preview **screenshot** tool has been
timing out since C5 (environment, not the app) — verify via `preview_console_logs` + tests.

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
