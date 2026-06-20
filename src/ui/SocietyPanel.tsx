import { useGameStore } from '../state/store';

const STANCE_LABEL: Record<string, string> = {
  ally: '🤝 Allied',
  neutral: '· Neutral',
  rival: '⚔️ Rivals',
};

/**
 * Society panel: shows the social groups that have emerged from survivors' relationships —
 * their name, leader, members, fictional culture/belief/law tenets, and how groups regard each
 * other. All of it is derived by the sim core from the affinity graph + value axes.
 */
export default function SocietyPanel({ onClose }: { onClose: () => void }) {
  const society = useGameStore((s) => s.snapshot?.society ?? { groups: [], relations: [] });
  const npcs = useGameStore((s) => s.snapshot?.npcs ?? []);
  const nameOf = (id: string) => npcs.find((n) => n.id === id)?.name ?? id;
  const groupName = (id: string) => society.groups.find((g) => g.id === id)?.name ?? id;

  return (
    <div className="society">
      <div className="society__head">
        <span>Society</span>
        <button className="society__close" onClick={onClose} aria-label="Close society">
          ✕
        </button>
      </div>

      {society.groups.length === 0 ? (
        <div className="society__empty">
          No communities yet. Recruit survivors and keep them together — groups form from their
          bonds over time.
        </div>
      ) : (
        <div className="society__list">
          {society.groups.map((g) => (
            <div key={g.id} className="grp">
              <div className="grp__name">{g.name}</div>
              <div className="grp__meta">
                👑 {nameOf(g.leaderId)} · {g.memberIds.length} members
              </div>
              <div className="grp__members">{g.memberIds.map(nameOf).join(', ')}</div>
              <ul className="grp__tenets">
                <li>🏺 {g.tenets.culture}</li>
                <li>✨ {g.tenets.belief}</li>
                <li>⚖️ {g.tenets.law}</li>
              </ul>
            </div>
          ))}

          {society.relations.length > 0 && (
            <div className="society__relations">
              {society.relations.map((r) => (
                <div key={`${r.a}|${r.b}`} className="rel">
                  {groupName(r.a)} {STANCE_LABEL[r.stance]} {groupName(r.b)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
