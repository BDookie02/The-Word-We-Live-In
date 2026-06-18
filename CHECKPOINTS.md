# CHECKPOINTS.md — The World We Live In

Append-only checkpoint log. Newest at top. Each entry = a verifiable save point.

---

## C5 — Phase 5 complete & verified — 2026-06-18
**Phase:** 5 (inventory, tools, gathering, crafting) — ✅ done
**What was built:**
- Sim core `src/sim/items/`:
  - `items.ts` — `ItemId` (resources + materials + tools), `ITEMS` defs/icons, `ITEM_ORDER`,
    `TOOL_FOR_RESOURCE` (axe→wood, pickaxe→stone).
  - `inventory.ts` — `Inventory` (count map) + `invCount/invAdd/invHas/invConsume` (tested).
  - `recipes.ts` — data-driven `RECIPES` (plank, rope, sharp_stone, axe, pickaxe, spear).
- `World`: replaced the flat `gathered` tally with `inventory`; `gather` credits the inventory
  and the matching tool doubles yield; `craft` intent validates + consumes inputs and produces
  output (optional `requiresTool`); `eat`/`grantCache` updated; snapshot carries `inventory`.
- Intent `craft` added.
- UI: HUD inventory row (icons + counts) + Eat/Drink/Craft/Ad actions; new `CraftingPanel`
  listing recipes with affordability highlighting and a Craft button.

