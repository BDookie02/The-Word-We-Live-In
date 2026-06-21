import { describe, expect, it } from 'vitest';
import { World } from '../world/World';
import { migrateSave, SAVE_VERSION, type SaveBlob } from './saveSchema';
import { makeThreat } from '../threats/threats';

/** Build a world in a non-trivial state for round-trip testing. */
function richWorld(): World {
  const w = World.fromSeed(123);
  w.era = 1;
  w.dispatch({ type: 'grantCache', kind: 'wood', amount: 10 });
  w.dispatch({ type: 'grantCache', kind: 'fiber', amount: 6 });
  w.npcs[0].recruited = true;
  w.npcs[0].task = 'gather_wood';
  w.npcs[1].recruited = true;
  w.relationships['npc-0|npc-1'] = 40;
  w.dispatch({ type: 'placeBuilding', kind: 'campfire', x: 4, y: 4 });
  w.threats.push(makeThreat('threat-s', 'raider', { x: 20, y: 18 }));
  for (let i = 0; i < 50; i++) w.tick();
  return w;
}

describe('save round-trip', () => {
  it('restores an identical snapshot after a JSON round-trip', () => {
    const w = richWorld();
    const before = w.snapshot();
    const blob = JSON.parse(JSON.stringify(w.serialize())) as SaveBlob;
    const restored = World.restore(blob);
    expect(restored.snapshot()).toEqual(before);
  });

  it('continues deterministically after restore (RNG cursor preserved)', () => {
    const w = richWorld();
    const blob = JSON.parse(JSON.stringify(w.serialize())) as SaveBlob;
    const restored = World.restore(blob);
    for (let i = 0; i < 30; i++) {
      w.tick();
      restored.tick();
    }
    expect(restored.snapshot()).toEqual(w.snapshot());
  });

  it('serialize stamps the current version and omits terrain', () => {
    const blob = World.fromSeed(1).serialize();
    expect(blob.version).toBe(SAVE_VERSION);
    expect('terrain' in blob).toBe(false);
  });
});

describe('migrateSave', () => {
  it('returns null for absent/corrupt/old saves', () => {
    expect(migrateSave(null)).toBeNull();
    expect(migrateSave('nonsense')).toBeNull();
    expect(migrateSave({ version: 1, seed: 5 })).toBeNull();
  });

  it('passes through a current-version blob', () => {
    const blob = World.fromSeed(7).serialize();
    expect(migrateSave(JSON.parse(JSON.stringify(blob)))).not.toBeNull();
  });
});
