import type { EntityId, ResourceKind } from '../core/types';

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
  /** Recover from a collapse — used by the rewarded-ad "revive" reward flow. */
  | { type: 'revive' };

export type IntentType = Intent['type'];
