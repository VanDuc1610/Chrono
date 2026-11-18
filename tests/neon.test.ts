import { describe, expect, it } from 'vitest';
import neonJson from '../public/assets/data/neon.json';
import mapsJson from '../public/assets/data/maps.json';

describe('neon accents data', () => {
  const maps = (mapsJson as unknown as { maps: Record<string, unknown> }).maps;
  const neon = (neonJson as unknown as { maps: Record<string, { accent: string }> }).maps;
  it('names every real map once, each with an accent colour', () => {
    expect(Object.keys(neon).sort()).toEqual(Object.keys(maps).sort());
    for (const [id, d] of Object.entries(neon)) expect(d.accent, id).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
