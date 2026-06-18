import type { AdPlacement, AdService, RewardResult } from './AdService';

/**
 * Google AdMob implementation via `@capacitor-community/admob`.
 *
 * STUB until Phase 16: the plugin is not yet a dependency, so the SDK calls below are
 * documented but not wired, and {@link isAvailable} returns false — callers transparently
 * fall back to MockAdService. This file marks the integration seam so the real wiring is a
 * localized change (install plugin, dynamic-import it here, fill in the TODOs).
 */
export class AdMobService implements AdService {
  private ready = false;

  async init(): Promise<void> {
    // Phase 16:
    //   const { AdMob } = await import('@capacitor-community/admob');
    //   await AdMob.initialize({ initializeForTesting: import.meta.env.DEV });
    //   ...prepare interstitial + rewarded units, request UMP/GDPR consent...
    this.ready = false;
  }

  isAvailable(): boolean {
    return this.ready;
  }

  async showBanner(): Promise<void> {
    // Phase 16: AdMob.showBanner({ adId, position: 'BOTTOM_CENTER', ... })
  }

  async hideBanner(): Promise<void> {
    // Phase 16: AdMob.hideBanner()
  }

  async showInterstitial(_placement: AdPlacement): Promise<void> {
    // Phase 16: await AdMob.prepareInterstitial({ adId }); await AdMob.showInterstitial();
  }

  async showRewarded(placement: AdPlacement): Promise<RewardResult> {
    // Phase 16: prepareRewardVideoAd + showRewardVideoAd; resolve granted on the reward event.
    return { granted: false, placement, reason: 'unavailable' };
  }
}
