# ARCHITECTURE.md — The World We Live In

## Guiding principles
1. **Deterministic sim core, isolated.** All game logic lives in `src/sim/` as pure
   TypeScript — no React, no DOM, no Three.js, no platform APIs. Given the same seed and the
   same ordered intents, it always produces the same world. This makes it testable in Node,
   reusable as a future authoritative multiplayer server, and safe to snapshot for saves.
2. **One-way data flow.** `Input → Intent → Sim mutates state → snapshot → UI + Render read.`
   The UI and renderer never mutate world state directly; they dispatch intents.
3. **Renderer/UI/platform are swappable adapters** around the core. Ads, saves, networking,
   and rendering are all behind interfaces with mock/dev implementations.
4. **Emergent, not hard-coded.** Social/cultural/governance systems are data-driven and
   fictional/abstract (values, needs, relationships, history) — never hard-coded real-world
   religions or political parties.

## Layer map
```
┌─────────────────────────────────────────────────────────────┐
│ App shell (src/App.tsx, main.tsx)                            │
│  - owns the game loop (rAF → fixed-timestep sim.tick)        │
│  - view/zoom router                                          │
└───────────────┬───────────────────────────┬─────────────────┘
                │                            │
        ┌───────▼────────┐          ┌────────▼─────────┐
        │ UI (src/ui)    │          │ Render (src/render)│
        │ React HUD,     │          │ react-three-fiber  │
        │ panels, menus  │          │ scene per zoom LOD │
        └───────┬────────┘          └────────┬─────────┘
                │  read snapshot / dispatch intent
        ┌───────▼─────────────────────────────▼─────────┐
        │ State bridge (src/state) — Zustand store        │
        │  serializable snapshot + intent dispatch        │
        └───────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────▼─────────────────────────────┐
        │ SIM CORE (src/sim) — pure deterministic TS       │
        │  World, SimClock, seeded RNG, entities, systems  │
        └───────────────────▲─────────────────────────────┘
                            │ uses (via interfaces only)
        ┌───────────────────┴─────────────────────────────┐
        │ Services (src/services)                          │
        │  ads/ (AdService→AdMob|Mock)                     │
        │  save/ (versioned schema + storage adapter)      │
        │  platform/ (web vs native capabilities)          │
        │  net/ (future MP interfaces, offline-first)      │
        └──────────────────────────────────────────────────┘
        Input (src/input): touch/gesture → intents
        Config/data (src/config, src/data): tunables, item/recipe/era tables
```

## Folder structure
```
src/
  main.tsx              React entry
  App.tsx               Root: wires loop + router
  game/
    GameLoop.ts         rAF driver → fixed-timestep ticks into the sim
  sim/                  ⟵ PURE, NO React/DOM/Three
    core/
      rng.ts            seeded deterministic RNG (mulberry32)
      SimClock.ts       fixed-timestep accumulator + in-world calendar
      ids.ts            stable entity id generation
      types.ts          shared sim types
    world/
      World.ts          root aggregate: state + tick() + dispatch(intent)
    entities/           player, npc, resource nodes, structures (added per phase)
    systems/            survival, needs, social, civ, threats (added per phase)
    intents/            Intent union + handlers
    index.ts            public barrel for the core
  state/
    store.ts            Zustand store: holds latest snapshot, exposes dispatch
    selectors.ts        derived UI views
  render/               react-three-fiber scenes (added Phase 2/3)
  ui/                   React components (HUD, panels)
  input/                touch/gesture → intents (added Phase 2)
  services/
    ads/
      AdService.ts      interface (banner/interstitial/rewarded)
      MockAdService.ts  dev/web no-op + simulated reward
      AdMobService.ts   Capacitor AdMob impl (wired Phase 16; guarded by platform)
      index.ts          provider selection by platform
    save/
      SaveSchema.ts     versioned save shape + migrations (Phase 12)
      SaveService.ts    serialize/deserialize + storage adapter
    platform/
      platform.ts       isNative / capabilities
    net/                future MP interfaces (Phase 14)
  config/
    gameConfig.ts       tunables (tick rate, day length, ad cadence)
  data/                 item/recipe/era tables (added per phase)
tests live colocated as *.test.ts and run under Vitest.
```

## Key contracts
- **Intent**: `{ type: string; ...payload }` — the only way to change the world.
- **Snapshot**: a structured-clone-safe view of world state the UI/renderer subscribe to.
  Produced each tick (or on change) and pushed into the Zustand store.
- **AdService**: `init()`, `showBanner()/hideBanner()`, `showInterstitial()`,
  `showRewarded(): Promise<RewardResult>`. Gameplay awaits rewards; never touches the SDK.
- **SaveService**: `save(world): blob`, `load(blob): world`, versioned + migrated.

## Monetization design (Play-policy aware)
- **Rewarded ads** are the primary model: player *opts in* to watch for a concrete in-game
  boost (speed up a craft, recover after death, bonus resource cache). Always optional.
- **Interstitials** only at natural breaks (era transition, returning to menu) — never
  mid-action, never on app open spam. Frequency-capped via `gameConfig`.
- **Banner** only in non-gameplay menus (optional, low priority).
- All gated behind `AdService`; `MockAdService` lets us build/test the whole reward flow
  offline with zero SDK dependency.

## Performance posture
3D in a WebView on mid-range Android is the main risk. Mitigations: chunked/low-poly meshes,
LOD per zoom layer, instancing for repeated props, capped draw calls, sim runs on fixed
timestep decoupled from render. Profiled in Phase 15. Renderer stays swappable in case we
need to drop to 2D/2.5D.
