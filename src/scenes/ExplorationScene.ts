import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { KeyboardPlayerController } from '../systems/input/KeyboardPlayerController';
import { TopDownMovementSystem } from '../systems/movement/TopDownMovementSystem';
import { InteractionSystem } from '../systems/interaction/InteractionSystem';
import { DialogueSystem } from '../systems/dialogue/DialogueSystem';
import { QuestSystem, QuestEventListener } from '../systems/quest/QuestSystem';
import { InventorySystem } from '../systems/inventory/InventorySystem';
import { SaveSystem } from '../systems/save/SaveSystem';
import { DialogueDatabase } from '../systems/dialogue/DialogueTypes';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { DEFAULT_MAP_ID, FLAGS, GameSession, getSession } from '../state/GameSession';
import type { CombatSceneData } from './CombatScene';

const PROLOGUE_QUEST_ID = 'quest_prologue_awakening';
const DEFAULT_SPAWN = { x: 12 * 32, y: 10 * 32 };

export interface ExplorationSceneData {
  /** Where to place Peter (e.g. after a battle). Defaults to the session position, then map spawn. */
  returnPosition?: { x: number; y: number };
  /** One-shot banner to show on arrival (e.g. battle rewards). */
  notice?: { title: string; subtitle: string };
}

export class ExplorationScene extends Phaser.Scene {
  public player!: Player;
  public controller!: KeyboardPlayerController;
  public interactionSystem!: InteractionSystem;
  public dialogueSystem!: DialogueSystem;
  /** Game state for this playthrough; outlives the scene (see GameSession). */
  public session!: GameSession;
  public saveSystem = new SaveSystem();
  private soundSystem = SoundSystem.getInstance();

  private map!: Phaser.Tilemaps.Tilemap;
  public groundLayer!: Phaser.Tilemaps.TilemapLayer;
  public wallLayer!: Phaser.Tilemaps.TilemapLayer;

  // UI Elements
  private promptText!: Phaser.GameObjects.Text;
  private dialogueBoxContainer!: Phaser.GameObjects.Container;
  private dialogueSpeakerText!: Phaser.GameObjects.Text;
  private dialogueBodyText!: Phaser.GameObjects.Text;
  private dialogueContinueHint!: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Text[] = [];

  // Inventory UI
  private inventoryContainer!: Phaser.GameObjects.Container;
  private isInventoryOpen = false;
  private inventoryItemContainer!: Phaser.GameObjects.Container;

  // Quest HUD Elements
  private questTrackerContainer!: Phaser.GameObjects.Container;
  private questTitleText!: Phaser.GameObjects.Text;
  private questObjectiveTexts: Phaser.GameObjects.Text[] = [];

  // Notification Banner
  private notificationContainer!: Phaser.GameObjects.Container;
  private notificationTitle!: Phaser.GameObjects.Text;
  private notificationSubtitle!: Phaser.GameObjects.Text;
  private notificationTween: Phaser.Tweens.Tween | null = null;

  // Typewriter state
  private isTyping = false;
  private fullTargetText = '';
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;

  // Scene-local state (reset in init on every entry)
  private shadeSprite: Phaser.Physics.Arcade.Sprite | null = null;
  private isTransitioningToBattle = false;
  private spawnOrigin = new Phaser.Math.Vector2(DEFAULT_SPAWN.x, DEFAULT_SPAWN.y);
  private pendingNotice: ExplorationSceneData['notice'] | null = null;

  constructor() {
    super({ key: 'ExplorationScene' });
  }

  /** Compatibility accessors (used by CDP test scripts); state lives in the session. */
  public get inventorySystem(): InventorySystem {
    return this.session.inventory;
  }

  public get questSystem(): QuestSystem {
    return this.session.quests;
  }

  public get isShadeDefeated(): boolean {
    return this.session.getFlag(FLAGS.shadeDefeated);
  }

