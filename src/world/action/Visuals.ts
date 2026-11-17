import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import { type GameSession } from '../../state/GameSession';
import { type Point } from '../../systems/action/ActionRules';
import { meleeShape } from '../../systems/action/WeaponRules';
import { Roamer } from './ActionTypes';
export interface VisualsContext {
  bars: Phaser.GameObjects.Graphics;
  roamers: Roamer[];
  flag: (f: string) => boolean;
  player: Player;
  session: GameSession;
  scene: Phaser.Scene;
}

export function drawBars(this: VisualsContext): void {
  const g = this.bars;
  g.clear();
  const bar = (cx: number, top: number, w: number, h: number, ratio: number, color: number) => {
    const x = Math.round(cx - w / 2);
    g.fillStyle(0x05060c, 0.85).fillRect(x - 1, top - 1, w + 2, h + 2);
    g.fillStyle(color, 1).fillRect(x, top, Math.round(w * Math.max(0, Math.min(1, ratio))), h);
  };
  const hpColor = (ratio: number) => (ratio > 0.5 ? 0x4ade80 : ratio > 0.25 ? 0xfacc15 : 0xef4444);
  for (const r of this.roamers) {
    if (!r.alive || r.def.ambush || !r.sprite.active) continue;
    const ratio = r.shownRatio ?? r.hp / r.enemy.maxHp;
    const top = r.sprite.y - r.sprite.displayHeight * r.sprite.originY - 6;
    bar(r.sprite.x, top, 22, 3, ratio, ratio > 0.5 ? 0xf87171 : 0xef4444);
  }
  // Peter's bars appear once he can fight.
  if (!this.flag('has_broken_blade')) return;
  const p = this.player.sprite;
  const stats = this.session.getStats();
  const top = p.y - p.displayHeight * p.originY - 9;
  const hp = this.session.hp / stats.maxHp;
  bar(p.x, top, 26, 3, hp, hpColor(hp));
  bar(p.x, top + 5, 26, 2, this.session.mp / stats.maxMp, 0x38bdf8);
}

export function drawSlash(this: VisualsContext, origin: Point, aim: number, reach: number): void {
  const g = this.scene.add.graphics().setDepth(42);
  const shape = meleeShape(this.session.meleeClass);
  const half = (shape.arcDeg * Math.PI) / 360;
  g.lineStyle(shape.arcDeg < 90 ? 4 : 3, shape.color, 0.9);
  g.beginPath();
  g.arc(origin.x, origin.y, reach - 4, aim - half, aim + half);
  g.strokePath();
  this.scene.tweens.add({ targets: g, alpha: 0, duration: 160, onComplete: () => g.destroy() });
}

export function floatText(
  this: VisualsContext,
  x: number,
  y: number,
  text: string,
  color: string,
): void {
  const numeric = /^[+-]?\d+!?( HP| MP)?$/.test(text.trim());
  const crit = numeric && text.trim().endsWith('!');
  const label = this.scene.add
    .text(x + (numeric ? Phaser.Math.Between(-5, 5) : 0), y, text, {
      fontFamily: 'monospace',
      fontSize: crit ? '14px' : numeric ? '12px' : '11px',
      fontStyle: 'bold',
      color,
      stroke: crit ? '#5a3000' : '#000000',
      strokeThickness: crit ? 4 : 3,
    })
    .setOrigin(0.5)
    // Above the map's darkness and motes (atmosphere at depths 59-62).
    .setDepth(63);
  if (!numeric) {
    this.scene.tweens.add({
      targets: label,
      y: y - 16,
      alpha: 0,
      duration: 650,
      onComplete: () => label.destroy(),
    });
    return;
  }
  label.setScale(crit ? 2.1 : 1.6);
  this.scene.tweens.add({ targets: label, scale: 1, duration: 180, ease: 'Back.easeOut' });
  if (crit)
    this.scene.tweens.add({
      targets: label,
      x: label.x + 2,
      duration: 40,
      yoyo: true,
      repeat: 3,
    });
  this.scene.tweens.add({
    targets: label,
    y: y - (text.startsWith('+') ? 24 : 18),
    alpha: 0,
    delay: 260,
    duration: 620,
    ease: 'Sine.easeIn',
    onComplete: () => label.destroy(),
  });
}
