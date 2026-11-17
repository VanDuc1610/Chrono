import Phaser from 'phaser';
import { SoundSystem } from '../systems/audio/SoundSystem';
import type { GameSession } from '../state/GameSession';
import { createPanel } from './Panel';
import type { Translate } from './Strings';
import { controlList } from './controlList';

// T-91 compact HUD: a small panel, slim bars with their numbers, a hairline of EXP.
const PANEL = { x: 8, y: 8, w: 186, h: 48 };
const BAR_X = 36;
const BAR_W = 108;
const HP_Y = 28;
const MP_Y = 38;
const EXP_Y = 49;

/**
 * Top-left status: place and level, HP and MP bars with their values, an EXP hairline; the key
 * list (H) and the quick slots at the bottom. The bars glide to their new value, a pale trail
 * shows what a blow just took, and a level up pops a banner (the scene adds light and chime).
 */
export class StatusHud {
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly mpText: Phaser.GameObjects.Text;
  private readonly levelText: Phaser.GameObjects.Text;
  private readonly controls: Phaser.GameObjects.Text;
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
    text(16, HP_Y - 5, 'HP', '8px', '#8b97b8');
    text(16, MP_Y - 5, 'MP', '8px', '#8b97b8');
    this.hpText = text(right, HP_Y - 5, '', '8px', '#e4ebf5').setOrigin(1, 0);
    this.mpText = text(right, MP_Y - 5, '', '8px', '#b8d8ff').setOrigin(1, 0);
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
    this.controls = scene.add
      .text(width / 2, height - 24, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#c8d4ec',
        backgroundColor: '#07080fe6',
        padding: { left: 10, right: 10, top: 6, bottom: 6 },
        lineSpacing: 3,
      })
      .setOrigin(0.5, 1)
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
    keys.push(this.t('hud.controlsClose'));
    const half = Math.ceil(keys.length / 2);
    const colW = Math.max(...keys.slice(0, half).map((k) => k.length)) + 4;
    const lines: string[] = [];
    for (let i = 0; i < half; i++) lines.push(keys[i].padEnd(colW) + (keys[i + half] ?? ''));
    this.controls.setText(lines.join('\n'));
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
