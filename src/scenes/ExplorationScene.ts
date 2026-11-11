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
import { DialogueDatabase, DialogueEffects } from '../systems/dialogue/DialogueTypes';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { FLAGS, GameSession, getSession } from '../state/GameSession';
import { DialogueBox } from '../ui/DialogueBox';
import { NotificationBanner } from '../ui/NotificationBanner';
import { QuestTracker } from '../ui/QuestTracker';
import { SatchelPanel } from '../ui/SatchelPanel';
import { StatusHud } from '../ui/StatusHud';
import { getStrings, Translate } from '../ui/Strings';
import { pickDialogue, pointInRect, resolveMap, tileCenter } from '../world/MapRegistry';
import type {
  MapDatabase,
  MapDefinition,
  MapEncounterDefinition,
  MapExitDefinition,
  MapTriggerDefinition,
} from '../world/MapTypes';
import type { CombatSceneData } from './CombatScene';

export interface ExplorationSceneData {
  /** Map to load (id or alias). Defaults to the saved map, then maps.json `startMapId`. */
  mapId?: string;
  /** Named spawn in the map (used by exits). */
  spawnId?: string;
  /** Exact position (e.g. after a battle). Wins over `spawnId`. */
  returnPosition?: { x: number; y: number };
  /** One-shot banner to show on arrival (e.g. battle rewards). */
  notice?: { title: string; subtitle: string };
  /** Dialogue opened shortly after arrival (e.g. a boss's last words after the battle). */
  openDialogueId?: string;
}

const PLAYER_SPEED = 130;

/**
 * Overworld scene. Everything placed in the world comes from public/assets/data/maps.json; this
 * scene wires it to the systems. UI lives in src/ui/.
 */
export class ExplorationScene extends Phaser.Scene {
  public player!: Player;
  public controller!: KeyboardPlayerController;
  public interactionSystem!: InteractionSystem;
  public dialogueSystem!: DialogueSystem;
  /** Game state for this playthrough; outlives the scene (see GameSession). */
  public session!: GameSession;
  public saveSystem = new SaveSystem();
  public groundLayer!: Phaser.Tilemaps.TilemapLayer;
  public wallLayer!: Phaser.Tilemaps.TilemapLayer;
  private soundSystem = SoundSystem.getInstance();

  private t!: Translate;
  private mapDef!: MapDefinition;
  private dialogueBox!: DialogueBox;
  private banner!: NotificationBanner;
  private questTracker!: QuestTracker;
  private satchel!: SatchelPanel;
  private statusHud!: StatusHud;
  private promptText!: Phaser.GameObjects.Text;

  // Scene-local state (reset in init on every entry)
  private encounterSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private isTransitioning = false;
  private pendingEnding = false;
  private lockedExitShown: string | null = null;
  private exitsArmed = false;
  private spawn = { x: 0, y: 0 };
  private pendingNotice: ExplorationSceneData['notice'] | null = null;
  private pendingDialogueId: string | null = null;

  constructor() {
    super({ key: 'ExplorationScene' });
  }

  // ---- Compatibility accessors (used by the CDP test scripts); state lives in the session ----
  public get inventorySystem(): InventorySystem {
    return this.session.inventory;
  }
  public get questSystem(): QuestSystem {
    return this.session.quests;
  }
  public get isShadeDefeated(): boolean {
    return this.session.getFlag(FLAGS.shadeDefeated);
  }
  public get shadeSprite(): Phaser.Physics.Arcade.Sprite | null {
    return this.encounterSprites[0] ?? null;
  }
  public get isTyping(): boolean {
    return this.dialogueBox.isTyping;
  }
  public get dialogueBodyText(): Phaser.GameObjects.Text {
    return this.dialogueBox.bodyText;
  }
  public get dialogueSpeakerText(): Phaser.GameObjects.Text {
    return this.dialogueBox.speakerText;
  }
  public get currentMapId(): string {
    return this.mapDef.id;
  }

