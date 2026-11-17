import fs from 'node:fs';
import { format } from 'prettier';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Claude can append this to renderCredits before its final Markdown formatting step. */
export async function renderAudioCredits(
  entries = JSON.parse(fs.readFileSync('art-source/audio/manifest.json', 'utf8')),
) {
  let text =
    '## Audio\n\nSource licences are verified against the archived OpenGameArt pages. Prepared excerpts and loop crossfades are modifications; original authors retain copyright.\n\n';
  for (const entry of entries) {
    text += `### ${entry.id}\n\n${entry.attribution}\n\n- Source page: ${entry.pageUrl}\n- Direct file: ${entry.directUrl}\n- Licence: ${entry.license}\n- Status: ${entry.status}\n`;
    if (entry.status === 'kept') text += `- Game file: ${entry.file}\n- SHA-256: ${entry.sha256}\n`;
    text += `\n${entry.notes}\n\n`;
  }
  return format(text, { parser: 'markdown' });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Keep the locked LPC generator/root document untouched until Claude merges this section.
  fs.writeFileSync('art-source/audio/CREDITS.md', await renderAudioCredits());
}
