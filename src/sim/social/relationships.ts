import type { EntityId } from '../core/types';

/**
 * Pairwise affinity between entities (player and NPCs), keyed by a canonical sorted pair.
 * Range roughly [-100, 100]. This is the seed for the emergent social systems in Phase 10
 * (groups, friendships, rivalries) — kept deliberately simple here.
 */
export type RelationshipMap = Record<string, number>;

export function relKey(a: EntityId, b: EntityId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getAffinity(map: RelationshipMap, a: EntityId, b: EntityId): number {
  return map[relKey(a, b)] ?? 0;
}

export function addAffinity(
  map: RelationshipMap,
  a: EntityId,
  b: EntityId,
  delta: number,
  min = -100,
  max = 100,
): void {
  if (a === b) return;
  const k = relKey(a, b);
  map[k] = Math.max(min, Math.min(max, (map[k] ?? 0) + delta));
}
