import { Canvas } from '@react-three/fiber';
import CameraRig from '../input/CameraRig';
import { useGameStore } from '../state/store';
import CharacterCamera from './CharacterCamera';
import OrbitView from './OrbitView';
import PlanetView from './PlanetView';
import WorldScene from './WorldScene';

/**
 * Hosts the react-three-fiber canvas and routes between zoom-scale layers (Phase 13):
 *  - character/settlement → the low-poly ground world (different cameras),
 *  - planet → a stylized biome globe,
 *  - orbit → the planet among the stars.
 * Fills its container so it adapts to portrait/landscape and device pixel ratio. Render-only:
 * the sim core is untouched; scenes read snapshots.
 */
export default function WorldCanvas() {
  const viewScale = useGameStore((s) => s.viewScale);
  const seed = useGameStore((s) => s.snapshot?.seed ?? 0);
  const onGround = viewScale === 'character' || viewScale === 'settlement';

  return (
    <div className="world-canvas">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [45, 55, 45], fov: 45, near: 0.1, far: 600 }}
        gl={{ antialias: true }}
      >
        {onGround && <WorldScene />}
        {viewScale === 'settlement' && <CameraRig />}
        {viewScale === 'character' && <CharacterCamera />}
        {viewScale === 'planet' && <PlanetView seed={seed} />}
        {viewScale === 'orbit' && <OrbitView seed={seed} />}
      </Canvas>
    </div>
  );
}
