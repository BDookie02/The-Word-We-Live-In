import { useGameStore, VIEW_SCALES, type ViewScale } from '../state/store';

const SCALE_META: Record<ViewScale, { icon: string; label: string }> = {
  character: { icon: '🧍', label: 'Character' },
  settlement: { icon: '🏠', label: 'Settlement' },
  planet: { icon: '🌍', label: 'Planet' },
  orbit: { icon: '🛰️', label: 'Orbit' },
};

/**
 * Vertical zoom-scale switcher (character ↔ settlement ↔ planet ↔ orbit). A render/UI control
 * only — it sets `viewScale`, which WorldCanvas uses to swap scenes/cameras.
 */
export default function ScaleSwitcher() {
  const viewScale = useGameStore((s) => s.viewScale);
  const setViewScale = useGameStore((s) => s.setViewScale);

  return (
    <div className="scales">
      {VIEW_SCALES.map((scale) => (
        <button
          key={scale}
          className={`scale-btn ${viewScale === scale ? 'scale-btn--on' : ''}`}
          onClick={() => setViewScale(scale)}
          title={SCALE_META[scale].label}
          aria-label={SCALE_META[scale].label}
        >
          {SCALE_META[scale].icon}
        </button>
      ))}
    </div>
  );
}
