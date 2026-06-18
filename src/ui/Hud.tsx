import { useGameStore } from '../state/store';
import { useRewardedAd } from './useRewardedAd';
import { ADS } from '../config/gameConfig';
import { RESOURCE_KINDS } from '../sim';

/** Heads-up overlay: world clock, gathered resources, and the opt-in rewarded-ad action. */
export default function Hud() {
  const snapshot = useGameStore((s) => s.snapshot);
  const { watchForReward, adBusy } = useRewardedAd();
  if (!snapshot) return null;

  const { day, hour, minute } = snapshot.time;
  const clock = `Day ${day} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <div className="hud">
      <header className="hud__bar hud__bar--top">
        <span className="hud__title">The World We Live In</span>
        <span className="hud__clock">
          {snapshot.isNight ? '🌙' : '☀️'} {clock}
        </span>
      </header>

      <footer className="hud__bar hud__bar--bottom">
        <div className="hud__resources">
          {RESOURCE_KINDS.map((kind) => (
            <span key={kind} className={`res res--${kind}`}>
              {kind}: <b>{snapshot.gathered[kind]}</b>
            </span>
          ))}
        </div>
        <button
          className="hud__ad-btn"
          disabled={adBusy}
          onClick={() =>
            watchForReward('reward_cache', {
              type: 'grantCache',
              kind: 'wood',
              amount: ADS.rewardCacheAmount,
            })
          }
        >
          {adBusy ? 'Loading ad…' : `🎁 Watch ad: +${ADS.rewardCacheAmount} wood`}
        </button>
      </footer>
    </div>
  );
}
