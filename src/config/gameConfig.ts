/**
 * Central gameplay tunables. Pure data — safe to import from the sim core.
 * Times are expressed in fixed sim ticks so the simulation stays deterministic
 * and independent of real wall-clock frame rate.
 */

export const TICK_RATE_HZ = 20; // fixed sim steps per real second at 1x speed
export const TICK_MS = 1000 / TICK_RATE_HZ;

// In-world calendar: how many sim ticks map to one in-world hour/day.
// 150 ticks/hour @20Hz => 7.5s per in-world hour => 3 min per in-world day.
export const TICKS_PER_HOUR = 150;
export const HOURS_PER_DAY = 24;
export const TICKS_PER_DAY = TICKS_PER_HOUR * HOURS_PER_DAY;

// Loop safety: never simulate more than this many catch-up steps in one frame
// (prevents the "spiral of death" after a stall / backgrounded tab).
export const MAX_CATCHUP_STEPS = 5;

// How often (real ms) the game autosaves to storage.
export const AUTOSAVE_INTERVAL_MS = 15000;

// Monetization cadence (enforced by gameplay, honored by AdService callers).
export const ADS = {
  /** Minimum real seconds between interstitials. */
  interstitialCooldownSec: 120,
  /** Resource bonus granted by the rewarded "supply cache" placement. */
  rewardCacheAmount: 10,
} as const;

// Player movement + survival (Phase 4). Decay/regen are per fixed tick.
export const SURVIVAL = {
  moveSpeed: 10, // world units per second
  arriveRadius: 0.4, // stop when within this distance of the move target

  hungerDecayPerTick: 0.02,
  thirstDecayPerTick: 0.03,
  energyMoveCostPerTick: 0.05,
  energyIdleRegenPerTick: 0.03,

  // Health drains while any need is empty, and slowly recovers while well-fed/hydrated.
  healthDecayPerTick: 0.06,
  healthRegenPerTick: 0.012,
  healthRegenNeedThreshold: 50,

  eatRestore: 35, // hunger restored per food eaten
  drinkRestore: 40, // thirst restored per drink
  drinkMaxHeightAboveWater: 1.8, // player counts as "at the shore" within this height band
  reviveLevel: 60, // needs/health restored to this on revive
} as const;

// Enemies / threats + combat (Phase 11). Seeded, deterministic.
export const THREAT = {
  spawnCheckTicks: 60, // evaluate a spawn every N ticks
  spawnChanceDay: 0.15,
  spawnChanceNight: 0.45,
  eraSpawnBonus: 0.07, // + per era index (a growing settlement attracts more raids)
  maxActive: 6,
  edgeMargin: 10, // spawn this far inside the world edge
  speed: 6, // world units / second (slower than the player)
  attackRange: 2.2, // distance at which a threat can strike the player
  attackCooldownTicks: 20,
  contactDamage: 6, // fallback; per-kind damage in THREAT_STATS
  guardRange: 3.0, // guard NPCs damage threats within this distance
  guardDamagePerTick: 0.25,
  playerAttackBase: 2, // bare-handed attack power
} as const;

// Emergent social systems (Phase 10). Fictional/abstract, deterministic.
export const SOCIAL = {
  recomputeTicks: 40, // re-derive society every N ticks (~2s)
  groupAffinityThreshold: 8, // affinity weight that counts as a social tie (edge)
  driftRate: 0.05, // value convergence toward the group mean per recompute
  allyDistance: 1.5, // value distance below which two groups are allied
  rivalDistance: 3.5, // value distance above which two groups are rivals
} as const;

// Settlement construction + jobs (Phase 8). Per-tick rates.
export const BUILD = {
  workPerTick: 0.18, // a builder NPC's progress contribution per tick when adjacent
  playerWorkPerTap: 3, // progress added when the player taps an in-progress building
  farmFoodPerTick: 0.04, // food produced per tick by a tended (built) farm
  workRadius: 3.5, // how close an NPC must be to a building to work/tend it
} as const;

// NPC survivors (Phase 7). All per-tick rates; deterministic behaviour.
export const NPC_CFG = {
  count: 4,
  moveSpeed: 7, // world units / second (a touch slower than the player)
  arriveRadius: 1.2,
  spawnRadius: 20, // NPCs spawn within this radius of the crash site (origin)

  seekThirstBelow: 35,
  seekHungerBelow: 35,
  drinkRestore: 45,
  eatRestore: 40,

  wanderChance: 0.012, // per-tick chance to pick a new wander destination
  wanderRadius: 14,

  proximityRadius: 10, // affinity grows between entities within this distance
  affinityPerTick: 0.02,
  recruitRadius: 7, // player must be this close to recruit an NPC
  recruitAffinityBonus: 20,
} as const;

// Procedural terrain (Phase 3). gridSize cells per side -> (gridSize+1)^2 vertices.
export const PLANET = {
  gridSize: 64,
  worldSize: 140, // world units across the terrain patch
  maxHeight: 16,
  waterLevel: 3.2,
  noiseFrequency: 2.6, // higher = smaller, more frequent features
  noiseOctaves: 5,
} as const;

// Starter resource nodes scattered across the generated terrain (by biome).
export const DEMO = {
  resourceNodeCount: 26,
  nodeAmountMin: 3,
  nodeAmountMax: 6,
} as const;
