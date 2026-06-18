import { SURVIVAL, TICK_MS } from '../../config/gameConfig';
import type { PlayerState } from '../core/types';

const SPEED_PER_TICK = SURVIVAL.moveSpeed * (TICK_MS / 1000);

/**
 * Advance the player one tick toward its move target. Mutates `player.pos` and clears the
 * target on arrival. Returns whether the player actually moved this tick (used by the
 * survival system to charge energy for movement). Pure aside from the in-place mutation of
 * the passed player; deterministic.
 */
export function stepMovement(player: PlayerState): boolean {
  const target = player.target;
  if (!target) return false;

  const dx = target.x - player.pos.x;
  const dy = target.y - player.pos.y;
  const dist = Math.hypot(dx, dy);

  if (dist <= Math.max(SURVIVAL.arriveRadius, SPEED_PER_TICK)) {
    player.pos.x = target.x;
    player.pos.y = target.y;
    player.target = null;
    return dist > 0.0001;
  }

  player.pos.x += (dx / dist) * SPEED_PER_TICK;
  player.pos.y += (dy / dist) * SPEED_PER_TICK;
  return true;
}
