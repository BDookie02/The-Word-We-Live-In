import { describe, expect, it } from 'vitest';
import { generateTerrain, sampleHeight } from './Terrain';

describe('generateTerrain', () => {
  it('is deterministic for a given seed', () => {
    const a = generateTerrain(99);
    const b = generateTerrain(99);
    expect(a).toEqual(b);
  });

  it('produces a full (size+1)^2 vertex grid', () => {
    const t = generateTerrain(1, { size: 16 });
    const verts = 16 + 1;
    expect(t.heights).toHaveLength(verts * verts);
    expect(t.biomes).toHaveLength(verts * verts);
  });

  it('keeps heights within [0, maxHeight]', () => {
    const t = generateTerrain(3, { maxHeight: 16 });
    for (const h of t.heights) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(16);
    }
  });

  it('contains both water and land', () => {
    const t = generateTerrain(5);
    const below = t.heights.filter((h) => h < t.waterLevel).length;
    const above = t.heights.filter((h) => h >= t.waterLevel).length;
    expect(below).toBeGreaterThan(0);
    expect(above).toBeGreaterThan(0);
  });
});

describe('sampleHeight', () => {
  it('matches the grid height exactly at a vertex position', () => {
    const t = generateTerrain(7, { size: 32, worldSize: 100 });
    const verts = t.size + 1;
    const cell = t.worldSize / t.size;
    const half = t.worldSize / 2;
    const i = 10;
    const j = 12;
    const wx = -half + i * cell;
    const wz = -half + j * cell;
    expect(sampleHeight(t, wx, wz)).toBeCloseTo(t.heights[j * verts + i], 5);
  });

  it('clamps out-of-bounds samples to the patch', () => {
    const t = generateTerrain(7, { worldSize: 100 });
    const v = sampleHeight(t, 9999, -9999);
    expect(Number.isFinite(v)).toBe(true);
  });
});
