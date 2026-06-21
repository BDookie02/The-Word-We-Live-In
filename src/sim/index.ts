/** Public surface of the deterministic simulation core. */
export { World, type WorldSnapshot } from './world/World';
export { SimClock, type CalendarTime } from './core/SimClock';
export { createRng, hashStringToSeed, type RNG } from './core/rng';
export type { Intent, IntentType } from './intents/intents';
export {
  generateTerrain,
  sampleHeight,
  type TerrainData,
  type TerrainOptions,
} from './planet/Terrain';
export { BIOMES, BIOME_COLOR, biomeForHeight, type Biome } from './planet/biomes';
export { createValueNoise, fbm, type Noise2D } from './planet/noise';
export {
  ITEMS,
  ITEM_ORDER,
  TOOL_FOR_RESOURCE,
  type ItemId,
  type ItemDef,
  type ItemCategory,
} from './items/items';
export {
  invAdd,
  invConsume,
  invCount,
  invHas,
  type Inventory,
  type ItemCost,
} from './items/inventory';
export { RECIPES, recipeById, type Recipe } from './items/recipes';
export {
  OBJECTIVES,
  type AssistantMessage,
  type ObjectiveProgress,
  type PlayerStats,
} from './objectives/objectives';
export {
  NPC_NAMES,
  TASK_RESOURCE,
  isGatherTask,
  type GatherTask,
  type NPC,
  type NpcBehavior,
  type NpcTaskKind,
} from './npc/npc';
export {
  BUILDINGS,
  BUILDING_ORDER,
  type Building,
  type BuildingDef,
  type BuildingKind,
} from './buildings/buildings';
export {
  ERAS,
  MAX_ERA_INDEX,
  eraDef,
  canAdvanceEra,
  nextEraRequirements,
  type EraDef,
  type EraId,
  type EraRequirement,
} from './progression/eras';
export {
  getAffinity,
  relKey,
  type RelationshipMap,
} from './social/relationships';
export {
  driftToward,
  meanValues,
  randomValues,
  valueDistance,
  VALUE_AXES,
  type ValueAxes,
} from './social/values';
export {
  deriveSociety,
  tenetsFor,
  type GroupRelation,
  type GroupStance,
  type GroupTenets,
  type SocialGroup,
  type SocialMember,
  type Society,
} from './social/society';
export {
  THREAT_STATS,
  WEAPON_BONUS,
  playerAttackPower,
  type Threat,
  type ThreatKind,
} from './threats/threats';
export type { NpcSnapshot } from './world/World';
export { SAVE_VERSION, migrateSave, type SaveBlob } from './persistence/saveSchema';
export {
  RESOURCE_KINDS,
  emptyTally,
  fullNeeds,
  type EntityId,
  type NeedLevels,
  type PlayerState,
  type PlayerStatus,
  type ResourceKind,
  type ResourceNode,
  type ResourceTally,
  type Vec2,
} from './core/types';
export type { PlayerSnapshot } from './world/World';
