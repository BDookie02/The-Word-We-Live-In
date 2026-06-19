import { useGameStore } from '../state/store';
import type { NpcTaskKind } from '../sim';

const TASK_OPTIONS: { task: NpcTaskKind; label: string }[] = [
  { task: 'gather_wood', label: '🪵 Wood' },
  { task: 'gather_stone', label: '🪨 Stone' },
  { task: 'gather_food', label: '🍖 Food' },
  { task: 'gather_fiber', label: '🌾 Fiber' },
];

const BEHAVIOR_LABEL: Record<string, string> = {
  idle: 'Idle',
  wander: 'Wandering',
  seekWater: 'Finding water',
  seekFood: 'Finding food',
  task: 'Working',
};

/**
 * Survivor roster. Recruited NPCs can be assigned a gather task (deposited into the shared
 * stockpile) or set idle; wild NPCs show a recruit hint. Affinity reflects the relationship
 * graph the sim core grows from proximity.
 */
export default function RosterPanel({ onClose }: { onClose: () => void }) {
  const npcs = useGameStore((s) => s.snapshot?.npcs ?? []);
  const dispatch = useGameStore((s) => s.dispatch);
  const recruited = npcs.filter((n) => n.recruited).length;

  return (
    <div className="roster">
      <div className="roster__head">
        <span>
          People <small>({recruited}/{npcs.length} recruited)</small>
        </span>
        <button className="roster__close" onClick={onClose} aria-label="Close roster">
          ✕
        </button>
      </div>
      <div className="roster__list">
        {npcs.map((npc) => (
          <div key={npc.id} className="person">
            <div className="person__row">
              <span className="person__name">
                {npc.recruited ? '🟢' : '🟠'} {npc.name}
              </span>
              <span className="person__meta">
                {BEHAVIOR_LABEL[npc.behavior] ?? npc.behavior} · ❤️{Math.round(npc.needs.health)} ·
                ♥{Math.round(npc.affinityWithPlayer)}
              </span>
            </div>
            {npc.recruited ? (
              <div className="person__tasks">
                {TASK_OPTIONS.map((opt) => (
                  <button
                    key={opt.task}
                    className={`tag ${npc.task === opt.task ? 'tag--on' : ''}`}
                    onClick={() => dispatch({ type: 'assignNpcTask', npcId: npc.id, task: opt.task })}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  className={`tag ${npc.task === null ? 'tag--on' : ''}`}
                  onClick={() => dispatch({ type: 'assignNpcTask', npcId: npc.id, task: null })}
                >
                  💤 Idle
                </button>
              </div>
            ) : (
              <div className="person__hint">Walk close and tap them in the world to recruit.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
