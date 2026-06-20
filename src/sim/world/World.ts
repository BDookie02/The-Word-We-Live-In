import { BUILD, DEMO, NPC_CFG, SOCIAL, SURVIVAL } from '../../config/gameConfig';
import { BUILDINGS, type Building } from '../buildings/buildings';
import { deriveSociety, type Society } from '../social/society';
import { driftToward, randomValues } from '../social/values';
import {
  canAdvanceEra,
  eraDef,
  MAX_ERA_INDEX,
  nextEraRequirements,
  type EraContext,
  type EraId,
  type EraRequirement,
} from '../progression/eras';
import { createRng, type RNG } from '../core/rng';
import { SimClock, type CalendarTime } from '../core/SimClock';
import {
  fullNeeds,
  type PlayerState,
  type ResourceKind,
  type ResourceNode,
  type Vec2,
} from '../core/types';
import type { Intent } from '../intents/intents';
import { invAdd, invConsume, invCount, type Inventory } from '../items/inventory';
import { TOOL_FOR_RESOURCE } from '../items/items';
import { recipeById } from '../items/recipes';
import { biomeForHeight } from '../planet/biomes';
import { findShorePoints, generateTerrain, sampleHeight, type TerrainData } from '../planet/Terrain';
import { NPC_NAMES, type NPC } from '../npc/npc';
import { stepNpc } from '../npc/npcAI';
import { addAffinity, getAffinity, type RelationshipMap } from '../social/relationships';
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

