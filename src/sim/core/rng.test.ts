import { describe, expect, it } from 'vitest';
import { createRng, hashStringToSeed } from './rng';

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('produces different streams for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it('returns floats in [0, 1)', () => {
    const r = createRng(99);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() stays within inclusive bounds', () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.int(3, 8);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(8);
    }
  });

  it('fork() yields reproducible, independent sub-streams', () => {
    const parent = createRng(42);
    const f1a = parent.fork(1);
    const f1b = createRng(42).fork(1);
    expect(f1a.next()).toEqual(f1b.next());
    expect(parent.fork(1).next()).not.toEqual(parent.fork(2).next());
  });
});

describe('hashStringToSeed', () => {
  it('is stable and seed-usable', () => {
    expect(hashStringToSeed('terra')).toEqual(hashStringToSeed('terra'));
    expect(hashStringToSeed('terra')).not.toEqual(hashStringToSeed('terria'));
    expect(Number.isInteger(hashStringToSeed('x'))).toBe(true);
  });
});
