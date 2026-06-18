import { invCount, type ItemCost, type Inventory } from '../items/inventory';
import type { ItemId } from '../items/items';

/** Lifetime action counters used by objectives (and future progression systems). */
export interface PlayerStats {
  gathered: number;
  crafted: number;
  eaten: number;
  drank: number;
}

export function emptyStats(): PlayerStats {
  return { gathered: 0, crafted: 0, eaten: 0, drank: 0 };
}

export interface ObjectiveContext {
  inventory: Inventory;
  stats: PlayerStats;
}

export interface ObjectiveDef {
  id: string;
  title: string;
  target: number;
  /** Current progress value, computed from world state. */
  measure: (ctx: ObjectiveContext) => number;
  /** Items granted once on completion. */
  reward?: ItemCost;
}

/** Serializable per-objective progress for the UI. */
export interface ObjectiveProgress {
  id: string;
  title: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface AssistantMessage {
  id: number;
  tick: number;
  text: string;
}

const ownsItem =
  (id: ItemId) =>
  (ctx: ObjectiveContext): number =>
    invCount(ctx.inventory, id);

const statValue =
  (key: keyof PlayerStats) =>
  (ctx: ObjectiveContext): number =>
    ctx.stats[key];

/**
 * Small, numerous, easy objectives that auto-track against world state. Designed to be
 * abundant and quick to complete — the early-game "do many little things" loop. Latched:
 * once an objective hits its target it stays complete (rewards granted once). Add era-scaled
 * objectives here in later phases.
 */
export const OBJECTIVES: readonly ObjectiveDef[] = [
  { id: 'gather_wood_5', title: 'Gather 5 wood', target: 5, measure: ownsItem('wood'), reward: { food: 2 } },
  { id: 'gather_stone_3', title: 'Gather 3 stone', target: 3, measure: ownsItem('stone'), reward: { food: 2 } },
  { id: 'gather_fiber_5', title: 'Gather 5 fiber', target: 5, measure: ownsItem('fiber') },
  { id: 'gather_food_3', title: 'Stock 3 food', target: 3, measure: ownsItem('food') },
  { id: 'gather_any_15', title: 'Gather 15 resources total', target: 15, measure: statValue('gathered') },
  { id: 'eat_meal', title: 'Eat a meal', target: 1, measure: statValue('eaten') },
  { id: 'drink_water', title: 'Drink from the water', target: 1, measure: statValue('drank') },
  { id: 'craft_anything', title: 'Craft your first item', target: 1, measure: statValue('crafted'), reward: { fiber: 2 } },
  { id: 'craft_sharp', title: 'Craft a sharp stone', target: 1, measure: ownsItem('sharp_stone') },
  { id: 'craft_rope', title: 'Craft rope', target: 1, measure: ownsItem('rope') },
  { id: 'craft_axe', title: 'Craft a stone axe', target: 1, measure: ownsItem('axe'), reward: { wood: 5 } },
  { id: 'craft_pickaxe', title: 'Craft a stone pickaxe', target: 1, measure: ownsItem('pickaxe'), reward: { stone: 5 } },
  { id: 'craft_spear', title: 'Craft a spear', target: 1, measure: ownsItem('spear') },
];

/** Build the serializable progress list for a snapshot. */
export function objectiveProgress(
  ctx: ObjectiveContext,
  completed: Record<string, boolean>,
): ObjectiveProgress[] {
  return OBJECTIVES.map((o) => {
    const current = o.measure(ctx);
    return {
      id: o.id,
      title: o.title,
      current: Math.min(current, o.target),
      target: o.target,
      completed: completed[o.id] ?? current >= o.target,
    };
  });
}
