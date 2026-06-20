import type { RNG } from '../core/rng';

/**
 * Abstract, FICTIONAL value axes for survivors. Each is in [-1, 1] between two poles. These
 * are deliberately not tied to any real-world ideology, religion, or party — they are generic
 * dials from which culture/belief/law tenets emerge (see society.ts). Add axes here to deepen
 * the model in later passes.
 *
 *  tradition:  -1 progressive ........ +1 traditional
 *  community:  -1 individualist ...... +1 collectivist
 *  harmony:    -1 competitive ........ +1 cooperative
 */
export interface ValueAxes {
  tradition: number;
  community: number;
  harmony: number;
}

export const VALUE_AXES: readonly (keyof ValueAxes)[] = ['tradition', 'community', 'harmony'];

export function randomValues(rng: RNG): ValueAxes {
  return {
    tradition: rng.range(-1, 1),
    community: rng.range(-1, 1),
    harmony: rng.range(-1, 1),
  };
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** Move `v` a fraction `rate` toward `target` on each axis (cultural convergence). */
export function driftToward(v: ValueAxes, target: ValueAxes, rate: number): ValueAxes {
  return {
    tradition: clamp(v.tradition + (target.tradition - v.tradition) * rate),
    community: clamp(v.community + (target.community - v.community) * rate),
    harmony: clamp(v.harmony + (target.harmony - v.harmony) * rate),
  };
}

export function meanValues(list: readonly ValueAxes[]): ValueAxes {
  if (list.length === 0) return { tradition: 0, community: 0, harmony: 0 };
  const sum = list.reduce(
    (acc, v) => ({
      tradition: acc.tradition + v.tradition,
      community: acc.community + v.community,
      harmony: acc.harmony + v.harmony,
    }),
    { tradition: 0, community: 0, harmony: 0 },
  );
  return {
    tradition: sum.tradition / list.length,
    community: sum.community / list.length,
    harmony: sum.harmony / list.length,
  };
}

/** Manhattan distance between two value sets (0 = identical, 6 = maximally opposed). */
export function valueDistance(a: ValueAxes, b: ValueAxes): number {
  return (
    Math.abs(a.tradition - b.tradition) +
    Math.abs(a.community - b.community) +
    Math.abs(a.harmony - b.harmony)
  );
}
