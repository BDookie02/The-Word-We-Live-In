import { isNative } from '../platform/platform';
import { AdMobService } from './AdMobService';
import type { AdService } from './AdService';
import { MockAdService } from './MockAdService';

export type { AdService, AdPlacement, RewardResult } from './AdService';

let instance: AdService | null = null;

/**
 * Returns the process-wide AdService. Prefers real AdMob on a native device once wired
 * (Phase 16); otherwise — and on web/dev — uses the Mock so the reward flow always works.
 */
export function getAdService(): AdService {
  if (instance) return instance;

  if (isNative()) {
    const admob = new AdMobService();
    instance = admob.isAvailable() ? admob : new MockAdService();
  } else {
    instance = new MockAdService();
  }
  return instance;
}
