import { describe, expect, it } from 'vitest';
import { canAdvanceEra, eraDef, MAX_ERA_INDEX, nextEraRequirements, type EraContext } from './eras';

function ctx(over: Partial<EraContext> = {}): EraContext {
  return { population: 0, crafted: 0, builtFarms: 0, builtStorage: 0, toolsOwned: 0, ...over };
}

describe('eras', () => {
  it('starts at the primitive era', () => {
    expect(eraDef(0).id).toBe('primitive');
  });

  it('lists requirements to advance from primitive and gates on them', () => {
    expect(nextEraRequirements(0, ctx())).toHaveLength(2);
    expect(canAdvanceEra(0, ctx())).toBe(false);
    expect(canAdvanceEra(0, ctx({ crafted: 1, population: 1 }))).toBe(true);
  });

  it('requires a farm and two survivors to reach the agrarian era', () => {
    expect(canAdvanceEra(1, ctx({ builtFarms: 1, population: 1 }))).toBe(false);
    expect(canAdvanceEra(1, ctx({ builtFarms: 1, population: 2 }))).toBe(true);
  });

  it('has no requirements beyond the final era', () => {
    expect(nextEraRequirements(MAX_ERA_INDEX, ctx())).toBeNull();
    expect(canAdvanceEra(MAX_ERA_INDEX, ctx({ population: 99 }))).toBe(false);
  });

  it('clamps eraDef to valid bounds', () => {
    expect(eraDef(-5).index).toBe(0);
    expect(eraDef(999).index).toBe(MAX_ERA_INDEX);
  });
});
