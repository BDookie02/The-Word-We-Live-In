import { DEMO } from '../config/gameConfig';
import { useGameStore } from '../state/store';
import { computeLighting, dayFractionFromTime } from './dayNight';
import ResourceNodeMesh from './ResourceNodeMesh';

/**
 * The low-poly 3D world. Reads the latest sim snapshot from the store and draws the
 * ground, player, and resource nodes. Sim coordinates (x, y) map to world (X, Z); height
 * (Y) is up. Lighting/sky are derived from the in-world clock. No world mutation happens
 * here beyond dispatching a `gather` intent on tap.
 */
export default function WorldScene() {
  const snapshot = useGameStore((s) => s.snapshot);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!snapshot) return null;

  const groundSize = DEMO.worldHalfExtent * 2 + 40;
  const light = computeLighting(dayFractionFromTime(snapshot.time.hour, snapshot.time.minute));

  return (
    <>
      <color attach="background" args={[light.skyColor]} />
      <fog attach="fog" args={[light.skyColor, groundSize * 0.5, groundSize * 1.6]} />

      <ambientLight intensity={light.ambientIntensity} />
      <hemisphereLight intensity={0.35} color={light.skyColor} groundColor="#2b1f14" />
      <directionalLight position={light.sunPosition} intensity={light.sunIntensity} color="#fff4e0" />

      {/* Flat ground for now; procedural low-poly terrain replaces this in Phase 3. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[groundSize, groundSize, 1, 1]} />
        <meshStandardMaterial color="#3f7d3a" flatShading />
      </mesh>

      {/* Player marker. */}
      <mesh position={[snapshot.player.pos.x, 0.9, snapshot.player.pos.y]}>
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4fc3f7" flatShading />
      </mesh>

      {snapshot.nodes.map((node) => (
        <ResourceNodeMesh
          key={node.id}
          node={node}
          onGather={(id) => dispatch({ type: 'gather', nodeId: id })}
        />
      ))}
    </>
  );
}
