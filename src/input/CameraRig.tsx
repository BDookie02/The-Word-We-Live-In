import { MapControls } from '@react-three/drei';

/**
 * Camera input controller for the world view. Wraps drei's MapControls tuned for touch:
 * one-finger drag pans across the map, two-finger pinch zooms (and pans). Rotation is
 * disabled in Phase 2 to keep orientation stable on mobile; the zoom-scale layer transitions
 * (character → settlement → planet → orbit) build on top of this in Phase 13.
 */
export default function CameraRig() {
  return (
    <MapControls
      makeDefault
      enableRotate={false}
      enableDamping
      dampingFactor={0.15}
      panSpeed={0.9}
      zoomSpeed={0.9}
      minDistance={12}
      maxDistance={130}
      maxPolarAngle={Math.PI / 2.4}
      screenSpacePanning={false}
      target={[0, 0, 0]}
    />
  );
}
