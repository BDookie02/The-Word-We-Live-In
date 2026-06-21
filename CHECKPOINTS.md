# CHECKPOINTS.md — The World We Live In

Append-only checkpoint log. Newest at top. Each entry = a verifiable save point.

---

## C15 — Phase 15 complete & verified — 2026-06-21
**Phase:** 15 (mobile UI polish + performance pass) — ✅ done. Render/UI/build only; sim untouched.
**What was built:**
- Performance: `vite.config.ts` `manualChunks` vendor split (three-vendor / react-vendor / vendor)
  + `chunkSizeWarningLimit` 1200; `App` lazy-loads `WorldCanvas` via `React.lazy` + `Suspense`.
  Result: app entry chunk ~1 MB → ~45 KB (15 KB gz); three.js isolated + lazy; no chunk warning.
- UX: `ui/MainMenu.tsx` boot screen (New Game / Continue — Continue only if a save exists; New Game
  clears the save and uses a random seed). `App` gates the GameLoop on a chosen mode (ad init now
  happens only after Start, confirmed via console).
- Polish: HUD hidden at planet/orbit scales (only the scale switcher shows); menu CSS; existing
  44px touch targets + safe-area insets retained.

**Files changed:** ~vite.config.ts, ~src/App.tsx, +src/ui/MainMenu.tsx, ~src/ui/Hud.tsx,
~src/index.css.
**What works:** boots to a menu; New Game vs Continue; lazy 3D layer; smaller initial bundle;
clean HUD at planetary scales; all gameplay intact.
**What is stubbed (honest):** per-tick snapshot selectors still allocate (acceptable at current
entity counts; deeper memoization deferred); no animated scale transitions; DPR cap left at
[1,2]; no settings screen yet.
**What failed:** nothing. Preview **screenshot** tool was unreliable again this round — verified
via clean console boot (no errors; no premature ad init at the menu) + build chunk output + tests.
**Validation run:** `npm run test` → 128/128 pass · `npm run build` → tsc + vite OK, code-split
(entry 45 KB / react-vendor 238 KB / three-vendor 737 KB), **no chunk-size warning** · `npm run
lint` → clean · **runtime:** boots to the menu, no console errors.
**Next exact task:** Phase 16 — Android export/release docs: add Capacitor + capacitor.config.ts,
write ANDROID.md (build → cap add android → sync → Android Studio), AdMob prod wiring + consent,
signing/keystore, Play listing checklist. (JDK/Android Studio not installed here — docs + config.)
**Git:** committed on `main`, pushed to origin.

## C14 — Phase 14 complete & verified — 2026-06-18
**Phase:** 14 (multiplayer architecture interfaces) — ✅ done. Offline-first; NOTHING connects.
**What was built:**
- `src/sim/net/protocol.ts`: `NET_PROTOCOL_VERSION`, `NetCommand` (Intent + tick/seq/playerId),
  `NetMessage` union (hello/bye/command/sync; sync carries a SaveBlob), versioned
  `encodeMessage`/`decodeMessage`. Pure + tested.
- `src/services/net/NetTransport.ts`: `NetTransport` interface + `NullTransport` (offline default)
  + `LoopbackTransport` (in-process, hot-seat/tests). Tested.
- `src/services/net/Session.ts`: host-authoritative `MultiplayerSession` interface +
  `OfflineSession` no-op default + `getSession()` singleton. Tested.
- `src/services/net/index.ts` barrel; sim barrel exports the protocol.
- ARCHITECTURE.md: "Multiplayer architecture (Phase 14)" section documenting the model +
  the future GameLoop integration point (submitIntent → host orders per-tick commands →
  deterministic re-sim; joiner bootstrapped via `sync` SaveBlob).

**Files changed:** +src/sim/net/protocol.ts(+test), +src/services/net/{NetTransport.ts,Session.ts,
index.ts,net.test.ts}, ~src/sim/index.ts, ~ARCHITECTURE.md.
**What works:** protocol encode/decode round-trips + version-rejects; loopback delivery + unsub;
offline session is a clean no-op; gameplay unchanged (still fully offline).
**What is stubbed (honest, by design):** no real transport (WebRTC/relay), no lobby/matchmaking,
session not wired into the GameLoop (offline-first means no behavior change). These are the
intended future drop-ins; the seam + tests exist now.
**What failed:** tsc caught arity mismatches in the offline stub method signatures (vitest had
passed since it strips types) — fixed by giving the stubs full `_`-prefixed params.
**Validation run:** `npm run test` → 128/128 pass · `npm run build` → tsc + vite OK (1.03 MB /
289 KB gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no
console errors; interfaces-only phase, no behavior change).
**Next exact task:** Phase 15 — mobile UI polish + performance pass (code-split three.js, cap DPR,
hide gameplay HUD at planet/orbit, boot/menu screen, touch-target/safe-area polish).
**Git:** committed on `main`, pushed to origin.

