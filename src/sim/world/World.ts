import { DEMO, SURVIVAL } from '../../config/gameConfig';
import { createRng, type RNG } from '../core/rng';
import { SimClock, type CalendarTime } from '../core/SimClock';
import { fullNeeds, type PlayerState, type ResourceKind, type ResourceNode } from '../core/types';
import type { Intent } from '../intents/intents';
import { invAdd, invConsume, invCount, type Inventory } from '../items/inventory';
import { TOOL_FOR_RESOURCE } from '../items/items';
import { recipeById } from '../items/recipes';
import { biomeForHeight } from '../planet/biomes';
import { generateTerrain, sampleHeight, type TerrainData } from '../planet/Terrain';
import { stepMovement } from '../systems/movement';
import { clamp01to100, stepSurvival } from '../systems/survival';
import {
  emptyStats,
  objectiveProgress,
  OBJECTIVES,
  type AssistantMessage,
  type ObjectiveContext,
  type ObjectiveProgress,
  type PlayerStats,
} from '../objectives/objectives';
import type { ItemId } from '../items/items';

/** Player view in a snapshot: full state plus a derived `nearWater` flag for the UI. */
export type PlayerSnapshot = PlayerState & { nearWater: boolean };

/**
 * Read-only, structured-clone-safe view of the world for the UI/renderer to consume.
 * The UI must never receive a live reference to internal mutable state — always a snapshot.
 * Terrain is NOT included here: it is static, so it is delivered once via `terrainData()`
 * instead of being cloned every tick.
 */
export interface WorldSnapshot {
  seed: number;
  tick: number;
  time: CalendarTime;
  isNight: boolean;
  player: PlayerSnapshot;
  nodes: ResourceNode[];
  inventory: Inventory;
  objectives: ObjectiveProgress[];
  messages: AssistantMessage[];
}

const MAX_MESSAGES = 8;

/** Resource kinds that can spawn in each biome (by biome index from `biomeForHeight`). */
const BIOME_RESOURCES: Record<number, ResourceKind[]> = {
  1: ['fiber', 'food'], // sand / shoreline
  2: ['wood', 'food', 'fiber'], // grass
  3: ['wood', 'wood', 'fiber'], // forest (wood-heavy)
  4: ['stone'], // rock
  5: ['stone'], // snow (sparse, handled below)
};

/**
 * Root simulation aggregate. Owns all world state and the only mutation entry points:
 * `dispatch(intent)` (player/AI actions) and `tick()` (advance one fixed step).
 * Pure: no React, DOM, rendering, or platform dependencies.
 */
export class World {
  readonly seed: number;
  readonly rng: RNG;
  readonly clock: SimClock;
  readonly terrain: TerrainData;
  player: PlayerState;
  nodes: ResourceNode[];
  inventory: Inventory;
  stats: PlayerStats;
  /** Set of completed objective ids (latched). */
  private completed: Record<string, boolean> = {};
  private messages: AssistantMessage[] = [];
  private nextMsgId = 1;
  private warnedHunger = false;
  private warnedThirst = false;

  constructor(seed: number) {
    this.seed = seed >>> 0;
    this.rng = createRng(this.seed);
    this.clock = new SimClock();
    this.inventory = {};
    this.stats = emptyStats();
    this.terrain = generateTerrain(this.seed);
    this.player = {
      id: 'player',
      pos: { x: 0, y: 0 },
      target: null,
      needs: fullNeeds(),
      status: 'alive',
    };
    this.nodes = this.generateNodes();

    // The AI assistant's opening guidance (scripted, no LLM).
    this.pushMessage('ARIA: Systems online. We crash-landed on an unknown world.');
    this.pushMessage('ARIA: Tap the ground to move, tap resources to gather. Start with wood.');
  }

  static fromSeed(seed: number): World {
    return new World(seed);
  }

  /** Static terrain description for the renderer (delivered once, not per tick). */
  terrainData(): TerrainData {
    return this.terrain;
  }

  /** Whether the player is standing at the shoreline (close enough to drink). */
  private isNearWater(): boolean {
    const h = sampleHeight(this.terrain, this.player.pos.x, this.player.pos.y);
    return h <= this.terrain.waterLevel + SURVIVAL.drinkMaxHeightAboveWater;
  }

  /** Deterministically scatter resource nodes onto land, choosing kinds by biome. */
  private generateNodes(): ResourceNode[] {
    const nodes: ResourceNode[] = [];
    const r = this.rng.fork(0x1);
    const { worldSize, waterLevel, maxHeight } = this.terrain;
    const half = worldSize / 2 - 8;
    const maxTries = DEMO.resourceNodeCount * 30;

    let tries = 0;
    while (nodes.length < DEMO.resourceNodeCount && tries < maxTries) {
      tries++;
      const x = r.range(-half, half);
      const z = r.range(-half, half);
      const h = sampleHeight(this.terrain, x, z);
      if (h <= waterLevel + 0.4) continue; // keep nodes out of the water/shoreline edge

      const biome = biomeForHeight(h, waterLevel, maxHeight);
      const pool = BIOME_RESOURCES[biome];
      if (!pool) continue;
      if (biome === 5 && r.next() > 0.35) continue; // snow is sparse

      nodes.push({
        id: `node-${nodes.length}`,
        kind: r.pick(pool),
        pos: { x, y: z },
        amount: r.int(DEMO.nodeAmountMin, DEMO.nodeAmountMax),
      });
    }
    return nodes;
  }

