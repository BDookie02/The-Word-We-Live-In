import type { ResourceKind } from '../core/types';

/** All item identifiers: raw resources (gatherable) plus crafted materials and tools. */
export type ItemId =
  | ResourceKind // 'wood' | 'stone' | 'food' | 'fiber'
  | 'plank'
  | 'rope'
  | 'sharp_stone'
  | 'axe'
  | 'pickaxe'
  | 'spear';

export type ItemCategory = 'resource' | 'material' | 'tool';

export interface ItemDef {
  id: ItemId;
  name: string;
  category: ItemCategory;
  icon: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  wood: { id: 'wood', name: 'Wood', category: 'resource', icon: '🪵' },
  stone: { id: 'stone', name: 'Stone', category: 'resource', icon: '🪨' },
  food: { id: 'food', name: 'Food', category: 'resource', icon: '🍖' },
  fiber: { id: 'fiber', name: 'Fiber', category: 'resource', icon: '🌾' },
  plank: { id: 'plank', name: 'Plank', category: 'material', icon: '🟫' },
  rope: { id: 'rope', name: 'Rope', category: 'material', icon: '🧵' },
  sharp_stone: { id: 'sharp_stone', name: 'Sharp Stone', category: 'material', icon: '🔪' },
  axe: { id: 'axe', name: 'Stone Axe', category: 'tool', icon: '🪓' },
  pickaxe: { id: 'pickaxe', name: 'Stone Pickaxe', category: 'tool', icon: '⛏️' },
  spear: { id: 'spear', name: 'Spear', category: 'tool', icon: '🗡️' },
};

/** Ordered list for stable UI rendering. */
export const ITEM_ORDER: readonly ItemId[] = [
  'wood',
  'stone',
  'food',
  'fiber',
  'plank',
  'rope',
  'sharp_stone',
  'axe',
  'pickaxe',
  'spear',
];

/** Which tool speeds up (doubles the yield of) gathering a given resource. */
export const TOOL_FOR_RESOURCE: Partial<Record<ResourceKind, ItemId>> = {
  wood: 'axe',
  stone: 'pickaxe',
};
