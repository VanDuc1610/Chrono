import { getSettings } from '../../state/Settings';
/**
 * Procedural Web Audio Sound System for CHRONO.
 * Generates 16-bit retro style sound effects and looping background music dynamically
 * using Web Audio API synthesis.
 * Original synthesis remains available when the optional vendored audio adapter has no file.
 */

export type BgmTheme = 'none' | 'ambient' | 'battle';

interface ActiveBgmChannel {
  theme: BgmTheme;
  masterGain: GainNode;
  filterNode: BiquadFilterNode;
  oscillators: Set<OscillatorNode>;
  nodes: Set<AudioNode>;
  timerId: ReturnType<typeof setInterval> | null;
  fadeTimeoutId: ReturnType<typeof setTimeout> | null;
  stepIndex: number;
  disposed: boolean;
}

export class SoundSystem {
  private static instance: SoundSystem | null = null;
  private ctx: AudioContext | null = null;
  private fileSfx: ((id: string, rate: number) => boolean) | null = null;
  private blipIndex = 0;
  /** Scene adapter returns false for unavailable files, preserving procedural fallback. */
  public setFileSfxPlayer(player: ((id: string, rate: number) => boolean) | null): () => void {
    this.fileSfx = player;
    return () => {
      if (this.fileSfx === player) this.fileSfx = null;
    };
  }
  private tryFileSfx(id: string, rate = 1): boolean {
    this.applySettings(getSettings());
    if (!this.fileSfx) return false;
    try {
      return this.fileSfx(id, rate);
    } catch {
      return false;
    }
  }
  private playEvent(id: string, frequency: number, duration = 0.08, rate = 1): void {
    if (this.tryFileSfx(id, rate)) return;
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const at = ctx.currentTime;
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency * rate, at);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency / 2), at + duration);
    gain.gain.setValueAtTime(Math.max(0.0001, this.getEffectiveVolume() * 0.25), at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(at);
    oscillator.stop(at + duration);
  }
  public playHit(): void {
    this.playEvent('sfx_hit', 160);
  }
  public playShot(): void {
    this.playEvent('sfx_shot', 880);
  }
  public playDodge(): void {
    this.playEvent('sfx_dodge', 320);
  }
  public playHurt(): void {
    this.playEvent('sfx_hurt', 100);
  }
  public playPickup(): void {
    this.playEvent('sfx_pickup', 740, 0.14);
  }
  public playLevelUp(): void {
    this.playEvent('sfx_level_up', 1046, 0.3);
  }
  public playPuzzleSolved(): void {
    this.playEvent('sfx_puzzle_solved', 660, 0.3);
  }
  public playFootstep(): void {
    this.playEvent('sfx_footstep', 70, 0.04);
  }
  public playDoor(): void {
    this.playEvent('sfx_door', 110, 0.2);
  }
  public playMenuCancel(): void {
    this.playEvent('sfx_menu_cancel', 220);
  }
  /**
   * An Authority skill (owner, 2026-11-18: each skill its own sound). Continuum's swing plays slow
   * and deep like a breaking wave; the synth fallback gives each Authority its own pitch.
   */
  public playSkill(authority: string): void {
    const tone: Record<string, [number, number, number]> = {
      continuum: [180, 0.3, 0.7],
      causality: [1320, 0.12, 1],
      memory: [520, 0.35, 1],
      finality: [140, 0.3, 1],
      possibility: [880, 0.2, 1],
      origin: [1046, 0.4, 1],
    };
    const [freq, dur, rate] = tone[authority] ?? [440, 0.15, 1];
    this.playEvent(`sfx_skill_${authority}`, freq, dur, rate);
  }

  public playCrit(): void {
    this.playEvent('sfx_crit', 1200, 0.06);
  }

  /** Gear put on: a blade drawn for weapons, armour and cloth for the rest. */
  public playEquip(weapon: boolean): void {
    if (weapon) this.playEvent('sfx_equip_weapon', 600, 0.12);
    else this.playEvent('sfx_equip_gear', 300, 0.12);
  }

  /** A gear set bonus was just reached. */
  public playSetBonus(): void {
    this.playEvent('sfx_set_bonus', 1318, 0.3);
  }

  public playDialogueBlip(): void {
    this.playEvent('sfx_dialogue_blip', 440, 0.025, 0.95 + (this.blipIndex++ % 3) * 0.05);
  }

  private sfxVolume = 0.6;
  private bgmVolume = 0.42;
  private masterVolume = 0.8;
  private isMuted = false;

  private activeBgm: ActiveBgmChannel | null = null;
  private fadingBgmChannels: Set<ActiveBgmChannel> = new Set();

  private constructor() {
    this.loadSettings();
    if (typeof window !== 'undefined') {
      (window as unknown as { __SOUND_SYSTEM__: SoundSystem }).__SOUND_SYSTEM__ = this;
    }
  }

  public static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private loadSettings(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('chrono_audio_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.sfxVolume = parsed.sfxVolume ?? 0.6;
          this.bgmVolume = parsed.bgmVolume ?? 0.42;
          this.masterVolume = parsed.masterVolume ?? 0.8;
          this.isMuted = parsed.isMuted ?? false;
        }
      }
    } catch {
      // ignore
    }
  }

  public saveSettings(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          'chrono_audio_settings',
          JSON.stringify({
            sfxVolume: this.sfxVolume,
            bgmVolume: this.bgmVolume,
            masterVolume: this.masterVolume,
            isMuted: this.isMuted,
          }),
        );
      }
    } catch {
      // ignore
    }
  }

  public getEffectiveVolume(): number {
    return this.isMuted ? 0 : this.masterVolume * this.sfxVolume;
  }

  public getEffectiveBgmVolume(): number {
    return this.isMuted ? 0 : this.masterVolume * this.bgmVolume;
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
    this.updateActiveBgmVolume();
  }

  public setBgmVolume(vol: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
    this.updateActiveBgmVolume();
  }

  /** T-96: the player's settings (src/state/Settings.ts) are the source of truth for volumes. */
  public applySettings(s: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  }): void {
    this.masterVolume = Math.max(0, Math.min(1, s.masterVolume));
    this.bgmVolume = Math.max(0, Math.min(1, s.musicVolume));
    this.sfxVolume = Math.max(0, Math.min(1, s.sfxVolume));
    this.isMuted = s.muted;
    this.updateActiveBgmVolume();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    this.updateActiveBgmVolume();
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentBgmTheme(): BgmTheme {
    return this.activeBgm && !this.activeBgm.disposed ? this.activeBgm.theme : 'none';
  }

  /**
   * Returns total count of live BGM oscillators + fading channels for leak verification.
   */
  public getActiveBgmNodeCount(): number {
    let count = 0;
    if (this.activeBgm && !this.activeBgm.disposed) {
      count += this.activeBgm.oscillators.size + this.activeBgm.nodes.size;
    }
    this.fadingBgmChannels.forEach((ch) => {
      if (!ch.disposed) {
        count += ch.oscillators.size + ch.nodes.size;
      }
    });
    return count;
  }

  private updateActiveBgmVolume(): void {
    if (!this.ctx || !this.activeBgm || this.activeBgm.disposed) return;
    const now = this.ctx.currentTime;
    const targetGain = Math.max(0.0001, this.getEffectiveBgmVolume());
    try {
      this.activeBgm.masterGain.gain.cancelScheduledValues(now);
      this.activeBgm.masterGain.gain.setValueAtTime(
        Math.max(0.0001, this.activeBgm.masterGain.gain.value),
        now,
      );
      this.activeBgm.masterGain.gain.linearRampToValueAtTime(
        this.isMuted ? 0.0001 : targetGain,
        now + 0.08,
      );
    } catch {
      // ignore
    }
  }

  /**
   * Starts or crossfades to the specified procedural BGM loop.
   * - 'ambient': Slow, dark, ethereal ruin theme for MainMenuScene & ExplorationScene.
   * - 'battle': Faster, tense tactical theme (boss fights).
   */
  public startBgm(theme: 'ambient' | 'battle', crossfadeMs = 450): void {
    const ctx = this.initContext();
    if (!ctx) return;

    // Clean up any previously fading channels immediately so rapid scene re-entry never accumulates nodes
    if (this.fadingBgmChannels.size > 0) {
      for (const ch of Array.from(this.fadingBgmChannels)) {
        this.disposeBgmChannel(ch);
      }
    }

    // Fade out and dispose existing active BGM channel
    if (this.activeBgm) {
      const outgoing = this.activeBgm;
      this.activeBgm = null;
      this.fadeOutAndDisposeChannel(outgoing, crossfadeMs);
    }

    const masterGain = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(theme === 'ambient' ? 920 : 1650, ctx.currentTime);
    filterNode.Q.value = theme === 'ambient' ? 1.2 : 2.0;

    const now = ctx.currentTime;
    const targetVol = this.getEffectiveBgmVolume();
    masterGain.gain.setValueAtTime(0.0001, now);
    if (!this.isMuted && targetVol > 0.0001) {
      masterGain.gain.linearRampToValueAtTime(targetVol, now + Math.max(0.05, crossfadeMs / 1000));
    }

    filterNode.connect(masterGain);
    masterGain.connect(ctx.destination);

    const channel: ActiveBgmChannel = {
      theme,
      masterGain,
      filterNode,
      oscillators: new Set(),
      nodes: new Set([masterGain, filterNode]),
      timerId: null,
      fadeTimeoutId: null,
      stepIndex: 0,
      disposed: false,
    };

    this.activeBgm = channel;

    if (theme === 'ambient') {
      this.setupAmbientRuinChannel(ctx, channel);
    } else {
      this.setupBattleChannel(channel);
    }
  }

  /**
   * Stops and disconnects all BGM oscillators, timers, and audio nodes immediately or after a short fade.
   * Safe to call on scene shutdown to prevent leaked audio nodes across scene transitions.
   */
  public stopBgm(immediate = true, fadeMs = 180): void {
    for (const ch of Array.from(this.fadingBgmChannels)) {
      this.disposeBgmChannel(ch);
    }
    if (!this.activeBgm) return;

    const current = this.activeBgm;
    this.activeBgm = null;

    if (immediate) {
      this.disposeBgmChannel(current);
    } else {
      this.fadeOutAndDisposeChannel(current, fadeMs);
    }
  }

  private fadeOutAndDisposeChannel(channel: ActiveBgmChannel, fadeMs: number): void {
    if (channel.disposed) return;

    if (channel.timerId !== null) {
      clearInterval(channel.timerId);
      channel.timerId = null;
    }

    if (!this.ctx || fadeMs <= 0) {
      this.disposeBgmChannel(channel);
      return;
    }

    this.fadingBgmChannels.add(channel);
    const now = this.ctx.currentTime;
    const fadeSec = Math.max(0.04, fadeMs / 1000);
    try {
      channel.masterGain.gain.cancelScheduledValues(now);
      channel.masterGain.gain.setValueAtTime(Math.max(0.0001, channel.masterGain.gain.value), now);
      channel.masterGain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
    } catch {
      // ignore
    }

    channel.fadeTimeoutId = setTimeout(() => {
      this.disposeBgmChannel(channel);
    }, fadeMs + 25);
  }

  private disposeBgmChannel(channel: ActiveBgmChannel): void {
    if (channel.disposed) return;
    channel.disposed = true;
    this.fadingBgmChannels.delete(channel);

    if (channel.timerId !== null) {
      clearInterval(channel.timerId);
      channel.timerId = null;
    }
    if (channel.fadeTimeoutId !== null) {
      clearTimeout(channel.fadeTimeoutId);
      channel.fadeTimeoutId = null;
    }

    for (const osc of Array.from(channel.oscillators)) {
      try {
        osc.onended = null;
        osc.stop();
      } catch {
        // ignore if already stopped
      }
      try {
        osc.disconnect();
      } catch {
        // ignore
      }
    }
    channel.oscillators.clear();

    for (const node of Array.from(channel.nodes)) {
      try {
        node.disconnect();
      } catch {
        // ignore
      }
    }
    channel.nodes.clear();
  }

  /**
   * Ambient Ruin Theme (MainMenu + Exploration):
   * Slow, dark, ethereal C-minor / Dorian modal pad drone + crystalline bell arpeggios.
   */
  private setupAmbientRuinChannel(ctx: AudioContext, channel: ActiveBgmChannel): void {
    const now = ctx.currentTime;

    // Sustained sub-drone oscillators (C2 = 65.41 Hz, G2 = 98.00 Hz)
    const droneFreqs = [65.41, 98.0];
    droneFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(idx === 0 ? 0.14 : 0.07, now);

      osc.connect(gain);
      gain.connect(channel.filterNode);

      channel.oscillators.add(osc);
      channel.nodes.add(gain);
      osc.start(now);
    });

    // Original slow, dark, ethereal 12-step motif (C minor / flat-6 modal intervals)
    const motifNotes = [
      261.63, // C4
      311.13, // Eb4
      392.0, // G4
      349.23, // F4
      293.66, // D4
      311.13, // Eb4
      415.3, // Ab4
      392.0, // G4
      261.63, // C4
      246.94, // B3
      293.66, // D4
      196.0, // G3
    ];

    const triggerStep = () => {
      if (channel.disposed || !this.ctx) return;
      const step = channel.stepIndex % motifNotes.length;
      channel.stepIndex++;

      const freq = motifNotes[step];
      this.scheduleTrackedNote(this.ctx, channel, freq, 'sine', 0.13, 0.04, 0.52);

      // Subtle ethereal fifth shimmer every 4th step
      if (step % 4 === 0) {
        this.scheduleTrackedNote(this.ctx, channel, freq * 1.5, 'triangle', 0.055, 0.08, 0.65);
      }
    };

    triggerStep();
    channel.timerId = setInterval(triggerStep, 580);
  }

  /**
   * Battle Theme (Combat):
   * Faster, tense tactical pulse with driving bass ostinato and sharp Phrygian/diminished accents.
   */
  private setupBattleChannel(channel: ActiveBgmChannel): void {
    const bassOstinato = [
      110.0, // A2
      110.0, // A2
      130.81, // C3
      110.0, // A2
      116.54, // Bb2
      110.0, // A2
      146.83, // D3
      138.59, // C#3
    ];

    const leadMotif = [
      220.0, // A3
      0,
      261.63, // C4
      293.66, // D4
      311.13, // Eb4
      293.66, // D4
      233.08, // Bb3
      196.0, // G3
      220.0, // A3
      0,
      329.63, // E4
      311.13, // Eb4
      293.66, // D4
      261.63, // C4
      233.08, // Bb3
      246.94, // B3
    ];

    const triggerStep = () => {
      if (channel.disposed || !this.ctx) return;
      const step = channel.stepIndex;
      channel.stepIndex++;

      const bassFreq = bassOstinato[step % bassOstinato.length];
      this.scheduleTrackedNote(this.ctx, channel, bassFreq, 'sawtooth', 0.14, 0.01, 0.15);

      const leadFreq = leadMotif[step % leadMotif.length];
      if (leadFreq > 0) {
        this.scheduleTrackedNote(this.ctx, channel, leadFreq, 'triangle', 0.12, 0.01, 0.17);
      }
    };

    triggerStep();
    channel.timerId = setInterval(triggerStep, 185);
  }

  private scheduleTrackedNote(
    ctx: AudioContext,
    channel: ActiveBgmChannel,
    freq: number,
    type: OscillatorType,
    peakGain: number,
    attackSec: number,
    durationSec: number,
  ): void {
    if (channel.disposed) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(peakGain, now + attackSec);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(noteGain);
    noteGain.connect(channel.filterNode);

    channel.oscillators.add(osc);
    channel.nodes.add(noteGain);

    const cleanup = () => {
      channel.oscillators.delete(osc);
      channel.nodes.delete(noteGain);
      try {
        osc.disconnect();
      } catch {
        // ignore
      }
      try {
        noteGain.disconnect();
      } catch {
        // ignore
      }
    };

    osc.onended = cleanup;
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  /**
   * UI Navigation Cursor Blip: Crisp 8-bit blip (800Hz -> 1200Hz, 35ms)
   */
  public playCursorBlip(): void {
    if (this.tryFileSfx('sfx_menu_move')) return;
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const vol = this.getEffectiveVolume() * 0.25;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  /**
   * Confirmation / Selection Chime: Rising two-tone interval (523Hz -> 659Hz, 90ms)
   */
  public playSelect(): void {
    if (this.tryFileSfx('sfx_menu_select')) return;
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const vol = this.getEffectiveVolume() * 0.35;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.045); // E5

    osc2.frequency.setValueAtTime(261.63, now); // C4
    osc2.frequency.setValueAtTime(329.63, now + 0.045);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.12);
    osc2.stop(now + 0.12);
  }

  /**
   * Blade Attack Slash: White noise burst with lowpass filter sweep
   */
  public playSlash(): void {
    if (this.tryFileSfx('sfx_slash')) return;
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const vol = this.getEffectiveVolume() * 0.45;
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.12);
  }

  /**
   * Healing / Chrono Shard restoration: Harmonic ascending triad (E4 -> G#4 -> B4)
   */
  public playHeal(): void {
    if (this.tryFileSfx('sfx_heal')) return;
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const vol = this.getEffectiveVolume() * 0.3;
    const now = ctx.currentTime;
    const freqs = [329.63, 415.3, 493.88]; // E major triad

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  /**
   * Chrono Save Chime: Shimmering 4-note temporal chord
   */
  public playSaveChime(): void {
    if (this.tryFileSfx('sfx_save')) return;
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const vol = this.getEffectiveVolume() * 0.35;
    const now = ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880]; // A major shimmering chime

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }
}
