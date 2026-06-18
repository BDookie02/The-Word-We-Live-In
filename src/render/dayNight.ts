/**
 * Pure day/night lighting model. Maps a day fraction (0 = midnight, 0.5 = noon) to sun
 * intensity/position and a sky colour. No three.js or DOM dependency, so it is unit-tested
 * in Node and reused by the r3f scene.
 */

export interface SkyLighting {
  /** Directional "sun" light intensity (low at night, peaks at noon). */
  sunIntensity: number;
  /** Fill ambient light intensity. */
  ambientIntensity: number;
  /** World-space position for the directional light. */
  sunPosition: [number, number, number];
  /** Scene background + fog colour as a hex string. */
  skyColor: string;
}

const DAY_SKY = { r: 0x87, g: 0xbe, b: 0xeb }; // light blue
const NIGHT_SKY = { r: 0x0b, g: 0x12, b: 0x24 }; // deep navy

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function computeLighting(dayFraction: number): SkyLighting {
  const f = ((dayFraction % 1) + 1) % 1; // wrap into [0, 1)

  // Sun elevation: -1 (deep night) .. +1 (noon). Sunrise ~0.25, sunset ~0.75.
  const elevation = Math.sin((f - 0.25) * Math.PI * 2);
  const daylight = Math.max(0, elevation); // 0..1

  const sunIntensity = 0.12 + daylight * 1.18;
  const ambientIntensity = 0.22 + daylight * 0.5;

  // Sun arcs east -> west across the sky; kept above a floor so it never lights from below.
  const azimuth = (f - 0.25) * Math.PI * 2;
  const radius = 100;
  const sunPosition: [number, number, number] = [
    Math.cos(azimuth) * radius,
    Math.max(6, elevation * radius),
    Math.sin(azimuth) * radius * 0.5 + 25,
  ];

  // Sky blends night -> day, reaching full day a little before solar noon.
  const t = clamp01(daylight * 1.6);
  const skyColor = toHex(
    lerp(NIGHT_SKY.r, DAY_SKY.r, t),
    lerp(NIGHT_SKY.g, DAY_SKY.g, t),
    lerp(NIGHT_SKY.b, DAY_SKY.b, t),
  );

  return { sunIntensity, ambientIntensity, sunPosition, skyColor };
}

/** Convenience: derive the day fraction from the in-world clock (minute resolution). */
export function dayFractionFromTime(hour: number, minute: number): number {
  return (hour * 60 + minute) / (24 * 60);
}
