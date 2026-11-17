import Phaser from 'phaser';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';
import { getSettings, updateSettings, type Settings, type TextSpeed } from '../state/Settings';

type Row =
  | { kind: 'volume'; key: 'masterVolume' | 'musicVolume' | 'sfxVolume'; label: string }
  | {
      kind: 'flag';
      key: 'muted' | 'screenShake' | 'reducedFlashes' | 'neonDefault' | 'lightingDefault';
      label: string;
    }
  | { kind: 'speed'; label: string }
  | { kind: 'info'; label: string; value: string };

const SPEEDS: TextSpeed[] = ['instant', 'fast', 'normal'];
const W = 440;
const H = 250;

/**
 * T-96 options (docs/design/SETTINGS_UX.md §2), shared by the title screen and the pause menu:
 * tabs Sound / Display & text / Controls. Keys: Tab, Q/E or ←/→ on the header switch tabs;
 * ↑/↓ choose a row; ←/→ adjust; Enter/Space toggle; ESC closes (changes are stored as they happen).
 * Mouse: click a tab, click a row (a volume bar takes the click position).
 */
export class OptionsPanel {
  private readonly root: Phaser.GameObjects.Container;
  private readonly tabs: Phaser.GameObjects.Text[] = [];
  private readonly lines: Phaser.GameObjects.Text[] = [];
  private readonly bars: Phaser.GameObjects.Graphics;
  private tab = 0;
  private row = 0;
  private readonly onKey: (e: KeyboardEvent) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly t: Translate,
    private readonly controls: string[],
    private readonly onClose: () => void,
    private readonly onChange?: () => void,
  ) {
    const { width, height } = scene.scale;
    const x0 = (width - W) / 2;
    const y0 = (height - H) / 2;
    this.root = scene.add.container(x0, y0).setScrollFactor(0).setDepth(400);
    const shade = scene.add
      .rectangle(-x0, -y0, width, height, 0x000000, 0.55)
      .setOrigin(0)
      .setInteractive();
    this.root.add([shade, createPanel(scene, 0, 0, W, H)]);
    this.root.add(
      scene.add
        .text(W / 2, 12, t('options.title'), { fontSize: '11px', color: '#00d2ff' })
        .setOrigin(0.5, 0),
    );
    ['options.tabSound', 'options.tabDisplay', 'options.tabControls'].forEach((k, i) => {
      const tab = scene.add
        .text(20 + i * 140, 32, t(k), { fontSize: '9px', color: '#8b97b8' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.setTab(i));
      this.tabs.push(tab);
      this.root.add(tab);
    });
    this.bars = scene.add.graphics();
    this.root.add(this.bars);
    for (let i = 0; i < 8; i++) {
      const line = scene.add
        .text(24, 58 + i * 20, '', { fontSize: '9px', color: '#c8d4ec' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', (p: Phaser.Input.Pointer) => this.click(i, p));
      this.lines.push(line);
      this.root.add(line);
    }
    this.root.add(
      scene.add
        .text(W / 2, H - 16, t('options.hint'), { fontSize: '7px', color: '#6f7da3' })
        .setOrigin(0.5, 0),
    );
    // The key that opened the panel must not also act inside it: listen from the next frame.
    this.onKey = (e) => this.key(e);
    scene.time.delayedCall(1, () => {
      if (this.root.active) scene.input.keyboard?.on('keydown', this.onKey);
    });
    this.draw();
  }

  private get rows(): Row[] {
    const t = this.t;
    if (this.tab === 0)
      return [
        { kind: 'volume', key: 'masterVolume', label: t('options.master') },
        { kind: 'volume', key: 'musicVolume', label: t('options.music') },
        { kind: 'volume', key: 'sfxVolume', label: t('options.sfx') },
        { kind: 'flag', key: 'muted', label: t('options.muted') },
        { kind: 'info', label: t('options.language'), value: t('options.languageValue') },
      ];
    if (this.tab === 1)
      return [
        { kind: 'speed', label: t('options.textSpeed') },
        { kind: 'flag', key: 'screenShake', label: t('options.shake') },
        { kind: 'flag', key: 'reducedFlashes', label: t('options.flashes') },
        { kind: 'flag', key: 'neonDefault', label: t('options.neon') },
        { kind: 'flag', key: 'lightingDefault', label: t('options.lighting') },
      ];
    return this.controls.slice(0, 8).map((c) => ({ kind: 'info', label: c, value: '' }));
  }

  public setTab(i: number): void {
    this.tab = (i + 3) % 3;
    this.row = 0;
    this.draw();
  }

  private key(e: KeyboardEvent): void {
    const k = e.key;
    if (k === 'Escape') return this.close();
    if (k === 'Tab' || k === 'q' || k === 'Q') {
      e.preventDefault?.();
      return this.setTab(this.tab + (k === 'q' || k === 'Q' ? -1 : 1));
    }
    if (k === 'e' || k === 'E') return this.setTab(this.tab + 1);
    const rows = this.rows;
    if (k === 'ArrowUp' || k === 'w' || k === 'W')
      this.row = (this.row + rows.length - 1) % rows.length;
    else if (k === 'ArrowDown' || k === 's' || k === 'S') this.row = (this.row + 1) % rows.length;
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.adjust(-1);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D' || k === 'Enter' || k === ' ')
      this.adjust(1);
    else return;
    this.draw();
  }

  private adjust(dir: number, at?: number): void {
    const r = this.rows[this.row];
    if (!r) return;
    const s = getSettings();
    if (r.kind === 'volume')
      updateSettings({ [r.key]: at ?? Math.round((s[r.key] + dir * 0.1) * 10) / 10 });
    else if (r.kind === 'flag') updateSettings({ [r.key]: !s[r.key] });
    else if (r.kind === 'speed') {
      const i = SPEEDS.indexOf(s.textSpeed);
      updateSettings({ textSpeed: SPEEDS[(i + dir + SPEEDS.length) % SPEEDS.length] });
    } else return;
    this.onChange?.();
  }

  private click(i: number, p: Phaser.Input.Pointer): void {
    if (i >= this.rows.length) return;
    this.row = i;
    const r = this.rows[i];
    if (r.kind === 'volume') {
      // The bar spans x 200..340 inside the panel.
      const local = p.x - this.root.x - 200;
      this.adjust(0, Math.round(Phaser.Math.Clamp(local / 140, 0, 1) * 10) / 10);
    } else this.adjust(1);
    this.draw();
  }

  private value(r: Row, s: Settings): string {
    const t = this.t;
    if (r.kind === 'volume') return `${Math.round(s[r.key] * 100)}%`;
    if (r.kind === 'flag') return s[r.key] ? t('options.on') : t('options.off');
    if (r.kind === 'speed') return t(`options.speed.${s.textSpeed}`);
    return r.value;
  }

  private draw(): void {
    const s = getSettings();
    const rows = this.rows;
    this.tabs.forEach((tab, i) => tab.setColor(i === this.tab ? '#ffe08a' : '#8b97b8'));
    this.bars.clear();
    this.lines.forEach((line, i) => {
      const r = rows[i];
      if (!r) return void line.setText('');
      const sel = i === this.row && this.tab < 2;
      const label = `${sel ? '▶ ' : '  '}${r.label}`;
      line.setText(
        r.kind === 'info' && this.tab === 2 ? r.label : `${label.padEnd(30)}${this.value(r, s)}`,
      );
      line.setColor(sel ? '#ffffff' : r.kind === 'info' ? '#8b97b8' : '#c8d4ec');
      if (r.kind === 'volume') {
        const y = 58 + i * 20 + 5;
        this.bars.fillStyle(0x05060c, 1).fillRect(199, y - 1, 142, 7);
        this.bars.fillStyle(sel ? 0x00d2ff : 0x4a7fb0, 1).fillRect(200, y, 140 * s[r.key], 5);
        line.setText(`${label.padEnd(52)}${this.value(r, s)}`);
      }
    });
  }

  public close(): void {
    SoundSystem.getInstance().playMenuCancel();
    this.scene.input.keyboard?.off('keydown', this.onKey);
    this.root.destroy();
    this.onClose();
  }
}
