import { describe, expect, it } from 'vitest';
import { World } from './World';
import { DEMO, NPC_CFG } from '../../config/gameConfig';
import { sampleHeight } from '../planet/Terrain';
import { invAdd, invCount } from '../items/inventory';
import { BUILDINGS } from '../buildings/buildings';
import { makeThreat, THREAT_STATS } from '../threats/threats';

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
    w.era = 1; // the axe is a tribal-era recipe
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

describe('World NPCs & relationships', () => {
  it('spawns the configured number of NPCs, all wild at first', () => {
    const w = World.fromSeed(5);
    expect(w.npcs).toHaveLength(NPC_CFG.count);
    expect(w.npcs.every((n) => !n.recruited)).toBe(true);
  });

  it('recruits a nearby NPC but rejects a distant one', () => {
    const w = World.fromSeed(5);
    const npc = w.npcs[0];

    npc.pos = { x: w.player.pos.x + 100, y: w.player.pos.y };
    expect(w.dispatch({ type: 'recruitNpc', npcId: npc.id })).toBe(false);

    npc.pos = { x: w.player.pos.x + 1, y: w.player.pos.y };
    expect(w.dispatch({ type: 'recruitNpc', npcId: npc.id })).toBe(true);
    expect(npc.recruited).toBe(true);
    expect(w.relationships['npc-0|player'] ?? w.relationships['player|npc-0']).toBeGreaterThan(0);
  });

  it('assigns a task only to recruited NPCs', () => {
    const w = World.fromSeed(5);
    const npc = w.npcs[0];
    expect(w.dispatch({ type: 'assignNpcTask', npcId: npc.id, task: 'gather_wood' })).toBe(false);
    npc.recruited = true;
    expect(w.dispatch({ type: 'assignNpcTask', npcId: npc.id, task: 'gather_wood' })).toBe(true);
    expect(npc.task).toBe('gather_wood');
  });

  it('grows player affinity while an NPC stays near the player', () => {
    const w = World.fromSeed(5);
    const npc = w.npcs[0];
    npc.pos = { x: w.player.pos.x, y: w.player.pos.y };
    const before = w.snapshot().npcs.find((n) => n.id === npc.id)!.affinityWithPlayer;
    for (let i = 0; i < 20; i++) {
      npc.pos = { x: w.player.pos.x, y: w.player.pos.y }; // hold them adjacent
      w.tick();
    }
    const after = w.snapshot().npcs.find((n) => n.id === npc.id)!.affinityWithPlayer;
    expect(after).toBeGreaterThan(before);
  });
});

describe('World buildings & jobs', () => {
  it('places a building, consuming its cost from the stockpile', () => {
    const w = World.fromSeed(5);
    invAdd(w.inventory, 'wood', 5);
    const ok = w.dispatch({ type: 'placeBuilding', kind: 'campfire', x: 2, y: 2 });
    expect(ok).toBe(true);
    expect(invCount(w.inventory, 'wood')).toBe(5 - BUILDINGS.campfire.cost.wood!);
    expect(w.buildings).toHaveLength(1);
    expect(w.buildings[0].built).toBe(false);
  });

  it('refuses to place a building the player cannot afford', () => {
    const w = World.fromSeed(5);
    expect(w.dispatch({ type: 'placeBuilding', kind: 'hut', x: 0, y: 0 })).toBe(false);
    expect(w.buildings).toHaveLength(0);
  });

  it('completes construction via player taps', () => {
    const w = World.fromSeed(5);
    invAdd(w.inventory, 'wood', 3);
    w.dispatch({ type: 'placeBuilding', kind: 'campfire', x: 0, y: 0 });
    const id = w.buildings[0].id;
    for (let i = 0; i < 4; i++) w.dispatch({ type: 'workBuilding', buildingId: id });
    expect(w.buildings[0].built).toBe(true);
  });

  it('a builder NPC completes a nearby in-progress site', () => {
    const w = World.fromSeed(5);
    invAdd(w.inventory, 'wood', 3);
    w.dispatch({ type: 'placeBuilding', kind: 'campfire', x: 5, y: 5 });
    const npc = w.npcs[0];
    npc.recruited = true;
    npc.task = 'build';
    npc.pos = { x: 5, y: 5 };
    for (let i = 0; i < 80 && !w.buildings[0].built; i++) {
      npc.pos = { x: 5, y: 5 }; // keep the builder on-site
      w.tick();
    }
    expect(w.buildings[0].built).toBe(true);
  });

  it('a farmer NPC at a built farm produces food', () => {
    const w = World.fromSeed(5);
    w.era = 1; // the farm is a tribal-era building
    invAdd(w.inventory, 'wood', 2);
    invAdd(w.inventory, 'fiber', 2);
    w.dispatch({ type: 'placeBuilding', kind: 'farm', x: -6, y: 4 });
    const farm = w.buildings[0];
    farm.built = true;
    farm.progress = BUILDINGS.farm.buildWork;
    const npc = w.npcs[0];
    npc.recruited = true;
    npc.task = 'farm';
    const foodBefore = invCount(w.inventory, 'food');
    for (let i = 0; i < 60; i++) {
      npc.pos = { x: -6, y: 4 }; // keep the farmer tending the plot
      w.tick();
    }
    expect(invCount(w.inventory, 'food')).toBeGreaterThan(foodBefore);
  });
});

