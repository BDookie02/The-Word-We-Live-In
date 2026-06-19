import { describe, expect, it } from 'vitest';
import { stepNpc, type NpcStepCtx } from './npcAI';
import type { NPC } from './npc';
import { fullNeeds, type ResourceNode } from '../core/types';
import { createRng } from '../core/rng';
import { generateTerrain } from '../planet/Terrain';

const terrain = generateTerrain(1, { size: 16, worldSize: 100 });

function mkNpc(over: Partial<NPC> = {}): NPC {
  return {
    id: 'npc-0',
    name: 'X',
    pos: { x: 0, y: 0 },
    target: null,
    needs: fullNeeds(),
    behavior: 'wander',
    task: null,
    recruited: false,
    ...over,
  };
}

function ctx(over: Partial<NpcStepCtx> = {}): NpcStepCtx {
  return { terrain, nodes: [], shorePoints: [{ x: 5, y: 0 }], rng: createRng(1), ...over };
}

function stepUntilArrived(npc: NPC, c: NpcStepCtx) {
  let res = stepNpc(npc, c);
  let guard = 0;
  while (npc.target && guard++ < 2000) res = stepNpc(npc, c);
  return res;
}

describe('stepNpc', () => {
  it('seeks water when thirsty and restores thirst on arrival', () => {
    const npc = mkNpc({ needs: { ...fullNeeds(), thirst: 10 } });
    stepUntilArrived(npc, ctx());
    expect(npc.behavior).toBe('seekWater');
    expect(npc.needs.thirst).toBeGreaterThan(10);
  });

  it('seeks food when hungry and eats a food node on arrival', () => {
    const food: ResourceNode = { id: 'f', kind: 'food', pos: { x: 4, y: 0 }, amount: 5 };
    const npc = mkNpc({ needs: { ...fullNeeds(), hunger: 10 } });
    const res = stepUntilArrived(npc, ctx({ nodes: [food] }));
    expect(npc.behavior).toBe('seekFood');
    expect(npc.needs.hunger).toBeGreaterThan(10);
    expect(res.harvestNodeId).toBe('f');
    expect(res.creditKind).toBeUndefined(); // self-fed, no stockpile credit
  });

  it('a recruited NPC with a task harvests into the stockpile', () => {
    const wood: ResourceNode = { id: 'w', kind: 'wood', pos: { x: 3, y: 0 }, amount: 5 };
    const npc = mkNpc({ recruited: true, task: 'gather_wood' });
    const res = stepUntilArrived(npc, ctx({ nodes: [wood] }));
    expect(npc.behavior).toBe('task');
    expect(res.harvestNodeId).toBe('w');
    expect(res.creditKind).toBe('wood');
  });

  it('idles when assigned a task with no matching node', () => {
    const npc = mkNpc({ recruited: true, task: 'gather_stone' });
    stepNpc(npc, ctx({ nodes: [] }));
    expect(npc.behavior).toBe('idle');
  });
});
