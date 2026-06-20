import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../state/store';
import { sampleHeight } from '../sim';

/**
 * Renders hostile threats as low-poly markers on the terrain. Tapping a threat attacks it
 * (the sim core applies the player's weapon-based attack power). Predators are darker red,
 * raiders brighter red and larger.
 */
export default function ThreatMeshes() {
  const threats = useGameStore((s) => s.snapshot?.threats ?? []);
  const terrain = useGameStore((s) => s.terrain);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!terrain) return null;

  return (
    <>
      {threats.map((t) => {
        const y = sampleHeight(terrain, t.pos.x, t.pos.y);
        const onTap = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          dispatch({ type: 'attackThreat', threatId: t.id });
        };
        const raider = t.kind === 'raider';
        const r = raider ? 0.55 : 0.42;
        return (
          <mesh key={t.id} position={[t.pos.x, y + r, t.pos.y]} onClick={onTap}>
            <icosahedronGeometry args={[r, 0]} />
            <meshStandardMaterial color={raider ? '#d83a3a' : '#9b2d2d'} flatShading />
          </mesh>
        );
      })}
    </>
  );
}
