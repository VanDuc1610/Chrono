import { describe, expect, it } from 'vitest';
// @ts-expect-error -- local Node audit helper, as in the LPC audit tests
import { auditAudio } from '../scripts/audio/audit.mjs';

interface Entry {
  id: string;
  file: string;
  status: string;
  author: string;
  license: string;
  attribution: string;
  pageUrl: string;
  directUrl: string;
  sha256: string;
  sourceSha256: string;
}
interface Asset {
  id: string;
  sha256: string;
  size: number;
}
describe('vendored audio', () => {
  it('covers every shipped file with licence, authorship and intact pins', async () => {
    const audit = await auditAudio();
    const entries: Entry[] = audit.entries;
    const assets: Asset[] = audit.assets;
    const kept = entries.filter((e) => e.status === 'kept');
    expect(kept.length).toBeGreaterThan(0);
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    expect([...audit.files].sort()).toEqual(kept.map((e) => e.file).sort());
    for (const entry of entries) {
      expect(entry.author.trim()).not.toBe('');
      expect(['CC0-1.0', 'CC-BY-3.0', 'CC-BY-4.0', 'OGA-BY-3.0']).toContain(entry.license);
      expect(entry.attribution).toContain(entry.author);
      expect(entry.pageUrl).toMatch(/^https:\/\/opengameart.org\/content\//);
      expect(entry.directUrl).toMatch(/^https:\/\/opengameart.org\/sites\/default\/files\//);
    }
    for (const entry of kept) {
      const asset = assets.find((a) => a.id === entry.id);
      expect(entry.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset?.sha256).toBe(entry.sha256);
      expect(asset?.size).toBeLessThan(2500000);
    }
  });
  it('generates the handoff credits fragment deterministically', async () => {
    const audit = await auditAudio();
    expect(audit.committedCredits).toBe(audit.credits);
  });
});
