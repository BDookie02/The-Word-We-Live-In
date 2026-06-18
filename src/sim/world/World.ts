import { DEMO } from '../../config/gameConfig';
import { createRng, type RNG } from '../core/rng';
import { SimClock, type CalendarTime } from '../core/SimClock';
import {
  emptyTally,
  RESOURCE_KINDS,
  type PlayerState,
  type ResourceNode,
  type ResourceTally,
} from '../core/types';
import type { Intent } from '../intents/intents';

/**
 * Read-only, structured-clone-safe view of the world for the UI/renderer to consume.
 * The UI must never receive a live reference to internal mutable state — always a snapshot.
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

/**
 * Root simulation aggregate. Owns all world state and the only mutation entry points:
 * `dispatch(intent)` (player/AI actions) and `tick()` (advance one fixed step).
 * Pure: no React, DOM, rendering, or platform dependencies.
 */
export class World {
  readonly seed: number;
  readonly rng: RNG;
  readonly clock: SimClock;
  player: PlayerState;
  nodes: ResourceNode[];
  gathered: ResourceTally;

  constructor(seed: number) {
    this.seed = seed >>> 0;
    this.rng = createRng(this.seed);
    this.clock = new SimClock();
    this.gathered = emptyTally();
    this.player = { id: 'player', pos: { x: 0, y: 0 } };
    this.nodes = this.generateDemoNodes();
  }

  static fromSeed(seed: number): World {
    return new World(seed);
  }

  /** Deterministically scatter starter resource nodes (placeholder world content). */
  private generateDemoNodes(): ResourceNode[] {
    const nodes: ResourceNode[] = [];
    const r = this.rng.fork(0x1);
    for (let i = 0; i < DEMO.resourceNodeCount; i++) {
      nodes.push({
        id: `node-${i}`,
        kind: r.pick(RESOURCE_KINDS),
        pos: {
          x: r.range(-DEMO.worldHalfExtent, DEMO.worldHalfExtent),
          y: r.range(-DEMO.worldHalfExtent, DEMO.worldHalfExtent),
        },
        amount: DEMO.nodeStartAmount,
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
