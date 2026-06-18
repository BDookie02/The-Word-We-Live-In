import type { ThreeEvent } from '@react-three/fiber';
import type { EntityId, ResourceKind, ResourceNode } from '../sim';

const NODE_COLOR: Record<ResourceKind, string> = {
  wood: '#5a8f3c',
  stone: '#9aa3ad',
  food: '#e0584f',
  fiber: '#d9c25a',
};

/** Low-poly, flat-shaded silhouette per resource kind. */
function NodeShape({ kind }: { kind: ResourceKind }) {
  switch (kind) {
    case 'wood':
      return (
        <group>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.22, 1, 5]} />
            <meshStandardMaterial color="#6b4a2b" flatShading />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <coneGeometry args={[0.9, 1.6, 6]} />
            <meshStandardMaterial color={NODE_COLOR.wood} flatShading />
          </mesh>
        </group>
      );
    case 'stone':
      return (
        <mesh position={[0, 0.4, 0]}>
          <dodecahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial color={NODE_COLOR.stone} flatShading />
        </mesh>
      );
    case 'food':
      return (
        <mesh position={[0, 0.5, 0]}>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color={NODE_COLOR.food} flatShading />
        </mesh>
      );
    case 'fiber':
      return (
        <mesh position={[0, 0.6, 0]}>
          <tetrahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial color={NODE_COLOR.fiber} flatShading />
        </mesh>
      );
  }
}

/**
 * A single resource node in the 3D world. The tap-to-gather input is a raycast pointer
 * event on the mesh; stopping propagation keeps the camera controls from also reacting.
 * Node scale shrinks as it depletes, giving visible feedback without a separate HUD.
 */
export default function ResourceNodeMesh({
  node,
  groundY,
  onGather,
}: {
  node: ResourceNode;
  groundY: number;
  onGather: (id: EntityId) => void;
}) {
  const handleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onGather(node.id);
  };

  return (
    <group
      position={[node.pos.x, groundY, node.pos.y]}
      scale={0.75 + node.amount * 0.06}
      onClick={handleTap}
    >
      <NodeShape kind={node.kind} />
    </group>
  );
}
