import { describe, expect, it } from 'vitest';
import { stepMovement } from './movement';
import { fullNeeds, type PlayerState } from '../core/types';

function mkPlayer(over: Partial<PlayerState> = {}): PlayerState {
  return { id: 'p', pos: { x: 0, y: 0 }, target: null, needs: fullNeeds(), status: 'alive', ...over };
}

describe('stepMovement', () => {
  it('does nothing without a target', () => {
    const p = mkPlayer();
    expect(stepMovement(p)).toBe(false);
    expect(p.pos).toEqual({ x: 0, y: 0 });
  });

  it('steps toward a far target without arriving', () => {
    const p = mkPlayer({ target: { x: 100, y: 0 } });
    const moved = stepMovement(p);
    expect(moved).toBe(true);
    expect(p.pos.x).toBeGreaterThan(0);
    expect(p.pos.y).toBeCloseTo(0, 6);
    expect(p.target).not.toBeNull();
  });

  it('snaps to and clears a nearby target', () => {
    const p = mkPlayer({ target: { x: 0.1, y: 0 } });
    stepMovement(p);
    expect(p.pos.x).toBeCloseTo(0.1, 6);
    expect(p.target).toBeNull();
  });

  it('eventually reaches a distant target', () => {
    const p = mkPlayer({ target: { x: 12, y: -9 } });
    let guard = 0;
    while (p.target && guard++ < 1000) stepMovement(p);
    expect(p.target).toBeNull();
    expect(p.pos.x).toBeCloseTo(12, 3);
    expect(p.pos.y).toBeCloseTo(-9, 3);
  });
});
