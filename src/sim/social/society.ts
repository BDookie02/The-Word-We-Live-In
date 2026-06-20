import { SOCIAL } from '../../config/gameConfig';
import { createRng, hashStringToSeed } from '../core/rng';
import type { EntityId } from '../core/types';
import { getAffinity, type RelationshipMap } from './relationships';
import { meanValues, valueDistance, type ValueAxes } from './values';

/** A member as seen by the society deriver. */
export interface SocialMember {
  id: EntityId;
  name: string;
  values: ValueAxes;
}

export interface GroupTenets {
  culture: string;
  belief: string;
  law: string;
}

export interface SocialGroup {
  id: string;
  name: string;
  memberIds: EntityId[];
  leaderId: EntityId;
  values: ValueAxes;
  tenets: GroupTenets;
}

export type GroupStance = 'ally' | 'neutral' | 'rival';

export interface GroupRelation {
  a: string; // group id
  b: string; // group id
  stance: GroupStance;
}

export interface Society {
  groups: SocialGroup[];
  relations: GroupRelation[];
}

// --- fictional naming (deterministic, abstract — not tied to anything real) ---
const ADJECTIVES = ['Stone', 'Free', 'Bright', 'Iron', 'Wild', 'Quiet', 'Golden', 'Red', 'Ashen', 'River'];
const NOUNS = ['Circle', 'Winds', 'Hands', 'Path', 'Vale', 'Kin', 'Hearth', 'Tide', 'Embers', 'Roots'];

function groupName(memberIds: readonly EntityId[]): string {
  const rng = createRng(hashStringToSeed([...memberIds].sort().join('|')));
  return `The ${rng.pick(ADJECTIVES)} ${rng.pick(NOUNS)}`;
}

/** Derive fictional culture/belief/law tenets from a group's average values. */
export function tenetsFor(v: ValueAxes): GroupTenets {
  return {
    culture: v.tradition >= 0 ? 'Honor the ways of those before us' : 'Seek new ideas and change',
    belief:
      v.harmony >= 0 ? 'The world rewards those who cooperate' : 'Strength and will shape destiny',
    law: v.community >= 0 ? 'What is gathered is shared by all' : 'Each keeps what their hands earn',
  };
}

// --- union-find for affinity clustering ---
class UnionFind {
  private parent = new Map<EntityId, EntityId>();
  find(x: EntityId): EntityId {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    this.parent.set(x, root);
    return root;
  }
  union(a: EntityId, b: EntityId): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

function stanceFor(a: ValueAxes, b: ValueAxes): GroupStance {
  const d = valueDistance(a, b);
  if (d <= SOCIAL.allyDistance) return 'ally';
  if (d >= SOCIAL.rivalDistance) return 'rival';
  return 'neutral';
}

/**
 * Build the society from members + the affinity graph. Social groups EMERGE: members linked by
 * affinity at/above the threshold form connected components; only components of 2+ become groups.
 * Each group elects the most-connected member as leader, averages member values, and derives
 * fictional culture/belief/law tenets. Inter-group stance comes from value similarity.
 * Pure + deterministic given the inputs.
 */
export function deriveSociety(
  members: readonly SocialMember[],
  rel: RelationshipMap,
  threshold = SOCIAL.groupAffinityThreshold,
): Society {
  const uf = new UnionFind();
  for (const m of members) uf.find(m.id);
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      if (getAffinity(rel, members[i].id, members[j].id) >= threshold) {
        uf.union(members[i].id, members[j].id);
      }
    }
  }

  // Bucket members by component root.
  const buckets = new Map<EntityId, SocialMember[]>();
  for (const m of members) {
    const root = uf.find(m.id);
    const list = buckets.get(root) ?? [];
    list.push(m);
    buckets.set(root, list);
  }

  const groups: SocialGroup[] = [];
  for (const list of buckets.values()) {
    if (list.length < 2) continue; // a lone survivor is not yet a group
    const memberIds = list.map((m) => m.id).sort();
    const values = meanValues(list.map((m) => m.values));

    // Leader = most-connected member (highest summed affinity to groupmates; ties -> lowest id).
    let leaderId = memberIds[0];
    let bestScore = -Infinity;
    for (const m of list) {
      let score = 0;
      for (const other of list) if (other.id !== m.id) score += getAffinity(rel, m.id, other.id);
      if (score > bestScore || (score === bestScore && m.id < leaderId)) {
        bestScore = score;
        leaderId = m.id;
      }
    }

    groups.push({
      id: `group:${memberIds.join(',')}`,
      name: groupName(memberIds),
      memberIds,
      leaderId,
      values,
      tenets: tenetsFor(values),
    });
  }

  // Stable order for deterministic snapshots/UI.
  groups.sort((a, b) => a.id.localeCompare(b.id));

  const relations: GroupRelation[] = [];
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      relations.push({
        a: groups[i].id,
        b: groups[j].id,
        stance: stanceFor(groups[i].values, groups[j].values),
      });
    }
  }

  return { groups, relations };
}
