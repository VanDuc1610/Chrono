import { describe, expect, it } from 'vitest';
import atmosphereJson from '../public/assets/data/atmosphere.json';
import mapsJson from '../public/assets/data/maps.json';

/** Map atmosphere (lights, darkness, motes): every entry names a real map with sane values. */
const maps = (mapsJson as unknown as { maps: Record<string, unknown> }).maps;
type Light = { color: string; radius: number; intensity: number };
type Def = {
  shade?: { color: string; alpha: number };
  peterLight?: Light;
  poiLight?: Light;
  lights?: (Light & { tile: { x: number; y: number } })[];
  vignette?: number;
};
const atmos = (atmosphereJson as unknown as { maps: Record<string, Def> }).maps;

describe('map atmosphere', () => {
  it('only describes maps that exist, with values in range', () => {
    expect(Object.keys(atmos).length).toBeGreaterThan(0);
    for (const [id, d] of Object.entries(atmos)) {
      expect(maps[id], id).toBeDefined();
      if (d.shade) expect(d.shade.alpha).toBeGreaterThanOrEqual(0);
      if (d.shade) expect(d.shade.alpha).toBeLessThanOrEqual(0.85);
      if (d.vignette !== undefined) expect(d.vignette).toBeLessThanOrEqual(1);
      for (const l of [d.peterLight, d.poiLight, ...(d.lights ?? [])].filter(Boolean) as Light[]) {
        expect(l.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(l.radius).toBeGreaterThan(0);
        expect(l.intensity).toBeGreaterThan(0);
      }
    }
  });
});
