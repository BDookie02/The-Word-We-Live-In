import { HOURS_PER_DAY, TICKS_PER_DAY, TICKS_PER_HOUR } from '../../config/gameConfig';

export interface CalendarTime {
  day: number; // 1-based in-world day
  hour: number; // 0..23
  minute: number; // 0..59
}

/**
 * Counts discrete simulation ticks and derives an in-world calendar from them.
 *
 * Intentionally has NO concept of real wall-clock time — that lives in the GameLoop
 * driver. Feeding the same number of ticks always yields the same calendar, which keeps
 * the simulation deterministic and trivially serializable.
 */
export class SimClock {
  tick: number;

  constructor(tick = 0) {
    this.tick = tick;
  }

  /** Advance exactly one fixed step. */
  step(): void {
    this.tick++;
  }

  get time(): CalendarTime {
    const dayTick = this.tick % TICKS_PER_DAY;
    const day = Math.floor(this.tick / TICKS_PER_DAY) + 1;
    const hour = Math.floor(dayTick / TICKS_PER_HOUR) % HOURS_PER_DAY;
    const minute = Math.floor(((dayTick % TICKS_PER_HOUR) / TICKS_PER_HOUR) * 60);
    return { day, hour, minute };
  }

  /** 0..1 fraction through the current day (0 = midnight). Useful for day/night lighting. */
  get dayFraction(): number {
    return (this.tick % TICKS_PER_DAY) / TICKS_PER_DAY;
  }

  get isNight(): boolean {
    const { hour } = this.time;
    return hour < 6 || hour >= 20;
  }
}