/** NPC view in a snapshot: full state plus derived affinity with the player. */
export type NpcSnapshot = NPC & { affinityWithPlayer: number };

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
  npcs: NpcSnapshot[];
  nodes: ResourceNode[];
  buildings: Building[];
  inventory: Inventory;
  objectives: ObjectiveProgress[];
  messages: AssistantMessage[];
  era: { index: number; id: EraId; name: string };
  nextEra: string | null;
  eraRequirements: EraRequirement[] | null;
  canAdvanceEra: boolean;
  society: Society;
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
  npcs: NPC[];
  nodes: ResourceNode[];
  buildings: Building[] = [];
  inventory: Inventory;
  stats: PlayerStats;
  relationships: RelationshipMap = {};
  era = 0; // civilization era index
  private society: Society = { groups: [], relations: [] };
  private shorePoints: Vec2[] = [];
  private npcRng: RNG;
  private nextBuildingId = 0;
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
    this.shorePoints = findShorePoints(this.terrain, SURVIVAL.drinkMaxHeightAboveWater);
    this.npcRng = this.rng.fork(0x2);
    this.npcs = this.generateNpcs();

    // The AI assistant's opening guidance (scripted, no LLM).
    this.pushMessage('ARIA: Systems online. We crash-landed on an unknown world.');
    this.pushMessage('ARIA: Tap the ground to move, tap resources to gather. Start with wood.');
    this.pushMessage('ARIA: I detect other survivors nearby. Approach one and recruit them.');
  }

  /** Spawn wandering survivors on land near the crash site. */
  private generateNpcs(): NPC[] {
    const npcs: NPC[] = [];
    const r = this.rng.fork(0x3);
    const { waterLevel } = this.terrain;
    let tries = 0;
    while (npcs.length < NPC_CFG.count && tries < NPC_CFG.count * 40) {
      tries++;
      const x = r.range(-NPC_CFG.spawnRadius, NPC_CFG.spawnRadius);
      const z = r.range(-NPC_CFG.spawnRadius, NPC_CFG.spawnRadius);
      if (sampleHeight(this.terrain, x, z) <= waterLevel + 0.5) continue;
      npcs.push({
        id: `npc-${npcs.length}`,
        name: NPC_NAMES[npcs.length % NPC_NAMES.length],
        pos: { x, y: z },
        target: null,
        needs: fullNeeds(),
        behavior: 'wander',
        task: null,
        recruited: false,
        values: randomValues(r),
      });
    }
    return npcs;
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
        if (recipe.minEra > this.era) return false;
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

      case 'placeBuilding': {
        if (!alive) return false;
        const def = BUILDINGS[intent.kind];
        if (def.minEra > this.era) return false;
        if (!invConsume(this.inventory, def.cost)) return false;
        this.buildings.push({
          id: `b-${this.nextBuildingId++}`,
          kind: intent.kind,
          pos: { x: intent.x, y: intent.y },
          progress: 0,
          built: false,
          produce: 0,
        });
        this.pushMessage(`ARIA: ${def.name} site marked. Assign a builder, or tap it to build.`);
        return true;
      }

      case 'workBuilding': {
        if (!alive) return false;
        const b = this.buildings.find((x) => x.id === intent.buildingId);
        if (!b || b.built) return false;
        this.addBuildProgress(b, BUILD.playerWorkPerTap);
        return true;
      }

      case 'recruitNpc': {
        if (!alive) return false;
        const npc = this.npcs.find((n) => n.id === intent.npcId);
        if (!npc || npc.recruited) return false;
        const dx = npc.pos.x - this.player.pos.x;
        const dy = npc.pos.y - this.player.pos.y;
        if (Math.hypot(dx, dy) > NPC_CFG.recruitRadius) return false;
        npc.recruited = true;
        addAffinity(this.relationships, 'player', npc.id, NPC_CFG.recruitAffinityBonus);
        this.pushMessage(`ARIA: ${npc.name} joined your group.`);
        return true;
      }

      case 'assignNpcTask': {
        const npc = this.npcs.find((n) => n.id === intent.npcId);
        if (!npc || !npc.recruited) return false;
        npc.task = intent.task;
        npc.target = null;
        return true;
      }

      case 'advanceEra': {
        if (this.era >= MAX_ERA_INDEX) return false;
        if (!canAdvanceEra(this.era, this.eraContext())) return false;
        this.era += 1;
        this.pushMessage(`ARIA: Civilization advanced to the ${eraDef(this.era).name} era.`);
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

  /** Assemble the inputs the era-advancement rules read from live world state. */
  private eraContext(): EraContext {
    return {
      population: this.npcs.filter((n) => n.recruited).length,
      crafted: this.stats.crafted,
      builtFarms: this.buildings.filter((b) => b.kind === 'farm' && b.built).length,
      builtStorage: this.buildings.filter((b) => b.kind === 'storage' && b.built).length,
      toolsOwned:
        invCount(this.inventory, 'axe') +
        invCount(this.inventory, 'pickaxe') +
        invCount(this.inventory, 'spear'),
    };
  }

  /** Farm output scales with the civilization era (a tangible reward for advancing). */
  private get farmYieldPerTick(): number {
    return BUILD.farmFoodPerTick * (1 + this.era * 0.5);
  }

  private addBuildProgress(b: Building, work: number): void {
    if (b.built) return;
    b.progress += work;
    const def = BUILDINGS[b.kind];
    if (b.progress >= def.buildWork) {
      b.progress = def.buildWork;
      b.built = true;
      this.pushMessage(`ARIA: ${def.name} construction complete.`);
    }
  }

  /** Builders advance nearby in-progress sites; tended farms produce food into the stockpile. */
  private updateBuildings(): void {
    const r2 = BUILD.workRadius * BUILD.workRadius;
    const near = (a: Vec2, b: Vec2) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return dx * dx + dy * dy <= r2;
    };
    for (const npc of this.npcs) {
      if (!npc.recruited || !npc.task) continue;
      if (npc.task === 'build') {
        const site = this.buildings.find((b) => !b.built && near(npc.pos, b.pos));
        if (site) this.addBuildProgress(site, BUILD.workPerTick);
      } else if (npc.task === 'farm') {
        const farm = this.buildings.find(
          (b) => b.kind === 'farm' && b.built && near(npc.pos, b.pos),
        );
        if (farm) {
          farm.produce += this.farmYieldPerTick;
          if (farm.produce >= 1) {
            const whole = Math.floor(farm.produce);
            farm.produce -= whole;
            invAdd(this.inventory, 'food', whole);
          }
        }
      }
    }
  }

  /** Advance every NPC one tick: behaviour, needs decay, and any node interaction. */
  private updateNpcs(): void {
    const ctx = {
      terrain: this.terrain,
      nodes: this.nodes,
      buildings: this.buildings,
      shorePoints: this.shorePoints,
      rng: this.npcRng,
    };
    for (const npc of this.npcs) {
      const res = stepNpc(npc, ctx);
      stepSurvival(npc.needs, res.moving); // NPCs weaken but don't permanently die in Phase 7
      if (res.harvestNodeId) {
        const node = this.nodes.find((n) => n.id === res.harvestNodeId);
        if (node) {
          node.amount -= 1;
          if (res.creditKind) invAdd(this.inventory, res.creditKind, 1);
          if (node.amount <= 0) {
            const idx = this.nodes.indexOf(node);
            if (idx >= 0) this.nodes.splice(idx, 1);
          }
        }
      }
    }
  }

  /**
   * Re-derive the emergent society (groups, leaders, tenets, relations) from recruited NPCs'
   * affinity + values, then drift each grouped member's values toward their group mean (cultural
   * convergence). Runs on an interval rather than every tick.
   */
  private updateSociety(): void {
    const members = this.npcs
      .filter((n) => n.recruited)
      .map((n) => ({ id: n.id, name: n.name, values: n.values }));
    this.society = deriveSociety(members, this.relationships);

    for (const group of this.society.groups) {
      for (const id of group.memberIds) {
        const npc = this.npcs.find((n) => n.id === id);
        if (npc) npc.values = driftToward(npc.values, group.values, SOCIAL.driftRate);
      }
    }
  }

  /** Grow affinity between entities that spend time near each other. */
  private updateRelationships(): void {
    const r2 = NPC_CFG.proximityRadius * NPC_CFG.proximityRadius;
    const within = (a: Vec2, b: Vec2) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return dx * dx + dy * dy <= r2;
    };
    for (let i = 0; i < this.npcs.length; i++) {
      const ni = this.npcs[i];
      if (within(ni.pos, this.player.pos)) {
        addAffinity(this.relationships, 'player', ni.id, NPC_CFG.affinityPerTick);
      }
      for (let j = i + 1; j < this.npcs.length; j++) {
        if (within(ni.pos, this.npcs[j].pos)) {
          addAffinity(this.relationships, ni.id, this.npcs[j].id, NPC_CFG.affinityPerTick);
        }
      }
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
    this.updateNpcs();
    this.updateBuildings();
    this.updateRelationships();
    if (this.clock.tick % SOCIAL.recomputeTicks === 0) this.updateSociety();
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
      npcs: this.npcs.map((n) => ({
        ...n,
        pos: { ...n.pos },
        target: n.target ? { ...n.target } : null,
        needs: { ...n.needs },
        affinityWithPlayer: getAffinity(this.relationships, 'player', n.id),
      })),
      nodes: this.nodes.map((n) => ({ ...n, pos: { ...n.pos } })),
      buildings: this.buildings.map((b) => ({ ...b, pos: { ...b.pos } })),
      inventory: { ...this.inventory },
      objectives: objectiveProgress(this.objectiveContext(), this.completed),
      messages: this.messages.map((m) => ({ ...m })),
      era: { index: this.era, id: eraDef(this.era).id, name: eraDef(this.era).name },
      nextEra: this.era < MAX_ERA_INDEX ? eraDef(this.era + 1).name : null,
      eraRequirements: nextEraRequirements(this.era, this.eraContext()),
      canAdvanceEra: canAdvanceEra(this.era, this.eraContext()),
      society: {
        groups: this.society.groups.map((g) => ({
          ...g,
          memberIds: [...g.memberIds],
          values: { ...g.values },
          tenets: { ...g.tenets },
        })),
        relations: this.society.relations.map((r) => ({ ...r })),
      },
    };
  }
}
