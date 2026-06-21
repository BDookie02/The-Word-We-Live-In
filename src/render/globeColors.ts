import { BIOME_COLOR } from '../sim';

/**
 * Map a noise value in [0, 1] to a biome colour for the stylized planet globe. Pure (no three.js)
 * so it can be unit-tested. Thresholds mirror the terrain biome bands at a planetary scale.
 */
export function biomeColorForValue(v: number): string {
  if (v < 0.45) return BIOME_COLOR.water;
  if (v < 0.5) return BIOME_COLOR.sand;
  if (v < 0.68) return BIOME_COLOR.grass;
  if (v < 0.82) return BIOME_COLOR.forest;
  if (v < 0.92) return BIOME_COLOR.rock;
  return BIOME_COLOR.snow;
}
