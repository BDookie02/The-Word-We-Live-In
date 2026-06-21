import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { GameLoop } from './game/GameLoop';
import { getAdService } from './services/ads';
import { SaveService } from './services/save/SaveService';
import { useGameStore } from './state/store';
import { World } from './sim';
import { AUTOSAVE_INTERVAL_MS } from './config/gameConfig';
import Hud from './ui/Hud';
import CollapseOverlay from './ui/CollapseOverlay';
import ScaleSwitcher from './ui/ScaleSwitcher';
import MainMenu from './ui/MainMenu';

// Lazy-load the 3D render layer so three.js/r3f stay off the initial parse path (perf pass).
const WorldCanvas = lazy(() => import('./render/WorldCanvas'));

type StartMode = 'new' | 'continue';

function randomSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) ^ Date.now()) >>> 0;
}

/**
 * Root component. Shows a boot menu (New Game / Continue), then owns the GameLoop lifecycle:
 * builds the world (fresh or restored), wires it to the Zustand store (snapshots out, dispatch +
 * save/load in), autosaves on an interval and on exit, and tears down on unmount.
 */
export default function App() {
  const setSnapshot = useGameStore((s) => s.setSnapshot);
  const setTerrain = useGameStore((s) => s.setTerrain);
  const setDispatch = useGameStore((s) => s.setDispatch);
  const setSaveHandlers = useGameStore((s) => s.setSaveHandlers);
  const ready = useGameStore((s) => s.snapshot !== null);

  const [started, setStarted] = useState(false);
  const modeRef = useRef<StartMode>('continue');
  const loopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    if (!started) return;
    void getAdService().init();

    let world: World;
    if (modeRef.current === 'continue') {
      const saved = SaveService.loadWorld();
      world = saved ? World.restore(saved) : World.fromSeed(randomSeed());
    } else {
      SaveService.clear();
      world = World.fromSeed(randomSeed());
    }

    const loop = new GameLoop(world);
    loopRef.current = loop;
    setTerrain(loop.getTerrain());
    setDispatch(loop.dispatch);
    setSaveHandlers(
      () => SaveService.saveWorld(loop.serialize()),
      () => {
        const blob = SaveService.loadWorld();
        if (!blob) return;
        loop.loadFrom(blob);
        setTerrain(loop.getTerrain());
      },
    );
    loop.start(setSnapshot);

    const autosave = window.setInterval(
      () => SaveService.saveWorld(loop.serialize()),
      AUTOSAVE_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(autosave);
      SaveService.saveWorld(loop.serialize());
      loop.stop();
    };
  }, [started, setSnapshot, setTerrain, setDispatch, setSaveHandlers]);

  const begin = (mode: StartMode) => {
    modeRef.current = mode;
    setStarted(true);
  };

  if (!started) {
    return (
      <main className="app">
        <MainMenu hasSave={SaveService.hasSave()} onNewGame={() => begin('new')} onContinue={() => begin('continue')} />
      </main>
    );
  }

  return (
    <main className="app">
      {ready ? (
        <>
          <Suspense fallback={<div className="boot">Rendering world…</div>}>
            <WorldCanvas />
          </Suspense>
          <Hud />
          <ScaleSwitcher />
          <CollapseOverlay />
        </>
      ) : (
        <div className="boot">Generating world…</div>
      )}
    </main>
  );
}
