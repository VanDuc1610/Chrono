# Audio import and scene handoff (T-97)

## State

Four source tracks are shipped with verified source/output SHA-256 pins: Title Theme, Town Theme RPG, Path to Lake Land and Crystal Cave (song18). Every shipped excerpt decoded successfully in Chromium. Other planned tracks and both SFX packs have confirmed page licences but repeatedly failed file downloads; their manifest entries are explicitly dropped and they use procedural fallback. No licence was inferred from the plan alone.

`license-evidence.json` records the checked page URLs, authors, licences and page hashes. Full downloaded HTML and raw sources are ignored local caches, never executable inputs. `manifest.json` lists every considered source and the reason for each omission.

ffmpeg is unavailable. The installed Python codec environment failed actual encoding, so the import uses Node only and preserves MP3/OGG formats. `prepare-audio.mjs` trims complete MPEG frames or Ogg pages to at most 60 seconds / 2.4 MB. Ogg EOS/checksum is repaired. MusicPlayer overlaps the excerpt tail/head for 1.5 seconds, including non-looping Title Theme. This is an edited excerpt with a crossfade, not a claim of musically perfect original loop points or measured LUFS normalization.

## Reproduce

Run `node scripts/audio/fetch-audio.mjs` to verify committed files without network access. `--pin` fills initially empty pins when importing a source; existing pins are never silently replaced. Missing committed files are regenerated from the exact pinned source and the deterministic Node preparation. Dropped entries are skipped; retrying them requires an explicit manifest review. No archive is executed or automatically extracted.

Run `node scripts/audio/credits.mjs` to generate `art-source/audio/CREDITS.md`. Tests compare this fragment in memory. Root CREDITS.md and the LPC generator remain untouched by owner instruction until Claude merges the section.

## Claude: credits integration still required

The owner chose to keep the T-88 lock on `scripts/lpc/credits.mjs`. Once Claude can update it:

```js
import { renderAudioCredits } from '../audio/credits.mjs';
// Inside renderCredits, before its final Markdown formatting/return:
if (fs.existsSync('art-source/audio/manifest.json')) {
  text += '\n' + (await renderAudioCredits());
}
```

Then run `node scripts/lpc/credits.mjs` and `npx vitest run tests/lpc-credits.test.ts tests/audio-credits.test.ts`. This makes the existing LPC full-document sync test cover the generated audio section too. T-97 must not be marked DONE before this step.

## Claude: preload and runtime API

```ts
import { queueAudio, attachFileSfx } from '../../systems/audio/AudioAssets';
import { MusicPlayer } from '../../systems/audio/MusicPlayer';
// Adjust relative imports to the caller location.
queueAudio(this.load); // PreloadScene.preload, before loader completion
const detachSfx = attachFileSfx(this); // once on a game-lifetime owner after loading
const music = MusicPlayer.fromScene(this); // keep one shared instance across maps
music.playMenu();
music.playForMap(mapId, chapter);
music.playBattle();
music.playBoss(false); // true for final boss
music.playStory();
music.playEnding(1); // 1 order, 2 unbound, 3 true, 4 returned_page
music.stop();
// On final owner/game teardown (not every map transition):
detachSfx();
music.destroy();
```

The manager/cache passed by `fromScene` are game-wide; retain the player across map transitions. Do not create a player per map. The caller owns teardown. Same-track map transitions do not restart playback. Settings changes immediately apply master x music and mute, including fading channels; SFX use master x SFX. Missing cache entries, unavailable sound backends and failed play calls use existing procedural music.

SoundSystem keeps all existing methods. New methods: `playHit`, `playShot`, `playDodge`, `playHurt`, `playPickup`, `playLevelUp`, `playPuzzleSolved`, `playFootstep`, `playDoor`, `playMenuCancel`, `playDialogueBlip`. The latter varies pitch by up to 5%. Until SFX pack downloads succeed these methods synthesize their cues. `attachFileSfx` automatically uses loaded files when present and returns a cleanup function; old cleanup cannot detach a newer adapter.

No scenes were edited in T-97. Scene wiring, runtime calls at battle/story/ending boundaries and UI/event hooks belong to Claude.
