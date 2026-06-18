/**
 * Monetization boundary. Gameplay code talks ONLY to this interface — never to the
 * AdMob SDK directly — so the entire reward flow is testable offline (MockAdService)
 * and the ad provider can be swapped without touching game logic.
 *
 * Policy posture (see TECH_DECISIONS.md TD-004):
 *  - Rewarded ads are opt-in and grant a concrete in-game boost.
 *  - Interstitials only fire at natural breaks, frequency-capped by the caller.
 *  - Banners are confined to non-gameplay menus.
 */

export type AdPlacement =
  | 'reward_speedup' // skip/accelerate a craft or build
  | 'reward_revive' // recover after the player dies
  | 'reward_cache' // bonus resource supply drop
  | 'era_transition'; // interstitial shown between civilization eras

export interface RewardResult {
  granted: boolean;
  placement: AdPlacement;
  /** Present when the provider could not show an ad (offline, not loaded, etc.). */
  reason?: 'unavailable' | 'dismissed' | 'error';
}

export interface AdService {
  /** Load SDK / prepare ad units. Safe to call once at startup. */
  init(): Promise<void>;
  /** Whether ads can currently be served (false on unsupported web/dev). */
  isAvailable(): boolean;

  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;

  /** Fire-and-forget interstitial at a natural break. Resolves when dismissed. */
  showInterstitial(placement: AdPlacement): Promise<void>;

  /** Opt-in rewarded ad. Resolves with whether the reward should be granted. */
  showRewarded(placement: AdPlacement): Promise<RewardResult>;
}
