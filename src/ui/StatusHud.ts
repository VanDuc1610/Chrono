import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

/** Top-left header (location, chapter, level/EXP/HP) and the bottom controls hint. */
export class StatusHud {
  private readonly stats: Phaser.GameObjects.Text;
  private readonly controls: Phaser.GameObjects.Text;
  private readonly quick: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly t: Translate,
    locationName: string,
    /** 0 = Prologue. */
    chapter = 0,
  ) {
    createPanel(scene, 10, 10, 290, 56).setScrollFactor(0).setDepth(90);
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
  }
}
