import type { Building } from '../buildings/buildings';
import type { PlayerState } from '../core/types';
import type { Inventory } from '../items/inventory';
import type { ResourceNode } from '../core/types';
import type { NPC } from '../npc/npc';
import type { AssistantMessage, PlayerStats } from '../objectives/objectives';
import type { RelationshipMap } from '../social/relationships';
import type { Society } from '../social/society';
import type { Threat } from '../threats/threats';

export const SAVE_VERSION = 2;

/**
 * Full, versioned save of a World. Terrain is intentionally NOT stored — it is regenerated
 * deterministically from `seed` on restore. RNG cursor states are stored so continuation after
 * load stays deterministic. Bump SAVE_VERSION and add a migration step when this shape changes.
 */
export interface SaveBlobV2 {
  version: number;
  seed: number;
  tick: number;
  player: PlayerState;
  inventory: Inventory;
  nodes: ResourceNode[];
  npcs: NPC[];
  buildings: Building[];
  threats: Threat[];
  relationships: RelationshipMap;
  era: number;
  stats: PlayerStats;
  society: Society;
  completed: Record<string, boolean>;
  messages: AssistantMessage[];
  warnedHunger: boolean;
  warnedThirst: boolean;
  nextBuildingId: number;
  nextThreatId: number;
  nextMsgId: number;
  npcRngState: number;
  threatRngState: number;
}

export type SaveBlob = SaveBlobV2;

/**
 * Normalize a raw parsed save into the current schema. Returns null for absent/corrupt/
 * unmigratable data (the caller then starts a fresh world). Older full-save versions get their
 * migration step here as the schema evolves.
 */
export function migrateSave(raw: unknown): SaveBlob | null {
  if (!raw || typeof raw !== 'object') return null;
  const blob = raw as Partial<SaveBlobV2>;
  if (blob.version === SAVE_VERSION && typeof blob.seed === 'number') {
    return blob as SaveBlobV2;
  }
  // No migration path from older/unknown full saves yet — ignore and start fresh.
  return null;
}
