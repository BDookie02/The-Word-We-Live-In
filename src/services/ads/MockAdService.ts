import type { AdPlacement, AdService, RewardResult } from './AdService';

/**
 * Development / web implementation of {@link AdService}. Shows no real ads — it simulates
 * the timing of each ad type and always grants rewarded boosts, so the full reward flow
 * (rewarded → grant resources) can be built and tested without the AdMob SDK or a network.
 */
export class MockAdService implements AdService {
  async init(): Promise<void> {
    console.info('[ads:mock] initialized (no real ads will be shown)');
  }

  isAvailable(): boolean {
    return true;
  }

  async showBanner(): Promise<void> {
    console.info('[ads:mock] banner shown');
  }

  async hideBanner(): Promise<void> {
    console.info('[ads:mock] banner hidden');
  }

  async showInterstitial(placement: AdPlacement): Promise<void> {
    console.info(`[ads:mock] interstitial (${placement})`);
    await delay(300);
  }

  async showRewarded(placement: AdPlacement): Promise<RewardResult> {
    console.info(`[ads:mock] rewarded (${placement}) — simulating watch`);
    await delay(500);
    return { granted: true, placement };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
