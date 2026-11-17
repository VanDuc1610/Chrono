import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { renderAudioCredits } from './credits.mjs';

export async function auditAudio() {
  const entries = JSON.parse(fs.readFileSync('art-source/audio/manifest.json', 'utf8'));
  // Music and sound effects (T-97); the old placeholder at the folder root is not shipped audio.
  const files = ['bgm', 'sfx'].flatMap((dir) => {
    const d = `public/assets/audio/${dir}`;
    return fs.existsSync(d) ? fs.readdirSync(d).map((f) => `${d}/${f}`) : [];
  });
  return {
    entries,
    files,
    assets: entries
      .filter((e) => e.status === 'kept')
      .map((e) => {
        const bytes = fs.readFileSync(e.file);
        return {
          id: e.id,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          size: bytes.length,
        };
      }),
    credits: await renderAudioCredits(entries),
    committedCredits: fs.readFileSync('art-source/audio/CREDITS.md', 'utf8'),
  };
}
