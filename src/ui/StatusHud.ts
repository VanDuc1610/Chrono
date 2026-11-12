import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

/** Top-left header (location, chapter, level/EXP/HP) and the bottom controls hint. */
export class StatusHud {
  private readonly stats: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly t: Translate,
    locationName: string,
    /** 0 = Prologue. */
    chapter = 0,
  ) {
    createPanel(scene, 10, 10, 240, 56).setScrollFactor(0).setDepth(90);
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
    text(18, t('hud.location', { name: locationName }), '10px', '#65d5ff', true);
    text(
      31,
      chapter > 0
        ? t('hud.chapter', { n: chapter, title: t(`chapter.${chapter}.title`) })
        : t('hud.phase'),
      '9px',
      '#8b97b8',
    );
    this.stats = text(44, '', '9px', '#4ade80', true);

    scene.add
      .text(10, scene.scale.height - 16, t('hud.controls'), {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#5d6b8a',
        backgroundColor: '#07080fcc',
        padding: { left: 4, right: 4, top: 2, bottom: 2 },
      })
      .setScrollFactor(0)
      .setDepth(90);
    this.refresh();
  }

  public refresh(): void {
    const s = this.session;
    const remaining = s.expToNextLevel();
    const exp =
      remaining === null ? `${s.exp}/${this.t('hud.expMax')}` : `${s.exp}/${s.exp + remaining}`;
    this.stats.setText(
      this.t('hud.stats', { level: s.level, exp, hp: s.hp, maxHp: s.getStats().maxHp }),
    );
  }
}
