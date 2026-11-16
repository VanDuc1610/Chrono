import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const BAR_X = 20;
const BAR_W = 270;
const HP_Y = 58;
const MP_Y = 63;

/**
 * Top-left header (location, chapter, level/EXP/HP), HP and MP bars and the bottom controls hint.
 * T-85 UI: the bars glide to their new value, a pale trail shows what a blow just took, and a
 * level up pops a banner (the scene adds its own light and chime through `onLevelUp`).
 */
export class StatusHud {
  private readonly stats: Phaser.GameObjects.Text;
  private readonly controls: Phaser.GameObjects.Text;
  private readonly quick: Phaser.GameObjects.Text;
  private readonly bars: Phaser.GameObjects.Graphics;
  /** Shown values (0-1): the bar, and the trail that follows it down. */
  private readonly shown = { hp: 1, hpTrail: 1, mp: 1 };
  private lastLevel: number;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly t: Translate,
    locationName: string,
    /** 0 = Prologue. */
    chapter = 0,
    private readonly onLevelUp?: (level: number) => void,
  ) {
    createPanel(scene, 10, 10, 290, 64).setScrollFactor(0).setDepth(90);
    const text = (y: number, value: string, size: string, color: string, bold = false) =>
      scene.add
        .text(20, y, value, {
          fontFamily: 'monospace',
          fontSize: size,
          color,
          fontStyle: bold ? 'bold' : 'normal',
        })
        .setScrollFactor(0)
        .setDepth(95);
    text(18, t('hud.location', { name: locationName }), '11px', '#65d5ff', true);
    text(
      31,
      chapter > 0
        ? t('hud.chapter', { n: chapter, title: t(`chapter.${chapter}.title`) })
        : t('hud.phase'),
      '9px',
      '#8b97b8',
    );
    this.stats = text(44, '', '10px', '#4ade80', true);
    this.bars = scene.add.graphics().setScrollFactor(0).setDepth(95);

    this.controls = scene.add
      .text(10, scene.scale.height - 16, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#5d6b8a',
        backgroundColor: '#07080fcc',
        padding: { left: 4, right: 4, top: 2, bottom: 2 },
      })
      .setScrollFactor(0)
      .setDepth(90);
    this.quick = scene.add
      .text(scene.scale.width - 10, scene.scale.height - 34, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8fb8ff',
        backgroundColor: '#07080fcc',
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

  public refresh(): void {
    const s = this.session;
    const remaining = s.expToNextLevel();
    const exp =
      remaining === null ? `${s.exp}/${this.t('hud.expMax')}` : `${s.exp}/${s.exp + remaining}`;
    const max = s.getStats();
    this.stats.setText(
      this.t('hud.stats', {
        level: s.level,
        exp,
        hp: s.hp,
        maxHp: max.maxHp,
        mp: Math.floor(s.mp),
        maxMp: max.maxMp,
      }),
    );
    const inv = s.inventory;
    const slots = s.quickSlots.map((id, i) => {
      if (!id) return `[${i + 1}] —`;
      const name = inv.getItemDefinition(id)?.name ?? id;
      return `[${i + 1}] ${name} x${inv.getItemCount(id)}`;
    });
    const anyQuick = s.quickSlots.some((id) => id !== null);
    this.quick.setText(slots.join('  ')).setVisible(anyQuick);
    this.controls.setText(
      this.t(s.getFlag('has_broken_blade') ? 'hud.controlsArmed' : 'hud.controls'),
    );
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
    // The trail lingers, then slides down to the new value; on a heal it simply follows.
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
    g.fillStyle(0x05060c, 0.9).fillRect(BAR_X - 1, HP_Y - 1, BAR_W + 2, 4);
    g.fillStyle(0xffe0e0, 0.85).fillRect(BAR_X, HP_Y, BAR_W * clamp(this.shown.hpTrail), 2);
    const hp = clamp(this.shown.hp);
    g.fillStyle(hp > 0.5 ? 0x4ade80 : hp > 0.25 ? 0xf0c860 : 0xff5a4a, 1).fillRect(
      BAR_X,
      HP_Y,
      BAR_W * hp,
      2,
    );
    g.fillStyle(0x05060c, 0.9).fillRect(BAR_X - 1, MP_Y - 1, BAR_W + 2, 3);
    g.fillStyle(0x67b8ff, 1).fillRect(BAR_X, MP_Y, BAR_W * clamp(this.shown.mp), 1);
  }

  /** "LÊN CẤP" bursts in under the header, bounces and fades. */
  private levelUp(level: number): void {
    const { width } = this.scene.scale;
    const label = this.scene.add
      .text(width / 2, 92, this.t('hud.levelUp', { level }), {
        fontFamily: 'monospace',
        fontSize: '16px',
        fontStyle: 'bold',
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
