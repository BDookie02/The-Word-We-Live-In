import { PLANET } from '../../config/gameConfig';
import { biomeForHeight } from './biomes';
import { createValueNoise, fbm } from './noise';

/**
 * Serializable terrain description. Static for a world (generated once at world creation),
 * so it is delivered to the renderer separately from the per-tick snapshot rather than being
 * cloned every tick. Heights are stored row-major over a (size+1) x (size+1) vertex grid.
 */
export interface TerrainData {
  /** Cells per side; the vertex grid is (size + 1) per side. */
  size: number;
  /** World units across the patch (centered on the origin). */
  worldSize: number;
  waterLevel: number;
  maxHeight: number;
  /** Row-major vertex heights, length (size+1)^2. */
  heights: number[];
  /** Row-major per-vertex biome index, length (size+1)^2. */
  biomes: number[];
}

export interface TerrainOptions {
  size?: number;
  worldSize?: number;
  maxHeight?: number;
  waterLevel?: number;
  frequency?: number;
  octaves?: number;
}

/** Deterministically generate terrain height/biome data from a seed. */
export function generateTerrain(seed: number, opts: TerrainOptions = {}): TerrainData {
  const size = opts.size ?? PLANET.gridSize;
  const worldSize = opts.worldSize ?? PLANET.worldSize;
  const maxHeight = opts.maxHeight ?? PLANET.maxHeight;
  const waterLevel = opts.waterLevel ?? PLANET.waterLevel;
  const frequency = opts.frequency ?? PLANET.noiseFrequency;
  const octaves = opts.octaves ?? PLANET.noiseOctaves;

  const noise = createValueNoise((seed ^ 0xbeef) >>> 0);
  const verts = size + 1;
  const heights = new Array<number>(verts * verts);
  const biomes = new Array<number>(verts * verts);

  for (let j = 0; j < verts; j++) {
    for (let i = 0; i < verts; i++) {
      const nx = (i / size) * frequency;
      const ny = (j / size) * frequency;
      // Raise contrast a touch so lowlands flatten and peaks stand out.
      const n = Math.pow(fbm(noise, nx, ny, octaves), 1.3);
      const height = n * maxHeight;
      const idx = j * verts + i;
      heights[idx] = height;
      biomes[idx] = biomeForHeight(height, waterLevel, maxHeight);
    }
  }

  return { size, worldSize, waterLevel, maxHeight, heights, biomes };
}

/**
 * Bilinearly sample terrain height at world coordinates (wx, wz). Used to seat entities and
 * resource nodes on the surface. Clamps to the patch bounds. Pure.
 */
export function sampleHeight(data: TerrainData, wx: number, wz: number): number {
  const { size, worldSize, heights } = data;
  const verts = size + 1;
  const half = worldSize / 2;

  // World -> grid space.
  const gx = ((wx + half) / worldSize) * size;
  const gz = ((wz + half) / worldSize) * size;

  const x0 = Math.max(0, Math.min(size, Math.floor(gx)));
  const z0 = Math.max(0, Math.min(size, Math.floor(gz)));
  const x1 = Math.min(size, x0 + 1);
  const z1 = Math.min(size, z0 + 1);
  const tx = Math.max(0, Math.min(1, gx - x0));
  const tz = Math.max(0, Math.min(1, gz - z0));

  const h00 = heights[z0 * verts + x0];
  const h10 = heights[z0 * verts + x1];
  const h01 = heights[z1 * verts + x0];
  const h11 = heights[z1 * verts + x1];

  const a = h00 + (h10 - h00) * tx;
  const b = h01 + (h11 - h01) * tx;
  return a + (b - a) * tz;
}