  public init(data?: ExplorationSceneData): void {
    this.isTransitioning = false;
    this.pendingEnding = false;
    this.lockedExitShown = null;
    this.exitsArmed = false;
    this.encounterSprites = [];
    this.session = getSession(this);
    this.pendingNotice = data?.notice ?? null;
    this.pendingDialogueId = data?.openDialogueId ?? null;

    const db = this.cache.json.get('data_maps') as MapDatabase;
    this.mapDef = resolveMap(db, data?.mapId ?? this.session.position?.mapId);

    const saved = this.session.position;
    const savedHere = saved && resolveMap(db, saved.mapId).id === this.mapDef.id ? saved : null;
    const named = data?.spawnId ? this.mapDef.spawns[data.spawnId] : undefined;
    this.spawn =
      data?.returnPosition ??
      (named ? tileCenter(named) : null) ??
      (savedHere ? { x: savedHere.x, y: savedHere.y } : null) ??
      tileCenter(this.mapDef.spawns.default);
  }

  public create(): void {
    this.t = getStrings(this);

    this.dialogueSystem = new DialogueSystem();
    this.dialogueSystem.loadDatabase(this.cache.json.get('data_dialogue') as DialogueDatabase);
    this.dialogueSystem.addEventListener((event) => {
      if (event.type === 'node_changed' && event.node?.effects) {
        this.applyEffects(event.node.effects);
        if (event.node.effects.endPrologue) this.pendingEnding = true;
      }
      if (event.type === 'dialogue_ended' && this.pendingEnding) this.startPrologueEnding();
    });

    this.buildMap();
    this.interactionSystem = new InteractionSystem();

    this.controller = new KeyboardPlayerController(this);
    this.player = new Player(
      this,
      this.spawn.x,
      this.spawn.y,
      this.controller,
      new TopDownMovementSystem(),
      { speed: PLAYER_SPEED },
    );
    this.physics.add.collider(this.player.sprite, this.wallLayer);
    this.cameras.main.startFollow(this.player.sprite, true, 0.09, 0.09);
    // Maps smaller than the view (e.g. Peter's room) are centred instead of pinned top-left.
    const mapW = this.wallLayer.width;
    const mapH = this.wallLayer.height;
    const boundW = Math.max(mapW, this.scale.width);
    const boundH = Math.max(mapH, this.scale.height);
    this.cameras.main.setBounds((mapW - boundW) / 2, (mapH - boundH) / 2, boundW, boundH);

    this.createUI();
    this.spawnNpcs();
    this.spawnInteractables();
    this.spawnEncounters();
    this.setupQuestListeners();
    this.setupKeys();

    // Arrival banner first, then any quest banners it causes (B2: inventory is not touched here).
    if (this.pendingNotice) {
      this.banner.show(this.pendingNotice.title, this.pendingNotice.subtitle);
      this.pendingNotice = null;
    }
    if (this.pendingDialogueId) {
      const id = this.pendingDialogueId;
      this.pendingDialogueId = null;
      this.time.delayedCall(700, () => this.openDialogue(id));
    }
    this.session.syncQuestProgress();
    this.questTracker.refresh();

    for (const trig of this.mapDef.triggers ?? []) {
      if (trig.on === 'arrive' && this.canFire(trig)) {
        this.time.delayedCall(trig.delayMs ?? 0, () => this.fireTrigger(trig));
      }
    }

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.soundSystem.startBgm(this.mapDef.bgm);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.soundSystem.stopBgm(true));
  }

  public update(_time: number, delta: number): void {
    this.session.tick(delta);
    if (this.satchel.isOpen || this.isTransitioning) return;

    if (this.dialogueBox.isOpen()) {
      if (this.controller.getActions().interact) this.dialogueBox.interact();
      return;
    }

    this.player.update();
    const { x, y } = this.player;
    if (this.checkTriggers(x, y) || this.checkExits(x, y)) return;

    const nearby = this.interactionSystem.getClosestInteractable(new Phaser.Math.Vector2(x, y));
    this.promptText.setVisible(!!nearby);
    if (nearby) {
      this.promptText.setText(nearby.interactPrompt);
      if (this.controller.getActions().interact) nearby.onInteract(this.player.sprite);
    }
  }

  // ------------------------------------------------------------------ world building

  private buildMap(): void {
    const def = this.mapDef;
    const map = this.make.tilemap({ key: def.tilemap.key });
    const tileset = map.addTilesetImage(def.tileset.name, def.tileset.key);
    if (!tileset) throw new Error(`[${def.id}] tileset "${def.tileset.name}" failed to load.`);
    const ground = map.createLayer(def.layers.ground, tileset, 0, 0);
    const walls = map.createLayer(def.layers.walls, tileset, 0, 0);
    if (!ground || !walls) throw new Error(`[${def.id}] tilemap layers missing.`);
    this.groundLayer = ground;
    this.wallLayer = walls;
    walls.setCollisionBetween(def.collision.fromGid, def.collision.toGid, true);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  private spawnNpcs(): void {
    for (const def of this.mapDef.npcs ?? []) {
      const pos = tileCenter(def.tile);
      const npc = new NPC(
        this,
        pos.x,
        pos.y,
        def.texture,
        {
          id: def.id,
          name: def.name,
          dialogueId: def.dialogueId,
          prompt: def.prompt,
          interactionRadius: def.radius,
        },
        () => {
          this.openDialogue(pickDialogue(def.dialogueId, def.dialogueRules, this.stateView()));
          if (def.completeObjective) {
            this.questSystem.completeObjective(
              def.completeObjective.questId,
              def.completeObjective.objectiveId,
            );
          }
        },
      );
      if (def.anim && this.anims.exists(def.anim)) npc.sprite.play(def.anim);
      this.physics.add.collider(this.player.sprite, npc.sprite);
      this.interactionSystem.register(npc);
    }
  }

  private spawnInteractables(): void {
    for (const def of this.mapDef.interactables ?? []) {
      const pos = new Phaser.Math.Vector2(tileCenter(def.tile).x, tileCenter(def.tile).y);
      this.interactionSystem.register({
        id: def.id,
        interactPrompt: def.prompt,
        getInteractionPosition: () => pos,
        getInteractionRadius: () => def.radius,
        canInteract: () => !def.requiresFlag || this.session.getFlag(def.requiresFlag),
        onInteract: () => {
          this.openDialogue(def.dialogueId);
          if (def.completeObjective) {
            this.questSystem.completeObjective(
              def.completeObjective.questId,
              def.completeObjective.objectiveId,
            );
          }
        },
      });
    }
  }

  private spawnEncounters(): void {
    for (const def of this.mapDef.encounters ?? []) {
      if (this.session.getFlag(def.defeatedFlag)) continue;
      const pos = tileCenter(def.tile);
      const sprite = this.physics.add.sprite(pos.x, pos.y, def.texture).setImmovable(true);
      if (def.anim && this.anims.exists(def.anim)) sprite.play(def.anim);
      const size = def.hitbox ?? 22;
      sprite.body?.setSize(size, size);
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 6,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.physics.add.overlap(this.player.sprite, sprite, () => this.startEncounter(def));
      this.encounterSprites.push(sprite);
    }
  }

  // ------------------------------------------------------------------ triggers & exits

  private canFire(trig: MapTriggerDefinition): boolean {
    if (this.session.getFlag(trig.onceFlag)) return false;
    return !trig.requiresFlag || this.session.getFlag(trig.requiresFlag);
  }

  private fireTrigger(trig: MapTriggerDefinition): void {
    if (!this.canFire(trig) || this.isTransitioning) return;
    this.session.setFlag(trig.onceFlag);
    if (trig.effects) this.applyEffects(trig.effects);
    if (trig.dialogueId) this.openDialogue(trig.dialogueId);
  }

  /** Zone triggers; returns true when one fired this frame. */
  private checkTriggers(x: number, y: number): boolean {
    for (const trig of this.mapDef.triggers ?? []) {
      if (trig.on !== 'zone' || !trig.area || !pointInRect(x, y, trig.area)) continue;
      if (!this.canFire(trig)) continue;
      this.fireTrigger(trig);
      return true;
    }
    return false;
  }

  /** Map exits; returns true when Peter is leaving or a locked-exit message opened. */
  private checkExits(x: number, y: number): boolean {
    const exit = (this.mapDef.exits ?? []).find((e) => pointInRect(x, y, e.area));
    if (!exit) {
      this.lockedExitShown = null;
      this.exitsArmed = true;
      return false;
    }
    // Arriving inside an exit area (e.g. a spawn placed on a doorway) must not bounce Peter back.
    if (!this.exitsArmed) return false;
    if (exit.requiresFlag && !this.session.getFlag(exit.requiresFlag)) {
      if (this.lockedExitShown !== exit.id && exit.lockedDialogueId) {
        this.lockedExitShown = exit.id;
        this.openDialogue(exit.lockedDialogueId);
        return true;
      }
      return false;
    }
    this.travel(exit);
    return true;
  }

  private travel(exit: MapExitDefinition): void {
    this.beginSceneExit();
    const db = this.cache.json.get('data_maps') as MapDatabase;
    const target = resolveMap(db, exit.toMap);
    const spawnTile = target.spawns[exit.toSpawn] ?? target.spawns.default;
    this.session.position = { mapId: target.id, ...tileCenter(spawnTile) };
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const data: ExplorationSceneData = { mapId: target.id, spawnId: exit.toSpawn };
      this.scene.restart(data);
    });
  }

  private startEncounter(def: MapEncounterDefinition): void {
    if (this.isTransitioning) return;
    this.beginSceneExit();
    this.cameras.main.flash(350, 0, 200, 255);
    this.cameras.main.fadeOut(350, 0, 0, 0);

    const returnPosition = { x: this.player.x - 24, y: this.player.y };
    this.session.position = { mapId: this.mapDef.id, ...returnPosition };
    const revive = tileCenter(this.mapDef.revive ?? this.mapDef.spawns.default);

    this.time.delayedCall(350, () => {
      const data: CombatSceneData = {
        enemyId: def.enemyId,
        victoryFlag: def.defeatedFlag,
        returnPosition,
        revivePosition: revive,
        victoryDialogueId: def.victoryDialogueId,
      };
      this.scene.start('CombatScene', data);
    });
  }

  /** Freezes input for a fade-out (map change, battle, ending). */
  private beginSceneExit(): void {
    this.isTransitioning = true;
    this.controller.setEnabled(false);
    this.player.getMovementSystem().stop(this.player.sprite);
    this.promptText.setVisible(false);
  }

  // ------------------------------------------------------------------ UI & dialogue

  private createUI(): void {
    const { width, height } = this.scale;
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

    this.statusHud = new StatusHud(this, this.session, this.t, this.mapDef.name);
    this.questTracker = new QuestTracker(this, this.questSystem, this.t);
    this.banner = new NotificationBanner(this);
    this.dialogueBox = new DialogueBox(this, this.dialogueSystem, this.t, () => {
      // A dialogue can end into a scene exit (Elder farewell -> Prologue ending): keep input off.
      if (!this.isTransitioning) this.controller.setEnabled(true);
    });
    this.satchel = new SatchelPanel(
      this,
      this.session,
      this.soundSystem,
      this.t,
      (title, subtitle) => this.showNotification(title, subtitle),
      () => this.statusHud.refresh(),
    );
  }

  private setupKeys(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    const K = Phaser.Input.Keyboard.KeyCodes;
    const on = (code: number, fn: () => void): void => {
      kb.addKey(code).on('down', fn);
    };

    on(K.ESC, () => {
      if (this.satchel.isOpen) this.toggleInventory();
      else if (this.dialogueBox.isOpen()) this.closeDialogue();
      else this.returnToMenu();
    });
    on(K.I, () => this.toggleInventory());
    on(K.B, () => this.toggleInventory());
    on(K.UP, () => this.satchel.isOpen && this.satchel.navigate(-1));
    on(K.DOWN, () => this.satchel.isOpen && this.satchel.navigate(1));
    on(K.E, () => this.satchel.isOpen && this.satchel.useSelected());
    on(K.SPACE, () => this.satchel.isOpen && this.satchel.useSelected());
    on(K.K, () => void this.quickSave());
    on(K.Q, () => {
      if (this.questTracker.cycle()) this.soundSystem.playCursorBlip();
    });
    on(K.ONE, () => this.dialogueBox.choose(0));
    on(K.TWO, () => this.dialogueBox.choose(1));
  }

  private setupQuestListeners(): void {
    const listener: QuestEventListener = (event) => {
      this.questTracker.refresh();
      if (event.type === 'quest_started') {
        this.showNotification(this.t('notify.newQuest'), `◆ ${event.quest.title}`);
      } else if (event.type === 'objective_completed' && event.objective) {
        this.showNotification(this.t('notify.objectiveDone'), `✓ ${event.objective.description}`);
      } else if (event.type === 'quest_completed') {
        const rewards = this.session.claimQuestRewards(event.quest.id);
        this.statusHud.refresh();
        const rewardText = rewards ? this.session.describeRewards(rewards) : '';
        this.showNotification(
          this.t('notify.questDone'),
          rewardText ? `★ ${event.quest.title} (${rewardText})` : `★ ${event.quest.title}`,
        );
        // Start any follow-up quest (and auto-complete flag objectives already satisfied).
        this.session.syncQuestProgress();
      }
    };
    // The QuestSystem outlives this scene, so the listener must not (it would call into destroyed UI).
    this.questSystem.addEventListener(listener);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.questSystem.removeEventListener(listener),
    );
  }

  private stateView() {
    return {
      isQuestCompleted: (id: string) => this.questSystem.isQuestCompleted(id),
      getFlag: (flag: string) => this.session.getFlag(flag),
    };
  }

  /** Applies data-driven effects and announces any items received. */
  private applyEffects(effects: DialogueEffects): void {
    const granted = this.session.applyDialogueEffects(effects);
    if (granted.length > 0) {
      const names = granted
        .map((s) => {
          const name = this.inventorySystem.getItemDefinition(s.itemId)?.name ?? s.itemId;
          return s.quantity > 1 ? `${name} x${s.quantity}` : name;
        })
        .join(', ');
      this.showNotification(this.t('notify.itemObtained'), `◆ ${names}`);
    }
    this.statusHud.refresh();
    this.questTracker.refresh();
  }

  // ------------------------------------------------------------------ public API (tests, systems)

  public openDialogue(dialogueId: string): void {
    if (!this.dialogueBox.open(dialogueId)) return;
    // Movement is frozen while dialogue is open (update() skips player.update()). The controller
    // stays enabled: a disabled controller reports no actions, so E / Space could not advance.
    this.player.getMovementSystem().stop(this.player.sprite);
    this.promptText.setVisible(false);
  }

  public closeDialogue(): void {
    this.dialogueBox.close();
  }

  public showNotification(title: string, subtitle: string): void {
    this.banner.show(title, subtitle);
  }

  public updateQuestHUD(): void {
    this.questTracker.refresh();
  }

  public updatePlayerStatusHUD(): void {
    this.statusHud.refresh();
  }

  public toggleInventory(): void {
    this.satchel.toggle();
    if (this.satchel.isOpen) this.player.sprite.setVelocity(0, 0);
  }

  public navigateInventory(direction: number): void {
    this.satchel.navigate(direction);
  }

  public useSelectedInventoryItem(): void {
    this.satchel.useSelected();
  }

  public async quickSave(): Promise<void> {
    const saveData = this.session.toSaveData({
      mapId: this.mapDef.id,
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    });
    if (await this.saveSystem.save(1, saveData)) {
      this.showNotification(this.t('notify.saved'), this.t('notify.savedDetail'));
    }
  }

  /** Fades out to the Prologue closing card. Guarded so it runs once per scene entry. */
  public startPrologueEnding(): void {
    if (this.isTransitioning) return;
    this.beginSceneExit();
    this.session.setFlag(FLAGS.prologueComplete);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('PrologueEndScene');
    });
  }

  private returnToMenu(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
