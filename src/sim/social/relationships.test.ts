import { describe, expect, it } from 'vitest';
import { addAffinity, getAffinity, relKey, type RelationshipMap } from './relationships';

describe('relationships', () => {
  it('uses a canonical key regardless of order', () => {
    expect(relKey('a', 'b')).toBe(relKey('b', 'a'));
  });

  it('defaults missing affinity to 0', () => {
    expect(getAffinity({}, 'player', 'npc-0')).toBe(0);
  });

  it('accumulates and reads back symmetrically', () => {
    const m: RelationshipMap = {};
    addAffinity(m, 'player', 'npc-0', 5);
    addAffinity(m, 'npc-0', 'player', 3);
    expect(getAffinity(m, 'player', 'npc-0')).toBe(8);
  });

  it('clamps to [-100, 100] and ignores self-affinity', () => {
    const m: RelationshipMap = {};
    addAffinity(m, 'a', 'b', 1000);
    expect(getAffinity(m, 'a', 'b')).toBe(100);
    addAffinity(m, 'a', 'a', 50);
    expect(getAffinity(m, 'a', 'a')).toBe(0);
  });
});
