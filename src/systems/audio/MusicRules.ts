export type MusicContext = 'map' | 'menu' | 'battle' | 'boss' | 'finalBoss' | 'story' | 'ending';
export const CHAPTER_TRACKS = [
  'bgm_ch0_prologue',
  'bgm_ch1_sunset',
  'bgm_ch2_empire',
  'bgm_ch3_crypt',
  'bgm_ch4_war',
  'bgm_ch5_garden',
  'bgm_ch6_gods',
  'bgm_ch7_cradle',
  'bgm_ch8_null',
  'bgm_ch9_crown',
] as const;

/** Map prefixes take precedence over a stale caller chapter; context always takes precedence. */
export function chooseTrack(
  mapId: string,
  chapter: number,
  context: MusicContext = 'map',
  ending = 1,
): string {
  switch (context) {
    case 'menu':
      return 'bgm_menu';
    case 'battle':
      return 'bgm_battle';
    case 'boss':
      return 'bgm_boss';
    case 'finalBoss':
      return 'bgm_final';
    case 'story':
      return 'bgm_sad_soliloquy';
    case 'ending':
      return (
        ['bgm_ch2_empire', 'bgm_ending_unbound', 'bgm_ch1_sunset', 'bgm_sad_soliloquy'][
          ending - 1
        ] ?? 'bgm_sad_soliloquy'
      );
    default: {
      const prefix = /^map_ch([1-9])_/.exec(mapId);
      const prologue = [
        'map_peters_room',
        'map_coastal_town',
        'map_shattered_antechamber',
        'map_forgotten_forest',
        'map_old_lighthouse',
      ].includes(mapId);
      const n = prefix ? Number(prefix[1]) : prologue ? 0 : chapter;
      return CHAPTER_TRACKS[Number.isInteger(n) && n >= 0 && n <= 9 ? n : 0];
    }
  }
}
