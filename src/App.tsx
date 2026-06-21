import { useEffect, useRef } from 'react';
import { GameLoop } from './game/GameLoop';
import { getAdService } from './services/ads';
import { SaveService } from './services/save/SaveService';
import { useGameStore } from './state/store';
import { hashStringToSeed, World } from './sim';
import { AUTOSAVE_INTERVAL_MS } from './config/gameConfig';
import Hud from './ui/Hud';
import CollapseOverlay from './ui/CollapseOverlay';
import WorldCanvas from './render/WorldCanvas';

/**
 * Root component. Owns the GameLoop lifecycle: restores a saved world (Continue) or starts a
 * fresh one, wires it to the Zustand store (snapshots out, dispatch + save/load in), autosaves
 * on an interval and on unmount, and tears down on unmount. The zoom router branches here in
 * Phase 13.
 */
export default function App() {
  const setSnapshot = useGameStore((s) => s.setSnapshot);
  const setTerrain = useGameStore((s) => s.setTerrain);
  const setDispatch = useGameStore((s) => s.setDispatch);
  const setSaveHandlers = useGameStore((s) => s.setSaveHandlers);
  const ready = useGameStore((s) => s.snapshot !== null);
  const loopRef = useRef<GameLoop | null>(null);

  useEffect(() => {
    void getAdService().init();

    const saved = SaveService.loadWorld();
    const world = saved ? World.restore(saved) : World.fromSeed(hashStringToSeed('terra-prime'));
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
  }, [setSnapshot, setTerrain, setDispatch, setSaveHandlers]);

  return (
    <main className="app">
      {ready ? (
        <>
          <WorldCanvas />
          <Hud />
          <CollapseOverlay />
        </>
      ) : (
        <div className="boot">Generating world…</div>
      )}
    </main>
  );
}