  public init(data?: ExplorationSceneData): void {
    this.isTransitioningToBattle = false;
    this.isTyping = false;
    this.isInventoryOpen = false;
    this.fullTargetText = '';
    this.typewriterTimer = null;
    this.notificationTween = null;
    this.questObjectiveTexts = [];
    this.choiceButtons = [];
    this.shadeSprite = null;

    this.session = getSession(this);
    this.pendingNotice = data?.notice ?? null;

    const spawn = data?.returnPosition ?? this.session.position ?? DEFAULT_SPAWN;
    this.spawnOrigin.set(spawn.x, spawn.y);
  }

  public create(): void {
    // 1. Dialogue database (dialogue progress is scene-local; quest/inventory state is in the session)
    const dialogueData = this.cache.json.get('data_dialogue') as DialogueDatabase;
    this.dialogueSystem = new DialogueSystem();
    this.dialogueSystem.loadDatabase(dialogueData);

    // 2. Initialize Map & Tileset
    this.map = this.make.tilemap({ key: 'prologue_map' });
    const tileset = this.map.addTilesetImage('dungeon_tileset', 'dungeon_tileset');

    if (!tileset) {
      throw new Error('Failed to load tileset "dungeon_tileset".');
    }

    const groundLayer = this.map.createLayer(
      'Ground',
      tileset,
      0,
      0,
    ) as Phaser.Tilemaps.TilemapLayer | null;
    const wallLayer = this.map.createLayer(
      'Walls',
      tileset,
      0,
      0,
    ) as Phaser.Tilemaps.TilemapLayer | null;

    if (!groundLayer || !wallLayer) {
      throw new Error('Failed to create tilemap layers.');
    }

    this.groundLayer = groundLayer;
    this.wallLayer = wallLayer;

    // 3. Collision Boundaries setup
    this.wallLayer.setCollisionBetween(4, 16, true);
    const mapWidthPx = this.map.widthInPixels;
    const mapHeightPx = this.map.heightInPixels;
    this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);

    // 4. Initialize Interaction System
    this.interactionSystem = new InteractionSystem();

    // 5. Initialize Player
    this.controller = new KeyboardPlayerController(this);
    const movementSystem = new TopDownMovementSystem();
    this.player = new Player(
      this,
      this.spawnOrigin.x,
      this.spawnOrigin.y,
      this.controller,
      movementSystem,
      { speed: 130 },
    );

    this.physics.add.collider(this.player.sprite, this.wallLayer);

    // 6. Camera Follow Configuration
    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setZoom(1.0);

    // 7. Initialize NPCs / Interactables
    this.setupInteractables();
    this.setupEnemies();

    // 8. Create HUD, Dialogue Overlay, and Quest Tracker UI
    this.createUI();

    // 9. Subscribe to Quest Events
    this.setupQuestListeners();

    // 10. Ensure the prologue quest is running (no-op if already started/completed)
    if (this.questSystem.getQuestStage(PROLOGUE_QUEST_ID) === 'inactive') {
      this.questSystem.startQuest(PROLOGUE_QUEST_ID);
    }
    this.updateQuestHUD();

    // 11. One-shot arrival banner (e.g. battle rewards). Inventory is never touched here (B2).
    const notice = this.pendingNotice;
    if (notice) {
      this.pendingNotice = null;
      this.time.delayedCall(450, () => this.showNotification(notice.title, notice.subtitle));
    }

