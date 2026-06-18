/** Public surface of the deterministic simulation core. */
export { World, type WorldSnapshot } from './world/World';
export { SimClock, type CalendarTime } from './core/SimClock';
export { createRng, hashStringToSeed, type RNG } from './core/rng';
export type { Intent, IntentType } from './intents/intents';
export {
  generateTerrain,
  sampleHeight,
  type TerrainData,
  type TerrainOptions,
} from './planet/Terrain';
export { BIOMES, BIOME_COLOR, biomeForHeight, type Biome } from './planet/biomes';
export { createValueNoise, fbm, type Noise2D } from './planet/noise';
export {
  RESOURCE_KINDS,
  emptyTally,
  fullNeeds,
  type EntityId,
  type NeedLevels,
  type PlayerState,
  type PlayerStatus,
  type ResourceKind,
  type ResourceNode,
  type ResourceTally,
  type Vec2,
} from './core/types';
export type { PlayerSnapshot } from './world/World';