## C13 — Phase 13 complete & verified — 2026-06-18
**Phase:** 13 (zoom scale layers) — ✅ done. Render/UI only; sim core untouched.
**What was built:**
- State: `ViewScale` ('character'|'settlement'|'planet'|'orbit') + `viewScale`/`setViewScale`.
- `render/globeColors.ts`: pure noise-value → biome colour mapping (tested).
- `render/BiomeGlobe.tsx`: flat-shaded icosphere coloured by seeded fBm → biome palette, with a
  settlement marker, optional auto-rotate (reused by planet + orbit views).
- `render/CharacterCamera.tsx`: smooth follow-cam on the player (no controls).
- `render/PlanetView.tsx`: biome globe + lights + OrbitControls (orbit the planet).
- `render/OrbitView.tsx`: small globe + seeded starfield (points) + distant sun + OrbitControls.
- `render/WorldCanvas.tsx`: routes scene + camera/controls by `viewScale` (ground views share
  WorldScene with CameraRig vs CharacterCamera).
- `ui/ScaleSwitcher.tsx`: side switcher; rendered in `App`. CSS for switcher.

**Files changed:** ~src/state/store.ts, +src/render/{globeColors.ts(+test),BiomeGlobe.tsx,
CharacterCamera.tsx,PlanetView.tsx,OrbitView.tsx}, ~src/render/WorldCanvas.tsx,
+src/ui/ScaleSwitcher.tsx, ~src/App.tsx, ~src/index.css.
**What works:** switching scales swaps scenes/cameras; planet globe + orbit starfield generate
deterministically from the world seed; settlement/character share the ground world.
**What is stubbed (honest):** the planet globe is a STYLIZED representation (independent fBm), not
a 1:1 render of the local terrain patch; transitions are instant (no animated fly-through);
gameplay HUD stays visible at planet/orbit scales (polish later); no LOD/chunking yet.
**What failed:** nothing in code; the preview **screenshot** tool went intermittent again this
round (timed out) — could not capture the planet/orbit views; verified via clean console boot +
build + 119 tests.
**Validation run:** `npm run test` → 119/119 pass · `npm run build` → tsc + vite OK (1.03 MB /
289 KB gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no
console errors); visual capture of new scales deferred (screenshot tool flaky).
**Next exact task:** Phase 14 — multiplayer architecture interfaces (offline-first): NetCommand
envelope, NetTransport + LocalTransport loopback, Session/lobby types, docs; interfaces + stub +
tests only.
**Git:** committed on `main`, pushed to origin.

## C12 — Phase 12 complete & verified — 2026-06-18
**Phase:** 12 (save/load) — ✅ done
**What was built:**
- `src/sim/persistence/saveSchema.ts`: `SaveBlobV2` (full state; terrain omitted — regenerated
  from seed), `SAVE_VERSION=2`, `migrateSave` (version-keyed seam; older/corrupt → null).
- `World.serialize()` / static `World.restore(blob)`: deep structuredClone in/out; restore
  rebuilds terrain/shorePoints from seed and resumes the npc/threat RNG cursors via
  `createRng(state)` (mulberry32 state == seed-equivalent) so continuation is deterministic.
- `SaveService` rewritten: `saveWorld`/`loadWorld` (migrate) / `hasSave` / `clear` on a
  localStorage adapter (Capacitor Preferences later). Removed the old seed-only API.
- `GameLoop` now takes a `World` (+ `GameLoop.fromSeed`); added `serialize()`, `loadFrom(blob)`,
  `snapshot()`. `App` restores a saved world on launch (Continue) or starts fresh, autosaves
  every 15s (`AUTOSAVE_INTERVAL_MS`) + on unmount, and injects save/load handlers into the store.
