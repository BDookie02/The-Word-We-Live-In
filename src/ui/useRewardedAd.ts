import { useCallback } from 'react';
import { getAdService, type AdPlacement } from '../services/ads';
import { useGameStore } from '../state/store';
import type { Intent } from '../sim';

/**
 * Drives the opt-in rewarded-ad flow from the UI: show the ad, and on a granted reward
 * dispatch the supplied gameplay intent (e.g. a resource cache). Tracks busy state so the
 * UI can disable the button while an ad is in flight.
 */
export function useRewardedAd() {
  const dispatch = useGameStore((s) => s.dispatch);
  const adBusy = useGameStore((s) => s.adBusy);
  const setAdBusy = useGameStore((s) => s.setAdBusy);

  const watchForReward = useCallback(
    async (placement: AdPlacement, reward: Intent): Promise<boolean> => {
      if (adBusy) return false;
      setAdBusy(true);
      try {
        const result = await getAdService().showRewarded(placement);
        if (result.granted) {
          dispatch(reward);
          return true;
        }
        return false;
      } finally {
        setAdBusy(false);
      }
    },
    [adBusy, dispatch, setAdBusy],
  );

  return { watchForReward, adBusy };
}
