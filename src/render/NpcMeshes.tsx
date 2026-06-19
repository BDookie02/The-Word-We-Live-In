import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../state/store';
import { sampleHeight } from '../sim';

/**
 * Renders survivor NPCs as capsules seated on the terrain. Recruited NPCs are green, wild
 * ones amber. Tapping a wild NPC dispatches a recruit intent (the sim core enforces the
 * proximity requirement).
 */
export default function NpcMeshes() {
  const npcs = useGameStore((s) => s.snapshot?.npcs ?? []);
  const terrain = useGameStore((s) => s.terrain);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!terrain) return null;

  return (
    <>
      {npcs.map((npc) => {
        const y = sampleHeight(terrain, npc.pos.x, npc.pos.y);
        const onTap = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (!npc.recruited) dispatch({ type: 'recruitNpc', npcId: npc.id });
        };
        return (
          <mesh key={npc.id} position={[npc.pos.x, y + 0.85, npc.pos.y]} onClick={onTap}>
            <capsuleGeometry args={[0.35, 0.7, 4, 8]} />
            <meshStandardMaterial color={npc.recruited ? '#7bd88f' : '#e6a14b'} flatShading />
          </mesh>
        );
      })}
    </>
  );
}