**Files changed:** +src/sim/items/{items,inventory,recipes}.ts (+ inventory test),
~src/sim/intents/intents.ts, ~src/sim/world/World.ts (+ test updates/additions),
~src/sim/index.ts, ~src/ui/Hud.tsx, +src/ui/CraftingPanel.tsx, ~src/index.css.
**What works:** gather→inventory; craft chain resources→materials→tools; tool-doubled gather;
crafting UI; everything else from prior phases intact.
**What is stubbed (honest):** no objectives/AI assistant yet (Phase 6); no NPCs/settlement/eras;
AdMob seam + seed-only save still pending; survival/craft balance first-pass.
**What failed:** nothing in code. The browser **screenshot** tool timed out this round (transient
preview-tooling issue); app boot confirmed via console (`[ads:mock] initialized`, no errors).
**Validation run:** `npm run test` → 58/58 pass · `npm run build` → tsc + vite OK (999 KB / 278 KB
gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots with no console
errors (visual screenshot not captured this round — see above).
**Next exact task:** Phase 6 — objective/quest model (small numerous tasks auto-tracked) + a
contextual scripted AI-assistant message feed, surfaced in the HUD.
**Git:** committed on `main`, pushed to origin.

## C4 — Phase 4 complete & verified — 2026-06-18
**Phase:** 4 (player movement + survival resource loop) — ✅ done
**What was built:**
- Config: `SURVIVAL` tunables (move speed, decay/regen rates, eat/drink restore, revive level);
  lengthened the in-world day to ~3 min (TICKS_PER_HOUR 50→150).
- Types: `NeedLevels` + `fullNeeds()`; `PlayerState` gains `target`, `needs`, `status`.
- Intents: `moveTo`, `eat`, `drink`, `revive`.
- Pure systems: `systems/movement.ts` (`stepMovement` toward target) and `systems/survival.ts`
  (`stepSurvival` decay/regen + collapse) — both unit-tested.
- `World`: runs movement + survival each tick (while alive); handles new intents (eat consumes
  food + relieves hunger; drink relieves thirst only at the shoreline via terrain sampling;
  revive restores from collapse); snapshot now carries needs/status/target + derived `nearWater`.
- Render: tapping terrain/water dispatches `moveTo` (with a target ring marker); player capsule
  greys out on collapse.
- UI: HUD needs bars (health/hunger/thirst/energy) + Eat/Drink actions (contextually disabled);
  `CollapseOverlay` with opt-in rewarded-ad revive (`reward_revive`).

**Files changed:** ~src/config/gameConfig.ts, ~src/sim/core/types.ts, ~src/sim/intents/intents.ts,
+src/sim/systems/{movement,survival}.ts (+ tests), ~src/sim/world/World.ts (+ test additions),
~src/sim/index.ts, ~src/render/WorldScene.tsx, ~src/ui/Hud.tsx, +src/ui/CollapseOverlay.tsx,
~src/App.tsx, ~src/index.css.
**What works:** tap-to-move (terrain-follow); needs decay + eat/drink; collapse→ad-revive
(unit-tested); HUD needs bars; contextual action enabling.
**What is stubbed (honest):** inventory is still the flat `gathered` tally (real items/tools/
crafting = Phase 5); no tools yet; NPCs/settlement/eras unbuilt; AdMob seam + seed-only save
still pending. Survival balance is first-pass.
**What failed:** nothing.
**Validation run:** `npm run test` → 50/50 pass · `npm run build` → tsc + vite OK (996 KB / 278 KB
gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** browser preview showed needs
bars, contextually-disabled Eat/Drink, and the player moving toward a tapped point; no console errors.
**Next exact task:** Phase 5 — item model + inventory, data-driven crafting recipes, craft intent,
tool-gated/faster gathering, crafting UI.
**Git:** committed on `main`, pushed to origin.

## C3 — Phase 3 complete & verified — 2026-06-18
**Phase:** 3 (procedural low-poly planet prototype) — ✅ done
**What was built:**
- Sim core `src/sim/planet/`:
  - `noise.ts` — seeded 2D value noise + fBm (deterministic; unit-tested).
  - `biomes.ts` — biome list/colours + `biomeForHeight` (elevation → biome).
  - `Terrain.ts` — `generateTerrain(seed)` → `TerrainData` (heightmap + per-vertex biome) and
    `sampleHeight` (bilinear surface sampling). Unit-tested.
- `World` now owns static terrain (`terrain`/`terrainData()`); resource nodes are placed on
  land and chosen by biome, with random amounts. Terrain is delivered to the renderer once
  (not per tick).
- State/loop/app wiring: store gains `terrain`; `GameLoop.getTerrain()`; `App` sets terrain once.
- Render: `TerrainMesh.tsx` builds a non-indexed, flat-shaded, per-triangle biome-coloured
  mesh; `WorldScene` draws terrain + a water plane and seats player/nodes via `sampleHeight`;
  `ResourceNodeMesh` takes a `groundY`.
- Config: added `PLANET` tunables; reworked `DEMO` (node count + amount range).

**Files changed:** +src/sim/planet/{noise,biomes,Terrain}.ts (+ noise/Terrain tests),
~src/sim/world/World.ts (+ test rewrite), ~src/sim/index.ts, ~src/config/gameConfig.ts,
~src/state/store.ts, ~src/game/GameLoop.ts, ~src/App.tsx, +src/render/TerrainMesh.tsx,
~src/render/WorldScene.tsx, ~src/render/ResourceNodeMesh.tsx.
**What works:** procedural terrain with biomes + water renders; nodes seated on the surface by
biome; deterministic per seed; day/night intact.
**What is stubbed (honest):** single terrain mesh (no chunk/LOD yet — Phase 13); no moisture/
temperature biome inputs (height-only for now); player can't move yet (Phase 4); AdMob seam,
seed-only save still pending.
**What failed:** nothing.
**Validation run:** `npm run test` → 34/34 pass · `npm run build` → tsc + vite OK (992 KB /
276 KB gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** browser preview
showed the faceted low-poly terrain with biomes/water and nodes seated on the surface, no
console errors.
**Next exact task:** Phase 4 — player movement (tap-to-move, terrain-follow) + survival needs
(hunger/thirst/energy) as a pure per-tick sim system, surfaced in the HUD.
**Git:** committed on `main`, pushed to origin.

## C2 — Phase 2 complete & verified — 2026-06-18
**Phase:** 2 (mobile input, camera, portrait/landscape) — ✅ done
**What was built:**
- Deps: `three`, `@react-three/fiber` (v8, React 18), `@react-three/drei` (v9), `@types/three`.
- `src/render/dayNight.ts` — pure day/night lighting model (sun intensity/position + sky colour
  from a day fraction); unit-tested.
- `src/render/WorldScene.tsx` — low-poly 3D scene: fog/sky, ambient+hemisphere+directional
  ("sun") lights, flat ground plane, player capsule, per-kind resource meshes.
- `src/render/ResourceNodeMesh.tsx` — flat-shaded shape per resource kind; tap (raycast
  pointer) dispatches `gather`; scale shrinks as the node depletes.
- `src/input/CameraRig.tsx` — drei MapControls tuned for touch (1-finger pan, 2-finger pinch
  zoom; rotation off for mobile stability).
- `src/render/WorldCanvas.tsx` — hosts the r3f `<Canvas>` (fills container → portrait/landscape).
- Wired into `App.tsx`; removed the old SVG `WorldView`; CSS updated (`.world-canvas`,
  `touch-action:none`). Added `.claude/launch.json` for the dev preview.

**Files changed:** +src/render/{dayNight.ts,dayNight.test.ts,WorldScene.tsx,ResourceNodeMesh.tsx,
WorldCanvas.tsx}, +src/input/CameraRig.tsx, ~src/App.tsx, ~src/index.css, +.claude/launch.json,
-src/ui/WorldView.tsx, ~package.json/lock.
**What works:** 3D world renders day & night; camera pan/zoom + tap-to-gather wired; HUD overlay;
rewarded-ad reward flow runs in the live app.
**What is stubbed (honest):** terrain is a flat plane (real procedural terrain = Phase 3);
AdMob real impl still a seam; save still seed-only; no NPCs/survival yet.
**What failed:** nothing. (A killed background dev-server process reported exit 255 — expected,
not a code failure.)
**Validation run:** `npm run test` → 23/23 pass · `npm run build` → tsc + vite OK (989 KB / 275 KB
gz, chunk-size warning noted) · `npm run lint` → clean · **runtime:** browser preview showed the
3D scene at night and day with no console errors, and the ad button moved wood 0→10.
**Next exact task:** Phase 3 — seeded procedural terrain (heightmap+biomes) in the sim core +
chunked low-poly terrain mesh replacing the flat ground.
**Git:** committed on `main`, pushed to origin.

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
