import { describe, expect, it } from 'vitest';
import { deriveSociety, tenetsFor, type SocialMember } from './society';
import { addAffinity, type RelationshipMap } from './relationships';
import type { ValueAxes } from './values';

const V = (tradition: number, community: number, harmony: number): ValueAxes => ({
  tradition,
  community,
  harmony,
});

function member(id: string, values: ValueAxes): SocialMember {
  return { id, name: id.toUpperCase(), values };
}

describe('tenetsFor', () => {
  it('derives different tenets from opposing values', () => {
    const trad = tenetsFor(V(1, 1, 1));
    const prog = tenetsFor(V(-1, -1, -1));
    expect(trad.culture).not.toEqual(prog.culture);
    expect(trad.belief).not.toEqual(prog.belief);
    expect(trad.law).not.toEqual(prog.law);
  });
});

describe('deriveSociety', () => {
  it('forms a group from members linked above the affinity threshold', () => {
    const members = [member('a', V(0.5, 0.5, 0.5)), member('b', V(0.3, 0.3, 0.3))];
    const rel: RelationshipMap = {};
    addAffinity(rel, 'a', 'b', 20);
    const society = deriveSociety(members, rel, 8);
    expect(society.groups).toHaveLength(1);
    expect(society.groups[0].memberIds).toEqual(['a', 'b']);
  });

  it('does not group members below the threshold', () => {
    const members = [member('a', V(0, 0, 0)), member('b', V(0, 0, 0))];
    const rel: RelationshipMap = {};
    addAffinity(rel, 'a', 'b', 3);
    expect(deriveSociety(members, rel, 8).groups).toHaveLength(0);
  });

  it('elects the most-connected member as leader', () => {
    const members = [member('a', V(0, 0, 0)), member('b', V(0, 0, 0)), member('c', V(0, 0, 0))];
    const rel: RelationshipMap = {};
    addAffinity(rel, 'a', 'b', 10);
    addAffinity(rel, 'a', 'c', 10);
    addAffinity(rel, 'b', 'c', 5);
    const g = deriveSociety(members, rel, 8).groups[0];
    expect(g.leaderId).toBe('a');
  });

  it('marks groups with distant values as rivals', () => {
    const members = [
      member('a', V(1, 1, 1)),
      member('b', V(1, 1, 1)),
      member('c', V(-1, -1, -1)),
      member('d', V(-1, -1, -1)),
    ];
    const rel: RelationshipMap = {};
    addAffinity(rel, 'a', 'b', 20);
    addAffinity(rel, 'c', 'd', 20);
    const society = deriveSociety(members, rel, 8);
    expect(society.groups).toHaveLength(2);
    expect(society.relations).toHaveLength(1);
    expect(society.relations[0].stance).toBe('rival');
  });
});