- UI: 💾 Save / ↺ Load buttons in the HUD.

**Files changed:** +src/sim/persistence/{saveSchema.ts,save.test.ts}, ~src/sim/world/World.ts,
~src/sim/index.ts, ~src/services/save/SaveService.ts, ~src/game/GameLoop.ts, ~src/state/store.ts,
~src/App.tsx, ~src/config/gameConfig.ts, ~src/ui/Hud.tsx.
**What works:** autosave + Continue-on-launch; manual save/revert; save→load yields an identical
snapshot AND continues deterministically (RNG preserved); migrations seam in place.
**What is stubbed (honest):** storage is localStorage only (Capacitor Preferences swap = native
phase); no multiple save slots / cloud sync; "Load" reverts to the single latest save; AdMob real
impl still pending.
**What failed:** nothing.
**Validation run:** `npm run test` → 116/116 pass (incl. round-trip + continuation determinism)
· `npm run build` → tsc + vite OK (1.03 MB / 288 KB gz; chunk-size warning noted) · `npm run lint`
→ clean · **runtime:** browser preview (screenshot tool recovered) shows the full game rendering —
era/needs/assistant/threat-alert/3D world + the complete action bar incl. Save/Load; no console errors.
**Next exact task:** Phase 13 — zoom scale layers (character/settlement/planet/orbit) driven by a
`viewScale` UI state; render/camera swaps only, sim core untouched.
**Git:** committed on `main`, pushed to origin.

## C11 — Phase 11 complete & verified — 2026-06-18
**Phase:** 11 (enemies/threats + weapon/tool progression) — ✅ done
**What was built:**
- Config `THREAT` (spawn cadence/chances, era/night scaling, speed, ranges, damage, guard, base
  attack). `services/ads`: added `reward_defense` placement.
- `src/sim/threats/threats.ts`: `Threat` + `THREAT_STATS` (predator/raider hp/damage/loot),
  `WEAPON_BONUS` + `playerAttackPower` (best owned weapon), `chooseThreatKind` (raiders scale with
  era), `makeThreat`. Tested.
- NPC `guard` task added; `npcAI` targets the nearest threat when guarding.
- `World`: `threats` + seeded `threatRng`; `maybeSpawnThreat` (edge/on-land, capped, night/era
  scaled), `updateThreats` (move toward player, cooldowned contact damage → collapse, guard NPC
  damage, death + loot via `killThreat`), `attackThreat` (weapon-power) + `repelThreats` intents;
  threats passed to NPC ctx; snapshot carries `threats`.
- Render `ThreatMeshes` (tap-to-attack). UI: threat-alert banner + a swap of the ad button to
  "🛡️ Repel (ad)" (`reward_defense`) when threats are present; roster gains a Guard task.

**Files changed:** ~src/config/gameConfig.ts, ~src/services/ads/AdService.ts,
+src/sim/threats/threats.ts (+ test), ~src/sim/npc/npc.ts, ~src/sim/npc/npcAI.ts (+ test ctx),
~src/sim/intents/intents.ts, ~src/sim/world/World.ts (+ tests), ~src/sim/index.ts,
+src/render/ThreatMeshes.tsx, ~src/render/WorldScene.tsx, ~src/ui/Hud.tsx, ~src/ui/RosterPanel.tsx,
~src/index.css.
**What works:** threats spawn/advance/attack; tap-attack with weapon scaling + loot; guard NPCs
defend; ad-repel; collapse via combat ties into existing revive.
**What is stubbed (honest):** no dedicated weapon "equip" UI (best owned weapon auto-applies); no
ranged/era weapon tiers beyond spear/axe bonus; threats target the player (not buildings) for now;
save/load still seed-only (Phase 12 next); AdMob seam still pending.
**What failed:** one test type error (npcAI test ctx missing `threats`) — added.
**Validation run:** `npm run test` → 111/111 pass · `npm run build` → tsc + vite OK (1.03 MB /
287 KB gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no
console errors). Preview **screenshot** tool still timing out since C5 (environment) — via console.
**Next exact task:** Phase 12 — full versioned save/load (serialize/restore World; migrations seam;
autosave + manual Save/Load + Continue), round-trip unit-tested.
**Git:** committed on `main`, pushed to origin.

