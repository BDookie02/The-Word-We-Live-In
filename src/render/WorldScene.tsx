import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../state/store';
import { sampleHeight } from '../sim';
import { computeLighting, dayFractionFromTime } from './dayNight';
import BuildingMeshes from './BuildingMeshes';
import NpcMeshes from './NpcMeshes';
import ResourceNodeMesh from './ResourceNodeMesh';
import TerrainMesh from './TerrainMesh';
import ThreatMeshes from './ThreatMeshes';

/**
 * The low-poly 3D world. Reads the latest sim snapshot and the static terrain from the store
 * and draws the terrain, water, player, and resource nodes. Sim coordinates (x, y) map to
 * world (X, Z); terrain height provides Y. Tapping the ground sets a move target; tapping a
 * node gathers it. No world mutation happens here beyond dispatching those intents.
 */
export default function WorldScene() {
  const snapshot = useGameStore((s) => s.snapshot);
  const terrain = useGameStore((s) => s.terrain);
  const dispatch = useGameStore((s) => s.dispatch);
  const placement = useGameStore((s) => s.placement);
  const setPlacement = useGameStore((s) => s.setPlacement);
  if (!snapshot || !terrain) return null;

  const { player } = snapshot;
  const light = computeLighting(dayFractionFromTime(snapshot.time.hour, snapshot.time.minute));
  const playerY = sampleHeight(terrain, player.pos.x, player.pos.y);

  const handleGroundTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (placement) {
      dispatch({ type: 'placeBuilding', kind: placement, x: e.point.x, y: e.point.z });
      setPlacement(null);
    } else {
      dispatch({ type: 'moveTo', x: e.point.x, y: e.point.z });
    }
  };

  return (
    <>
      <color attach="background" args={[light.skyColor]} />
      <fog attach="fog" args={[light.skyColor, terrain.worldSize * 0.55, terrain.worldSize * 1.5]} />

      <ambientLight intensity={light.ambientIntensity} />
      <hemisphereLight intensity={0.35} color={light.skyColor} groundColor="#2b1f14" />
      <directionalLight position={light.sunPosition} intensity={light.sunIntensity} color="#fff4e0" />

      {/* Tapping terrain or water sets a move target. */}
      <group onClick={handleGroundTap}>
        <TerrainMesh data={terrain} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, terrain.waterLevel, 0]}>
          <planeGeometry args={[terrain.worldSize, terrain.worldSize]} />
          <meshStandardMaterial color="#2f6fb0" transparent opacity={0.8} flatShading />
        </mesh>
      </group>

      {/* Move-target marker. */}
      {player.target && (
        <mesh
          position={[
            player.target.x,
            sampleHeight(terrain, player.target.x, player.target.y) + 0.15,
            player.target.y,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.6, 0.9, 16]} />
          <meshBasicMaterial color="#ffe08a" transparent opacity={0.85} />
        </mesh>
      )}

      {/* Player marker, seated on the terrain (greys out on collapse). */}
      <mesh position={[player.pos.x, playerY + 0.9, player.pos.y]}>
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial color={player.status === 'collapsed' ? '#8a8f98' : '#4fc3f7'} flatShading />
      </mesh>

      {snapshot.nodes.map((node) => (
        <ResourceNodeMesh
          key={node.id}
          node={node}
          groundY={sampleHeight(terrain, node.pos.x, node.pos.y)}
          onGather={(id) => dispatch({ type: 'gather', nodeId: id })}
        />
      ))}

      <BuildingMeshes />
      <NpcMeshes />
      <ThreatMeshes />
    </>
  );
}
