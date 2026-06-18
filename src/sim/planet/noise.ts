import { createRng } from '../core/rng';

/** A 2D scalar noise field returning values in [0, 1). */
export type Noise2D = (x: number, y: number) => number;

/**
 * Seeded 2D value noise with smooth (smoothstep) interpolation. Deterministic for a given
 * seed — used by terrain generation so a seed always yields the same planet. Pure: depends
 * only on the seeded RNG, no global state.
 */
export function createValueNoise(seed: number): Noise2D {
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;

  // Fisher–Yates shuffle driven by the seeded RNG.
  const r = createRng(seed);
  for (let i = 255; i > 0; i--) {
    const j = r.int(0, i);
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }

  const p = new Uint8Array(512);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];

  const fade = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const hash = (xi: number, yi: number) => p[(p[xi & 255] + (yi & 255)) & 255] / 255;

  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = fade(xf);
    const v = fade(yf);
    const aa = hash(xi, yi);
    const ba = hash(xi + 1, yi);
    const ab = hash(xi, yi + 1);
    const bb = hash(xi + 1, yi + 1);
    return lerp(lerp(aa, ba, u), lerp(ab, bb, u), v);
  };
}

/**
 * Fractal Brownian motion: sums octaves of a noise field for natural-looking terrain.
 * Returns a value normalized to [0, 1].
 */
export function fbm(
  noise: Noise2D,
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2,
  gain = 0.5,
): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}
