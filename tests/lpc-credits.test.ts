import { describe, expect, it } from 'vitest';
// @ts-expect-error -- Node audit script without type declarations, like sync-skills.js
import { auditCredits } from '../scripts/lpc/audit.mjs';
import manifest from '../art-source/lpc/manifest.json';

const allowed = new Set([
  'CC-BY-SA-3.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'OGA-SA-3.0',
  'GPL-3.0',
  'GPL-2.0',
  'OGA-BY-3.0',
  'CC0-1.0',
]);
describe('vendored LPC attribution', () => {
  it('covers every PNG and gives each entry authors, licences, provenance and an intact hash', async () => {
    const audit = await auditCredits();
    expect(new Set(manifest.map((entry) => entry.id)).size).toBe(manifest.length);
    expect(new Set(manifest.map((entry) => entry.file)).size).toBe(manifest.length);
    const files = new Set([
      ...manifest.map((entry) => entry.file),
      ...audit.derived.map((entry: { file: string }) => entry.file),
    ]);
    for (const file of audit.pngs) {
      expect(files.has(file), `Missing manifest entry: ${file}`).toBe(true);
    }
    for (const entry of manifest) {
      expect(entry.authors.length).toBeGreaterThan(0);
      expect(entry.authors.every((author) => author.trim().length > 0)).toBe(true);
      expect(entry.licenses.length).toBeGreaterThan(0);
      expect(entry.licenses.every((license) => allowed.has(license))).toBe(true);
      expect(entry.sha).toMatch(/^[a-f0-9]{40}$/);
      expect(entry.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(entry.urls.length).toBeGreaterThan(0);
      const asset = audit.assets.find((asset: { file: string }) => asset.file === entry.file);
      expect(asset.signature).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(asset.hash).toBe(entry.sha256);
    }
  });

  it('traces every derived game asset (T-88) to vendored sources, with an intact hash', async () => {
    const audit = await auditCredits();
    const ids = new Set(manifest.map((entry) => entry.id));
    type Derived = { id: string; file: string; from: string[]; sha256: string; hash: string };
    for (const d of audit.derived as Derived[]) {
      expect(d.file.startsWith('public/assets/lpc/'), d.id).toBe(true);
      expect(d.from.length, d.id).toBeGreaterThan(0);
      for (const id of d.from) expect(ids.has(id), `${d.id} <- ${id}`).toBe(true);
      expect(d.hash, d.id).toBe(d.sha256);
    }
  });

  it('keeps CREDITS.md in sync without writing files', async () => {
    const audit = await auditCredits();
    expect(audit.committed).toBe(audit.rendered);
  });
});
