import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { format } from 'prettier';

export async function renderCredits(entries, derived = []) {
  let text =
    '# LPC art credits\n\nVendored source art, and the game assets derived from it (listed last).\n\n';
  text +=
    'LPC sources offer CC-BY-SA 3.0 / GPL 3.0 and, for some components, CC-BY 3.0 / OGA-BY 3.0 or the other licences listed below. These are component-specific alternatives, not blanket permission to relicense a combined sheet. Modified sprites remain under the applicable source licence, including its attribution and share-alike requirements. See each source credit record for details.\n\n';
  for (const repo of [...new Set(entries.map((entry) => entry.repo))].sort()) {
    text += `## ${repo}\n\n`;
    for (const entry of entries.filter((entry) => entry.repo === repo)) {
      text += `### ${entry.id}\n\n- File: ${entry.file}\n- Source: https://github.com/${repo}/blob/${entry.sha}/${entry.path.split('/').map(encodeURIComponent).join('/')}\n- Authors: ${entry.authors.join('; ')}\n- Licences: ${entry.licenses.join(', ')}\n`;
      for (const url of entry.urls) text += `- ${url}\n`;
      text += `\n${entry.notes}\n\n`;
    }
  }
  // T-88: game assets cut or recoloured from the sources above, with every source's authors.
  if (derived.length > 0) {
    text += '## Game assets derived from the sources above\n\n';
    for (const d of derived) {
      const sources = d.from.map((id) => entries.find((entry) => entry.id === id));
      const authors = [...new Set(sources.flatMap((entry) => entry?.authors ?? []))];
      const licences = [...new Set(sources.flatMap((entry) => entry?.licenses ?? []))];
      text += `### ${d.id}\n\n- File: ${d.file}\n- Made by: ${d.script}\n- From: ${d.from.join(', ')}\n- Authors: ${authors.join('; ')}\n- Licences: ${licences.join(', ')}\n\n${d.notes}\n\n`;
    }
  }
  return format(text, { parser: 'markdown' });
}

/** Derived game assets (art-source/lpc/derived.json), or none. */
export function readDerived() {
  const file = 'art-source/lpc/derived.json';
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entries = JSON.parse(fs.readFileSync('art-source/lpc/manifest.json', 'utf8'));
  fs.writeFileSync('CREDITS.md', await renderCredits(entries, readDerived()));
}
