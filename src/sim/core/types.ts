/** Shared primitive types for the simulation core. Kept tiny in Phase 1; grows per phase. */

export type EntityId = string;

export interface Vec2 {
  x: number;
  y: number;
}

/** Resource categories available at the primitive era. Expanded in later phases. */
export type ResourceKind = 'wood' | 'stone' | 'food' | 'fiber';

export const RESOURCE_KINDS: readonly ResourceKind[] = ['wood', 'stone', 'food', 'fiber'];

export type ResourceTally = Record<ResourceKind, number>;

export function emptyTally(): ResourceTally {
  return { wood: 0, stone: 0, food: 0, fiber: 0 };
}

export interface ResourceNode {
  id: EntityId;
  kind: ResourceKind;
  pos: Vec2;
  amount: number;
}

/** Survival needs, each on a 0..100 scale (100 = fully satisfied). */
export interface NeedLevels {
  hunger: number;
  thirst: number;
  energy: number;
  health: number;
}

export function fullNeeds(): NeedLevels {
  return { hunger: 100, thirst: 100, energy: 100, health: 100 };
}

export type PlayerStatus = 'alive' | 'collapsed';

export interface PlayerState {
  id: EntityId;
  pos: Vec2;
  /** Current move destination in world (x, z), or null when idle. */
  target: Vec2 | null;
  needs: NeedLevels;
  status: PlayerStatus;
}
