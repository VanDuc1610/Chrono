import Phaser from 'phaser';
import { SaveSystem } from '../systems/save/SaveSystem';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { startNewSession, startSessionFromSave } from '../state/GameSession';
import { applyChapterStart, CHAPTER_STARTS, type ChapterStart } from '../state/ChapterStarts';
import { createPanel } from '../ui/Panel';
import { getStrings, type Translate } from '../ui/Strings';
import { registerPeterAnimations } from '../systems/animation/PeterAnimationConfig';
import { OptionsPanel } from '../ui/OptionsPanel';
import { ACTIVE_SLOT, SaveSlotsPanel } from '../ui/SaveSlotsPanel';
import { controlList } from '../ui/controlList';

type MenuItemId = 'newGame' | 'continue' | 'load' | 'chapters' | 'options';

interface MenuItem {
  id: MenuItemId;
  text: string;
  action: () => void;
  enabled: boolean;
  gameObject?: Phaser.GameObjects.Text;
}

export class MainMenuScene extends Phaser.Scene {
  private selectedIndex = 0;
  private menuItems: MenuItem[] = [];
  private cursorSprite!: Phaser.GameObjects.Sprite;
  private saveSystem = new SaveSystem();
  private soundSystem = SoundSystem.getInstance();

  private options: OptionsPanel | null = null;
  private isOptionsOpen = false;
  private chaptersContainer!: Phaser.GameObjects.Container;
  private isChaptersOpen = false;
  private t!: Translate;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public init(): void {
    this.selectedIndex = 0;
    this.isOptionsOpen = false;
    this.isChaptersOpen = false;
    this.menuItems = [];
  }

  public create(): void {
    const { width, height } = this.scale;
    this.t = getStrings(this);

    // Atmospheric Dark Sky background with starry gradient
    this.createBackground(width, height);

    // T-91: a great clock turning slowly behind the title, and Peter waiting at the edge of it.
    this.createClockSigil(width / 2, height * 0.27);
    this.createPeter(width * 0.16, height * 0.86);

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
      .text(width / 2, height * 0.39, this.t('menu.tagline'), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8a9cc8',
        letterSpacing: 1,
      })
      .setOrigin(0.5);

    const hasSavedGame = [1, 2, 3].some((n) => this.saveSystem.hasSave(n));

