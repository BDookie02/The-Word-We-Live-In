import { useGameStore } from '../state/store';
import { DEMO } from '../config/gameConfig';

const NODE_COLORS: Record<string, string> = {
  wood: '#8a5a2b',
  stone: '#9aa3ad',
  food: '#e0584f',
  fiber: '#d9c25a',
};

/**
 * Placeholder world view. A real react-three-fiber low-poly scene replaces this in
 * Phases 2–3; for now it renders the deterministic node layout as a simple top-down map so
 * the sim is visible and verifiable. Day/night is reflected in the background tint.
 */
export default function WorldView() {
  const snapshot = useGameStore((s) => s.snapshot);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!snapshot) return null;

  const extent = DEMO.worldHalfExtent;
  const toPct = (v: number) => ((v + extent) / (extent * 2)) * 100;

  return (
    <svg
      className="world-view"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ filter: snapshot.isNight ? 'brightness(0.55) saturate(0.8)' : 'none' }}
    >
      <rect x="0" y="0" width="100" height="100" fill="#1b3a2b" />
      {snapshot.nodes.map((n) => (
        <circle
          key={n.id}
          cx={toPct(n.pos.x)}
          cy={toPct(n.pos.y)}
          r={1.2 + n.amount * 0.25}
          fill={NODE_COLORS[n.kind] ?? '#ffffff'}
          stroke="#0e1726"
          strokeWidth="0.3"
          onClick={() => dispatch({ type: 'gather', nodeId: n.id })}
          style={{ cursor: 'pointer' }}
        >
          <title>{`${n.kind} (${n.amount}) — tap to gather`}</title>
        </circle>
      ))}
      <circle cx={toPct(snapshot.player.pos.x)} cy={toPct(snapshot.player.pos.y)} r="1.8" fill="#4fc3f7" />
    </svg>
  );
}
