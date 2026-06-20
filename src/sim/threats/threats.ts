import { THREAT } from '../../config/gameConfig';
import type { RNG } from '../core/rng';
import type { EntityId, Vec2 } from '../core/types';
import { invCount, type Inventory, type ItemCost } from '../items/inventory';
import type { ItemId } from '../items/items';

export type ThreatKind = 'predator' | 'raider';

export interface Threat {
  id: EntityId;
  kind: ThreatKind;
  pos: Vec2;
  hp: number;
  maxHp: number;
  lastAttackTick: number;
}

export interface ThreatStat {
  maxHp: number;
  damage: number;
  loot: ItemCost;
}

export const THREAT_STATS: Record<ThreatKind, ThreatStat> = {
  predator: { maxHp: 6, damage: 5, loot: { food: 1, fiber: 1 } },
  raider: { maxHp: 12, damage: 7, loot: { stone: 1, wood: 1 } },
};

/** Weapon bonuses to the player's attack power (best owned weapon applies). */
export const WEAPON_BONUS: Partial<Record<ItemId, number>> = {
  spear: 3,
  axe: 1,
  pickaxe: 1,
};

/** Player attack power: a base plus the best owned weapon's bonus. */
export function playerAttackPower(inv: Inventory): number {
  let bonus = 0;
  for (const [id, b] of Object.entries(WEAPON_BONUS) as [ItemId, number][]) {
    if (invCount(inv, id) > 0) bonus = Math.max(bonus, b);
  }
  return THREAT.playerAttackBase + bonus;
}

/** Raiders grow more common as the civilization (era) advances; predators dominate early. */
export function chooseThreatKind(rng: RNG, era: number): ThreatKind {
  const raiderChance = 0.15 + era * 0.15;
  return rng.next() < raiderChance ? 'raider' : 'predator';
}

export function makeThreat(id: EntityId, kind: ThreatKind, pos: Vec2): Threat {
  const stat = THREAT_STATS[kind];
  return { id, kind, pos: { ...pos }, hp: stat.maxHp, maxHp: stat.maxHp, lastAttackTick: -9999 };
}
