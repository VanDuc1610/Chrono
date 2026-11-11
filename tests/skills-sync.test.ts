import { describe, expect, it } from 'vitest';
// @ts-expect-error -- plain JS build script without type declarations
import { diffSkills } from '../scripts/sync-skills.js';

describe('agent skills', () => {
  it('.claude/skills is an exact copy of .agents/skills (run `node scripts/sync-skills.js`)', () => {
    expect(diffSkills()).toEqual([]);
  });
});
