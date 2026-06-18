import { describe, expect, it } from 'vitest';
import { computeLighting, dayFractionFromTime } from './dayNight';

describe('computeLighting', () => {
  it('is brightest at noon and darkest at midnight', () => {
    const noon = computeLighting(0.5);
    const midnight = computeLighting(0.0);
    expect(noon.sunIntensity).toBeGreaterThan(midnight.sunIntensity);
    expect(noon.ambientIntensity).toBeGreaterThan(midnight.ambientIntensity);
    expect(noon.skyColor).not.toEqual(midnight.skyColor);
  });

  it('keeps intensities non-negative and the sun above the horizon floor', () => {
    for (let f = 0; f < 1; f += 0.05) {
      const l = computeLighting(f);
      expect(l.sunIntensity).toBeGreaterThanOrEqual(0);
      expect(l.ambientIntensity).toBeGreaterThanOrEqual(0);
      expect(l.sunPosition[1]).toBeGreaterThanOrEqual(6);
    }
  });

  it('wraps day fraction outside [0,1)', () => {
    expect(computeLighting(1.5)).toEqual(computeLighting(0.5));
    expect(computeLighting(-0.5)).toEqual(computeLighting(0.5));
  });

  it('returns a valid hex sky colour', () => {
    expect(computeLighting(0.5).skyColor).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('dayFractionFromTime', () => {
  it('maps midnight and noon correctly', () => {
    expect(dayFractionFromTime(0, 0)).toBe(0);
    expect(dayFractionFromTime(12, 0)).toBe(0.5);
    expect(dayFractionFromTime(6, 0)).toBe(0.25);
  });
});
