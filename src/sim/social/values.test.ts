import { describe, expect, it } from 'vitest';
import { driftToward, meanValues, randomValues, valueDistance } from './values';
import { createRng } from '../core/rng';

describe('values', () => {
  it('randomValues is deterministic and within [-1, 1]', () => {
    const a = randomValues(createRng(7));
    const b = randomValues(createRng(7));
    expect(a).toEqual(b);
    for (const v of Object.values(a)) {
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('driftToward moves toward the target and clamps', () => {
    const v = { tradition: 0, community: 0, harmony: 0 };
    const target = { tradition: 1, community: -1, harmony: 1 };
    const next = driftToward(v, target, 0.5);
    expect(next.tradition).toBeCloseTo(0.5);
    expect(next.community).toBeCloseTo(-0.5);
    // Repeated drift converges but never overshoots the [-1, 1] bound.
    let acc = v;
    for (let i = 0; i < 100; i++) acc = driftToward(acc, target, 0.5);
    expect(acc.tradition).toBeLessThanOrEqual(1);
    expect(acc.tradition).toBeGreaterThan(0.99);
  });

  it('meanValues averages a list', () => {
    const m = meanValues([
      { tradition: 1, community: 0, harmony: -1 },
      { tradition: -1, community: 0, harmony: 1 },
    ]);
    expect(m).toEqual({ tradition: 0, community: 0, harmony: 0 });
  });

  it('valueDistance is 0 for identical and positive otherwise', () => {
    const v = { tradition: 0.5, community: -0.2, harmony: 0.1 };
    expect(valueDistance(v, v)).toBe(0);
    expect(valueDistance(v, { tradition: -0.5, community: 0.2, harmony: -0.1 })).toBeGreaterThan(0);
  });
});
