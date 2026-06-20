import type { NeedLevels, ResourceKind, Vec2, EntityId } from '../core/types';
import type { ValueAxes } from '../social/values';

export type NpcBehavior = 'idle' | 'wander' | 'seekWater' | 'seekFood' | 'task';

/** Gather tasks deposit a resource into the shared stockpile. */
export type GatherTask = 'gather_wood' | 'gather_stone' | 'gather_food' | 'gather_fiber';

/** All tasks a recruited NPC can be assigned. */
export type NpcTaskKind = GatherTask | 'build' | 'farm' | 'guard';

export const TASK_RESOURCE: Record<GatherTask, ResourceKind> = {
  gather_wood: 'wood',
  gather_stone: 'stone',
  gather_food: 'food',
  gather_fiber: 'fiber',
};

export function isGatherTask(task: NpcTaskKind): task is GatherTask {
  return task in TASK_RESOURCE;
}

export interface NPC {
  id: EntityId;
  name: string;
  pos: Vec2;
  target: Vec2 | null;
  needs: NeedLevels;
  behavior: NpcBehavior;
  /** Assigned task (recruited NPCs only), or null. */
  task: NpcTaskKind | null;
  recruited: boolean;
  /** Abstract value axes that drive emergent culture/beliefs (Phase 10). */
  values: ValueAxes;
}

export const NPC_NAMES: readonly string[] = [
  'Mara',
  'Tomas',
  'Senna',
  'Kael',
  'Iris',
  'Bo',
  'Lena',
  'Dax',
  'Nova',
  'Pike',
];
