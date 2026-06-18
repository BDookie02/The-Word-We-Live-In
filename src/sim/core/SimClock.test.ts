import { describe, expect, it } from 'vitest';
import { SimClock } from './SimClock';
import { TICKS_PER_DAY, TICKS_PER_HOUR } from '../../config/gameConfig';

describe('SimClock', () => {
  it('starts at day 1, hour 0', () => {
    const c = new SimClock();
    expect(c.tick).toBe(0);
    expect(c.time).toEqual({ day: 1, hour: 0, minute: 0 });
  });

  it('advances one hour after TICKS_PER_HOUR steps', () => {
    const c = new SimClock();
    for (let i = 0; i < TICKS_PER_HOUR; i++) c.step();
    expect(c.time.hour).toBe(1);
    expect(c.time.day).toBe(1);
  });

  it('rolls over to day 2 after a full day', () => {
    const c = new SimClock();
    for (let i = 0; i < TICKS_PER_DAY; i++) c.step();
    expect(c.time.day).toBe(2);
    expect(c.time.hour).toBe(0);
  });

  it('reports night during early/late hours', () => {
    const c = new SimClock(0); // hour 0 -> night
    expect(c.isNight).toBe(true);
    const noon = new SimClock(TICKS_PER_HOUR * 12);
    expect(noon.isNight).toBe(false);
  });

  it('dayFraction stays within [0, 1)', () => {
    const c = new SimClock(Math.floor(TICKS_PER_DAY / 3));
    expect(c.dayFraction).toBeGreaterThanOrEqual(0);
    expect(c.dayFraction).toBeLessThan(1);
  });
});
