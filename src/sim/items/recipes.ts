import type { ItemCost } from './inventory';
import type { ItemId } from './items';

export interface Recipe {
  id: string;
  name: string;
  output: { item: ItemId; qty: number };
  inputs: ItemCost;
  /** Optional tool that must be owned to craft this recipe (not consumed). */
  requiresTool?: ItemId;
}

/**
 * Data-driven crafting recipes. The progression is intentionally shallow-but-gated:
 * raw resources → materials (plank/rope/sharp_stone) → tools (axe/pickaxe/spear).
 * Add eras/tiers here in later phases rather than branching code.
 */
export const RECIPES: readonly Recipe[] = [
  { id: 'plank', name: 'Plank', output: { item: 'plank', qty: 1 }, inputs: { wood: 2 } },
  { id: 'rope', name: 'Rope', output: { item: 'rope', qty: 1 }, inputs: { fiber: 3 } },
  {
    id: 'sharp_stone',
    name: 'Sharp Stone',
    output: { item: 'sharp_stone', qty: 1 },
    inputs: { stone: 2 },
  },
  {
    id: 'axe',
    name: 'Stone Axe',
    output: { item: 'axe', qty: 1 },
    inputs: { wood: 2, sharp_stone: 1, rope: 1 },
  },
  {
    id: 'pickaxe',
    name: 'Stone Pickaxe',
    output: { item: 'pickaxe', qty: 1 },
    inputs: { wood: 2, sharp_stone: 2, rope: 1 },
  },
  {
    id: 'spear',
    name: 'Spear',
    output: { item: 'spear', qty: 1 },
    inputs: { wood: 1, sharp_stone: 1, rope: 1 },
  },
];

export function recipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
