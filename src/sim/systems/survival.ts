import { SURVIVAL } from '../../config/gameConfig';
import type { NeedLevels } from '../core/types';

export function clamp01to100(v: number): number {
  return Math.max(0, Math.min(100, v));
}

/**
 * Advance survival needs one tick. Hunger and thirst always decay; energy is spent while
 * moving and recovers while idle; health drains while ANY need is empty and slowly recovers
 * while the player is well-fed and hydrated. Mutates `needs` in place. Pure + deterministic.
 *
 * Returns true if the player has collapsed this tick (health reached 0).
 */
export function stepSurvival(needs: NeedLevels, moving: boolean): boolean {
  needs.hunger = clamp01to100(needs.hunger - SURVIVAL.hungerDecayPerTick);
  needs.thirst = clamp01to100(needs.thirst - SURVIVAL.thirstDecayPerTick);

  needs.energy = clamp01to100(
    needs.energy + (moving ? -SURVIVAL.energyMoveCostPerTick : SURVIVAL.energyIdleRegenPerTick),
  );

  const starving = needs.hunger <= 0 || needs.thirst <= 0 || needs.energy <= 0;
  if (starving) {
    needs.health = clamp01to100(needs.health - SURVIVAL.healthDecayPerTick);
  } else if (
    needs.hunger > SURVIVAL.healthRegenNeedThreshold &&
    needs.thirst > SURVIVAL.healthRegenNeedThreshold
  ) {
    needs.health = clamp01to100(needs.health + SURVIVAL.healthRegenPerTick);
  }

  return needs.health <= 0;
}
