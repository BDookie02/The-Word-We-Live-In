import type { BuildingKind } from '../buildings/buildings';
import type { EntityId, ResourceKind } from '../core/types';
import type { NpcTaskKind } from '../npc/npc';

/**
 * Intents are the ONLY way to mutate the world. Input/UI produce intents; the World
 * applies them deterministically. Keep this a discriminated union so handlers stay
 * exhaustive (the `noop` arm keeps switch statements total during early development).
 */
export type Intent =
  | { type: 'noop' }
  | { type: 'gather'; nodeId: EntityId }
  /** Grant a resource bonus — used by the rewarded-ad "supply cache" reward flow. */
  | { type: 'grantCache'; kind: ResourceKind; amount: number }
  /** Set the player's move destination (world x, z). */
  | { type: 'moveTo'; x: number; y: number }
  /** Consume one food to relieve hunger. */
  | { type: 'eat' }
  /** Drink to relieve thirst (only succeeds at the shoreline). */
  | { type: 'drink' }
  /** Craft a recipe by id, consuming its inputs. */
  | { type: 'craft'; recipeId: string }
  /** Recruit a nearby NPC into the player's group. */
  | { type: 'recruitNpc'; npcId: EntityId }
  /** Assign (or clear, with null) a task for a recruited NPC. */
  | { type: 'assignNpcTask'; npcId: EntityId; task: NpcTaskKind | null }
  /** Place a building site (consumes its cost from the stockpile). */
  | { type: 'placeBuilding'; kind: BuildingKind; x: number; y: number }
  /** Player taps an in-progress building to add construction work. */
  | { type: 'workBuilding'; buildingId: EntityId }
  /** Advance the civilization to the next era (only when requirements are met). */
  | { type: 'advanceEra' }
  /** Player attacks a threat (uses the best owned weapon). */
  | { type: 'attackThreat'; threatId: EntityId }
  /** Clear all active threats — used by the rewarded-ad "distress beacon" defense flow. */
  | { type: 'repelThreats' }
  /** Recover from a collapse — used by the rewarded-ad "revive" reward flow. */
  | { type: 'revive' };

export type IntentType = Intent['type'];
