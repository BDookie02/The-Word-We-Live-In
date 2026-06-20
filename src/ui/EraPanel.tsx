import { getAdService } from '../services/ads';
import { useGameStore } from '../state/store';

/**
 * Civilization era panel: shows the current era, the requirements to reach the next one, and
 * an Advance button (enabled only when the sim core says the requirements are met). Advancing
 * plays an interstitial ad at this natural break (the `era_transition` placement) before the
 * `advanceEra` intent is dispatched.
 */
export default function EraPanel({ onClose }: { onClose: () => void }) {
  const snapshot = useGameStore((s) => s.snapshot);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!snapshot) return null;

  const { era, nextEra, eraRequirements, canAdvanceEra } = snapshot;

  const advance = async () => {
    await getAdService().showInterstitial('era_transition');
    dispatch({ type: 'advanceEra' });
  };

  return (
    <div className="era">
      <div className="era__head">
        <span>Civilization</span>
        <button className="era__close" onClick={onClose} aria-label="Close era panel">
          ✕
        </button>
      </div>
      <div className="era__current">
        Era: <b>{era.name}</b>
      </div>

      {nextEra && eraRequirements ? (
        <>
          <div className="era__next">Advance to {nextEra}:</div>
          <div className="era__reqs">
            {eraRequirements.map((r) => (
              <div key={r.label} className={`ereq ${r.current >= r.target ? 'ereq--done' : ''}`}>
                <span>
                  {r.current >= r.target ? '✅' : '◻️'} {r.label}
                </span>
                <span className="ereq__count">
                  {r.current}/{r.target}
                </span>
              </div>
            ))}
          </div>
          <button className="era__advance" disabled={!canAdvanceEra} onClick={advance}>
            {canAdvanceEra ? `🏛️ Advance to ${nextEra}` : 'Requirements not met'}
          </button>
        </>
      ) : (
        <div className="era__final">You have reached the most advanced era — for now.</div>
      )}
    </div>
  );
}
