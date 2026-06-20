/**
 * Civilization era progression. Eras are an ordered chain; advancing from one to the next
 * requires measurable world-state conditions (data-driven, checked in the sim core). Recipes
 * and buildings carry a `minEra` index that gates them. Designed to extend toward modern/space
 * eras in later phases — add entries here rather than branching code.
 */
export type EraId = 'primitive' | 'tribal' | 'agrarian' | 'industrial';

export interface EraDef {
  id: EraId;
  name: string;
  index: number;
}

export const ERAS: readonly EraDef[] = [
  { id: 'primitive', name: 'Primitive', index: 0 },
  { id: 'tribal', name: 'Tribal', index: 1 },
  { id: 'agrarian', name: 'Agrarian', index: 2 },
  { id: 'industrial', name: 'Industrial', index: 3 },
];

export const MAX_ERA_INDEX = ERAS.length - 1;

export function eraDef(index: number): EraDef {
  return ERAS[Math.max(0, Math.min(MAX_ERA_INDEX, index))];
}

/** Inputs the advancement rules read; assembled by the World from live state. */
export interface EraContext {
  population: number; // recruited survivors
  crafted: number; // lifetime items crafted
  builtFarms: number;
  builtStorage: number;
  toolsOwned: number; // axe + pickaxe + spear
}

export interface EraRequirement {
  label: string;
  current: number;
  target: number;
}

/**
 * Requirements to advance FROM the given era index to the next. Returns null at the final era.
 * Each requirement's `current` is clamped to its `target` for clean progress display.
 */
export function nextEraRequirements(currentIndex: number, ctx: EraContext): EraRequirement[] | null {
  const clamp = (v: number, t: number) => Math.min(v, t);
  switch (currentIndex) {
    case 0: // -> Tribal
      return [
        { label: 'Craft an item', current: clamp(ctx.crafted, 1), target: 1 },
        { label: 'Recruit a survivor', current: clamp(ctx.population, 1), target: 1 },
      ];
    case 1: // -> Agrarian
      return [
        { label: 'Build a farm', current: clamp(ctx.builtFarms, 1), target: 1 },
        { label: 'Recruit survivors', current: clamp(ctx.population, 2), target: 2 },
      ];
    case 2: // -> Industrial
      return [
        { label: 'Build storage', current: clamp(ctx.builtStorage, 1), target: 1 },
        { label: 'Own a tool', current: clamp(ctx.toolsOwned, 1), target: 1 },
        { label: 'Recruit survivors', current: clamp(ctx.population, 3), target: 3 },
      ];
    default:
      return null; // final era
  }
}

export function canAdvanceEra(currentIndex: number, ctx: EraContext): boolean {
  const reqs = nextEraRequirements(currentIndex, ctx);
  if (!reqs) return false;
  return reqs.every((r) => r.current >= r.target);
}