    // Fade in from transition
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Start procedural ambient ruin BGM and stop all audio nodes on shutdown
    this.soundSystem.startBgm('ambient');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.soundSystem.stopBgm(true);
    });

    // Global Key Listeners
    if (this.input.keyboard) {
      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => {
        if (this.isInventoryOpen) {
          this.toggleInventory();
        } else if (this.dialogueSystem.isActive()) {
          this.closeDialogue();
        } else {
          this.returnToMenu();
        }
      });

      // Satchel / Inventory toggle
      const keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
      const keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
      keyI.on('down', () => this.toggleInventory());
      keyB.on('down', () => this.toggleInventory());

      // Quick save
      const keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
      keyK.on('down', () => this.quickSave());

      // Quick numbers 1-2 for dialogue choice selection
      const key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      const key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
      key1.on('down', () => this.handleChoiceKey(0));
      key2.on('down', () => this.handleChoiceKey(1));
    }
  }

  private setupInteractables(): void {
    // NPC: Elder Chronographer
    const elder = new NPC(
      this,
      9 * 32 + 16,
      8 * 32 + 16,
      'npc_elder',
      {
        id: 'npc_elder',
        name: 'Elder Chronographer',
        dialogueId: 'npc_elder_greeting',
        prompt: '[E] Talk with Elder Chronographer',
        interactionRadius: 44,
      },
      () => {
        this.openDialogue('npc_elder_greeting');
        // Progress quest objective
        this.questSystem.completeObjective(PROLOGUE_QUEST_ID, 'obj_speak_elder');
      },
    );

    this.physics.add.collider(this.player.sprite, elder.sprite);
    this.interactionSystem.register(elder);

    // Altar Interactable
    const altarInteractable = {
      id: 'altar_of_moments',
      interactPrompt: '[E] Inspect Altar of Moments',
      getInteractionPosition: () => new Phaser.Math.Vector2(11 * 32 + 16, 5 * 32 + 16),
      getInteractionRadius: () => 48,
      canInteract: () => true,
      onInteract: () => {
        this.openDialogue('altar_inspection');
        // Progress quest objective
        this.questSystem.completeObjective(PROLOGUE_QUEST_ID, 'obj_inspect_altar');
      },
    };
    this.interactionSystem.register(altarInteractable);
  }

  private setupEnemies(): void {
    if (this.session.getFlag(FLAGS.shadeDefeated)) return;

    this.shadeSprite = this.physics.add.sprite(16 * 32 + 16, 9 * 32 + 16, 'enemy_fracture');
    this.shadeSprite.setImmovable(true);
    if (this.shadeSprite.body) {
      this.shadeSprite.body.setSize(22, 22);
    }

    this.tweens.add({
      targets: this.shadeSprite,
      y: this.shadeSprite.y - 6,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.physics.add.overlap(this.player.sprite, this.shadeSprite, () => {
      this.triggerCombatEncounter();
    });
  }

  private triggerCombatEncounter(): void {
    if (this.isTransitioningToBattle) return;

    this.isTransitioningToBattle = true;
    this.controller.setEnabled(false);
    this.player.getMovementSystem().stop(this.player.sprite);

    // Visual encounter flash transition
    this.cameras.main.flash(350, 0, 200, 255);
    this.cameras.main.fadeOut(350, 0, 0, 0);

    const returnPosition = { x: this.player.x - 24, y: this.player.y };
    this.session.position = { mapId: DEFAULT_MAP_ID, ...returnPosition };

    this.time.delayedCall(350, () => {
      const data: CombatSceneData = {
        enemyId: 'enemy_temporal_shade',
        victoryFlag: FLAGS.shadeDefeated,
        returnPosition,
      };
      this.scene.start('CombatScene', data);
    });
  }

  private createUI(): void {
    const { width, height } = this.scale;

    // 1. Interaction Prompt Text
    this.promptText = this.add
      .text(width / 2, height - 36, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#ffea79',
        backgroundColor: '#0c101cd0',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    // 2. Exploration Header Banner (Location)
    const headerBg = this.add.graphics().setScrollFactor(0).setDepth(90);
    headerBg.fillStyle(0x0a0c16, 0.75);
    headerBg.fillRect(10, 10, 240, 34);
    headerBg.lineStyle(1, 0x2e3852, 1);
    headerBg.strokeRect(10, 10, 240, 34);

    this.add
      .text(18, 14, 'LOCATION: Shattered Antechamber', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#65d5ff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(95);

    this.add
      .text(18, 27, 'PHASE: Prologue (Vertical Slice)', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#8b97b8',
      })
      .setScrollFactor(0)
      .setDepth(95);

    // 3. Quest Tracker Panel (Top-Right HUD)
    this.createQuestHUD(width);

    // 4. Notification Banner (Top-Center)
    this.createNotificationHUD(width);

    // 5. Navigation Controls Hint (Bottom Left)
    this.add
      .text(
        10,
        height - 16,
        '[WASD / Arrows] Move  |  [E / Space] Interact  |  [I / B] Satchel  |  [K] Save  |  [ESC] Menu',
        {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#5d6b8a',
          backgroundColor: '#07080fcc',
          padding: { left: 4, right: 4, top: 2, bottom: 2 },
        },
      )
      .setScrollFactor(0)
      .setDepth(90);

    // 6. Dialogue Box Container (HUD overlay)
    this.createDialogueHUD(width, height);

    // 7. Inventory Satchel HUD Overlay
    this.createInventoryHUD(width, height);
  }

  private createQuestHUD(width: number): void {
    const panelWidth = 220;
    const panelHeight = 62;
    const panelX = width - panelWidth - 10;
    const panelY = 10;

    this.questTrackerContainer = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(90);

    const bg = this.add.graphics();
    bg.fillStyle(0x090b14, 0.85);
    bg.fillRect(0, 0, panelWidth, panelHeight);
    bg.lineStyle(1, 0x243048, 1);
    bg.strokeRect(0, 0, panelWidth, panelHeight);

    const label = this.add.text(10, 6, 'CURRENT QUEST', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#00d2ff',
      letterSpacing: 1,
    });

    this.questTitleText = this.add.text(10, 18, 'Echoes in the Fracture', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#e4ebf5',
      fontStyle: 'bold',
    });

    this.questTrackerContainer.add([bg, label, this.questTitleText]);

    // Objective text rows
    for (let i = 0; i < 2; i++) {
      const objText = this.add.text(10, 32 + i * 13, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#8b9bb4',
      });
      this.questObjectiveTexts.push(objText);
      this.questTrackerContainer.add(objText);
    }
  }

  private createNotificationHUD(width: number): void {
    const bannerWidth = 320;
    const bannerHeight = 38;
    const bannerX = width / 2 - bannerWidth / 2;
    const bannerY = -50; // Initially hidden off-screen

    this.notificationContainer = this.add
      .container(bannerX, bannerY)
      .setScrollFactor(0)
      .setDepth(300)
      .setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x0d1424, 0.95);
    bg.fillRect(0, 0, bannerWidth, bannerHeight);
    bg.lineStyle(1, 0x00e1ff, 1);
    bg.strokeRect(0, 0, bannerWidth, bannerHeight);

    this.notificationTitle = this.add
      .text(bannerWidth / 2, 7, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#00e1ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    this.notificationSubtitle = this.add
      .text(bannerWidth / 2, 20, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#cdd7eb',
      })
      .setOrigin(0.5, 0);

    this.notificationContainer.add([bg, this.notificationTitle, this.notificationSubtitle]);
  }

  private createDialogueHUD(width: number, height: number): void {
    this.dialogueBoxContainer = this.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false);

    const boxWidth = width - 60;
    const boxHeight = 84;
    const boxX = 30;
    const boxY = height - boxHeight - 16;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1322, 0.95);
    bg.fillRect(boxX, boxY, boxWidth, boxHeight);
    bg.lineStyle(2, 0x00d2ff, 1);
    bg.strokeRect(boxX, boxY, boxWidth, boxHeight);

    this.dialogueSpeakerText = this.add.text(boxX + 16, boxY + 9, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#00e1ff',
      fontStyle: 'bold',
    });

    this.dialogueBodyText = this.add.text(boxX + 16, boxY + 28, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e4ebf5',
      wordWrap: { width: boxWidth - 32 },
    });

    this.dialogueContinueHint = this.add
      .text(boxX + boxWidth - 14, boxY + boxHeight - 12, '[E / Space to continue]', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#7f90b3',
      })
      .setOrigin(1, 1);

    this.dialogueBoxContainer.add([
      bg,
      this.dialogueSpeakerText,
      this.dialogueBodyText,
      this.dialogueContinueHint,
    ]);

    // Create 2 choice buttons for branching
    for (let i = 0; i < 2; i++) {
      const btn = this.add
        .text(boxX + 24 + i * 220, boxY + 54, '', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ffd666',
          backgroundColor: '#161d30',
          padding: { left: 6, right: 6, top: 3, bottom: 3 },
        })
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const choiceIdx = i;
      btn.on('pointerdown', () => this.handleChoiceSelect(choiceIdx));
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => btn.setColor('#ffd666'));

      this.choiceButtons.push(btn);
      this.dialogueBoxContainer.add(btn);
    }
  }

  private setupQuestListeners(): void {
    const listener: QuestEventListener = (event) => {
      this.updateQuestHUD();

      if (event.type === 'objective_completed' && event.objective) {
        this.showNotification('OBJECTIVE COMPLETED', `✓ ${event.objective.description}`);
      } else if (event.type === 'quest_completed') {
        const rewards = this.session.claimQuestRewards(event.quest.id);
        const rewardText = rewards ? this.session.describeRewards(rewards) : '';
        this.showNotification(
          'QUEST COMPLETED!',
          rewardText ? `★ ${event.quest.title} (${rewardText})` : `★ ${event.quest.title}`,
        );
      }
    };

    // The QuestSystem outlives this scene, so the listener must not (it would call into destroyed UI).
    this.questSystem.addEventListener(listener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.questSystem.removeEventListener(listener);
    });
  }

  public updateQuestHUD(): void {
    const activeQuests = this.questSystem.getActiveQuests();
    if (activeQuests.length === 0) {
      const completed = this.questSystem.isQuestCompleted(PROLOGUE_QUEST_ID);
      if (completed) {
        this.questTitleText.setText('Prologue Quest Complete');
        this.questObjectiveTexts[0]?.setText('✓ Sanctuary antechamber surveyed');
        this.questObjectiveTexts[1]?.setText('✓ Awaiting Milestone 3 (Combat)');
      } else {
        this.questTitleText.setText('No Active Quest');
        this.questObjectiveTexts.forEach((t) => t.setText(''));
      }
      return;
    }

    const currentQuest = activeQuests[0];
    this.questTitleText.setText(currentQuest.title);

    currentQuest.objectives.forEach((obj, idx) => {
      if (this.questObjectiveTexts[idx]) {
        const check = obj.completed ? '✓' : '○';
        const color = obj.completed ? '#48bb78' : '#8b9bb4';
        this.questObjectiveTexts[idx].setText(`${check} ${obj.description}`);
        this.questObjectiveTexts[idx].setColor(color);
      }
    });
  }

  public showNotification(title: string, subtitle: string): void {
    if (this.notificationTween) {
      this.notificationTween.stop();
    }

    this.notificationTitle.setText(title);
    this.notificationSubtitle.setText(subtitle);
    this.notificationContainer.setY(-50);
    this.notificationContainer.setVisible(true);

    this.notificationTween = this.tweens.add({
      targets: this.notificationContainer,
      y: 12,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2400, () => {
          this.tweens.add({
            targets: this.notificationContainer,
            y: -50,
            duration: 300,
            ease: 'Sine.easeIn',
            onComplete: () => {
              this.notificationContainer.setVisible(false);
            },
          });
        });
      },
    });
  }

  private createInventoryHUD(width: number, height: number): void {
    const panelWidth = 440;
    const panelHeight = 220;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    this.inventoryContainer = this.add
      .container(panelX, panelY)
      .setScrollFactor(0)
      .setDepth(250)
      .setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0d18, 0.96);
    bg.fillRect(0, 0, panelWidth, panelHeight);
    bg.lineStyle(2, 0x00c8ff, 1);
    bg.strokeRect(0, 0, panelWidth, panelHeight);

    // Decorative inner border
    bg.lineStyle(1, 0x22324f, 0.8);
    bg.strokeRect(6, 6, panelWidth - 12, panelHeight - 12);

    // Title
    const title = this.add.text(18, 14, "PETER'S SATCHEL — INVENTORY & CHRONAL RELICS", {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#00e1ff',
      fontStyle: 'bold',
      letterSpacing: 1,
    });

    // Subtitle / Capacity
    const subtitle = this.add.text(18, 28, 'Capacity: 16 Slots | Category: All Items', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#6e80a3',
    });

    const divider = this.add.graphics();
    divider.lineStyle(1, 0x1f2b45, 1);
    divider.lineBetween(18, 42, panelWidth - 18, 42);

    this.inventoryItemContainer = this.add.container(18, 50);

    const footer = this.add
      .text(panelWidth / 2, panelHeight - 16, '[I / B / ESC] Close Satchel  |  [K] Quick Save', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#65789e',
      })
      .setOrigin(0.5);

    this.inventoryContainer.add([
      bg,
      title,
      subtitle,
      divider,
      this.inventoryItemContainer,
      footer,
    ]);
  }

  private refreshInventoryUI(): void {
    this.inventoryItemContainer.removeAll(true);
    const items = this.inventorySystem.getAllItems();

    if (items.length === 0) {
      const emptyText = this.add.text(10, 20, 'Satchel is empty.', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#677594',
      });
      this.inventoryItemContainer.add(emptyText);
      return;
    }

    items.forEach((stack, idx) => {
      const def = this.inventorySystem.getItemDefinition(stack.itemId);
      if (!def) return;

      const yOffset = idx * 46;
      const categoryColor =
        def.type === 'key_item' ? '#ffd700' : def.type === 'consumable' ? '#00e1ff' : '#99b0d1';

      // Item category tag + name
      const headerText = this.add.text(
        0,
        yOffset,
        `[${def.type.toUpperCase()}] ${def.name}  x${stack.quantity}`,
        {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: categoryColor,
          fontStyle: 'bold',
        },
      );

      // Item description
      const descText = this.add.text(12, yOffset + 14, def.description, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#b8c5de',
        wordWrap: { width: 390 },
      });

      this.inventoryItemContainer.add([headerText, descText]);
    });
  }

  public toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;
    if (this.isInventoryOpen) {
      this.refreshInventoryUI();
      this.inventoryContainer.setVisible(true);
      if (this.player) {
        this.player.sprite.setVelocity(0, 0);
      }
    } else {
      this.inventoryContainer.setVisible(false);
    }
  }

  public async quickSave(): Promise<void> {
    const saveData = this.session.toSaveData({
      mapId: DEFAULT_MAP_ID,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    });

    const success = await this.saveSystem.save(1, saveData);
    if (success) {
      this.showNotification('GAME SAVED', 'Progress recorded to Chrono Slot 1');
    }
  }

  public update(_time: number, delta: number): void {
    this.session.tick(delta);

    // 0. If inventory is open, pause exploration movement
    if (this.isInventoryOpen) {
      return;
    }

    // 1. Check Awakening Trigger Zone
    if (!this.session.getFlag(FLAGS.awakeningTriggered) && this.player) {
      const distFromSpawn = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.spawnOrigin.x,
        this.spawnOrigin.y,
      );
      if (distFromSpawn > 18) {
        this.session.setFlag(FLAGS.awakeningTriggered);
        this.time.delayedCall(300, () => {
          this.openDialogue('intro_awakening');
        });
        return;
      }
    }

    // 2. If dialogue is active, handle dialogue progression
    if (this.dialogueSystem.isActive()) {
      const actions = this.controller.getActions();
      if (actions.interact) {
        this.handleDialogueInteract();
      }
      return;
    }

    // 3. Normal Exploration Update
    this.player.update();

    // 4. Interaction Check
    const origin = new Phaser.Math.Vector2(this.player.x, this.player.y);
    const nearby = this.interactionSystem.getClosestInteractable(origin);

    if (nearby) {
      this.promptText.setText(nearby.interactPrompt);
      this.promptText.setVisible(true);

      const actions = this.controller.getActions();
      if (actions.interact) {
        nearby.onInteract(this.player.sprite);
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  public openDialogue(dialogueId: string): void {
    const started = this.dialogueSystem.startDialogue(dialogueId);
    if (!started) return;

    this.controller.setEnabled(false);
    this.player.getMovementSystem().stop(this.player.sprite);
    this.dialogueBoxContainer.setVisible(true);

    this.renderCurrentDialogue();
  }

  private renderCurrentDialogue(): void {
    const node = this.dialogueSystem.getCurrentNode();
    const line = this.dialogueSystem.getCurrentLine();
    if (!node || !line) return;

    this.dialogueSpeakerText.setText(node.speaker);

    // Hide choices while typing
    this.choiceButtons.forEach((btn) => btn.setVisible(false));

    // Start Typewriter
    this.startTypewriter(line);

    this.updateDialogueHints();
  }

  private startTypewriter(text: string): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
    }

    this.fullTargetText = text;
    this.isTyping = true;
    let charIndex = 0;
    this.dialogueBodyText.setText('');

    this.typewriterTimer = this.time.addEvent({
      delay: 18,
      repeat: text.length - 1,
      callback: () => {
        charIndex++;
        this.dialogueBodyText.setText(text.substring(0, charIndex));
        if (charIndex >= text.length) {
          this.isTyping = false;
          this.onTypewriterComplete();
        }
      },
    });
  }

  private completeTypewriterImmediately(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }
    this.isTyping = false;
    this.dialogueBodyText.setText(this.fullTargetText);
    this.onTypewriterComplete();
  }

  private onTypewriterComplete(): void {
    this.updateDialogueHints();

    // If at last line and has choices, display choice buttons
    if (this.dialogueSystem.isLastLineOfNode()) {
      const responses = this.dialogueSystem.getAvailableResponses();
      if (responses.length > 0) {
        responses.forEach((resp, idx) => {
          if (this.choiceButtons[idx]) {
            this.choiceButtons[idx].setText(`[${idx + 1}] ${resp.text}`);
            this.choiceButtons[idx].setVisible(true);
          }
        });
      }
    }
  }

  private updateDialogueHints(): void {
    const node = this.dialogueSystem.getCurrentNode();
    if (!node) return;

    if (this.isTyping) {
      this.dialogueContinueHint.setText('[E / Space to skip]');
      return;
    }

    const isLast = this.dialogueSystem.isLastLineOfNode();
    const hasChoices = this.dialogueSystem.getAvailableResponses().length > 0;

    if (isLast) {
      if (hasChoices) {
        this.dialogueContinueHint.setText('[Press 1 or 2 to choose]');
      } else {
        this.dialogueContinueHint.setText('[E / Space / ESC to close]');
      }
    } else {
      this.dialogueContinueHint.setText('[E / Space to continue]');
    }
  }

  private handleDialogueInteract(): void {
    // If typing, immediately complete line
    if (this.isTyping) {
      this.completeTypewriterImmediately();
      return;
    }

    // If choices are presented, wait for choice selection
    const isLast = this.dialogueSystem.isLastLineOfNode();
    const hasChoices = this.dialogueSystem.getAvailableResponses().length > 0;
    if (isLast && hasChoices) {
      return;
    }

    // Advance dialogue
    const hasMore = this.dialogueSystem.advance();
    if (hasMore) {
      this.renderCurrentDialogue();
    } else {
      this.closeDialogue();
    }
  }

  private handleChoiceKey(choiceIndex: number): void {
    if (!this.dialogueSystem.isActive() || this.isTyping) return;
    if (!this.dialogueSystem.isLastLineOfNode()) return;

    this.handleChoiceSelect(choiceIndex);
  }

  private handleChoiceSelect(index: number): void {
    const responses = this.dialogueSystem.getAvailableResponses();
    if (index >= 0 && index < responses.length) {
      const selected = responses[index];
      if (selected.nextDialogueId) {
        this.openDialogue(selected.nextDialogueId);
      } else {
        this.closeDialogue();
      }
    }
  }

  public closeDialogue(): void {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }
    this.isTyping = false;
    this.choiceButtons.forEach((btn) => btn.setVisible(false));
    this.dialogueSystem.close();
    this.dialogueBoxContainer.setVisible(false);
    this.controller.setEnabled(true);
  }

  private returnToMenu(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
