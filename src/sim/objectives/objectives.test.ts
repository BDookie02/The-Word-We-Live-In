import { describe, expect, it } from 'vitest';
import { emptyStats, objectiveProgress, OBJECTIVES, type ObjectiveContext } from './objectives';

function ctx(over: Partial<ObjectiveContext> = {}): ObjectiveContext {
  return { inventory: {}, stats: emptyStats(), ...over };
}

describe('OBJECTIVES', () => {
  it('all have unique ids and positive targets', () => {
    const ids = new Set(OBJECTIVES.map((o) => o.id));
    expect(ids.size).toBe(OBJECTIVES.length);
    for (const o of OBJECTIVES) expect(o.target).toBeGreaterThan(0);
  });
});

describe('objectiveProgress', () => {
  it('reports clamped progress and incomplete state for a fresh world', () => {
    const list = objectiveProgress(ctx(), {});
    const wood = list.find((o) => o.id === 'gather_wood_5')!;
    expect(wood.current).toBe(0);
    expect(wood.target).toBe(5);
    expect(wood.completed).toBe(false);
  });

  it('marks an objective completed once its measure meets the target', () => {
    const list = objectiveProgress(ctx({ inventory: { wood: 7 } }), {});
    const wood = list.find((o) => o.id === 'gather_wood_5')!;
    expect(wood.current).toBe(5); // clamped to target
    expect(wood.completed).toBe(true);
  });

  it('respects a latched completion map', () => {
    const list = objectiveProgress(ctx(), { gather_wood_5: true });
    const wood = list.find((o) => o.id === 'gather_wood_5')!;
    expect(wood.completed).toBe(true);
  });

  it('tracks stat-based objectives', () => {
    const stats = emptyStats();
    stats.eaten = 1;
    const list = objectiveProgress(ctx({ stats }), {});
    expect(list.find((o) => o.id === 'eat_meal')!.completed).toBe(true);
  });
});