    // Menu Options
    this.menuItems = [
      {
        id: 'newGame',
        text: this.t('menu.newGame'),
        enabled: true,
        action: () => this.startNewGame(),
      },
      {
        id: 'continue',
        text: hasSavedGame ? this.t('menu.continue') : this.t('menu.continueNoSave'),
        enabled: hasSavedGame,
        action: () => this.continueGame(),
      },
      {
        id: 'load',
        text: this.t('menu.load'),
        enabled: hasSavedGame,
        action: () => this.openSlots(),
      },
      {
        id: 'chapters',
        text: this.t('menu.chapters'),
        enabled: true,
        action: () => this.toggleChapters(),
      },
      {
        id: 'options',
        text: this.t('menu.options'),
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

    // Retro selection cursor (UI_SET_001 sprite + pulse anim)
    this.cursorSprite = this.add.sprite(0, 0, 'ui_cursor', 0).setOrigin(0.5);
    if (this.anims.exists('ui_cursor_pulse')) {
      this.cursorSprite.play('ui_cursor_pulse');
    }
    this.updateMenuVisuals();

    // Input handlers (Keyboard navigation)
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
      this.input.keyboard.on('keydown-W', () => this.navigate(-1));
      this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
      this.input.keyboard.on('keydown-S', () => this.navigate(1));
      this.input.keyboard.on('keydown-ENTER', () => this.selectOption());
      this.input.keyboard.on('keydown-SPACE', () => this.selectOption());
      // The options and slot panels close themselves on ESC.
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isChaptersOpen) this.toggleChapters();
      });
      const digits = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
      digits.forEach((key, i) =>
        this.input.keyboard?.on(`keydown-${key}`, () => {
          const start = CHAPTER_STARTS[i];
          if (this.isChaptersOpen && start) this.startChapter(start);
        }),
      );
    }

    // Version & Footer
    this.add
      .text(12, height - 18, this.t('menu.version'), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#434d66',
      })
      .setOrigin(0, 0);

    this.add
      .text(width - 12, height - 18, this.t('menu.footerHint'), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#434d66',
      })
      .setOrigin(1, 0);

    this.createChaptersModal(width, height);

    // Start procedural ambient ruin BGM and clean up on shutdown
    this.soundSystem.startBgm('ambient');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.soundSystem.stopBgm(true);
    });
  }

  /** T-96: the options panel (sound, display and text, controls), shared with the pause menu. */
  public toggleOptionsModal(): void {
    if (this.options) {
      this.options.close();
      return;
    }
    this.isOptionsOpen = true;
    this.soundSystem.playSelect();
    this.options = new OptionsPanel(this, this.t, controlList(this.t), () => {
      this.options = null;
      this.isOptionsOpen = false;
    });
  }

  /** T-96: the three save slots, to load one. */
  private openSlots(): void {
    this.isOptionsOpen = true;
    new SaveSlotsPanel(
      this,
      this.t,
      'load',
      () => Promise.all([1, 2, 3].map((n) => this.saveSystem.getMetadata(n))),
      (slot) => this.loadSlot(slot),
      async (slot) => {
        await this.saveSystem.delete(slot);
      },
      () => {
        this.isOptionsOpen = false;
        this.refreshContinue();
      },
    );
  }

  /** Enables "Tiếp tục" / "Tải trò chơi" when any slot holds a save. */
  private refreshContinue(): void {
    const any = [1, 2, 3].some((n) => this.saveSystem.hasSave(n));
    for (const item of this.menuItems)
      if (item.id === 'continue' || item.id === 'load') {
        item.enabled = any;
        if (item.id === 'continue')
          item.gameObject?.setText(any ? this.t('menu.continue') : this.t('menu.continueNoSave'));
        item.gameObject?.setColor(any ? '#e0e8ff' : '#454e66');
      }
    this.updateMenuVisuals();
  }

  /** Chapter select: each chapter starts with the level, gear and story of the ones before it. */
  private createChaptersModal(width: number, height: number): void {
    const w = 380;
    const rowH = 24;
    const h = 92 + CHAPTER_STARTS.length * rowH;
    this.chaptersContainer = this.add
      .container(width / 2 - w / 2, height / 2 - h / 2)
      .setDepth(200)
      .setVisible(false);
    const bg = createPanel(this, 0, 0, w, h);
    const header = this.add
      .text(w / 2, 20, this.t('menu.chaptersTitle'), {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00e1ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const rows = CHAPTER_STARTS.map((c, i) => {
      const row = this.add
        .text(
          w / 2,
          48 + i * rowH,
          this.t('menu.chapterItem', { n: c.chapter, title: c.title, lv: c.level }),
          {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#e0e8ff',
            backgroundColor: '#161f36',
            padding: { left: 8, right: 8, top: 3, bottom: 3 },
          },
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      row.on('pointerover', () => row.setColor('#00e1ff'));
      row.on('pointerout', () => row.setColor('#e0e8ff'));
      row.on('pointerdown', () => this.startChapter(c));
      return row;
    });
    const hint = this.add
      .text(w / 2, h - 34, this.t('menu.chaptersHint'), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#657499',
      })
      .setOrigin(0.5);
    const close = this.add
      .text(w / 2, h - 16, this.t('menu.optionsClose'), {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.toggleChapters());
    this.chaptersContainer.add([bg, header, ...rows, hint, close]);
  }

  public toggleChapters(): void {
    this.isChaptersOpen = !this.isChaptersOpen;
    this.chaptersContainer.setVisible(this.isChaptersOpen);
    this.soundSystem.playSelect();
  }

  /** Starts a fresh session at the beginning of a chapter (see ChapterStarts). */
  public startChapter(start: ChapterStart): void {
    const session = startNewSession(this);
    applyChapterStart(session, start);
    this.soundSystem.playSelect();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ExplorationScene', { mapId: start.mapId, spawnId: start.spawnId });
    });
  }

  private navigate(direction: number): void {
    if (this.isOptionsOpen || this.isChaptersOpen) return;
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

    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      if (item.gameObject) {
        if (isSelected) {
          item.gameObject.setColor(item.enabled ? '#00e1ff' : '#6f7994');
          item.gameObject.setScale(1.08);

          const itemY = item.gameObject.y;
          const textHalfWidth = (item.gameObject.width * 1.08) / 2;
          this.cursorSprite.setPosition(width / 2 - textHalfWidth - 16, itemY);
        } else {
          item.gameObject.setColor(item.enabled ? '#abb7d6' : '#454e66');
          item.gameObject.setScale(1.0);
        }
      }
    });
  }

  private selectOption(): void {
    if (this.isOptionsOpen || this.isChaptersOpen) return;
    const current = this.menuItems[this.selectedIndex];
    if (current && current.enabled) {
      this.soundSystem.playSelect();
      current.action();
    }
  }

  private startNewGame(): void {
    // A fresh session discards every trace of a previous playthrough (B3).
    startNewSession(this);
    this.registry.set(ACTIVE_SLOT, 1);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Always pass data: Phaser reuses the scene's previous start data when none is given, so a
      // new game after an end card would otherwise open on that chapter's first map.
      this.scene.start('ExplorationScene', {});
    });
  }

  /** "Tiếp tục": the newest of the three slots (T-96). */
  private async continueGame(): Promise<void> {
    const metas = await Promise.all([1, 2, 3].map((n) => this.saveSystem.getMetadata(n)));
    const newest = metas
      .filter((m): m is NonNullable<typeof m> => !!m)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    if (newest) await this.loadSlot(newest.slot);
  }

  private async loadSlot(slot: number): Promise<void> {
    const saveData = await this.saveSystem.load(slot);
    if (!saveData) return;
    this.registry.set(ACTIVE_SLOT, slot);

    startSessionFromSave(this, saveData);
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('ExplorationScene', {});
    });
  }

  /** A clock face of light (rings, hour marks, a hexagram, stopped hands) turning very slowly. */
  private createClockSigil(x: number, y: number): void {
    const key = 'menu_clock_sigil';
    if (!this.textures.exists(key)) {
      const S = 220;
      const c = S / 2;
      const R = c - 2;
      const g = this.make.graphics({}, false);
      const at = (a: number, r: number) => ({ x: c + Math.cos(a) * r, y: c + Math.sin(a) * r });
      g.lineStyle(1, 0xffffff, 1);
      g.strokeCircle(c, c, R);
      g.strokeCircle(c, c, R * 0.88);
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        const p = at(a, R * (i % 5 === 0 ? 0.8 : 0.93));
        const q = at(a, R);
        g.lineBetween(p.x, p.y, q.x, q.y);
      }
      for (const turn of [0, Math.PI])
        g.strokePoints(
          [0, 1, 2].map((k) => at(turn - Math.PI / 2 + (k * Math.PI * 2) / 3, R * 0.66)),
          true,
        );
      g.strokeCircle(c, c, R * 0.3);
      g.lineStyle(2, 0xffffff, 1);
      const h1 = at(-Math.PI / 2, R * 0.55);
      const h2 = at(-Math.PI / 2 + 2.6, R * 0.38);
      g.lineBetween(c, c, h1.x, h1.y);
      g.lineBetween(c, c, h2.x, h2.y);
      g.generateTexture(key, S, S);
      g.destroy();
    }
    const sigil = this.add
      .image(x, y, key)
      .setTint(0x3b7fd6)
      .setAlpha(0.16)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: sigil, angle: 360, duration: 180000, repeat: -1 });
  }

  /** Peter (LPC-scale idle) at the edge of the title screen, if his sheets are loaded. */
  private createPeter(x: number, y: number): void {
    if (!this.textures.exists('peter_idle')) return;
    registerPeterAnimations(this);
    const peter = this.add.sprite(x, y, 'peter_idle', 0).setOrigin(0.5, 1).setScale(2);
    if (this.anims.exists('peter_idle_right')) peter.play('peter_idle_right');
    const glow = this.add
      .ellipse(x, y - 4, 70, 14, 0x00c8ff, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0.05, duration: 1600, yoyo: true, repeat: -1 });
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
