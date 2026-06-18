import { MAX_CATCHUP_STEPS, TICK_MS } from '../config/gameConfig';
import { World, type Intent, type WorldSnapshot } from '../sim';

/**
 * Real-time driver for the deterministic sim. This is the ONLY place wall-clock time enters
 * the system: it converts elapsed frame time into a whole number of fixed sim ticks (fixed
 * timestep with an accumulator) so the simulation advances at a constant rate regardless of
 * display refresh rate, then publishes a fresh snapshot via the supplied callback.
 */
export class GameLoop {
  private world: World;
  private accumulatorMs = 0;
  private lastMs = 0;
  private rafId = 0;
  private running = false;
  private onSnapshot: (s: WorldSnapshot) => void = () => {};

  constructor(seed: number) {
    this.world = World.fromSeed(seed);
  }

  get seed(): number {
    return this.world.seed;
  }

  /** Submit a player/AI intent. Safe to call from UI/input at any time. */
  dispatch = (intent: Intent): void => {
    this.world.dispatch(intent);
  };

  start(onSnapshot: (s: WorldSnapshot) => void): void {
    if (this.running) return;
    this.running = true;
    this.onSnapshot = onSnapshot;
    this.lastMs = performance.now();
    this.onSnapshot(this.world.snapshot()); // publish initial frame immediately
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private frame = (now: number): void => {
    if (!this.running) return;

    const delta = now - this.lastMs;
    this.lastMs = now;
    this.accumulatorMs += delta;

    let steps = 0;
    while (this.accumulatorMs >= TICK_MS && steps < MAX_CATCHUP_STEPS) {
      this.world.tick();
      this.accumulatorMs -= TICK_MS;
      steps++;
    }
    // Drop unprocessed backlog after a long stall to avoid a catch-up spiral.
    if (this.accumulatorMs > TICK_MS * MAX_CATCHUP_STEPS) {
      this.accumulatorMs = 0;
    }

    if (steps > 0) this.onSnapshot(this.world.snapshot());
    this.rafId = requestAnimationFrame(this.frame);
  };
}
