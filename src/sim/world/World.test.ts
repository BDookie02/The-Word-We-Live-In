import { describe, expect, it } from 'vitest';
import { World } from './World';
import { DEMO } from '../../config/gameConfig';

describe('World', () => {
  it('generates identical worlds from the same seed', () => {
    const a = World.fromSeed(2024).snapshot();
    const b = World.fromSeed(2024).snapshot();
    expect(a).toEqual(b);
  });

  it('generates different worlds from different seeds', () => {
    const a = World.fromSeed(1).snapshot();
    const b = World.fromSeed(2).snapshot();
    expect(a.nodes).not.toEqual(b.nodes);
  });

  it('spawns the configured number of demo nodes', () => {
    const w = World.fromSeed(5);
    expect(w.nodes).toHaveLength(DEMO.resourceNodeCount);
  });

  it('gather decrements a node and credits the tally', () => {
    const w = World.fromSeed(5);
    const node = w.nodes[0];
    const before = w.gathered[node.kind];
    const changed = w.dispatch({ type: 'gather', nodeId: node.id });
    expect(changed).toBe(true);
    expect(w.gathered[node.kind]).toBe(before + 1);
    expect(w.nodes.find((n) => n.id === node.id)?.amount).toBe(DEMO.nodeStartAmount - 1);
  });

  it('removes a node once fully depleted', () => {
    const w = World.fromSeed(5);
    const node = w.nodes[0];
    for (let i = 0; i < DEMO.nodeStartAmount; i++) {
      w.dispatch({ type: 'gather', nodeId: node.id });
    }
    expect(w.nodes.find((n) => n.id === node.id)).toBeUndefined();
    expect(w.dispatch({ type: 'gather', nodeId: node.id })).toBe(false);
  });

  it('grantCache adds the rewarded bonus (ad reward flow)', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'wood', amount: 10 });
    expect(w.gathered.wood).toBe(10);
  });

  it('tick advances the clock deterministically', () => {
    const w = World.fromSeed(5);
    for (let i = 0; i < 100; i++) w.tick();
    expect(w.clock.tick).toBe(100);
    expect(w.snapshot().tick).toBe(100);
  });
});
