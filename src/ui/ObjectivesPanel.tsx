import { useGameStore } from '../state/store';

/**
 * Lists the player's objectives (incomplete first), each with a small progress bar.
 * Progress comes straight from the snapshot — the sim core tracks and completes them.
 */
export default function ObjectivesPanel({ onClose }: { onClose: () => void }) {
  const objectives = useGameStore((s) => s.snapshot?.objectives ?? []);
  const sorted = [...objectives].sort((a, b) => Number(a.completed) - Number(b.completed));
  const doneCount = objectives.filter((o) => o.completed).length;

  return (
    <div className="tasks">
      <div className="tasks__head">
        <span>
          Tasks <small>({doneCount}/{objectives.length})</small>
        </span>
        <button className="tasks__close" onClick={onClose} aria-label="Close tasks">
          ✕
        </button>
      </div>
      <div className="tasks__list">
        {sorted.map((o) => (
          <div key={o.id} className={`task ${o.completed ? 'task--done' : ''}`}>
            <span className="task__title">
              {o.completed ? '✅' : '◻️'} {o.title}
            </span>
            <span className="task__progress">
              <span className="task__track">
                <span
                  className="task__fill"
                  style={{ width: `${Math.min(100, (o.current / o.target) * 100)}%` }}
                />
              </span>
              <span className="task__count">
                {o.current}/{o.target}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
