/**
 * Preliminary persistence. Phase 1 only stores enough to re-create a world (its seed),
 * so the app can offer "Continue". The full versioned WorldSnapshot serialization with
 * migrations lands in Phase 12 (see ROADMAP.md) — this is intentionally minimal, not the
 * final save format.
 */

const SAVE_KEY = 'twwli.save.v1';
const SAVE_VERSION = 1;

interface SaveBlob {
  version: number;
  seed: number;
  savedAt: number;
}

/** Key/value storage that works on web today and is swapped for Capacitor Preferences later. */
interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const webStorage: StorageAdapter = {
  get: (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null),
  set: (k, v) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
  },
  remove: (k) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(k);
  },
};

export const SaveService = {
  saveSeed(seed: number, storage: StorageAdapter = webStorage): void {
    const blob: SaveBlob = { version: SAVE_VERSION, seed: seed >>> 0, savedAt: Date.now() };
    storage.set(SAVE_KEY, JSON.stringify(blob));
  },

  loadSeed(storage: StorageAdapter = webStorage): number | null {
    const raw = storage.get(SAVE_KEY);
    if (!raw) return null;
    try {
      const blob = JSON.parse(raw) as SaveBlob;
      return typeof blob.seed === 'number' ? blob.seed >>> 0 : null;
    } catch {
      return null;
    }
  },

  clear(storage: StorageAdapter = webStorage): void {
    storage.remove(SAVE_KEY);
  },
};
