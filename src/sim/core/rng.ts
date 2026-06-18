/**
 * Seeded, deterministic pseudo-random number generator (mulberry32).
 *
 * The entire sim core draws randomness from here so that a given seed + the same
 * ordered intents always reproduce the same world. Never use Math.random() in sim code.
 */

export interface RNG {
  /** Next float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Float in [min, max). */
  range(min: number, max: number): number;
  /** Pick a random element from a non-empty array. */
  pick<T>(arr: readonly T[]): T;
  /** Deterministic, independent sub-stream keyed by a salt (e.g. per-chunk RNG). */
  fork(salt: number): RNG;
  /** Current internal state (for save/restore). */
  state(): number;
}

export function createRng(seed: number): RNG {
  let a = seed >>> 0;

  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + next() * (max - min),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    fork: (salt) => createRng((seed ^ Math.imul(salt | 0, 0x9e3779b1)) >>> 0),
    state: () => a >>> 0,
  };
}

/** Stable string → 32-bit seed (so worlds can be named, not just numbered). */
export function hashStringToSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
