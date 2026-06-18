/** Terrain biomes, derived from elevation. Indices are stable (used for vertex colouring). */
export type Biome = 'water' | 'sand' | 'grass' | 'forest' | 'rock' | 'snow';

export const BIOMES: readonly Biome[] = ['water', 'sand', 'grass', 'forest', 'rock', 'snow'];

export const BIOME_COLOR: Record<Biome, string> = {
  water: '#2f6fb0',
  sand: '#d9c9a3',
  grass: '#5a9e4a',
  forest: '#3f7d3a',
  rock: '#8a8f98',
  snow: '#eef3f7',
};

/**
 * Map an elevation to a biome index (into {@link BIOMES}). Below the water level is always
 * water; above it the band is split by normalized height. Pure function — shared by terrain
 * generation, node placement, and the render layer's mesh colouring.
 */
export function biomeForHeight(height: number, waterLevel: number, maxHeight: number): number {
  if (height < waterLevel) return 0; // water
  const t = (height - waterLevel) / Math.max(0.0001, maxHeight - waterLevel);
  if (t < 0.06) return 1; // sand (shoreline)
  if (t < 0.4) return 2; // grass
  if (t < 0.65) return 3; // forest
  if (t < 0.85) return 4; // rock
  return 5; // snow
}
