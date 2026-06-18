import { describe, expect, it } from 'vitest';
import { clamp01to100, stepSurvival } from './survival';
import { fullNeeds } from '../core/types';

describe('clamp01to100', () => {
  it('clamps to the 0..100 range', () => {
    expect(clamp01to100(-5)).toBe(0);
    expect(clamp01to100(150)).toBe(100);
    expect(clamp01to100(42)).toBe(42);
  });
});

describe('stepSurvival', () => {
  it('decays hunger and thirst each tick', () => {
    const n = fullNeeds();
    stepSurvival(n, false);
    expect(n.hunger).toBeLessThan(100);
    expect(n.thirst).toBeLessThan(100);
  });

  it('spends energy while moving and recovers it while idle', () => {
    const moving = fullNeeds();
    moving.energy = 50;
    stepSurvival(moving, true);
    expect(moving.energy).toBeLessThan(50);

    const idle = fullNeeds();
    idle.energy = 50;
    stepSurvival(idle, false);
    expect(idle.energy).toBeGreaterThan(50);
  });

  it('drains health when a need is empty', () => {
    const n = { hunger: 0, thirst: 100, energy: 100, health: 100 };
    stepSurvival(n, false);
    expect(n.health).toBeLessThan(100);
  });

  it('regenerates health when well-fed and hydrated', () => {
    const n = { hunger: 100, thirst: 100, energy: 100, health: 50 };
    stepSurvival(n, false);
    expect(n.health).toBeGreaterThan(50);
  });

  it('reports collapse when health reaches 0', () => {
    const n = { hunger: 0, thirst: 0, energy: 0, health: 0.01 };
    expect(stepSurvival(n, false)).toBe(true);
    expect(n.health).toBe(0);
  });

  it('never pushes needs outside 0..100', () => {
    const n = { hunger: 0.001, thirst: 0.001, energy: 100, health: 100 };
    for (let i = 0; i < 50; i++) stepSurvival(n, false);
    for (const v of Object.values(n)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});
