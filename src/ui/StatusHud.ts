import Phaser from 'phaser';
import { SoundSystem } from '../systems/audio/SoundSystem';
import type { GameSession } from '../state/GameSession';
import { createPanel } from './Panel';
import type { Translate } from './Strings';
import { controlList } from './controlList';

// T-91 compact HUD: a small panel, slim bars with their numbers, a hairline of EXP.
// Sized for the readable UI font (2026-11-18): the numbers sit right of the bars, never on them.
const PANEL = { x: 8, y: 8, w: 214, h: 60 };
const BAR_X = 38;
const BAR_W = 116;
const HP_Y = 33;
const MP_Y = 46;
const EXP_Y = 61;

/**
 * Top-left status: place and level, HP and MP bars with their values, an EXP hairline; the key
 * list (H) and the quick slots at the bottom. The bars glide to their new value, a pale trail
 * shows what a blow just took, and a level up pops a banner (the scene adds light and chime).
 */
export class StatusHud {
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly mpText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;
  /** The key list (H): a backdrop, two columns and a footer (a proportional font: no padding). */
  private readonly controls: Phaser.GameObjects.Container;
  private readonly controlsBg: Phaser.GameObjects.Rectangle;
  private readonly controlsCols: [Phaser.GameObjects.Text, Phaser.GameObjects.Text];
  private readonly controlsFoot: Phaser.GameObjects.Text;
  private readonly controlsHint: Phaser.GameObjects.Text;
  private readonly quick: Phaser.GameObjects.Text;
  private readonly bars: Phaser.GameObjects.Graphics;
  /** Shown values (0-1): the bar, and the trail that follows it down; EXP progress. */
  private readonly shown = { hp: 1, hpTrail: 1, mp: 1, exp: 0 };
  private lastLevel: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly t: Translate,
    locationName: string,
    /** 0 = Prologue (the chapter now shows on the arrival banner). */
    _chapter = 0,
    private readonly onLevelUp?: (level: number) => void,
  ) {
    createPanel(scene, PANEL.x, PANEL.y, PANEL.w, PANEL.h).setScrollFactor(0).setDepth(90);
    const text = (x: number, y: number, value: string, size: string, color: string) =>
      scene.add
        .text(x, y, value, { fontFamily: 'monospace', fontSize: size, color })
        .setScrollFactor(0)
        .setDepth(95);
    const right = PANEL.x + PANEL.w - 8;
    text(16, 12, locationName, '9px', '#65d5ff');
    this.levelText = text(right, 12, '', '9px', '#ffe08a').setOrigin(1, 0);
    text(16, HP_Y + 2, 'HP', '8px', '#8b97b8').setOrigin(0, 0.5);
    text(16, MP_Y + 1, 'MP', '8px', '#8b97b8').setOrigin(0, 0.5);
    this.hpText = text(right, HP_Y + 2, '', '8px', '#e4ebf5').setOrigin(1, 0.5);
    this.mpText = text(right, MP_Y + 1, '', '8px', '#b8d8ff').setOrigin(1, 0.5);
    this.bars = scene.add.graphics().setScrollFactor(0).setDepth(95);

    // The full key list stays out of the way: a hint, and H opens it.
    const { width, height } = scene.scale;
    this.controlsHint = scene.add
      .text(10, height - 18, t('hud.controlsHint'), {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#7d8bb0',
        backgroundColor: '#07080fb0',
        padding: { left: 4, right: 4, top: 2, bottom: 2 },
      })
      .setScrollFactor(0)
      .setDepth(90);
    const colStyle = { fontFamily: 'monospace', fontSize: '9px', color: '#c8d4ec', lineSpacing: 3 };
    this.controlsBg = scene.add.rectangle(0, 0, 10, 10, 0x07080f, 0.9).setOrigin(0, 0);
    this.controlsCols = [scene.add.text(0, 0, '', colStyle), scene.add.text(0, 0, '', colStyle)];
    this.controlsFoot = scene.add.text(0, 0, '', { ...colStyle, color: '#8b97b8' });
    this.controls = scene.add
      .container(0, 0, [this.controlsBg, ...this.controlsCols, this.controlsFoot])
      .setScrollFactor(0)
      .setDepth(96)
      .setVisible(false);
    this.quick = scene.add
      .text(width - 10, height - 18, '', {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#8fb8ff',
        backgroundColor: '#07080fb0',
        padding: { left: 4, right: 4, top: 2, bottom: 2 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(90);
    this.lastLevel = session.level;
    const max = session.getStats();
    this.shown.hp = this.shown.hpTrail = session.hp / max.maxHp;
    this.shown.mp = session.mp / max.maxMp;
    this.refresh();
  }

  /** H: show or hide the full key list. */
  public toggleControls(): boolean {
    const on = !this.controls.visible;
    this.controls.setVisible(on);
    this.controlsHint.setVisible(!on);
    return on;
  }

  public refresh(): void {
    const s = this.session;
    const remaining = s.expToNextLevel();
    const max = s.getStats();
    this.levelText.setText(this.t('hud.level', { level: s.level }));
    this.hpText.setText(`${s.hp}/${max.maxHp}`);
    this.mpText.setText(`${Math.floor(s.mp)}/${max.maxMp}`);
    this.shown.exp = remaining === null ? 1 : s.exp / Math.max(1, s.exp + remaining);
    const inv = s.inventory;
    const slots = s.quickSlots.map((id, i) => {
      if (!id) return `[${i + 1}] —`;
      const name = inv.getItemDefinition(id)?.name ?? id;
      return `[${i + 1}] ${name} x${inv.getItemCount(id)}`;
    });
    const anyQuick = s.quickSlots.some((id) => id !== null);
    this.quick.setText(slots.join('  ')).setVisible(anyQuick);
    // The one-line key list becomes two columns.
    const keys = controlList(this.t, s.getFlag('has_broken_blade'));
    // The last entry is the fixed system keys: it runs along the bottom with the close hint.
    const system = keys.pop() ?? '';
    const half = Math.ceil(keys.length / 2);
    const [left, right] = this.controlsCols;
    left.setText(keys.slice(0, half).join('\n'));
    right.setText(keys.slice(half).join('\n'));
    this.controlsFoot.setText(`${system}   ${this.t('hud.controlsClose')}`);
    const pad = 10;
    const gap = 28;
    const colsW = left.width + gap + right.width;
    const w = Math.max(colsW, this.controlsFoot.width) + pad * 2;
    const h = Math.max(left.height, right.height) + this.controlsFoot.height + pad * 2 + 6;
    const { width, height } = this.scene.scale;
    const x0 = Math.round(width / 2 - w / 2);
    const y0 = Math.round(height - 24 - h);
    this.controlsBg.setPosition(x0, y0).setSize(w, h);
    left.setPosition(x0 + pad, y0 + pad);
    right.setPosition(x0 + pad + left.width + gap, y0 + pad);
    this.controlsFoot.setPosition(x0 + pad, y0 + h - pad - this.controlsFoot.height);
    this.glideBars(s.hp / max.maxHp, s.mp / max.maxMp);
    if (s.level > this.lastLevel) this.levelUp(s.level);
    this.lastLevel = s.level;
  }

  private glideBars(hp: number, mp: number): void {
    const tw = this.scene.tweens;
    tw.killTweensOf(this.shown);
    const took = hp < this.shown.hp;
    tw.add({
      targets: this.shown,
      hp,
      mp,
      duration: 220,
      ease: 'Sine.easeOut',
      onUpdate: () => this.drawBars(),
    });
    tw.add({
      targets: this.shown,
      hpTrail: hp,
      delay: took ? 380 : 0,
      duration: took ? 420 : 220,
      ease: 'Sine.easeIn',
      onUpdate: () => this.drawBars(),
    });
    this.drawBars();
  }

  private drawBars(): void {
    const g = this.bars;
    const clamp = (v: number): number => Phaser.Math.Clamp(v, 0, 1);
    g.clear();
    g.fillStyle(0x05060c, 0.9).fillRect(BAR_X - 1, HP_Y - 1, BAR_W + 2, 6);
    g.fillStyle(0xffe0e0, 0.85).fillRect(BAR_X, HP_Y, BAR_W * clamp(this.shown.hpTrail), 4);
    const hp = clamp(this.shown.hp);
    g.fillStyle(hp > 0.5 ? 0x4ade80 : hp > 0.25 ? 0xf0c860 : 0xff5a4a, 1).fillRect(
      BAR_X,
      HP_Y,
      BAR_W * hp,
      4,
    );
    g.fillStyle(0xffffff, 0.18).fillRect(BAR_X, HP_Y, BAR_W * hp, 1);
    g.fillStyle(0x05060c, 0.9).fillRect(BAR_X - 1, MP_Y - 1, BAR_W + 2, 5);
    g.fillStyle(0x67b8ff, 1).fillRect(BAR_X, MP_Y, BAR_W * clamp(this.shown.mp), 3);
    const ex = PANEL.x + 6;
    const ew = PANEL.w - 12;
    g.fillStyle(0x05060c, 0.9).fillRect(ex, EXP_Y - 1, ew, 3);
    g.fillStyle(0xb48cff, 1).fillRect(ex, EXP_Y, ew * clamp(this.shown.exp), 1);
  }

  /** "LÊN CẤP" bursts in under the header, bounces and fades. */
  private levelUp(level: number): void {
    SoundSystem.getInstance().playLevelUp();
    const { width } = this.scene.scale;
    const label = this.scene.add
      .text(width / 2, 92, this.t('hud.levelUp', { level }), {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffe08a',
        stroke: '#5a3000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110)
      .setScale(2.4)
      .setAlpha(0);
    this.scene.tweens.add({
      targets: label,
      scale: 1,
      alpha: 1,
      duration: 280,
      ease: 'Back.easeOut',
    });
    this.scene.tweens.add({
      targets: label,
      y: 80,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => label.destroy(),
    });
    this.onLevelUp?.(level);
  }
}
