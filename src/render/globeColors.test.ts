import { describe, expect, it } from 'vitest';
import { biomeColorForValue } from './globeColors';
import { BIOME_COLOR } from '../sim';

describe('biomeColorForValue', () => {
  it('maps low values to water and high values to snow', () => {
    expect(biomeColorForValue(0)).toBe(BIOME_COLOR.water);
    expect(biomeColorForValue(1)).toBe(BIOME_COLOR.snow);
  });

  it('returns valid hex colours across the range', () => {
    for (let v = 0; v <= 1.0001; v += 0.05) {
      expect(biomeColorForValue(v)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('is monotonic-ish: progresses water → land → peaks', () => {
    expect(biomeColorForValue(0.3)).toBe(BIOME_COLOR.water);
    expect(biomeColorForValue(0.6)).toBe(BIOME_COLOR.grass);
    expect(biomeColorForValue(0.75)).toBe(BIOME_COLOR.forest);
  });
});
