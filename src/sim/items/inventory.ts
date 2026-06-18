import type { ItemId } from './items';

/** A simple count-based inventory. Absent keys mean zero. */
export type Inventory = Partial<Record<ItemId, number>>;

/** A set of item requirements/costs (e.g. recipe inputs). */
export type ItemCost = Partial<Record<ItemId, number>>;

export function invCount(inv: Inventory, id: ItemId): number {
  return inv[id] ?? 0;
}

export function invAdd(inv: Inventory, id: ItemId, qty: number): void {
  inv[id] = invCount(inv, id) + qty;
}

/** True if the inventory satisfies every requirement in `cost`. */
export function invHas(inv: Inventory, cost: ItemCost): boolean {
  return (Object.entries(cost) as [ItemId, number][]).every(([id, qty]) => invCount(inv, id) >= qty);
}

/** Subtract `cost` from the inventory if affordable. Returns false (no change) otherwise. */
export function invConsume(inv: Inventory, cost: ItemCost): boolean {
  if (!invHas(inv, cost)) return false;
  for (const [id, qty] of Object.entries(cost) as [ItemId, number][]) {
    inv[id] = invCount(inv, id) - qty;
  }
  return true;
}
