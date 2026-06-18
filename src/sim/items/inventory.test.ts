import { describe, expect, it } from 'vitest';
import { invAdd, invConsume, invCount, invHas, type Inventory } from './inventory';

describe('inventory', () => {
  it('treats absent items as zero', () => {
    const inv: Inventory = {};
    expect(invCount(inv, 'wood')).toBe(0);
  });

  it('adds and accumulates counts', () => {
    const inv: Inventory = {};
    invAdd(inv, 'wood', 3);
    invAdd(inv, 'wood', 2);
    expect(invCount(inv, 'wood')).toBe(5);
  });

  it('invHas checks all requirements', () => {
    const inv: Inventory = { wood: 2, fiber: 1 };
    expect(invHas(inv, { wood: 2 })).toBe(true);
    expect(invHas(inv, { wood: 2, fiber: 2 })).toBe(false);
  });

  it('invConsume subtracts only when affordable', () => {
    const inv: Inventory = { wood: 2, stone: 1 };
    expect(invConsume(inv, { wood: 3 })).toBe(false);
    expect(inv.wood).toBe(2); // unchanged on failure
    expect(invConsume(inv, { wood: 2, stone: 1 })).toBe(true);
    expect(invCount(inv, 'wood')).toBe(0);
    expect(invCount(inv, 'stone')).toBe(0);
  });
});
