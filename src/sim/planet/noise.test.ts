import { describe, expect, it } from 'vitest';
import { createValueNoise, fbm } from './noise';

describe('createValueNoise', () => {
  it('is deterministic for a given seed', () => {
    const a = createValueNoise(123);
    const b = createValueNoise(123);
    for (let i = 0; i < 20; i++) {
      const x = i * 0.37;
      const y = i * 0.91;
      expect(a(x, y)).toEqual(b(x, y));
    }
  });

  it('differs across seeds', () => {
    const a = createValueNoise(1);
    const b = createValueNoise(2);
    expect(a(1.5, 2.5)).not.toEqual(b(1.5, 2.5));
  });

  it('returns values within [0, 1]', () => {
    const n = createValueNoise(7);
    for (let i = 0; i < 500; i++) {
      const v = n(i * 0.13, i * 0.29);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('fbm', () => {
  it('stays within [0, 1] and is deterministic', () => {
    const n = createValueNoise(42);
    for (let i = 0; i < 200; i++) {
      const v = fbm(n, i * 0.2, i * 0.05, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(fbm(n, 3.3, 4.4, 5)).toEqual(fbm(n, 3.3, 4.4, 5));
  });
});
