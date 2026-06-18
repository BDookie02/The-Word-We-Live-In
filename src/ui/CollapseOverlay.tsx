import { useGameStore } from '../state/store';
import { useRewardedAd } from './useRewardedAd';

/**
 * Shown when the player collapses (health hit 0). Offers an opt-in rewarded-ad revive
 * (the 'reward_revive' placement). On a granted reward the `revive` intent restores the
 * player. This is a player-friendly, optional monetization moment, not a hard wall.
 */
export default function CollapseOverlay() {
  const status = useGameStore((s) => s.snapshot?.player.status);
  const { watchForReward, adBusy } = useRewardedAd();
  if (status !== 'collapsed') return null;

  return (
    <div className="overlay">
      <div className="overlay__card">
        <h2 className="overlay__title">You collapsed</h2>
        <p className="overlay__body">
          Your body gave out. Watch a short ad to get back on your feet with restored strength.
        </p>
        <button
          className="overlay__btn"
          disabled={adBusy}
          onClick={() => watchForReward('reward_revive', { type: 'revive' })}
        >
          {adBusy ? 'Loading…' : '🎁 Watch ad to revive'}
        </button>
      </div>
    </div>
  );
}
