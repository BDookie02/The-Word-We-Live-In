# ROADMAP.md — The World We Live In

Phased build plan. Each phase is small enough to verify before moving on. Status legend:
⬜ not started · 🔧 in progress · ✅ done · ⚠️ partial/stubbed.

> Reality note: this is a deep simulation game. Early phases produce *real, runnable*
> systems; the social/civilization depth (Phases 9–11) is built as extensible frameworks
> that grow over many passes, not "finished" in one shot. We never label a stub as done.

| # | Phase | Maps to (this stack) | Status |
|---|-------|----------------------|--------|
| 0 | Inspect workspace, choose stack | Done in C0 | ✅ |
| 1 | Runnable project skeleton | Vite+React+TS, deterministic sim core, state bridge, ad-service abstraction, HUD | ✅ |
| 2 | Mobile input, camera, portrait/landscape | r3f 3D scene, day/night, drei MapControls (pan/pinch), tap-to-gather, responsive HUD | ✅ |
| 3 | Procedural low-poly planet prototype | Seeded value-noise/fBm heightmap + biomes (sim core), faceted low-poly mesh + water (render), biome-based node placement | ✅ |
| 4 | Player movement + survival resource loop | Tap-to-move (terrain-follow), needs (health/hunger/thirst/energy), eat/drink, collapse + ad-revive | ✅ |
| 5 | Inventory, tools, gathering, crafting | Item model + inventory, data-driven recipes, craft intent, tool-doubled gather, crafting UI | ✅ |
| 6 | AI assistant dialogue/objective system | Auto-tracked objective engine + rewards, scripted ARIA message feed (intro/warnings/completions), HUD banner + Tasks panel | ✅ |
| 7 | NPC survivors: needs, relationships, tasks | NPC agents + utility AI (seek/task/wander), relationship/affinity graph, proximity recruit, assignable gather tasks, roster UI | ✅ |
| 8 | Settlement construction + job assignment | Data-driven buildings, placeBuilding (tap-to-place + cost), construction via builders/player, farm food jobs, 3D structures + build menu | ✅ |
| 9 | Civilization progression eras | Era chain + minEra-gated recipes/buildings, requirement-gated advanceEra + Era panel, era_transition ad hook, era-scaled farm output | ✅ |
| 10 | Emergent social systems | Value axes, affinity-clustered groups + leaders, fictional culture/belief/law tenets + names, ally/rival relations, value drift, Society panel — *fictional/emergent* | ✅ |
| 11 | Enemies/threats + weapon/tool progression | Seeded threat spawns (night/era), contact damage + collapse, tap-attack w/ weapon power, loot, guard NPCs, ad-repel, 3D threats | ✅ |
| 12 | Save/load | Versioned full serialize/restore (RNG-cursor preserved, terrain regenerated), migrations seam, localStorage adapter, autosave + manual Save/Load + Continue | ✅ |
| 13 | Zoom scale layers | viewScale (character/settlement/planet/orbit): follow-cam, low-poly biome globe, starfield orbit, scale switcher | ✅ |
| 14 | Multiplayer architecture interfaces | NetCommand/NetMessage protocol, NetTransport (+Null/Loopback), host-authoritative Session (+Offline), docs — **offline-first, not implemented** | ✅ |
| 15 | Mobile UI polish + performance pass | Code-split three.js + lazy render layer (~45 KB entry), boot menu (New Game/Continue), HUD hidden at planet/orbit, touch/safe-area | ✅ |
| 16 | Android export/release docs | Capacitor + capacitor.config.ts + scripts + .env.example; ANDROID.md (cap add/sync, AdMob prod + consent, signing, Play checklist) | ✅ |

## Cross-cutting (woven through phases, not separate)
- **Monetization (AdMob):** abstraction in Phase 1; rewarded-ad hooks added as gameplay
  rewards appear (Phases 5+); interstitials at era transitions (Phase 9); prod config Phase 16.
- **Testing:** every phase adds Vitest coverage for new sim-core logic.
- **Determinism:** sim core stays seed-deterministic so saves/replays/MP stay viable.

## Quality bar per phase
After each phase run: `npm run build` (type-check), `npm run test`, `npm run lint`.
If a check can't run, document exactly what was not verified in CHECKPOINTS.md.
