import { NPC_CFG, TICK_MS } from '../../config/gameConfig';
import type { Building } from '../buildings/buildings';
import type { RNG } from '../core/rng';
import type { EntityId, ResourceKind, ResourceNode, Vec2 } from '../core/types';
import type { TerrainData } from '../planet/Terrain';
import { isGatherTask, TASK_RESOURCE, type NPC } from './npc';

const SPEED_PER_TICK = NPC_CFG.moveSpeed * (TICK_MS / 1000);

export interface NpcStepCtx {
  terrain: TerrainData;
  nodes: readonly ResourceNode[];
  buildings: readonly Building[];
  shorePoints: readonly Vec2[];
  rng: RNG;
}

export interface NpcStepResult {
  moving: boolean;
  /** Node the NPC interacted with this tick (consumed/harvested), if any. */
  harvestNodeId?: EntityId;
  /** Resource to credit to the shared stockpile (task harvesting); absent when the NPC self-feeds. */
  creditKind?: ResourceKind;
}

function dist2(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function nearest<T extends { pos: Vec2 }>(from: Vec2, items: readonly T[]): T | null {
  let best: T | null = null;
  let bestD = Infinity;
  for (const it of items) {
    const d = dist2(from, it.pos);
    if (d < bestD) {
      bestD = d;
      best = it;
    }
  }
  return best;
}

function nearestPoint(from: Vec2, points: readonly Vec2[]): Vec2 | null {
  let best: Vec2 | null = null;
  let bestD = Infinity;
  for (const p of points) {
    const d = dist2(from, p);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

/** Move the NPC toward its target. Returns whether it arrived this tick. */
function advance(npc: NPC): { moving: boolean; arrived: boolean } {
  if (!npc.target) return { moving: false, arrived: false };
  const dx = npc.target.x - npc.pos.x;
  const dy = npc.target.y - npc.pos.y;
  const d = Math.hypot(dx, dy);
  if (d <= Math.max(NPC_CFG.arriveRadius, SPEED_PER_TICK)) {
    npc.pos.x = npc.target.x;
    npc.pos.y = npc.target.y;
    return { moving: d > 0.0001, arrived: true };
  }
  npc.pos.x += (dx / d) * SPEED_PER_TICK;
  npc.pos.y += (dy / d) * SPEED_PER_TICK;
  return { moving: true, arrived: false };
}

/**
 * One tick of NPC behaviour: pick an intent by simple utility priority
 * (thirst > hunger > assigned task > wander), move toward it, and apply arrival effects.
 * Mutates the NPC; returns movement + any node interaction for the World to apply.
 * Pure aside from the in-place NPC mutation and RNG draws; deterministic given the RNG.
 */
export function stepNpc(npc: NPC, ctx: NpcStepCtx): NpcStepResult {
  const { needs } = npc;
  const foodNodes = ctx.nodes.filter((n) => n.kind === 'food');

  // Decide behaviour + (re)target.
  if (needs.thirst < NPC_CFG.seekThirstBelow && ctx.shorePoints.length > 0) {
    npc.behavior = 'seekWater';
    if (!npc.target) npc.target = nearestPoint(npc.pos, ctx.shorePoints);
  } else if (needs.hunger < NPC_CFG.seekHungerBelow && foodNodes.length > 0) {
    npc.behavior = 'seekFood';
    npc.target = nearest(npc.pos, foodNodes)?.pos ?? npc.target;
  } else if (npc.recruited && npc.task) {
    npc.behavior = 'task';
    if (isGatherTask(npc.task)) {
      const want = TASK_RESOURCE[npc.task];
      const node = nearest(
        npc.pos,
        ctx.nodes.filter((n) => n.kind === want),
      );
      npc.target = node ? node.pos : null;
      if (!node) npc.behavior = 'idle';
    } else if (npc.task === 'build') {
      const site = nearest(
        npc.pos,
        ctx.buildings.filter((b) => !b.built),
      );
      npc.target = site ? site.pos : null;
      if (!site) npc.behavior = 'idle';
    } else {
      // 'farm'
      const farm = nearest(
        npc.pos,
        ctx.buildings.filter((b) => b.kind === 'farm' && b.built),
      );
      npc.target = farm ? farm.pos : null;
      if (!farm) npc.behavior = 'idle';
    }
  } else {
    npc.behavior = 'wander';
    if (!npc.target && ctx.rng.next() < NPC_CFG.wanderChance) {
      npc.target = {
        x: npc.pos.x + ctx.rng.range(-NPC_CFG.wanderRadius, NPC_CFG.wanderRadius),
        y: npc.pos.y + ctx.rng.range(-NPC_CFG.wanderRadius, NPC_CFG.wanderRadius),
      };
    }
  }

  const { moving, arrived } = advance(npc);
  const result: NpcStepResult = { moving };

  if (arrived) {
    if (npc.behavior === 'seekWater') {
      needs.thirst = Math.min(100, needs.thirst + NPC_CFG.drinkRestore);
      npc.target = null;
    } else if (npc.behavior === 'seekFood') {
      const node = nearest(npc.pos, foodNodes);
      if (node && dist2(npc.pos, node.pos) < 4) {
        needs.hunger = Math.min(100, needs.hunger + NPC_CFG.eatRestore);
        result.harvestNodeId = node.id; // NPC eats it (no stockpile credit)
      }
      npc.target = null;
    } else if (npc.behavior === 'task' && npc.task && isGatherTask(npc.task)) {
      const want = TASK_RESOURCE[npc.task];
      const node = nearest(
        npc.pos,
        ctx.nodes.filter((n) => n.kind === want),
      );
      if (node && dist2(npc.pos, node.pos) < 4) {
        result.harvestNodeId = node.id;
        result.creditKind = want; // deposited into the shared stockpile
      }
      npc.target = null;
    } else {
      npc.target = null; // finished wandering
    }
  }

  return result;
}
