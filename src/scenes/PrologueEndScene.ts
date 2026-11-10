import Phaser from 'phaser';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { getSession } from '../state/GameSession';

/**
 * Closing card of the Prologue vertical slice. Reached after the Elder's farewell once
 * "Silence the Fracture" is complete; returns to the title screen.
 */
export class PrologueEndScene extends Phaser.Scene {
  private soundSystem = SoundSystem.getInstance();
  private isLeaving = false;

  constructor() {
    super({ key: 'PrologueEndScene' });
  }

  public init(): void {
    this.isLeaving = false;
  }

  public create(): void {
    const { width, height } = this.scale;
    const session = getSession(this);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x05060c, 0x05060c, 0x0d1424, 0x0d1424, 1);
    bg.fillRect(0, 0, width, height);

    // Drifting chronal motes
    for (let i = 0; i < 30; i++) {
      const mote = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        2,
        2,
        Phaser.Math.RND.pick([0x00c8ff, 0xa6f0ff, 0x7c3aed]),
        0.5,
      );
      this.tweens.add({
        targets: mote,
        y: mote.y - Phaser.Math.Between(20, 50),
        alpha: { from: 0.6, to: 0 },
        duration: Phaser.Math.Between(2500, 5000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    const title = this.add
      .text(width / 2, height * 0.3, 'PROLOGUE COMPLETE', {
        fontFamily: 'monospace',
        fontSize: '26px',
        color: '#cde9ff',
        fontStyle: 'bold',
        stroke: '#081427',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const subtitle = this.add
      .text(width / 2, height * 0.3 + 30, 'CHRONO — THE FRACTURED DIVINITY', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#00d2ff',
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const quests = session.quests.getAllQuests();
    const completed = quests.filter((q) => q.stage === 'completed').length;
    const totalSeconds = Math.floor(session.playtimeMs / 1000);
    const playtime = `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;

    const stats = this.add
      .text(
        width / 2,
        height * 0.56,
        [
          `${session.playerName}  ·  Lv. ${session.level}`,
          `Quests completed  ${completed}/${quests.length}`,
          `Playtime  ${playtime}`,
        ],
        {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#b8c5de',
          align: 'center',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5)
      .setAlpha(0);

    const thanks = this.add
      .text(width / 2, height * 0.78, 'Thank you for playing.', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffd666',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const prompt = this.add
      .text(width / 2, height - 22, '[E / Space / Enter] Return to Title', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#65789e',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.tweens.add({
      targets: [title, subtitle, stats, thanks, prompt],
      alpha: 1,
      duration: 900,
      delay: this.tweens.stagger(350, {}),
    });

    this.soundSystem.startBgm('ambient');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.soundSystem.stopBgm(true));

    // Accept input only after the card has faded in, so a held key can't skip it.
    this.time.delayedCall(1800, () => {
      if (!this.input.keyboard) return;
      for (const key of ['keydown-E', 'keydown-SPACE', 'keydown-ENTER']) {
        this.input.keyboard.on(key, () => this.returnToTitle());
      }
    });
  }

  public returnToTitle(): void {
    if (this.isLeaving) return;
    this.isLeaving = true;
    this.soundSystem.playSelect();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
