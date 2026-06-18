/** Public surface of the deterministic simulation core. */
export { World, type WorldSnapshot } from './world/World';
export { SimClock, type CalendarTime } from './core/SimClock';
export { createRng, hashStringToSeed, type RNG } from './core/rng';
export type { Intent, IntentType } from './intents/intents';
export {
  RESOURCE_KINDS,
  emptyTally,
  type EntityId,
  type PlayerState,
  type ResourceKind,
  type ResourceNode,
  type ResourceTally,
  type Vec2,
} from './core/types';
