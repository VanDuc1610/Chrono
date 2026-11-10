/**
 * Procedural Web Audio Sound System for CHRONO.
 * Generates 16-bit retro style sound effects dynamically using Web Audio API synthesis.
 * Zero external asset dependencies, 100% original synthesis.
 */

export class SoundSystem {
  private static instance: SoundSystem | null = null;
  private ctx: AudioContext | null = null;
  private sfxVolume = 0.6;
  private masterVolume = 0.8;
  private isMuted = false;

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
            masterVolume: this.masterVolume,
            isMuted: this.isMuted,
          })
        );
      }
    } catch {
      // ignore
    }
  }

  public getEffectiveVolume(): number {
    return this.isMuted ? 0 : this.masterVolume * this.sfxVolume;
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * UI Navigation Cursor Blip: Crisp 8-bit blip (800Hz -> 1200Hz, 35ms)
   */
  public playCursorBlip(): void {
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