## C10 — Phase 10 complete & verified — 2026-06-18
**Phase:** 10 (emergent social systems) — ✅ done. Fictional/abstract; NO real religions/parties.
**What was built:**
- Config `SOCIAL` (recompute interval, group threshold, drift rate, ally/rival distances).
- `src/sim/social/values.ts`: abstract `ValueAxes` (tradition/community/harmony) + `randomValues`,
  `driftToward`, `meanValues`, `valueDistance`. Tested.
- `src/sim/social/society.ts`: `deriveSociety` — union-find clustering of members by affinity ≥
  threshold into groups (size ≥ 2); most-connected member = leader; mean values → fictional
  culture/belief/law `tenetsFor`; seeded fictional group names; inter-group stance (ally/neutral/
  rival) from value distance. Pure + deterministic. Tested.
- NPC gains `values` (seeded at spawn). `World`: cached `society`, recomputed every
  `SOCIAL.recomputeTicks`; grouped members' values drift toward the group mean (convergence);
  snapshot carries a deep-copied `society`.
- UI: `SocietyPanel` (groups, leader, members, tenets, relations) + HUD 🌐 Society button.

**Files changed:** ~src/config/gameConfig.ts, +src/sim/social/{values,society}.ts (+ tests),
~src/sim/npc/npc.ts, ~src/sim/npc/npcAI.test.ts, ~src/sim/world/World.ts (+ tests),
~src/sim/index.ts, +src/ui/SocietyPanel.tsx, ~src/ui/Hud.tsx, ~src/index.css.
**What works:** recruited survivors who bond cluster into named groups with leaders + emergent
tenets; groups with opposing values become rivals; values converge within a group over time.
**What is stubbed (honest):** groups are NPC-only (player is settlement founder, not a group
member); organic affinity growth is slow at the default threshold (assigning NPCs together speeds
it); no governance *actions* yet (laws are descriptive tenets, not enforced mechanics) — deeper
politics/law enforcement is a later extension; AdMob seam + seed-only save still pending.
**What failed:** nothing.
**Validation run:** `npm run test` → 103/103 pass · `npm run build` → tsc + vite OK (1.02 MB /
286 KB gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no
console errors). Preview **screenshot** tool still timing out since C5 (environment) — via console.
**Next exact task:** Phase 11 — enemies/threats (seeded spawns, contact damage) + combat/weapon
progression (era-tied), 3D threats, threat alerts, optional ad defense hook.
**Git:** committed on `main`, pushed to origin.

## C9 — Phase 9 complete & verified — 2026-06-18
**Phase:** 9 (civilization progression eras) — ✅ done
**What was built:**
- `src/sim/progression/eras.ts`: ordered `ERAS` (Primitive→Tribal→Agrarian→Industrial),
  `EraContext`, data-driven `nextEraRequirements` + `canAdvanceEra`, `eraDef`. Unit-tested.
- Era-gating: `minEra` added to every `Recipe` and `BuildingDef` (tools + hut/storage/farm =
  tribal; rest primitive). World `craft`/`placeBuilding` reject locked items.
- `advanceEra` intent (checks requirements, increments era, assistant announcement); World
  `era` field, `eraContext()`, and farm output scaled by era (`farmYieldPerTick`). Snapshot
  carries `era`, `nextEra`, `eraRequirements`, `canAdvanceEra`.
- UI: HUD era chip (+ advance alert), `EraPanel` (requirements progress + Advance button that
  plays the `era_transition` interstitial then dispatches `advanceEra`); craft/build menus show
  🔒 era locks.

**Files changed:** +src/sim/progression/eras.ts (+ test), ~src/sim/items/recipes.ts,
~src/sim/buildings/buildings.ts, ~src/sim/intents/intents.ts, ~src/sim/world/World.ts (+ tests;
fixed 2 pre-era tests by bumping era), ~src/sim/index.ts, +src/ui/EraPanel.tsx, ~src/ui/Hud.tsx,
~src/ui/CraftingPanel.tsx, ~src/ui/BuildMenu.tsx, ~src/index.css.
**What works:** era-gated crafting/building; player-triggered era advancement with requirement
gating + ad hook; era display + locks in UI; farm output scales with era.
**What is stubbed (honest):** Agrarian/Industrial currently unlock little new content beyond the
farm-output boost (extend with more era-gated items later); no emergent social systems yet
(Phase 10); NPCs still don't permanently die; AdMob seam + seed-only save still pending.
**What failed:** 2 earlier tests (axe chain, farm produce) broke under new era gating — fixed by
setting `w.era = 1` in those tests.
**Validation run:** `npm run test` → 92/92 pass · `npm run build` → tsc + vite OK (1.02 MB / 284 KB
gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no console
errors). Preview **screenshot** tool still timing out since C5 (environment) — verified via console.
**Next exact task:** Phase 10 — emergent social systems (fictional/abstract): groups from the
affinity graph, NPC value axes, leaders, culture/belief/law tenets, inter-group relations, Society UI.
**Git:** committed on `main`, pushed to origin.

