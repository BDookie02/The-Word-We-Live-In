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
  | { type: 'grantCache'; kind: ResourceKind; amount: number };

export type IntentType = Intent['type'];
