import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../state/store';
import { sampleHeight } from '../sim';

/**
 * Close third-person camera for the "character" zoom scale: smoothly follows the player across
 * the terrain. No orbit controls — the camera is fully driven here. Render-only.
 */
export default function CharacterCamera() {
  const { camera } = useThree();
  const snapshot = useGameStore((s) => s.snapshot);
  const terrain = useGameStore((s) => s.terrain);
  const desired = new THREE.Vector3();
  const look = new THREE.Vector3();

  useFrame(() => {
    if (!snapshot || !terrain) return;
    const p = snapshot.player.pos;
    const y = sampleHeight(terrain, p.x, p.y);
    desired.set(p.x + 7, y + 7, p.y + 7);
    camera.position.lerp(desired, 0.12);
    look.set(p.x, y + 1, p.y);
    camera.lookAt(look);
  });

  return null;
}