describe('World civilization eras', () => {
  it('starts in the primitive era and exposes progress to the next', () => {
    const snap = World.fromSeed(5).snapshot();
    expect(snap.era.index).toBe(0);
    expect(snap.era.name).toBe('Primitive');
    expect(snap.nextEra).toBe('Tribal');
    expect(snap.canAdvanceEra).toBe(false);
  });

  it('gates era-locked recipes and buildings until advancement', () => {
    const w = World.fromSeed(5);
    invAdd(w.inventory, 'wood', 10);
    invAdd(w.inventory, 'stone', 4);
    invAdd(w.inventory, 'fiber', 6);

    // Tribal-tier axe + hut are locked at the primitive era.
    w.dispatch({ type: 'craft', recipeId: 'sharp_stone' });
    w.dispatch({ type: 'craft', recipeId: 'rope' });
    expect(w.dispatch({ type: 'craft', recipeId: 'axe' })).toBe(false);
    expect(w.dispatch({ type: 'placeBuilding', kind: 'hut', x: 1, y: 1 })).toBe(false);
  });

  it('advances when requirements are met, then unlocks gated content', () => {
    const w = World.fromSeed(5);
    invAdd(w.inventory, 'wood', 12);
    invAdd(w.inventory, 'stone', 6);
    invAdd(w.inventory, 'fiber', 9);

    // Requirement: craft an item + recruit a survivor.
    w.dispatch({ type: 'craft', recipeId: 'sharp_stone' });
    const npc = w.npcs[0];
    npc.pos = { x: w.player.pos.x, y: w.player.pos.y };
    w.dispatch({ type: 'recruitNpc', npcId: npc.id });

    expect(w.dispatch({ type: 'advanceEra' })).toBe(true);
    expect(w.era).toBe(1);

    // Now the tribal-tier hut can be placed.
    expect(w.dispatch({ type: 'placeBuilding', kind: 'hut', x: 2, y: 2 })).toBe(true);
  });

  it('refuses to advance when requirements are unmet', () => {
    const w = World.fromSeed(5);
    expect(w.dispatch({ type: 'advanceEra' })).toBe(false);
    expect(w.era).toBe(0);
  });
});

describe('World emergent society', () => {
  it('forms a social group from recruited, strongly-affined survivors', () => {
    const w = World.fromSeed(5);
    w.npcs[0].recruited = true;
    w.npcs[1].recruited = true;
    w.relationships['npc-0|npc-1'] = 50; // strong mutual tie
    w.tick(); // society recomputes on a tick that is a multiple of the interval (tick 0)
    const snap = w.snapshot();
    expect(snap.society.groups.length).toBeGreaterThanOrEqual(1);
    const group = snap.society.groups.find(
      (g) => g.memberIds.includes('npc-0') && g.memberIds.includes('npc-1'),
    );
    expect(group).toBeDefined();
    expect(group!.name.length).toBeGreaterThan(0);
    expect(group!.tenets.culture.length).toBeGreaterThan(0);
    expect(group!.leaderId).toMatch(/npc-/);
  });

  it('has no groups before survivors bond', () => {
    const snap = World.fromSeed(5).snapshot();
    expect(snap.society.groups).toHaveLength(0);
  });
});

describe('World threats & combat', () => {
  it('attacking a threat damages it and kills it with enough hits, dropping loot', () => {
    const w = World.fromSeed(5);
    invAdd(w.inventory, 'spear', 1); // attack power = base + 3
    w.threats.push(makeThreat('threat-x', 'predator', { x: 30, y: 30 }));
    const woodBefore = invCount(w.inventory, 'wood');
    expect(w.dispatch({ type: 'attackThreat', threatId: 'threat-x' })).toBe(true);
    expect(w.threats[0]?.hp).toBeLessThan(THREAT_STATS.predator.maxHp);
    // Finish it off.
    for (let i = 0; i < 5 && w.threats.length > 0; i++) {
      w.dispatch({ type: 'attackThreat', threatId: 'threat-x' });
    }
    expect(w.threats).toHaveLength(0);
    // Predator loot includes food + fiber (wood unrelated, unchanged here).
    expect(invCount(w.inventory, 'food')).toBeGreaterThan(0);
    expect(invCount(w.inventory, 'wood')).toBe(woodBefore);
  });

  it('a threat in contact damages the player', () => {
    const w = World.fromSeed(5);
    w.threats.push(makeThreat('threat-y', 'predator', { ...w.player.pos }));
    const before = w.player.needs.health;
    w.tick();
    expect(w.player.needs.health).toBeLessThan(before);
  });

  it('repelThreats clears the field (and is a no-op when empty)', () => {
    const w = World.fromSeed(5);
    expect(w.dispatch({ type: 'repelThreats' })).toBe(false);
    w.threats.push(makeThreat('t1', 'raider', { x: 10, y: 10 }));
    w.threats.push(makeThreat('t2', 'predator', { x: -10, y: 5 }));
    expect(w.dispatch({ type: 'repelThreats' })).toBe(true);
    expect(w.threats).toHaveLength(0);
  });

  it('a guard NPC damages an adjacent threat', () => {
    const w = World.fromSeed(5);
    const npc = w.npcs[0];
    npc.recruited = true;
    npc.task = 'guard';
    const threat = makeThreat('threat-z', 'raider', { x: 25, y: 25 });
    w.threats.push(threat);
    const hpBefore = threat.hp;
    for (let i = 0; i < 12; i++) {
      npc.pos = { x: threat.pos.x, y: threat.pos.y }; // keep the guard on the threat
      w.tick();
    }
    expect(threat.hp).toBeLessThan(hpBefore);
  });
});
