import { describe, expect, it } from 'vitest';
import { chooseThreatKind, makeThreat, playerAttackPower, THREAT_STATS } from './threats';
import { THREAT } from '../../config/gameConfig';
import { createRng } from '../core/rng';

describe('playerAttackPower', () => {
  it('is the base with no weapon', () => {
    expect(playerAttackPower({})).toBe(THREAT.playerAttackBase);
  });

  it('uses the best owned weapon bonus', () => {
    expect(playerAttackPower({ axe: 1 })).toBe(THREAT.playerAttackBase + 1);
    expect(playerAttackPower({ spear: 1 })).toBe(THREAT.playerAttackBase + 3);
    expect(playerAttackPower({ axe: 1, spear: 1 })).toBe(THREAT.playerAttackBase + 3);
  });
});

describe('makeThreat', () => {
  it('starts at full hp for its kind', () => {
    const t = makeThreat('t0', 'predator', { x: 1, y: 2 });
    expect(t.hp).toBe(THREAT_STATS.predator.maxHp);
    expect(t.maxHp).toBe(THREAT_STATS.predator.maxHp);
  });
});

describe('chooseThreatKind', () => {
  it('is deterministic for a given rng/era', () => {
    expect(chooseThreatKind(createRng(1), 0)).toBe(chooseThreatKind(createRng(1), 0));
  });
});