  /** Apply a single intent. Returns true if it changed state. */
  dispatch(intent: Intent): boolean {
    const alive = this.player.status === 'alive';
    switch (intent.type) {
      case 'noop':
        return false;

      case 'gather': {
        if (!alive) return false;
        const node = this.nodes.find((n) => n.id === intent.nodeId);
        if (!node || node.amount <= 0) return false;
        node.amount -= 1;
        // The matching tool doubles the yield.
        const tool = TOOL_FOR_RESOURCE[node.kind];
        const yieldQty = tool && invCount(this.inventory, tool) > 0 ? 2 : 1;
        invAdd(this.inventory, node.kind, yieldQty);
        this.stats.gathered += yieldQty;
        if (node.amount <= 0) {
          this.nodes = this.nodes.filter((n) => n.id !== node.id);
        }
        return true;
      }

      case 'grantCache': {
        invAdd(this.inventory, intent.kind, intent.amount);
        return true;
      }

      case 'craft': {
        if (!alive) return false;
        const recipe = recipeById(intent.recipeId);
        if (!recipe) return false;
        if (recipe.requiresTool && invCount(this.inventory, recipe.requiresTool) < 1) return false;
        if (!invConsume(this.inventory, recipe.inputs)) return false;
        invAdd(this.inventory, recipe.output.item, recipe.output.qty);
        this.stats.crafted += 1;
        return true;
      }

      case 'moveTo': {
        if (!alive) return false;
        this.player.target = { x: intent.x, y: intent.y };
        return true;
      }

      case 'eat': {
        if (!alive || invCount(this.inventory, 'food') < 1) return false;
        invConsume(this.inventory, { food: 1 });
        this.player.needs.hunger = clamp01to100(this.player.needs.hunger + SURVIVAL.eatRestore);
        this.stats.eaten += 1;
        return true;
      }

      case 'drink': {
        if (!alive || !this.isNearWater()) return false;
        this.player.needs.thirst = clamp01to100(this.player.needs.thirst + SURVIVAL.drinkRestore);
        this.stats.drank += 1;
        return true;
      }

      case 'revive': {
        if (this.player.status !== 'collapsed') return false;
        this.player.status = 'alive';
        this.player.target = null;
        this.player.needs = {
          hunger: SURVIVAL.reviveLevel,
          thirst: SURVIVAL.reviveLevel,
          energy: SURVIVAL.reviveLevel,
          health: SURVIVAL.reviveLevel,
        };
        return true;
      }

      default: {
        // Exhaustiveness guard: a new intent type without a handler is a compile error.
        const _exhaustive: never = intent;
        return _exhaustive;
      }
    }
  }

  private objectiveContext(): ObjectiveContext {
    return { inventory: this.inventory, stats: this.stats };
  }

  private pushMessage(text: string): void {
    this.messages.push({ id: this.nextMsgId++, tick: this.clock.tick, text });
    if (this.messages.length > MAX_MESSAGES) this.messages.shift();
  }

  /** Complete any newly-satisfied objectives, grant rewards, and announce them. */
  private evaluateObjectives(): void {
    const ctx = this.objectiveContext();
    for (const o of OBJECTIVES) {
      if (this.completed[o.id]) continue;
      if (o.measure(ctx) < o.target) continue;
      this.completed[o.id] = true;
      let rewardText = '';
      if (o.reward) {
        for (const [id, qty] of Object.entries(o.reward) as [ItemId, number][]) {
          invAdd(this.inventory, id, qty);
        }
        rewardText = ` (+${Object.entries(o.reward)
          .map(([id, qty]) => `${qty} ${id}`)
          .join(', ')})`;
      }
      this.pushMessage(`ARIA: Objective complete — ${o.title}${rewardText}.`);
    }
  }

  /** One-shot survival warnings from the assistant, re-armed once the need recovers. */
  private checkNeedWarnings(): void {
    const { hunger, thirst } = this.player.needs;
    if (hunger < 25 && !this.warnedHunger) {
      this.warnedHunger = true;
      this.pushMessage('ARIA: You are getting hungry — eat something soon.');
    } else if (hunger > 50) {
      this.warnedHunger = false;
    }
    if (thirst < 25 && !this.warnedThirst) {
      this.warnedThirst = true;
      this.pushMessage('ARIA: Hydration low — find water and drink.');
    } else if (thirst > 50) {
      this.warnedThirst = false;
    }
  }

  /** Advance exactly one fixed simulation step. */
  tick(): void {
    if (this.player.status === 'alive') {
      const moving = stepMovement(this.player);
      const collapsed = stepSurvival(this.player.needs, moving);
      if (collapsed) {
        this.player.status = 'collapsed';
        this.player.target = null;
        this.pushMessage('ARIA: Vitals critical — you collapsed.');
      }
      this.checkNeedWarnings();
    }
    this.evaluateObjectives();
    this.clock.step();
  }

  snapshot(): WorldSnapshot {
    const p = this.player;
    return {
      seed: this.seed,
      tick: this.clock.tick,
      time: this.clock.time,
      isNight: this.clock.isNight,
      player: {
        id: p.id,
        pos: { ...p.pos },
        target: p.target ? { ...p.target } : null,
        needs: { ...p.needs },
        status: p.status,
        nearWater: this.isNearWater(),
      },
      nodes: this.nodes.map((n) => ({ ...n, pos: { ...n.pos } })),
      inventory: { ...this.inventory },
      objectives: objectiveProgress(this.objectiveContext(), this.completed),
      messages: this.messages.map((m) => ({ ...m })),
    };
  }
}
