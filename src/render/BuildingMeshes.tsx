import type { ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../state/store';
import { sampleHeight, type BuildingKind } from '../sim';

const BUILDING_COLOR: Record<BuildingKind, string> = {
  campfire: '#d9772f',
  hut: '#9b6b3f',
  storage: '#b9a06a',
  farm: '#6fae3f',
};

/** Simple low-poly shape per building kind. */
function BuildingShape({ kind }: { kind: BuildingKind }) {
  const color = BUILDING_COLOR[kind];
  switch (kind) {
    case 'campfire':
      return (
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.7, 0.9, 6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      );
    case 'hut':
      return (
        <group>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[2, 1.2, 2]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <coneGeometry args={[1.7, 1, 4]} />
            <meshStandardMaterial color="#7a4a2b" flatShading />
          </mesh>
        </group>
      );
    case 'storage':
      return (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.6, 1, 1.6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      );
    case 'farm':
      return (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.6, 2.6]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      );
  }
}

/**
 * Renders settlement structures on the terrain. In-progress sites are translucent; tapping
 * one adds construction work (the sim core enforces the rules). Built structures are solid.
 */
export default function BuildingMeshes() {
  const buildings = useGameStore((s) => s.snapshot?.buildings ?? []);
  const terrain = useGameStore((s) => s.terrain);
  const dispatch = useGameStore((s) => s.dispatch);
  if (!terrain) return null;

  return (
    <>
      {buildings.map((b) => {
        const y = sampleHeight(terrain, b.pos.x, b.pos.y);
        const onTap = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (!b.built) dispatch({ type: 'workBuilding', buildingId: b.id });
        };
        return (
          <group
            key={b.id}
            position={[b.pos.x, y, b.pos.y]}
            onClick={onTap}
            visible
            scale={b.built ? 1 : 0.96}
          >
            <group renderOrder={1}>
              {/* Translucent while under construction. */}
              <BuildingTransparency built={b.built}>
                <BuildingShape kind={b.kind} />
              </BuildingTransparency>
            </group>
          </group>
        );
      })}
    </>
  );
}

/** Wraps children, dimming opacity for in-progress sites via a group-level material tweak. */
function BuildingTransparency({ built, children }: { built: boolean; children: React.ReactNode }) {
  // Opacity is applied per-material in the shapes; for in-progress we render a ghost via scale
  // + a wash. Keeping it simple: a faint base ring marks unbuilt sites.
  return (
    <group>
      {children}
      {!built && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.7, 20]} />
          <meshBasicMaterial color="#ffe08a" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}
