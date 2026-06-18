import { useEffect, useRef, useState } from 'react';
import { GameLoop } from './game/GameLoop';
import { getAdService } from './services/ads';
import { SaveService } from './services/save/SaveService';
import { useGameStore } from './state/store';
import { hashStringToSeed } from './sim';
import Hud from './ui/Hud';
import WorldCanvas from './render/WorldCanvas';

/**
 * Root component. Owns the GameLoop lifecycle: creates it with a seed, wires it to the
 * Zustand store (snapshots out, dispatch in), initializes the ad service, and tears down on
 * unmount. The view/zoom router will branch here in Phase 13.
 */
export default function App() {
  const setSnapshot = useGameStore((s) => s.setSnapshot);
  const setTerrain = useGameStore((s) => s.setTerrain);
  const setDispatch = useGameStore((s) => s.setDispatch);
  const ready = useGameStore((s) => s.snapshot !== null);
  const loopRef = useRef<GameLoop | null>(null);
  const [seed] = useState(() => SaveService.loadSeed() ?? hashStringToSeed('terra-prime'));

  useEffect(() => {
    void getAdService().init();

    const loop = new GameLoop(seed);
    loopRef.current = loop;
    setTerrain(loop.getTerrain());
    setDispatch(loop.dispatch);
    loop.start(setSnapshot);
    SaveService.saveSeed(loop.seed);

    return () => loop.stop();
  }, [seed, setSnapshot, setTerrain, setDispatch]);

  return (
    <main className="app">
      {ready ? (
        <>
          <WorldCanvas />
          <Hud />
        </>
      ) : (
        <div className="boot">Generating world…</div>
      )}
    </main>
  );
}
