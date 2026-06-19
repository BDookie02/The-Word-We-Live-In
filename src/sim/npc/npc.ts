import type { NeedLevels, ResourceKind, Vec2, EntityId } from '../core/types';

export type NpcBehavior = 'idle' | 'wander' | 'seekWater' | 'seekFood' | 'task';

/** Tasks a recruited NPC can be assigned (gather a resource into the shared stockpile). */
export type NpcTaskKind = 'gather_wood' | 'gather_stone' | 'gather_food' | 'gather_fiber';

export const TASK_RESOURCE: Record<NpcTaskKind, ResourceKind> = {
  gather_wood: 'wood',
  gather_stone: 'stone',
  gather_food: 'food',
  gather_fiber: 'fiber',
};

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
