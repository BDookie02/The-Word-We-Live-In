/**
 * Central gameplay tunables. Pure data — safe to import from the sim core.
 * Times are expressed in fixed sim ticks so the simulation stays deterministic
 * and independent of real wall-clock frame rate.
 */

export const TICK_RATE_HZ = 20; // fixed sim steps per real second at 1x speed
export const TICK_MS = 1000 / TICK_RATE_HZ;

// In-world calendar: how many sim ticks map to one in-world hour/day.
export const TICKS_PER_HOUR = 50;
export const HOURS_PER_DAY = 24;
export const TICKS_PER_DAY = TICKS_PER_HOUR * HOURS_PER_DAY;

// Loop safety: never simulate more than this many catch-up steps in one frame
// (prevents the "spiral of death" after a stall / backgrounded tab).
export const MAX_CATCHUP_STEPS = 5;

// Monetization cadence (enforced by gameplay, honored by AdService callers).
export const ADS = {
  /** Minimum real seconds between interstitials. */
  interstitialCooldownSec: 120,
  /** Resource bonus granted by the rewarded "supply cache" placement. */
  rewardCacheAmount: 10,
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
