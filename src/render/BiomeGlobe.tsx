import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createValueNoise, fbm } from '../sim';
import { biomeColorForValue } from './globeColors';

/**
 * A stylized low-poly planet globe. Builds a flat-shaded icosphere whose faces are coloured by
 * fBm noise (seeded from the world seed) mapped through the biome palette — giving oceans,
 * land, and snow caps without needing the actual terrain heightmap (which is a local patch).
 * Optionally auto-rotates. Used by both the planet and orbit views.
 */
export default function BiomeGlobe({
  seed,
  radius = 3,
  detail = 3,
  spin = true,
}: {
  seed: number;
  radius?: number;
  detail?: number;
  spin?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(radius, detail).toNonIndexed();
    const pos = g.getAttribute('position');
    const noise = createValueNoise((seed ^ 0x9e3779b1) >>> 0);
    const colors: number[] = [];
    const c = new THREE.Color();
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i += 3) {
      let cx = 0;
      let cy = 0;
      let cz = 0;
      for (let k = 0; k < 3; k++) {
        cx += pos.getX(i + k);
        cy += pos.getY(i + k);
        cz += pos.getZ(i + k);
      }
      v.set(cx / 3, cy / 3, cz / 3).normalize();
      const theta = Math.atan2(v.z, v.x);
      const phi = Math.acos(THREE.MathUtils.clamp(v.y, -1, 1));
      const value = fbm(noise, (theta + Math.PI) * 0.9, phi * 1.3, 4);
      c.set(biomeColorForValue(value));
      for (let k = 0; k < 3; k++) colors.push(c.r, c.g, c.b);
    }

    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [seed, radius, detail]);

  useFrame((_, dt) => {
    if (spin && ref.current) ref.current.rotation.y += dt * 0.12;
  });

  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <meshStandardMaterial vertexColors flatShading />
      </mesh>
      {/* Settlement marker on the surface (rotates with the globe). */}
      <mesh position={[0, 0, radius]}>
        <sphereGeometry args={[radius * 0.06, 8, 8]} />
        <meshStandardMaterial color="#ffd34d" emissive="#a9760a" />
      </mesh>
    </group>
  );
}
