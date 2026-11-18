import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import type { Authority, SkillDef } from '../systems/action/AuthorityRules';
import type { AuthorityPowers } from '../world/action/Authority';
import { keyLabel } from './keys';

const SIZE = 22;
const GAP = 6;

/**
 * The three Authority skill slots (Z / X / C) at the bottom centre (owner, 2026-11-18): each slot
 * shows its skill's glyph in the Authority's colour, its key, a cooldown shade that drains, and
 * dims while Peter lacks the MP. Empty slots show a faint frame. Hidden until a skill is known.
 */
export class SkillBar {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly labels: Phaser.GameObjects.Text[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly skillIn: (slot: number) => SkillDef | null,
    private readonly powers: () => AuthorityPowers | null,
  ) {
    this.g = scene.add.graphics().setScrollFactor(0).setDepth(92);
    const { width, height } = scene.scale;
    const x0 = width / 2 - (SIZE * 3 + GAP * 2) / 2;
    (['skill1', 'skill2', 'skill3'] as const).forEach((action, i) => {
      this.labels.push(
        scene.add
          .text(x0 + i * (SIZE + GAP) + SIZE - 2, height - 12, keyLabel(action), {
            fontFamily: 'monospace',
            fontSize: '7px',
            color: '#c8d4ec',
          })
          .setOrigin(1, 0)
          .setScrollFactor(0)
          .setDepth(93),
      );
    });
  }

  public update(now: number): void {
    const g = this.g.clear();
    const any = [0, 1, 2].some((i) => this.skillIn(i));
    for (const l of this.labels) l.setVisible(any);
    if (!any) return;
    const { width, height } = this.scene.scale;
    const x0 = width / 2 - (SIZE * 3 + GAP * 2) / 2;
    const y = height - SIZE - 8;
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * (SIZE + GAP);
      const def = this.skillIn(i);
      g.fillStyle(0x07080f, 0.82).fillRect(x, y, SIZE, SIZE);
      g.lineStyle(1, def ? 0x5a6a90 : 0x2a3048, 1).strokeRect(x + 0.5, y + 0.5, SIZE - 1, SIZE - 1);
      if (!def) continue;
      const color = Phaser.Display.Color.HexStringToColor(def.color).color;
      const short = this.session.mp < def.mpCost;
      glyph(g, def.authority, x + SIZE / 2, y + SIZE / 2, color, short ? 0.35 : 1);
      const left = this.powers()?.cooldownLeft(def, now) ?? 0;
      if (left > 0) g.fillStyle(0x000000, 0.62).fillRect(x + 1, y + 1, SIZE - 2, (SIZE - 2) * left);
      else g.lineStyle(1, color, 0.9).strokeRect(x + 0.5, y + 0.5, SIZE - 1, SIZE - 1);
    }
  }
}

/** A small glyph for each Authority, drawn in lines (no art file). */
function glyph(
  g: Phaser.GameObjects.Graphics,
  a: Authority,
  cx: number,
  cy: number,
  color: number,
  alpha: number,
): void {
  g.lineStyle(1.5, color, alpha);
  g.fillStyle(color, alpha);
  switch (a) {
    case 'continuum': // two waves
      for (const dy of [-3, 3]) {
        g.beginPath();
        for (let k = 0; k <= 12; k++) {
          const x = cx - 7 + (k * 14) / 12;
          const y = cy + dy + Math.sin(k / 1.9) * 2;
          if (k === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.strokePath();
      }
      break;
    case 'causality': // a bolt
      g.strokePoints(
        [
          { x: cx + 3, y: cy - 7 },
          { x: cx - 2, y: cy - 1 },
          { x: cx + 2, y: cy + 1 },
          { x: cx - 3, y: cy + 7 },
        ],
        false,
      );
      break;
    case 'memory': // a figure and its echo
      g.strokeCircle(cx - 2, cy - 3, 3);
      g.lineStyle(1, color, alpha * 0.5).strokeCircle(cx + 3, cy - 1, 3);
      g.lineStyle(1.5, color, alpha).lineBetween(cx - 2, cy, cx - 2, cy + 6);
      break;
    case 'finality': // a flame
      g.fillTriangle(cx, cy - 7, cx - 5, cy + 5, cx + 5, cy + 5);
      g.fillStyle(0xffffff, alpha * 0.8).fillTriangle(cx, cy - 1, cx - 2, cy + 5, cx + 2, cy + 5);
      break;
    case 'possibility': // a branching path
      g.lineBetween(cx, cy + 7, cx, cy);
      g.lineBetween(cx, cy, cx - 5, cy - 6);
      g.lineBetween(cx, cy, cx + 5, cy - 6);
      g.fillCircle(cx + 5, cy - 6, 1.5);
      break;
    case 'origin': // a sun
      g.fillCircle(cx, cy, 3);
      for (let k = 0; k < 8; k++) {
        const t = (k / 8) * Math.PI * 2;
        g.lineBetween(
          cx + Math.cos(t) * 5,
          cy + Math.sin(t) * 5,
          cx + Math.cos(t) * 7,
          cy + Math.sin(t) * 7,
        );
      }
      break;
  }
}
