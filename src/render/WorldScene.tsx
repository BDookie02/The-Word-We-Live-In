import { useGameStore } from '../state/store';
import { sampleHeight } from '../sim';
import { computeLighting, dayFractionFromTime } from './dayNight';
import ResourceNodeMesh from './ResourceNodeMesh';
import TerrainMesh from './TerrainMesh';

/**
 * The low-poly 3D world. Reads the latest sim snapshot and the static terrain from the store
 * and draws the terrain, water, player, and resource nodes. Sim coordinates (x, y) map to
 * world (X, Z); terrain height provides Y. Lighting/sky are derived from the in-world clock.
 * No world mutation happens here beyond dispatching a `gather` intent on tap.
 */
export default function WorldScene() {
  const snapshot = useGameStore((s) => s.snapshot);
  const terrain = useGameStore((s) => s.terrain);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!snapshot || !terrain) return null;

  const light = computeLighting(dayFractionFromTime(snapshot.time.hour, snapshot.time.minute));
  const playerY = sampleHeight(terrain, snapshot.player.pos.x, snapshot.player.pos.y);

  return (
    <>
      <color attach="background" args={[light.skyColor]} />
      <fog attach="fog" args={[light.skyColor, terrain.worldSize * 0.55, terrain.worldSize * 1.5]} />

      <ambientLight intensity={light.ambientIntensity} />
      <hemisphereLight intensity={0.35} color={light.skyColor} groundColor="#2b1f14" />
      <directionalLight position={light.sunPosition} intensity={light.sunIntensity} color="#fff4e0" />

      <TerrainMesh data={terrain} />

      {/* Water plane at sea level. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, terrain.waterLevel, 0]}>
        <planeGeometry args={[terrain.worldSize, terrain.worldSize]} />
        <meshStandardMaterial color="#2f6fb0" transparent opacity={0.8} flatShading />
      </mesh>

      {/* Player marker, seated on the terrain. */}
      <mesh position={[snapshot.player.pos.x, playerY + 0.9, snapshot.player.pos.y]}>
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial color="#4fc3f7" flatShading />
      </mesh>

      {snapshot.nodes.map((node) => (
        <ResourceNodeMesh
          key={node.id}
          node={node}
          groundY={sampleHeight(terrain, node.pos.x, node.pos.y)}
          onGather={(id) => dispatch({ type: 'gather', nodeId: id })}
        />
      ))}
    </>
  );
}
