import type { ItemCost } from '../items/inventory';
import type { EntityId, Vec2 } from '../core/types';

export type BuildingKind = 'campfire' | 'hut' | 'storage' | 'farm';

export interface BuildingDef {
  kind: BuildingKind;
  name: string;
  icon: string;
  cost: ItemCost;
  /** Work units required to finish construction. */
  buildWork: number;
  /** Minimum civilization era index required to place this (0 = primitive). */
  minEra: number;
}

export const BUILDINGS: Record<BuildingKind, BuildingDef> = {
  campfire: { kind: 'campfire', name: 'Campfire', icon: '🔥', cost: { wood: 3 }, buildWork: 8, minEra: 0 },
  hut: { kind: 'hut', name: 'Shelter', icon: '🛖', cost: { wood: 5, fiber: 3 }, buildWork: 20, minEra: 1 },
  storage: { kind: 'storage', name: 'Storage', icon: '📦', cost: { wood: 4, stone: 2 }, buildWork: 15, minEra: 1 },
  farm: { kind: 'farm', name: 'Farm Plot', icon: '🌱', cost: { wood: 2, fiber: 2 }, buildWork: 12, minEra: 1 },
};

export const BUILDING_ORDER: readonly BuildingKind[] = ['campfire', 'hut', 'storage', 'farm'];

export interface Building {
  id: EntityId;
  kind: BuildingKind;
  pos: Vec2;
  /** Construction progress in work units; built once it reaches the def's buildWork. */
  progress: number;
  built: boolean;
  /** Fractional production accumulator (farms). */
  produce: number;
}