## C8 — Phase 8 complete & verified — 2026-06-18
**Phase:** 8 (settlement construction + job assignment) — ✅ done
**What was built:**
- Config `BUILD` (build/farm rates, work radius, player tap work).
- `src/sim/buildings/buildings.ts`: `BuildingKind`, data-driven `BUILDINGS` defs (campfire, hut,
  storage, farm) with costs + buildWork, `BUILDING_ORDER`, `Building` instance type.
- NPC tasks extended: `GatherTask` + `'build'` + `'farm'`; `isGatherTask` guard. `npcAI` targets
  in-progress sites (build) / built farms (farm).
- Intents: `placeBuilding` (consumes stockpile, sites structure), `workBuilding` (player tap work).
- `World`: `buildings` list + `nextBuildingId`; `addBuildProgress` (completes + announces);
  `updateBuildings` per-tick pass (builder NPCs advance nearby sites; farmers produce food into
  the stockpile via a fractional accumulator); buildings ctx passed to NPC AI; snapshot carries
  `buildings`.
- State: `placement` (pending building kind). Render `BuildingMeshes` (per-kind shapes,
  translucent ring while in progress, tap to add work); `WorldScene` ground tap places when in
  placement mode else moves. UI `BuildMenu` (Build button, costs/affordability, place/cancel);
  roster gains Build/Farm task tags.

**Files changed:** ~src/config/gameConfig.ts, +src/sim/buildings/buildings.ts, ~src/sim/npc/npc.ts,
~src/sim/npc/npcAI.ts (+ test ctx), ~src/sim/intents/intents.ts, ~src/sim/world/World.ts (+ tests),
~src/sim/index.ts, ~src/state/store.ts, +src/render/BuildingMeshes.tsx, ~src/render/WorldScene.tsx,
+src/ui/BuildMenu.tsx, ~src/ui/Hud.tsx, ~src/ui/RosterPanel.tsx, ~src/index.css.
**What works:** place buildings (cost-gated), build via NPC or taps, farm food production, 3D
structures + build menu; all prior systems intact.
**What is stubbed (honest):** building effects are minimal (campfire/hut/storage are cosmetic so
far — housing caps/morale come later); no eras/tech gating yet (Phase 9); AdMob seam + seed-only
save still pending; balance first-pass.
**What failed:** one test type error (npcAI test ctx missing `buildings`) — added.
**Validation run:** `npm run test` → 83/83 pass · `npm run build` → tsc + vite OK (1.02 MB / 283 KB
gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no console
errors). Preview **screenshot** tool still timing out since C5 (environment) — verified via console.
**Next exact task:** Phase 9 — era/tech progression model with unlock gates, era-gated
recipes/buildings, HUD era display, `era_transition` interstitial-ad hook.
**Git:** committed on `main`, pushed to origin.

## C7 — Phase 7 complete & verified — 2026-06-18
**Phase:** 7 (NPC survivors: needs, relationships, tasks) — ✅ done
**What was built:**
- Config `NPC_CFG` (count, speed, seek thresholds, restores, wander, proximity/affinity, recruit).
- `src/sim/npc/npc.ts`: `NPC` type, `NpcBehavior`, `NpcTaskKind` + `TASK_RESOURCE`, names.
- `src/sim/npc/npcAI.ts`: pure `stepNpc` utility-AI (priority thirst > hunger > task > wander),
  movement, arrival effects (drink at shore / eat a food node / harvest a task node). Tested.
