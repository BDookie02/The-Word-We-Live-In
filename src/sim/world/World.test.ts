import { describe, expect, it } from 'vitest';
import { World } from './World';
import { DEMO } from '../../config/gameConfig';
import { sampleHeight } from '../planet/Terrain';
import { invAdd, invCount } from '../items/inventory';

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

  it('gather decrements a node and credits the inventory', () => {
    const w = World.fromSeed(5);
    const node = w.nodes[0];
    const before = invCount(w.inventory, node.kind);
    const amountBefore = node.amount;
    const changed = w.dispatch({ type: 'gather', nodeId: node.id });
    expect(changed).toBe(true);
    expect(invCount(w.inventory, node.kind)).toBe(before + 1);
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
    expect(invCount(w.inventory, 'wood')).toBe(10);
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
    expect(invCount(w.inventory, 'food')).toBe(2);
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

describe('World crafting & tools', () => {
  it('crafts a recipe, consuming inputs and producing output', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'stone', amount: 2 });
    const ok = w.dispatch({ type: 'craft', recipeId: 'sharp_stone' });
    expect(ok).toBe(true);
    expect(invCount(w.inventory, 'stone')).toBe(0);
    expect(invCount(w.inventory, 'sharp_stone')).toBe(1);
  });

  it('refuses to craft without enough inputs', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'stone', amount: 1 });
    expect(w.dispatch({ type: 'craft', recipeId: 'sharp_stone' })).toBe(false);
    expect(invCount(w.inventory, 'stone')).toBe(1); // unchanged
  });

  it('supports a full chain up to a stone axe', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'wood', amount: 4 });
    w.dispatch({ type: 'grantCache', kind: 'stone', amount: 2 });
    w.dispatch({ type: 'grantCache', kind: 'fiber', amount: 3 });
    expect(w.dispatch({ type: 'craft', recipeId: 'sharp_stone' })).toBe(true);
    expect(w.dispatch({ type: 'craft', recipeId: 'rope' })).toBe(true);
    expect(w.dispatch({ type: 'craft', recipeId: 'axe' })).toBe(true);
    expect(invCount(w.inventory, 'axe')).toBe(1);
  });

  it('doubles gather yield when the matching tool is owned', () => {
    const w = World.fromSeed(5);
    const woodNode = w.nodes.find((n) => n.kind === 'wood');
    expect(woodNode).toBeDefined();
    invAdd(w.inventory, 'axe', 1);
    const before = invCount(w.inventory, 'wood');
    w.dispatch({ type: 'gather', nodeId: woodNode!.id });
    expect(invCount(w.inventory, 'wood')).toBe(before + 2);
  });
});

describe('World objectives & assistant', () => {
  it('starts with scripted assistant messages and incomplete objectives', () => {
    const snap = World.fromSeed(5).snapshot();
    expect(snap.messages.length).toBeGreaterThan(0);
    expect(snap.objectives.every((o) => !o.completed)).toBe(true);
  });

  it('completes an objective on tick, grants its reward, and announces it', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'wood', amount: 5 });
    w.tick(); // evaluation runs each tick
    const snap = w.snapshot();
    const wood = snap.objectives.find((o) => o.id === 'gather_wood_5')!;
    expect(wood.completed).toBe(true);
    expect(invCount(w.inventory, 'food')).toBe(2); // reward granted once
    expect(snap.messages.some((m) => m.text.includes('Gather 5 wood'))).toBe(true);
  });

  it('does not re-grant a completed objective reward', () => {
    const w = World.fromSeed(5);
    w.dispatch({ type: 'grantCache', kind: 'wood', amount: 5 });
    w.tick();
    w.tick();
    w.tick();
    expect(invCount(w.inventory, 'food')).toBe(2); // still just one reward
  });
});
