import { describe, expect, it } from 'vitest';
import { World } from './World';
import { DEMO } from '../../config/gameConfig';
import { sampleHeight } from '../planet/Terrain';

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

  it('spawns the configured number of resource nodes', () => {
    const w = World.fromSeed(5);
    expect(w.nodes).toHaveLength(DEMO.resourceNodeCount);
  });

  it('places every node on land (above the water level)', () => {
    const w = World.fromSeed(5);
    for (const node of w.nodes) {
      const h = sampleHeight(w.terrain, node.pos.x, node.pos.y);
      expect(h).toBeGreaterThan(w.terrain.waterLevel);
    }
  });

  it('gather decrements a node and credits the tally', () => {
    const w = World.fromSeed(5);
    const node = w.nodes[0];
    const before = w.gathered[node.kind];
    const amountBefore = node.amount;
    const changed = w.dispatch({ type: 'gather', nodeId: node.id });
    expect(changed).toBe(true);
    expect(w.gathered[node.kind]).toBe(before + 1);
    expect(w.nodes.find((n) => n.id === node.id)?.amount).toBe(amountBefore - 1);
  });

  it('removes a node once fully depleted', () => {
    const w = World.fromSeed(5);
    const node = w.nodes[0];
    const amount = node.amount;
    for (let i = 0; i < amount; i++) {
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

describe('World survival & movement', () => {
  it('moveTo sets a target and ticks move the player toward it', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'moveTo', x: 20, y: 0 });
    expect(w.player.target).toEqual({ x: 20, y: 0 });
    for (let i = 0; i < 20; i++) w.tick();
    expect(w.player.pos.x).toBeGreaterThan(0);
  });

  it('eat consumes one food and restores hunger', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'food', amount: 3 });
    w.player.needs.hunger = 40;
    const ok = w.dispatch({ type: 'eat' });
    expect(ok).toBe(true);
    expect(w.gathered.food).toBe(2);
    expect(w.player.needs.hunger).toBeGreaterThan(40);
  });

  it('eat fails with no food', () => {
    const w = World.fromSeed(5);
    expect(w.dispatch({ type: 'eat' })).toBe(false);
  });

  it('drink restores thirst at the shoreline', () => {
    const w = World.fromSeed(5);
    // Move the player onto the lowest terrain vertex (guaranteed at/near water level).
    const { heights, size, worldSize } = w.terrain;
    const verts = size + 1;
    let minIdx = 0;
    for (let k = 1; k < heights.length; k++) if (heights[k] < heights[minIdx]) minIdx = k;
    const half = worldSize / 2;
    const cell = worldSize / size;
    w.player.pos = { x: -half + (minIdx % verts) * cell, y: -half + Math.floor(minIdx / verts) * cell };
    w.player.needs.thirst = 30;
    const ok = w.dispatch({ type: 'drink' });
    expect(ok).toBe(true);
    expect(w.player.needs.thirst).toBeGreaterThan(30);
  });

  it('collapses when health hits 0 and blocks actions until revived', () => {
    const w = World.fromSeed(5);
    w.player.needs = { hunger: 0, thirst: 0, energy: 0, health: 0.01 };
    w.tick();
    expect(w.player.status).toBe('collapsed');
    expect(w.dispatch({ type: 'moveTo', x: 5, y: 5 })).toBe(false);

    const revived = w.dispatch({ type: 'revive' });
    expect(revived).toBe(true);
    expect(w.player.status).toBe('alive');
    expect(w.player.needs.health).toBeGreaterThan(0);
  });
});
