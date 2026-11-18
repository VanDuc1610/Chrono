import { describe, expect, it } from 'vitest';
import manifest from '../art-source/audio/manifest.json';
import skills from '../public/assets/data/skills.json';

const kept = new Map(
  (manifest as { id: string; status: string; file: string }[])
    .filter((e) => e.status === 'kept')
    .map((e) => [e.id, e.file]),
);

// Files themselves are verified against their pinned SHA-256 by scripts/audio/fetch-audio.mjs.
describe('skill and gear sounds', () => {
  it('gives every Authority skill its own shipped sound', () => {
    for (const s of (skills as { skills: { authority: string }[] }).skills) {
      const file = kept.get(`sfx_skill_${s.authority}`);
      expect(file, s.authority).toBeTruthy();
      expect(file).toMatch(/^public\/assets\/audio\/sfx\/.+\.wav$/);
    }
  });

  it('ships the crit, equip and set sounds', () => {
    for (const id of ['sfx_crit', 'sfx_equip_weapon', 'sfx_equip_gear', 'sfx_set_bonus']) {
      expect(kept.has(id), id).toBe(true);
    }
  });
});
