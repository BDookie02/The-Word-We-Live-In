import { migrateSave, type SaveBlob } from '../../sim';

/**
 * Persistence boundary. Stores the full versioned World save (see sim/persistence/saveSchema).
 * Uses web localStorage today; the storage adapter is swapped for Capacitor Preferences on
 * native in a later phase. All (de)serialization lives in the sim core — this just moves bytes.
 */

const SAVE_KEY = 'twwli.save.v2';

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
  hasSave(storage: StorageAdapter = webStorage): boolean {
    return storage.get(SAVE_KEY) !== null;
  },

  saveWorld(blob: SaveBlob, storage: StorageAdapter = webStorage): void {
    try {
      storage.set(SAVE_KEY, JSON.stringify(blob));
    } catch (err) {
      console.warn('[save] failed to persist', err);
    }
  },

  /** Load + migrate the save, or null if absent/corrupt/unmigratable. */
  loadWorld(storage: StorageAdapter = webStorage): SaveBlob | null {
    const raw = storage.get(SAVE_KEY);
    if (!raw) return null;
    try {
      return migrateSave(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  clear(storage: StorageAdapter = webStorage): void {
    storage.remove(SAVE_KEY);
  },
};
