/** Where the story continues after each end card (none = back to the title). */
export const NEXT_START: Record<number, { mapId: string; spawnId: string }> = {
  0: { mapId: 'map_ch1_shore_gate', spawnId: 'from_prologue' },
  1: { mapId: 'map_ch2_imperial_outskirts', spawnId: 'from_ch1' },
  2: { mapId: 'map_ch3_sepulcher_gate', spawnId: 'from_ch2' },
  3: { mapId: 'map_ch4_encampment_veridia', spawnId: 'from_ch3' },
  4: { mapId: 'map_ch5_interval_shore', spawnId: 'from_ch4' },
  5: { mapId: 'map_ch6_celestial_stairs', spawnId: 'from_ch5' },
  6: { mapId: 'map_ch7_ash_abyss_drop', spawnId: 'from_ch6' },
  7: { mapId: 'map_ch8_null_rift_landing', spawnId: 'from_ch7' },
  8: { mapId: 'map_ch9_apex_nexus', spawnId: 'from_ch8' },
};