- `src/sim/social/relationships.ts`: pairwise affinity map (`relKey/getAffinity/addAffinity`). Tested.
- `src/sim/planet/Terrain.ts`: `findShorePoints` (drinkable water targets for NPCs).
- `World`: spawns NPCs near the crash site; per-tick `updateNpcs` (behaviour + needs decay +
  node harvest → stockpile or self-feed) and `updateRelationships` (proximity affinity, incl.
  player); `recruitNpc` (proximity-gated, +affinity, assistant line) and `assignNpcTask` intents;
  snapshot now carries `npcs` (with `affinityWithPlayer`).
- Render `NpcMeshes` (capsules, green=recruited/amber=wild, tap-to-recruit). UI `RosterPanel`
  (People button) with status/affinity + task-assignment tags.

**Files changed:** ~src/config/gameConfig.ts, +src/sim/npc/{npc,npcAI}.ts (+ npcAI test),
+src/sim/social/relationships.ts (+ test), ~src/sim/planet/Terrain.ts, ~src/sim/intents/intents.ts,
~src/sim/world/World.ts (+ tests), ~src/sim/index.ts, +src/render/NpcMeshes.tsx,
~src/render/WorldScene.tsx, +src/ui/RosterPanel.tsx, ~src/ui/Hud.tsx, ~src/index.css.
**What works:** NPCs wander/seek/self-sustain; recruit by proximity; assigned NPCs gather into
the stockpile; affinity grows by proximity; roster + 3D rendering.
**What is stubbed (honest):** NPCs weaken but don't permanently die yet; no daily schedules
(behaviour is needs-driven, not clock-driven); affinity not yet surfaced into social groups
(Phase 10); no buildings/jobs (Phase 8); AdMob seam + seed-only save still pending.
**What failed:** one unused-import build/lint error (NpcTaskKind in World.ts) — removed.
**Validation run:** `npm run test` → 78/78 pass · `npm run build` → tsc + vite OK (1.01 MB / 282 KB
gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (no console
errors). Preview **screenshot** tool still timing out since C5 (environment) — verified via console.
**Next exact task:** Phase 8 — building model + `placeBuilding` intent + construction/jobs
(builder + farm production), 3D structures + build menu/tap-to-place.
**Git:** committed on `main`, pushed to origin.

## C6 — Phase 6 complete & verified — 2026-06-18
**Phase:** 6 (AI assistant dialogue/objective system) — ✅ done
**What was built:**
- Sim core `src/sim/objectives/objectives.ts`: `OBJECTIVES` (13 small auto-tracked tasks —
  gather/craft/eat/drink milestones), `PlayerStats` lifetime counters, `ObjectiveContext`,
  `objectiveProgress()` (serializable progress), and `AssistantMessage`. Pure + unit-tested.
- `World`: tracks `stats` (incremented on gather/craft/eat/drink), a latched `completed` map,
  and an assistant `messages` feed. Each tick evaluates objectives (grants one-time rewards +
  announces), checks one-shot low-need warnings, and announces collapse. Constructor pushes
  scripted intro lines ("ARIA"). Snapshot now carries `objectives` + `messages`.
- UI: assistant banner (latest message, animated) + `ObjectivesPanel` (Tasks button, progress
  bars, done count). HUD gained the Tasks toggle.

**Files changed:** +src/sim/objectives/objectives.ts (+ test), ~src/sim/world/World.ts (+ tests),
~src/sim/index.ts, +src/ui/ObjectivesPanel.tsx, ~src/ui/Hud.tsx, ~src/index.css.
**What works:** objectives auto-complete from world state with rewards + assistant messages;
intro/warning lines; Tasks panel + assistant banner; all prior systems intact.
**What is stubbed (honest):** no NPCs yet (Phase 7); assistant is scripted/rule-based (no LLM, by
design); AdMob seam + seed-only save still pending; balance first-pass.
**What failed:** one build error (Array.at needs ES2022 lib) — fixed by indexing instead.
**Validation run:** `npm run test` → 66/66 pass · `npm run build` → tsc + vite OK (1.0 MB / 280 KB
gz; chunk-size warning noted) · `npm run lint` → clean · **runtime:** app boots clean (React +
AdService init, no console errors). NOTE: the preview **screenshot** tool has been timing out
since C5 (environment issue, not the app); verified via console + tests instead.
**Next exact task:** Phase 7 — NPC survivors (needs, utility-AI behaviour, schedules), a
relationship graph, recruit/assign-task, NPC rendering + roster UI; all NPC logic pure + tested.
**Git:** committed on `main`, pushed to origin.

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
