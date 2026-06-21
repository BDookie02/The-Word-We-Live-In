import { useEffect, useMemo } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createRng } from '../sim';
import BiomeGlobe from './BiomeGlobe';

function CameraInit({ x, y, z }: { x: number; y: number; z: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [camera, x, y, z]);
  return null;
}

/** A seeded starfield as a points cloud on a large sphere. */
function Starfield({ seed }: { seed: number }) {
  const geometry = useMemo(() => {
    const r = createRng((seed ^ 0x51ab) >>> 0);
    const count = 500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = r.range(-1, 1);
      const t = r.range(0, Math.PI * 2);
      const s = Math.sqrt(1 - u * u);
      const rad = r.range(45, 90);
      arr[i * 3] = Math.cos(t) * s * rad;
      arr[i * 3 + 1] = u * rad;
      arr[i * 3 + 2] = Math.sin(t) * s * rad;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [seed]);

  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.5} sizeAttenuation color="#ffffff" />
    </points>
  );
}

/** Orbit/galaxy zoom scale: the planet as a small body among stars, lit by a distant sun. */
export default function OrbitView({ seed }: { seed: number }) {
  return (
    <>
      <color attach="background" args={['#03060d']} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[20, 8, -15]} intensity={1.6} color="#fff2cc" />
      <Starfield seed={seed} />
      {/* Distant sun. */}
      <mesh position={[22, 9, -16]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#ffd866" />
      </mesh>
      <BiomeGlobe seed={seed} radius={1.4} detail={2} spin />
      <CameraInit x={0} y={1.5} z={5} />
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={3} maxDistance={30} />
    </>
  );
}
