import { useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import BiomeGlobe from './BiomeGlobe';

/** Sets the camera once when this scale mounts (so it frames the globe, not the old terrain pose). */
function CameraInit({ x, y, z }: { x: number; y: number; z: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [camera, x, y, z]);
  return null;
}

/** Planet zoom scale: the whole world as a rotating low-poly biome globe you can orbit. */
export default function PlanetView({ seed }: { seed: number }) {
  return (
    <>
      <color attach="background" args={['#0a1020']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 6, 10]} intensity={1.3} color="#fff4e0" />
      <BiomeGlobe seed={seed} radius={3} detail={3} spin />
      <CameraInit x={0} y={2} z={8} />
      <OrbitControls makeDefault enablePan={false} enableDamping minDistance={4.5} maxDistance={14} />
    </>
  );
}
