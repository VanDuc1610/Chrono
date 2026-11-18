import { describe, expect, it } from 'vitest';
import skillsJson from '../public/assets/data/skills.json';
import stringsJson from '../public/assets/data/strings.json';
import {
  absorb,
  assignSlot,
  blinkDistance,
  chainMult,
  chainOrder,
  executes,
  fillSlots,
  skillDamage,
  unlockedSkills,
  type SkillDatabase,
} from '../src/systems/action/AuthorityRules';

const db = skillsJson as SkillDatabase;

describe('Authority skills data', () => {
  it('has one skill per Authority, chapters 1-6, each named and described', () => {
    expect(db.skills.map((s) => s.chapter).sort()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(new Set(db.skills.map((s) => s.authority)).size).toBe(6);
    const strings = (stringsJson as { strings: Record<string, string> }).strings;
    for (const s of db.skills) {
      expect(strings[`skill.${s.id}.name`], s.id).toBeTruthy();
      expect(strings[`skill.${s.id}.desc`], s.id).toBeTruthy();
      expect(s.mpCost).toBeGreaterThan(0);
      expect(s.cooldownMs).toBeGreaterThan(0);
    }
  });
});

describe('Authority skill rules', () => {
  it('unlocks a skill once its chapter is finished', () => {
    expect(unlockedSkills(db, -1)).toEqual([]);
    expect(unlockedSkills(db, 0)).toEqual([]);
    expect(unlockedSkills(db, 1).map((s) => s.id)).toEqual(['continuum_tide']);
    expect(unlockedSkills(db, 9)).toHaveLength(6);
  });

  it('fills empty slots with new skills and clears unknown ones', () => {
    expect(fillSlots([null, null, null], ['a'], 3)).toEqual(['a', null, null]);
    expect(fillSlots(['b', null, null], ['a', 'b'], 3)).toEqual(['b', 'a', null]);
    expect(fillSlots(['x', 'a', null], ['a'], 3)).toEqual([null, 'a', null]);
    expect(fillSlots(['a', 'b', 'c'], ['a', 'b', 'c', 'd'], 3)).toEqual(['a', 'b', 'c']);
  });

  it('swaps when a skill moves to another slot', () => {
    expect(assignSlot(['a', 'b', null], 2, 'a')).toEqual([null, 'b', 'a']);
    expect(assignSlot(['a', 'b', 'c'], 0, 'c')).toEqual(['c', 'b', 'a']);
    expect(assignSlot(['a', 'b', 'c'], 1, null)).toEqual(['a', null, 'c']);
  });

  it('chains to the nearest target, then hop by hop, never twice', () => {
    const targets = [
      { x: 100, y: 0 },
      { x: 30, y: 0 },
      { x: 400, y: 0 },
      { x: 150, y: 0 },
    ];
    expect(chainOrder({ x: 0, y: 0 }, targets, 190, 120, 4)).toEqual([1, 0, 3]);
    expect(chainOrder({ x: 0, y: 0 }, targets, 20, 120, 4)).toEqual([]);
    expect(chainMult(1.4, 0.15, 0)).toBeCloseTo(1.4);
    expect(chainMult(1.4, 0.15, 2)).toBeCloseTo(0.98);
  });

  it('damage has a floor; Finality never executes a boss', () => {
    expect(skillDamage(40, 1.2, 10)).toBe(38);
    expect(skillDamage(5, 1, 50)).toBe(3);
    expect(executes(19, 100, 0.2, false)).toBe(true);
    expect(executes(21, 100, 0.2, false)).toBe(false);
    expect(executes(5, 100, 0.2, true)).toBe(false);
  });

  it("Origin's shield takes the blow first", () => {
    expect(absorb(10, 4)).toEqual({ shield: 6, damage: 0 });
    expect(absorb(10, 14)).toEqual({ shield: 0, damage: 4 });
    expect(absorb(0, 7)).toEqual({ shield: 0, damage: 7 });
  });

  it('the blink stops before a wall', () => {
    expect(blinkDistance(112, () => false)).toBe(112);
    expect(blinkDistance(112, (d) => d > 40)).toBe(40);
    expect(blinkDistance(112, () => true)).toBe(0);
  });
});
