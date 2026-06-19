import { create } from 'zustand';
import type { BuildingKind, Intent, TerrainData, WorldSnapshot } from '../sim';

/**
 * Bridge between the deterministic sim core and React. The GameLoop writes the latest
 * snapshot here each frame; React components subscribe with selectors so they only
 * re-render when the slice they read actually changes. `dispatch` is injected by the
 * GameLoop at startup so the UI can submit intents without holding a World reference.
 */
interface GameStore {
  snapshot: WorldSnapshot | null;
  /** Static terrain for the current world. Set once at startup, not per tick. */
  terrain: TerrainData | null;
  dispatch: (intent: Intent) => void;
  /** True while a rewarded ad is in flight (drives UI busy state). */
  adBusy: boolean;
  /** Building kind pending placement (next ground tap sites it), or null. */
  placement: BuildingKind | null;

  setSnapshot: (snapshot: WorldSnapshot) => void;
  setTerrain: (terrain: TerrainData) => void;
  setDispatch: (dispatch: (intent: Intent) => void) => void;
  setAdBusy: (busy: boolean) => void;
  setPlacement: (placement: BuildingKind | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  snapshot: null,
  terrain: null,
  dispatch: () => {
    /* replaced by GameLoop.start() */
  },
  adBusy: false,
  placement: null,

  setSnapshot: (snapshot) => set({ snapshot }),
  setTerrain: (terrain) => set({ terrain }),
  setDispatch: (dispatch) => set({ dispatch }),
  setAdBusy: (adBusy) => set({ adBusy }),
  setPlacement: (placement) => set({ placement }),
}));
