import Phaser from 'phaser';
import { SaveSystem } from '../systems/save/SaveSystem';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { startNewSession, startSessionFromSave } from '../state/GameSession';

interface MenuItem {
  text: string;
  action: () => void;
  enabled: boolean;
  gameObject?: Phaser.GameObjects.Text;
}

export class MainMenuScene extends Phaser.Scene {
  private selectedIndex = 0;
  private menuItems: MenuItem[] = [];
  private cursorGraphic!: Phaser.GameObjects.Graphics;
  private saveSystem = new SaveSystem();
  private soundSystem = SoundSystem.getInstance();

  private optionsContainer!: Phaser.GameObjects.Container;
  private isOptionsOpen = false;
  private soundStatusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // Atmospheric Dark Sky background with starry gradient
    this.createBackground(width, height);

    // Title Section
    this.add
      .text(width / 2, height * 0.22, 'CHRONO', {
        fontFamily: 'monospace',
        fontSize: '44px',
        color: '#cde9ff',
        fontStyle: 'bold',
        stroke: '#081427',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.33, 'THE FRACTURED DIVINITY', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#00d2ff',
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.39, '— PROLOGUE VERTICAL SLICE —', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#657499',
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    const hasSavedGame = this.saveSystem.hasSave(1);

    // Menu Options
    this.menuItems = [
      {
        text: 'NEW GAME',
        enabled: true,
        action: () => this.startNewGame(),
      },
      {
        text: hasSavedGame ? 'CONTINUE' : 'CONTINUE (NO SAVE)',
        enabled: hasSavedGame,
        action: () => this.continueGame(),
      },
      {
        text: 'OPTIONS',
        enabled: true,
        action: () => this.toggleOptionsModal(),
      },
    ];

    const startY = height * 0.54;
    const spacing = 32;

    this.menuItems.forEach((item, index) => {
      const itemY = startY + index * spacing;
      const textObj = this.add
        .text(width / 2, itemY, item.text, {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: item.enabled ? '#e0e8ff' : '#454e66',
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: item.enabled });

      if (item.enabled) {
        textObj.on('pointerover', () => {
          if (this.selectedIndex !== index) {
            this.soundSystem.playCursorBlip();
          }
          this.selectedIndex = index;
          this.updateMenuVisuals();
        });
        textObj.on('pointerdown', () => {
          this.selectedIndex = index;
          this.selectOption();
        });
      }

      item.gameObject = textObj;
    });

    // Retro selection cursor
    this.cursorGraphic = this.add.graphics();
    this.updateMenuVisuals();

    // Input handlers (Keyboard navigation)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
      this.input.keyboard.on('keydown-W', () => this.navigate(-1));
      this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
      this.input.keyboard.on('keydown-S', () => this.navigate(1));
      this.input.keyboard.on('keydown-ENTER', () => this.selectOption());
      this.input.keyboard.on('keydown-SPACE', () => this.selectOption());
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isOptionsOpen) {
          this.toggleOptionsModal();
        }
      });
    }

    // Version & Footer
    this.add
      .text(12, height - 18, 'v0.1.0-alpha | Phaser 3 + TypeScript', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#434d66',
      })
      .setOrigin(0, 0);

    this.add
      .text(width - 12, height - 18, '[Enter / Click to Select]', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#434d66',
      })
      .setOrigin(1, 0);

    // Create Options Modal
    this.createOptionsModal(width, height);

    // Start procedural ambient ruin BGM and clean up on shutdown
    this.soundSystem.startBgm('ambient');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.soundSystem.stopBgm(true);
    });
  }

  private createOptionsModal(width: number, height: number): void {
    const modalWidth = 320;
    const modalHeight = 160;
    const modalX = width / 2 - modalWidth / 2;
    const modalY = height / 2 - modalHeight / 2;

    this.optionsContainer = this.add
      .container(modalX, modalY)
      .setDepth(200)
      .setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x0c111f, 0.96);
    bg.fillRect(0, 0, modalWidth, modalHeight);
    bg.lineStyle(2, 0x00c8ff, 1);
    bg.strokeRect(0, 0, modalWidth, modalHeight);

    const header = this.add
      .text(modalWidth / 2, 18, 'SETTINGS & AUDIO', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00e1ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const isMuted = this.soundSystem.isSoundMuted();
    this.soundStatusText = this.add
      .text(modalWidth / 2, 60, `Sound FX: ${isMuted ? '[MUTED]' : '[ENABLED]'}`, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: isMuted ? '#f87171' : '#4ade80',
        backgroundColor: '#161f36',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.soundStatusText.on('pointerdown', () => {
      const nowMuted = this.soundSystem.toggleMute();
      this.soundStatusText.setText(`Sound FX: ${nowMuted ? '[MUTED]' : '[ENABLED]'}`);
      this.soundStatusText.setColor(nowMuted ? '#f87171' : '#4ade80');
      if (!nowMuted) {
        this.soundSystem.playSelect();
      }
    });

    const closeBtn = this.add
      .text(modalWidth / 2, 115, '[Back to Title / ESC]', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => this.toggleOptionsModal());

    this.optionsContainer.add([bg, header, this.soundStatusText, closeBtn]);
  }

  public toggleOptionsModal(): void {
    this.isOptionsOpen = !this.isOptionsOpen;
    this.optionsContainer.setVisible(this.isOptionsOpen);
    this.soundSystem.playSelect();
  }

  private navigate(direction: number): void {
    if (this.isOptionsOpen) return;
    const prev = this.selectedIndex;
    let next = prev + direction;

    if (next < 0) next = this.menuItems.length - 1;
    if (next >= this.menuItems.length) next = 0;

    this.selectedIndex = next;
    this.soundSystem.playCursorBlip();
    this.updateMenuVisuals();
  }

  private updateMenuVisuals(): void {
    const { width } = this.scale;
    this.cursorGraphic.clear();

    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      if (item.gameObject) {
        if (isSelected) {
          item.gameObject.setColor(item.enabled ? '#00e1ff' : '#6f7994');
          item.gameObject.setScale(1.08);

          // Render diamond indicator
          const itemY = item.gameObject.y;
          const textHalfWidth = (item.gameObject.width * 1.08) / 2;
          this.cursorGraphic.fillStyle(0x00e1ff, 1);
          // Left diamond
          this.cursorGraphic.fillTriangle(
            width / 2 - textHalfWidth - 14,
            itemY,
            width / 2 - textHalfWidth - 20,
            itemY - 4,
            width / 2 - textHalfWidth - 20,
            itemY + 4
          );
          // Right diamond
          this.cursorGraphic.fillTriangle(
            width / 2 + textHalfWidth + 14,
            itemY,
            width / 2 + textHalfWidth + 20,
            itemY - 4,
            width / 2 + textHalfWidth + 20,
            itemY + 4
          );
        } else {
          item.gameObject.setColor(item.enabled ? '#abb7d6' : '#454e66');
          item.gameObject.setScale(1.0);
        }
      }
    });
  }

  private selectOption(): void {
    if (this.isOptionsOpen) return;
    const current = this.menuItems[this.selectedIndex];
    if (current && current.enabled) {
      this.soundSystem.playSelect();
      current.action();
    }
  }

  private startNewGame(): void {
    // A fresh session discards every trace of a previous playthrough (B3).
    startNewSession(this);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ExplorationScene');
    });
  }

  private async continueGame(): Promise<void> {
    const saveData = await this.saveSystem.load(1);
    if (!saveData) return;

    startSessionFromSave(this, saveData);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ExplorationScene');
    });
  }

  private createBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x090a14, 0x090a14, 0x05050a, 0x05050a, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative fractured temporal particles
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 2);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.7);
      const color = Phaser.Math.RND.pick([0x00d2ff, 0x3d6eff, 0x7b52ff]);
      const particle = this.add.rectangle(x, y, size, size, color, alpha);

      // Subtle floating tween
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(10, 25),
        alpha: { from: alpha, to: 0.1 },
        duration: Phaser.Math.Between(2500, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}

