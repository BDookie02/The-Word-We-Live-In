import { create } from 'zustand';
import type { Intent, WorldSnapshot } from '../sim';

/**
 * Bridge between the deterministic sim core and React. The GameLoop writes the latest
 * snapshot here each frame; React components subscribe with selectors so they only
 * re-render when the slice they read actually changes. `dispatch` is injected by the
 * GameLoop at startup so the UI can submit intents without holding a World reference.
 */
interface GameStore {
  snapshot: WorldSnapshot | null;
  dispatch: (intent: Intent) => void;
  /** True while a rewarded ad is in flight (drives UI busy state). */
  adBusy: boolean;

  setSnapshot: (snapshot: WorldSnapshot) => void;
  setDispatch: (dispatch: (intent: Intent) => void) => void;
  setAdBusy: (busy: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  snapshot: null,
  dispatch: () => {
    /* replaced by GameLoop.start() */
  },
  adBusy: false,

  setSnapshot: (snapshot) => set({ snapshot }),
  setDispatch: (dispatch) => set({ dispatch }),
  setAdBusy: (adBusy) => set({ adBusy }),
}));
