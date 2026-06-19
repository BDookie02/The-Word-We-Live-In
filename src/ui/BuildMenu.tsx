import { useGameStore } from '../state/store';
import { BUILDING_ORDER, BUILDINGS, invHas, ITEMS, type ItemId } from '../sim';

/**
 * Build menu. Selecting a building enters placement mode (the next ground tap sites it).
 * Affordability is derived from the live stockpile; the sim core re-checks on placement.
 */
export default function BuildMenu({ onClose }: { onClose: () => void }) {
  const inventory = useGameStore((s) => s.snapshot?.inventory ?? {});
  const placement = useGameStore((s) => s.placement);
  const setPlacement = useGameStore((s) => s.setPlacement);

  return (
    <div className="build">
      <div className="build__head">
        <span>Build</span>
        <button className="build__close" onClick={onClose} aria-label="Close build menu">
          ✕
        </button>
      </div>
      {placement && <div className="build__hint">Tap the ground to place your {BUILDINGS[placement].name}.</div>}
      <div className="build__list">
        {BUILDING_ORDER.map((kind) => {
          const def = BUILDINGS[kind];
          const affordable = invHas(inventory, def.cost);
          const active = placement === kind;
          return (
            <div key={kind} className="build-item">
              <div className="build-item__main">
                <span className="build-item__name">
                  {def.icon} {def.name}
                </span>
                <span className="build-item__cost">
                  {(Object.entries(def.cost) as [ItemId, number][]).map(([id, qty]) => (
                    <span
                      key={id}
                      className={(inventory[id] ?? 0) >= qty ? 'cost' : 'cost cost--missing'}
                    >
                      {ITEMS[id].icon}
                      {qty}
                    </span>
                  ))}
                </span>
              </div>
              <button
                className={`build-item__btn ${active ? 'build-item__btn--on' : ''}`}
                disabled={!affordable}
                onClick={() => setPlacement(active ? null : kind)}
              >
                {active ? 'Cancel' : 'Place'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
