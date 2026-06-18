import { Canvas } from '@react-three/fiber';
import CameraRig from '../input/CameraRig';
import WorldScene from './WorldScene';

/**
 * Hosts the react-three-fiber canvas for the world view. Fills its container, so it adapts
 * automatically to portrait/landscape and device pixel ratio. The camera starts at an
 * isometric-ish angle suited to the low-poly look.
 */
export default function WorldCanvas() {
  return (
    <div className="world-canvas">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [45, 55, 45], fov: 45, near: 0.1, far: 600 }}
        gl={{ antialias: true }}
      >
        <WorldScene />
        <CameraRig />
      </Canvas>
    </div>
  );
}
