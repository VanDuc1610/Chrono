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
import { ActionCombat } from '../world/ActionCombat';
import { getStrings, Translate } from '../ui/Strings';
import {
  conditionHolds,
  pickDialogue,
  pointInRect,
  resolveMap,
  tileCenter,
} from '../world/MapRegistry';
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
  private visionSprites: Phaser.GameObjects.Sprite[] = [];
  private npcSprites: Phaser.GameObjects.Sprite[] = [];
  private frozenVeil: Phaser.GameObjects.Rectangle | null = null;
  private isFrozen = false;
  /** Encounter started as soon as the current dialogue closes (scripted battles). */
  private pendingEncounter: MapEncounterDefinition | null = null;
  /** Rebuild the map in place when the current dialogue closes (effects.refreshMap). */
  private pendingRefresh = false;
  private isTransitioning = false;
  private pendingEnding = false;
  /** Chapter whose end card plays (0 = Prologue). */
  private pendingChapter = 0;
  private lockedExitShown: string | null = null;
  private exitsArmed = false;
  private spawn = { x: 0, y: 0 };
  private pendingNotice: ExplorationSceneData['notice'] | null = null;
  private pendingDialogueId: string | null = null;
  /** Real-time combat with the map's roaming enemies (null until create). */
  public action: ActionCombat | null = null;
  /** Map / spawn Peter is carried to when the current dialogue closes (effects.warpTo). */
  private pendingWarp: { mapId: string; spawnId: string } | null = null;

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
    this.pendingChapter = 0;
    this.lockedExitShown = null;
    this.exitsArmed = false;
    this.encounterSprites = [];
    this.visionSprites = [];
    this.npcSprites = [];
    this.frozenVeil = null;
    this.isFrozen = false;
    this.pendingEncounter = null;
    this.pendingRefresh = false;
    this.pendingWarp = null;
    this.action = null;
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
        if (event.node.effects.endPrologue) {
          this.pendingEnding = true;
          this.pendingChapter = 0;
        }
        if (event.node.effects.endChapter !== undefined) {
          this.pendingEnding = true;
          this.pendingChapter = event.node.effects.endChapter;
        }
        if (event.node.effects.refreshMap) this.pendingRefresh = true;
        if (event.node.effects.warpTo) this.pendingWarp = event.node.effects.warpTo;
      }
      if (event.type === 'node_changed' && event.node) this.summonVisions(event.node.id);
      if (event.type === 'dialogue_ended') {
        this.dismissVisions();
        if (this.pendingEnding) this.startPrologueEnding(this.pendingChapter);
        else if (this.pendingWarp) {
          const warp = this.pendingWarp;
          this.pendingWarp = null;
          this.time.delayedCall(150, () => this.warp(warp.mapId, warp.spawnId));
        } else if (this.pendingRefresh) {
          this.pendingRefresh = false;
          this.time.delayedCall(150, () => this.rebuildInPlace());
        } else if (this.pendingEncounter) {
          const enc = this.pendingEncounter;
          this.pendingEncounter = null;
          this.time.delayedCall(250, () => this.startEncounter(enc));
        }
      }
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
    // Prologue v3: empty-handed until the Elder throws Peter the Broken Blade.
    this.player.setArmed(this.session.getFlag(FLAGS.hasBlade));
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
    this.action = new ActionCombat(
      this,
      this.session,
      this.player,
      this.wallLayer,
      this.mapDef.roamers ?? [],
      {
        isPaused: () => this.isTransitioning || this.satchel.isOpen || this.dialogueBox.isOpen(),
        onPlayerDefeated: () => this.knockedOut(),
        onAmbushRescue: (id) => {
          this.action?.dismissAmbushers();
          this.openDialogue(id);
        },
        notify: (title, subtitle) => this.showNotification(title, subtitle),
        refreshHud: () => this.statusHud.refresh(),
      },
      this.t,
    );
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
    this.refreshFrozen();
    if (!this.isFrozen) this.soundSystem.startBgm(this.mapDef.bgm);
    // Map light (e.g. Chapter 1's endless sunset), under the HUD.
    if (this.mapDef.ambient) {
      const { width, height } = this.scale;
      const color = Number.parseInt(this.mapDef.ambient.color.slice(1), 16);
      this.add
        .rectangle(0, 0, width, height, color, this.mapDef.ambient.alpha)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(79);
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.soundSystem.stopBgm(true));
  }

  public update(_time: number, delta: number): void {
    this.session.tick(delta);
    this.action?.update(delta);
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
    // A layer variant (e.g. low tide) may replace the default layers while its condition holds.
    const variant = (def.layerVariants ?? []).find((v) =>
      conditionHolds(v.when, (flag) => this.session.getFlag(flag)),
    );
    const ground = map.createLayer(variant?.ground ?? def.layers.ground, tileset, 0, 0);
    const walls = map.createLayer(variant?.walls ?? def.layers.walls, tileset, 0, 0);
    if (!ground || !walls) {
      throw new Error(
        `[${def.id}] tilemap layers missing or reused: ground="${variant?.ground ?? def.layers.ground}", walls="${variant?.walls ?? def.layers.walls}".`,
      );
    }
    this.groundLayer = ground;
    this.wallLayer = walls;
    walls.setCollisionBetween(def.collision.fromGid, def.collision.toGid, true);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  private flagOn = (flag: string): boolean => this.session.getFlag(flag);

  private spawnNpcs(): void {
    for (const def of this.mapDef.npcs ?? []) {
      if (!conditionHolds(def.visibleWhen, this.flagOn)) continue;
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
      if (def.tint) npc.sprite.setTint(Number.parseInt(def.tint.slice(1), 16));
      if (def.alpha !== undefined) npc.sprite.setAlpha(def.alpha);
      if (!def.resistsFreeze) this.npcSprites.push(npc.sprite);
      this.physics.add.collider(this.player.sprite, npc.sprite);
      this.interactionSystem.register(npc);
    }
  }

  /** Fades in the map's visions tied to this dialogue node (Residual Existence). */
  private summonVisions(dialogueId: string): void {
    for (const def of this.mapDef.visions ?? []) {
      if (def.dialogueId !== dialogueId) continue;
      const pos = tileCenter(def.tile);
      const sprite = this.add.sprite(pos.x, pos.y, def.texture, 0).setAlpha(0).setDepth(5);
      if (def.anim && this.anims.exists(def.anim)) sprite.play(def.anim);
      this.tweens.add({ targets: sprite, alpha: 1, duration: 900, ease: 'Sine.easeOut' });
      this.visionSprites.push(sprite);
    }
  }

  /** Visions dissolve, drifting up a little, when the dialogue closes. */
  private dismissVisions(): void {
    for (const sprite of this.visionSprites) {
      this.tweens.add({
        targets: sprite,
        alpha: 0,
        y: sprite.y - 6,
        duration: 1200,
        ease: 'Sine.easeIn',
        onComplete: () => sprite.destroy(),
      });
    }
    this.visionSprites = [];
  }

  private spawnInteractables(): void {
    for (const def of this.mapDef.interactables ?? []) {
      if (!conditionHolds(def.visibleWhen, this.flagOn)) continue;
      const pos = new Phaser.Math.Vector2(tileCenter(def.tile).x, tileCenter(def.tile).y);
      this.interactionSystem.register({
        id: def.id,
        interactPrompt: def.prompt,
        getInteractionPosition: () => pos,
        getInteractionRadius: () => def.radius,
        canInteract: () => !def.requiresFlag || this.session.getFlag(def.requiresFlag),
        onInteract: () => {
          this.openDialogue(pickDialogue(def.dialogueId, def.dialogueRules, this.stateView()));
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
      if (def.hidden || !conditionHolds(def.visibleWhen, this.flagOn)) continue;
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
    if (!trig.repeat && trig.onceFlag && this.session.getFlag(trig.onceFlag)) return false;
    if (trig.unlessFlag && this.session.getFlag(trig.unlessFlag)) return false;
    return !trig.requiresFlag || this.session.getFlag(trig.requiresFlag);
  }

  private fireTrigger(trig: MapTriggerDefinition): void {
    if (!this.canFire(trig) || this.isTransitioning) return;
    if (trig.onceFlag) this.session.setFlag(trig.onceFlag);
    if (trig.effects) this.applyEffects(trig.effects);
    this.refreshFrozen();
    if (trig.teleportTo) this.loopBack(trig.teleportTo);
    const encounter = trig.encounterId
      ? (this.mapDef.encounters ?? []).find((e) => e.id === trig.encounterId)
      : undefined;
    if (trig.dialogueId) {
      this.pendingEncounter = encounter ?? null;
      this.openDialogue(trig.dialogueId);
    } else if (encounter) {
      this.startEncounter(encounter);
    }
  }

  /** Continuum loop: a quick fade and Peter finds himself back at the start of the path. */
  private loopBack(spawnId: string): void {
    const tile = this.mapDef.spawns[spawnId];
    if (!tile) return;
    this.isTransitioning = true;
    this.player.getMovementSystem().stop(this.player.sprite);
    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const pos = tileCenter(tile);
      this.player.sprite.setPosition(pos.x, pos.y);
      this.cameras.main.fadeIn(260, 0, 0, 0);
      this.isTransitioning = false;
    });
  }

  /** Rebuilds the map in place (same spot) so flag-driven state is re-evaluated. */
  private rebuildInPlace(): void {
    if (this.isTransitioning) return;
    this.beginSceneExit();
    const here = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
    this.session.position = { mapId: this.mapDef.id, ...here };
    this.cameras.main.fadeOut(220, 255, 255, 255);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const data: ExplorationSceneData = { mapId: this.mapDef.id, returnPosition: here };
      this.scene.restart(data);
    });
  }

  /**
   * "Time has stopped" (map `frozenWhen`): NPCs stand still and turn cold, a veil covers the map,
   * the music stops. Re-evaluated whenever flags may have changed.
   */
  private refreshFrozen(): void {
    const frozen = !!this.mapDef.frozenWhen && conditionHolds(this.mapDef.frozenWhen, this.flagOn);
    if (frozen === this.isFrozen) return;
    this.isFrozen = frozen;
    for (const sprite of this.npcSprites) {
      if (frozen) {
        sprite.anims.pause();
        sprite.setTint(0x9fb4d0);
      } else {
        sprite.anims.resume();
        sprite.clearTint();
      }
    }
    if (frozen) {
      const { width, height } = this.scale;
      this.frozenVeil = this.add
        .rectangle(0, 0, width, height, 0x2a4a7a, 0.18)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(80);
      this.soundSystem.stopBgm(true);
    } else {
      this.frozenVeil?.destroy();
      this.frozenVeil = null;
      this.soundSystem.startBgm(this.mapDef.bgm);
    }
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

  /** Carried to another map by a dialogue (effects.warpTo), e.g. the Elder taking Peter home. */
  private warp(mapId: string, spawnId: string): void {
    if (this.isTransitioning) return;
    this.beginSceneExit();
    const db = this.cache.json.get('data_maps') as MapDatabase;
    const target = resolveMap(db, mapId);
    const tile = target.spawns[spawnId] ?? target.spawns.default;
    this.session.position = { mapId: target.id, ...tileCenter(tile) };
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const data: ExplorationSceneData = { mapId: target.id, spawnId };
      this.scene.restart(data);
    });
  }

  /** Peter falls on the map: he wakes at the map's safe point with full HP; nothing is lost. */
  private knockedOut(): void {
    if (this.isTransitioning) return;
    this.beginSceneExit();
    const revive = tileCenter(this.mapDef.revive ?? this.mapDef.spawns.default);
    this.session.hp = this.session.getStats().maxHp;
    this.session.mp = this.session.getStats().maxMp;
    this.session.position = { mapId: this.mapDef.id, ...revive };
    this.cameras.main.fadeOut(900, 40, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const data: ExplorationSceneData = {
        mapId: this.mapDef.id,
        returnPosition: revive,
        notice: { title: this.t('action.knockedOut'), subtitle: this.t('action.revived') },
      };
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
        fontSize: '12px',
        color: '#ffea79',
        backgroundColor: '#0c101cd0',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    this.statusHud = new StatusHud(
      this,
      this.session,
      this.t,
      this.mapDef.name,
      this.mapDef.chapter,
    );
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
      if (this.satchel.isOpen) {
        if (!this.satchel.back()) this.toggleInventory();
      } else if (this.dialogueBox.isOpen()) this.closeDialogue();
      else this.returnToMenu();
    });
    on(K.I, () => this.toggleInventory());
    on(K.B, () => this.toggleInventory());
    on(K.LEFT, () => this.satchel.isOpen && this.satchel.left());
    on(K.RIGHT, () => this.satchel.isOpen && this.satchel.right());
    on(K.TAB, () => this.satchel.isOpen && this.satchel.right());
    on(K.UP, () => this.satchel.isOpen && this.satchel.navigate(-1));
    on(K.DOWN, () => this.satchel.isOpen && this.satchel.navigate(1));
    on(K.E, () => this.satchel.isOpen && this.satchel.useSelected());
    on(K.SPACE, () => this.satchel.isOpen && this.satchel.useSelected());
    on(K.K, () => void this.quickSave());
    on(K.Q, () => {
      if (this.questTracker.cycle()) this.soundSystem.playCursorBlip();
    });
    // 1-4: dialogue choice, else (bag open) put the selected item on that key, else use it.
    [K.ONE, K.TWO, K.THREE, K.FOUR].forEach((code, i) =>
      on(code, () => {
        if (this.dialogueBox.isOpen()) this.dialogueBox.choose(i);
        else if (this.satchel.isOpen) this.satchel.assignQuick(i);
        else this.useQuickSlot(i);
      }),
    );
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
      hasItem: (itemId: string) => this.session.inventory.hasItem(itemId, 1),
    };
  }

  /** Applies data-driven effects and announces any items received. */
  private applyEffects(effects: DialogueEffects): void {
    const granted = this.session.applyDialogueEffects(effects);
    this.refreshFrozen();
    this.action?.syncSpawns();
    this.player.setArmed(this.session.getFlag(FLAGS.hasBlade));
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

  /** Quick key 1-4 on the map: use the consumable on that key. */
  public useQuickSlot(index: number): void {
    if (this.isTransitioning) return;
    const id = this.session.quickSlots[index];
    if (!id) return;
    const result = this.session.useConsumable(id);
    const { x, y } = this.player;
    if (!result.ok) {
      const key = result.reason === 'full' ? 'quick.full' : 'quick.none';
      this.action?.floatText(x, y - 22, this.t(key, { name: result.name }), '#8fb8ff');
      return;
    }
    this.soundSystem.playHeal();
    const gain = result.healed > 0 ? `+${result.healed} HP` : `+${result.restoredMp} MP`;
    this.action?.floatText(x, y - 22, gain, '#4ade80');
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

  /**
   * Fades out to a chapter's closing card (0 = Prologue). Guarded so it runs once per scene entry.
   */
  public startPrologueEnding(chapter = 0): void {
    if (this.isTransitioning) return;
    this.beginSceneExit();
    this.session.setFlag(chapter === 0 ? FLAGS.prologueComplete : `chapter${chapter}_complete`);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('PrologueEndScene', { chapter });
    });
  }

  private returnToMenu(): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
