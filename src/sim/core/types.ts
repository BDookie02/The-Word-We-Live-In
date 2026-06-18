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

export interface PlayerState {
  id: EntityId;
  pos: Vec2;
}
