import { DEMO } from '../../config/gameConfig';
import { createRng, type RNG } from '../core/rng';
import { SimClock, type CalendarTime } from '../core/SimClock';
import {
  emptyTally,
  type PlayerState,
  type ResourceKind,
  type ResourceNode,
  type ResourceTally,
} from '../core/types';
import type { Intent } from '../intents/intents';
import { biomeForHeight } from '../planet/biomes';
import { generateTerrain, sampleHeight, type TerrainData } from '../planet/Terrain';

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
  player: PlayerState;
  nodes: ResourceNode[];
  gathered: ResourceTally;
}

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
  gathered: ResourceTally;

  constructor(seed: number) {
    this.seed = seed >>> 0;
    this.rng = createRng(this.seed);
    this.clock = new SimClock();
    this.gathered = emptyTally();
    this.terrain = generateTerrain(this.seed);
    this.player = { id: 'player', pos: { x: 0, y: 0 } };
    this.nodes = this.generateNodes();
  }

  static fromSeed(seed: number): World {
    return new World(seed);
  }

  /** Static terrain description for the renderer (delivered once, not per tick). */
  terrainData(): TerrainData {
    return this.terrain;
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
    switch (intent.type) {
      case 'noop':
        return false;

      case 'gather': {
        const node = this.nodes.find((n) => n.id === intent.nodeId);
        if (!node || node.amount <= 0) return false;
        node.amount -= 1;
        this.gathered[node.kind] += 1;
        if (node.amount <= 0) {
          this.nodes = this.nodes.filter((n) => n.id !== node.id);
        }
        return true;
      }

      case 'grantCache': {
        this.gathered[intent.kind] += intent.amount;
        return true;
      }

      default: {
        // Exhaustiveness guard: a new intent type without a handler is a compile error.
        const _exhaustive: never = intent;
        return _exhaustive;
      }
    }
  }

  /** Advance exactly one fixed simulation step. Per-tick systems hook in here in later phases. */
  tick(): void {
    this.clock.step();
  }

  snapshot(): WorldSnapshot {
    return {
      seed: this.seed,
      tick: this.clock.tick,
      time: this.clock.time,
      isNight: this.clock.isNight,
      player: { id: this.player.id, pos: { ...this.player.pos } },
      nodes: this.nodes.map((n) => ({ ...n, pos: { ...n.pos } })),
      gathered: { ...this.gathered },
    };
  }
}
