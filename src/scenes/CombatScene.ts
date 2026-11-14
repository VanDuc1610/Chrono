import Phaser from 'phaser';
import { CombatSystem } from '../systems/combat/CombatSystem';
import {
  BattleEvent,
  ICombatAction,
  ICombatant,
  IEnemyDefinition,
} from '../systems/combat/CombatTypes';
import type { DialogueDatabase } from '../systems/dialogue/DialogueTypes';
import { FLAGS } from '../state/GameSession';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { GameSession, getSession } from '../state/GameSession';
import { registerPeterAnimations } from '../systems/animation/PeterAnimationConfig';
import { createPanel } from '../ui/Panel';
import { getStrings, getStringTable, Translate } from '../ui/Strings';
import type { ExplorationSceneData } from './ExplorationScene';

export interface CombatSceneData {
  enemyId: string;
  /** Session flag set to true when this encounter is won (e.g. FLAGS.shadeDefeated). */
  victoryFlag?: string;
  returnPosition?: { x: number; y: number };
  /**
   * Checkpoint revival (GDD §9): on defeat Peter wakes here with full HP, keeping all progress
   * and items. Without it, defeat returns to the title screen.
   */
  revivePosition?: { x: number; y: number };
  /** Dialogue opened back in the overworld after a victory (e.g. the Sentinel's last words). */
  victoryDialogueId?: string;
}

type PlayerCommand = 'attack' | 'skill' | 'item' | 'defend' | 'escape' | 'environment';

const PLAYER_TO_ENEMY_DELAY_MS = 1400;
const ENEMY_TO_PLAYER_DELAY_MS = 1200;
const BATTLE_END_DELAY_MS = 1200;
const ENEMY_OPENING_DELAY_MS = 1200;
/** Temporal Sight wind-up before the skill strike lands (fits inside PLAYER_TO_ENEMY_DELAY_MS). */
const SKILL_CHARGE_MS = 600;
/** Spark tints: cerulean for Peter's hits, carmine for the enemy's (ART_GUIDE palette). */
const PLAYER_HIT_TINT = 0x00c8ff;
const ENEMY_HIT_TINT = 0xff3355;

type PeterCombatAnim = 'idle' | 'attack' | 'hurt' | 'temporal_sight';

export class CombatScene extends Phaser.Scene {
  public combatSystem!: CombatSystem;
  public session!: GameSession;
  private soundSystem = SoundSystem.getInstance();

  // Visual representations
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;

  // UI elements
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerMpText!: Phaser.GameObjects.Text;
  private enemyHpBar!: Phaser.GameObjects.Graphics;
  private enemyHpText!: Phaser.GameObjects.Text;
  private itemButton: Phaser.GameObjects.Text | null = null;

  private commandPanel!: Phaser.GameObjects.NineSlice;
  private commandButtons: Phaser.GameObjects.Text[] = [];
  private logText!: Phaser.GameObjects.Text;
  private turnIndicatorText!: Phaser.GameObjects.Text;

  private player!: ICombatant;
  private enemy!: ICombatant;
  private enemyTemplate!: IEnemyDefinition;
  private sceneData!: CombatSceneData;
  private t!: Translate;
  /** Command [6]: the boss's next environment action (hidden when none is available). */
  private environmentButton: Phaser.GameObjects.Text | null = null;
  /** Command type of each entry in commandButtons (same order). */
  private commandTypes: PlayerCommand[] = [];
  private firedEvents = new Set<BattleEvent>();
  /** True while an action resolves or the enemy acts; blocks player commands. */
  private isProcessingTurn = true;

  constructor() {
    super({ key: 'CombatScene' });
  }

  public init(data: CombatSceneData): void {
    // The scene instance is reused for every battle: reset all transient state here (B4).
    this.sceneData = data;
    this.isProcessingTurn = true;
    this.commandButtons = [];
    this.itemButton = null;
    this.environmentButton = null;
    this.commandTypes = [];
    this.firedEvents = new Set();
    this.session = getSession(this);
    this.t = getStrings(this);
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Arena Background (Cosmic Dark Fantasy Ruin Platform)
    this.createArenaBackground(width, height);

    // 2. Combatants from session + JSON data
    const template =
      this.session.getEnemyDefinition(this.sceneData.enemyId) ??
      this.session.database.enemies.enemies[0];
    if (!template) {
      throw new Error(`[CombatScene] No enemy definition for "${this.sceneData.enemyId}".`);
    }
    this.enemyTemplate = template;

    this.player = this.session.createPlayerCombatant();
    this.enemy = {
      id: `${template.id}_1`,
      name: template.name,
      type: 'enemy',
      stats: {
        hp: template.maxHp,
        maxHp: template.maxHp,
        attack: template.attack,
        defense: template.defense,
        speed: template.speed,
      },
      isAlive: true,
      spriteKey: template.spriteKey,
      mechanic: template.mechanic,
    };

    this.combatSystem = new CombatSystem({
      tuning: this.session.database.player.combat,
      resolveItem: (itemId) => this.session.resolveCombatItem(itemId),
      text: getStringTable(this),
      hasItem: (id) => this.session.inventory.hasItem(id, 1),
      hasFlag: (flag) => this.session.getFlag(flag),
    });
    this.combatSystem.startBattle([this.player], [this.enemy]);
    if (template.script?.rescue) this.combatSystem.partyHpFloor = 1;
    const prepared = template.script?.stunIfFlag;
    if (prepared && this.session.getFlag(prepared.flag)) {
      this.combatSystem.stun(this.enemy.id, prepared.turns);
      this.time.delayedCall(300, () => this.setBattleLog(prepared.message));
    }
    const mirror = template.mechanic?.mirrorGear;
    if (mirror) {
      this.enemy.stats.attack += Math.round(this.player.stats.attack * mirror.pct);
      this.time.delayedCall(300, () => this.setBattleLog(mirror.message));
    }

    // 3. Render Combatants
    this.createCombatants();

    // 4. Render UI Panels
    this.createCombatUI(width, height);

    // 5. Input key shortcuts (1-5); KeyboardPlugin removes these listeners on shutdown
    this.setupInputs();

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Start procedural battle BGM and stop all audio nodes on shutdown
    this.soundSystem.startBgm('battle');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.soundSystem.stopBgm(true);
    });

    this.setBattleLog(this.t('combat.intro', { enemy: this.enemy.name }));

    // 6. Whoever is faster acts first (give the intro line a moment if the enemy opens)
    this.beginTurn(ENEMY_OPENING_DELAY_MS);
  }

  public update(_time: number, delta: number): void {
    this.session.tick(delta);
  }

  private createArenaBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060810, 0x060810, 0x0d1220, 0x0d1220, 1);
    bg.fillRect(0, 0, width, height);

    // Floor Platform
    const platform = this.add.graphics();
    platform.fillStyle(0x182032, 0.85);
    platform.fillEllipse(width / 2, height * 0.54, width * 0.75, 90);
    platform.lineStyle(2, 0x00c8ff, 0.4);
    platform.strokeEllipse(width / 2, height * 0.54, width * 0.75, 90);

    // Floating Cosmic Particles
    for (let i = 0; i < 25; i++) {
      const p = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.7),
        2,
        2,
        Phaser.Math.RND.pick([0x00e1ff, 0x7c3aed, 0x38bdf8]),
        0.5,
      );
      this.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(15, 30),
        alpha: { from: 0.6, to: 0.1 },
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        yoyo: true,
      });
    }
  }

  private createCombatants(): void {
    const { width, height } = this.scale;

    // Player (Peter on the left platform)
    const playerX = width * 0.28;
    const playerY = height * 0.48;

    // Peter stands in profile facing the enemy (CHAR_PETER_002/003 sheets, row "right").
    registerPeterAnimations(this);
    this.playerSprite = this.add.sprite(playerX, playerY, this.player.spriteKey, 0).setScale(2.0);
    this.playPeterAnim('idle');
    // Subtle breathing animation
    this.tweens.add({
      targets: this.playerSprite,
      y: playerY - 3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Enemy (on the right platform)
    const enemyX = width * 0.72;
    const enemyY = height * 0.42;

    this.enemySprite = this.add
      .sprite(enemyX, enemyY, this.enemy.spriteKey, 0)
      .setScale(this.enemyTemplate.spriteScale ?? 2.2);
    const enemyIdle = `${this.enemy.spriteKey}_idle`;
    if (this.anims.exists(enemyIdle)) this.enemySprite.play(enemyIdle);
    // Floating hover animation
    this.tweens.add({
      targets: this.enemySprite,
      y: enemyY - 8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createCombatUI(width: number, height: number): void {
    // Player Status Card (Top Left)
    createPanel(this, 20, 16, 180, 56);

    this.fitLabel(
      this.add.text(
        30,
        24,
        this.t('combat.nameLevel', { name: this.player.name, level: this.session.level }),
        { fontFamily: 'monospace', fontSize: '12px', color: '#00e1ff', fontStyle: 'bold' },
      ),
    );

    this.playerHpBar = this.add.graphics();
    this.playerMpText = this.add.text(124, 52, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#93c5fd',
    });
    this.playerHpText = this.add.text(124, 40, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cbd5e1',
    });

    // Enemy Status Card (Top Right)
    createPanel(this, width - 200, 16, 180, 56);

    this.fitLabel(
      this.add.text(
        width - 190,
        24,
        this.t('combat.nameLevel', { name: this.enemy.name, level: this.enemyTemplate.level }),
        { fontFamily: 'monospace', fontSize: '12px', color: '#ff4d79', fontStyle: 'bold' },
      ),
    );

    this.enemyHpBar = this.add.graphics();
    this.enemyHpText = this.add.text(width - 88, 40, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cbd5e1',
    });

    this.updateStatusBars();

    // Command Box (Bottom Left)
    const cmdBoxWidth = 260;
    const cmdBoxHeight = 92;
    const cmdBoxX = 20;
    const cmdBoxY = height - cmdBoxHeight - 14;

    this.commandPanel = createPanel(this, cmdBoxX, cmdBoxY, cmdBoxWidth, cmdBoxHeight);

    this.turnIndicatorText = this.add.text(cmdBoxX + 12, cmdBoxY + 9, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#00e1ff',
      fontStyle: 'bold',
    });

    const commands: { text: string; type: PlayerCommand }[] = [
      { text: this.t('combat.cmd.attack'), type: 'attack' },
      { text: this.t('combat.cmd.skill', { mp: this.combatSystem.skillMpCost }), type: 'skill' },
      { text: this.itemButtonLabel(), type: 'item' },
      { text: this.t('combat.cmd.defend'), type: 'defend' },
      { text: this.t('combat.cmd.escape'), type: 'escape' },
      { text: '', type: 'environment' },
    ];

    const colWidth = 128;
    commands.forEach((cmd, idx) => {
      const col = idx < 3 ? 0 : 1;
      const row = idx < 3 ? idx : idx - 3;
      const x = cmdBoxX + 12 + col * colWidth;
      const y = cmdBoxY + 25 + row * 19;

      const btn = this.add
        .text(x, y, cmd.text, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#e2e8f0',
        })
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      btn.on('pointerdown', () => this.handlePlayerAction(cmd.type));
      btn.on('pointerover', () => btn.setColor('#00e1ff'));
      btn.on('pointerout', () => btn.setColor('#e2e8f0'));

      if (cmd.type === 'item') this.itemButton = btn;
      if (cmd.type === 'environment') {
        // Stands out from the regular commands: a battlefield action.
        btn.setColor('#ffd666');
        btn.on('pointerout', () => btn.setColor('#ffd666'));
        this.environmentButton = btn;
        return;
      }
      this.commandButtons.push(btn);
      this.commandTypes.push(cmd.type);
    });

    // Battle Log Box (Bottom Right)
    const logBoxWidth = width - cmdBoxWidth - 60;
    const logBoxHeight = cmdBoxHeight;
    const logBoxX = cmdBoxX + cmdBoxWidth + 20;
    const logBoxY = cmdBoxY;

    createPanel(this, logBoxX, logBoxY, logBoxWidth, logBoxHeight);

    this.logText = this.add.text(logBoxX + 14, logBoxY + 12, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#cbd5e1',
      wordWrap: { width: logBoxWidth - 28 },
      lineSpacing: 4,
    });
  }

  /** Shrinks a status-card title until it fits inside the 180 px card (long boss names). */
  private fitLabel(text: Phaser.GameObjects.Text, maxWidth = 160): void {
    let size = 11;
    while (text.width > maxWidth && size > 8) {
      size--;
      text.setFontSize(size);
    }
  }

  private itemButtonLabel(): string {
    const id = this.session.pickCombatItem(this.player.stats.maxHp - this.player.stats.hp);
    const count = this.session.inventory.getItemCount(id);
    const name = this.session.inventory.getItemDefinition(id)?.name ?? id;
    return this.t('combat.cmd.item', { name, count });
  }

  private setupInputs(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-ONE', () => this.handlePlayerAction('attack'));
    this.input.keyboard.on('keydown-TWO', () => this.handlePlayerAction('skill'));
    this.input.keyboard.on('keydown-THREE', () => this.handlePlayerAction('item'));
    this.input.keyboard.on('keydown-FOUR', () => this.handlePlayerAction('defend'));
    this.input.keyboard.on('keydown-FIVE', () => this.handlePlayerAction('escape'));
    this.input.keyboard.on('keydown-SIX', () => this.handlePlayerAction('environment', 0));
    this.input.keyboard.on('keydown-SEVEN', () => this.handlePlayerAction('environment', 1));
    this.input.keyboard.on('keydown-EIGHT', () => this.handlePlayerAction('environment', 2));
    // Timed block: only the first press while the ring closes counts.
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.blockArmed && this.blockPressedAt === null) this.blockPressedAt = this.time.now;
    });
  }

  private blockArmed = false;
  /** When the closing ring touches Peter's outline (tests and probes read it). */
  public blockEndsAt = 0;
  private blockPressedAt: number | null = null;

  /**
   * A ring closes on Peter; Space as it touches his outline blocks. A feint lunges the ring in and
   * flashes halfway, then draws it back before the real close.
   */
  private runBlockRing(
    tb: NonNullable<IEnemyDefinition['timedBlock']>,
    done: (blocked: boolean, pressed: boolean) => void,
  ): void {
    const cx = this.playerSprite.x;
    const cy = this.playerSprite.y;
    const inner = 22;
    const outline = this.add.circle(cx, cy, inner).setStrokeStyle(2, 0xffffff, 0.85).setDepth(50);
    const ring = this.add.circle(cx, cy, 72).setStrokeStyle(3, 0xffc04a, 1).setDepth(51);
    const hint = this.add
      .text(cx, cy - 56, this.t('combat.blockHint'), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#ffd88a',
        stroke: '#0a0a0a',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(52);
    this.blockArmed = true;
    this.blockPressedAt = null;
    const feint = (tb.feintChance ?? 0) > 0 && Math.random() < (tb.feintChance ?? 0);
    const end = this.time.now + tb.ringMs;
    this.blockEndsAt = end;
    let anim: Phaser.Tweens.Tween | Phaser.Tweens.TweenChain;
    if (feint) {
      anim = this.tweens.chain({
        targets: ring,
        tweens: [
          { radius: inner + 3, duration: tb.ringMs * 0.35, ease: 'Quad.easeIn' },
          {
            radius: 52,
            duration: tb.ringMs * 0.15,
            onStart: () => {
              ring.setStrokeStyle(3, 0xffffff, 1);
              this.time.delayedCall(90, () => ring.setStrokeStyle(3, 0xffc04a, 1));
            },
          },
          { radius: inner, duration: tb.ringMs * 0.5, ease: 'Linear' },
        ],
      });
    } else {
      anim = this.tweens.add({ targets: ring, radius: inner, duration: tb.ringMs, ease: 'Linear' });
    }
    this.time.delayedCall(tb.ringMs, () => {
      this.blockArmed = false;
      const pressed = this.blockPressedAt !== null;
      const blocked = pressed && Math.abs((this.blockPressedAt ?? 0) - end) <= tb.windowMs / 2;
      // Stop the ring's tween first: it may still tick this frame and touch a destroyed Arc.
      anim.stop();
      this.tweens.killTweensOf(ring);
      ring.destroy();
      outline.destroy();
      hint.destroy();
      done(blocked, pressed);
    });
  }

  private updateStatusBars(): void {
    // Player HP
    this.playerHpBar.clear();
    const pPct = Math.max(0, this.player.stats.hp / this.player.stats.maxHp);
    this.playerHpBar.fillStyle(0x1e293b, 1);
    this.playerHpBar.fillRect(30, 41, 88, 8);
    this.playerHpBar.fillStyle(pPct > 0.3 ? 0x22c55e : 0xef4444, 1);
    this.playerHpBar.fillRect(30, 41, 88 * pPct, 8);
    this.playerHpText.setText(`${this.player.stats.hp}/${this.player.stats.maxHp} HP`);

    // Player MP
    const mp = this.player.stats.mp ?? 0;
    const maxMp = this.player.stats.maxMp ?? 0;
    const mPct = maxMp > 0 ? Math.max(0, mp / maxMp) : 0;
    this.playerHpBar.fillStyle(0x1e293b, 1);
    this.playerHpBar.fillRect(30, 54, 88, 5);
    this.playerHpBar.fillStyle(0x3b82f6, 1);
    this.playerHpBar.fillRect(30, 54, 88 * mPct, 5);
    this.playerMpText.setText(`${mp}/${maxMp} MP`);

    // Enemy HP
    this.enemyHpBar.clear();
    const ePct = Math.max(0, this.enemy.stats.hp / this.enemy.stats.maxHp);
    const { width } = this.scale;
    this.enemyHpBar.fillStyle(0x1e293b, 1);
    this.enemyHpBar.fillRect(width - 190, 41, 96, 8);
    this.enemyHpBar.fillStyle(0xef4444, 1);
    this.enemyHpBar.fillRect(width - 190, 41, 96 * ePct, 8);
    this.enemyHpText.setText(`${this.enemy.stats.hp}/${this.enemy.stats.maxHp} HP`);

    this.itemButton?.setText(this.itemButtonLabel());
  }

  private setBattleLog(msg: string): void {
    this.logText.setText(msg);
  }

  private showFloatingNumber(x: number, y: number, text: string, color: string): void {
    const floatText = this.add
      .text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: floatText,
      y: y - 30,
      alpha: { from: 1, to: 0 },
      duration: 900,
      ease: 'Back.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.commandButtons.forEach((b, i) =>
      b.setVisible(enabled && this.isCommandAvailable(this.commandTypes[i])),
    );
    const cores = enabled ? this.combatSystem.getEnvironmentOptions(this.enemy.id) : [];
    const env =
      enabled && cores.length === 0
        ? this.combatSystem.getAvailableEnvironmentAction(this.enemy.id)
        : null;
    const envText =
      cores.length > 0
        ? cores.map((c, i) => `[${6 + i}] ${c.label}`).join('  ')
        : env
          ? this.t('combat.cmd.environment', { label: env.label })
          : '';
    this.environmentButton?.setText(envText).setVisible(envText !== '');
    this.turnIndicatorText.setText(this.t(enabled ? 'combat.turn.yours' : 'combat.turn.resolving'));
    if (enabled) {
      this.commandPanel.clearTint();
    } else {
      this.commandPanel.setTint(0x7a8ca8);
    }
  }

  // ------------------------------------------------------------- turn flow

  /**
   * Hands control to whoever is next in the speed-ordered initiative queue. The pause between turns
   * is applied once, in endTurn; `enemyDelayMs` only matters when the enemy opens the battle.
   */
  private beginTurn(enemyDelayMs = 0): void {
    if (this.combatSystem.isBattleOver()) {
      this.handleBattleEnd();
      return;
    }

    if (this.combatSystem.getActiveCombatantId() === this.player.id) {
      // Scripted battles: an event due this round plays before the player chooses.
      const turn = this.combatSystem.getState().turnCount;
      const event = this.enemyTemplate.script?.events?.find(
        (e) => !this.firedEvents.has(e) && e.atTurn <= turn,
      );
      if (event) {
        this.runBattleEvent(event, () => this.beginTurn());
        return;
      }
      this.isProcessingTurn = false;
      this.setButtonsEnabled(true);
    } else {
      this.isProcessingTurn = true;
      this.setButtonsEnabled(false);
      if (enemyDelayMs > 0) {
        this.time.delayedCall(enemyDelayMs, () => this.executeEnemyTurn());
      } else {
        this.executeEnemyTurn();
      }
    }
  }

  /** Closes the current combatant's turn and schedules the next one. */
  private endTurn(delayMs: number): void {
    if (this.combatSystem.isBattleOver()) {
      this.time.delayedCall(BATTLE_END_DELAY_MS, () => this.handleBattleEnd());
      return;
    }
    this.combatSystem.advanceTurn();
    this.time.delayedCall(delayMs, () => this.beginTurn());
  }

  public handlePlayerAction(type: PlayerCommand, choice = 0): void {
    if (this.isProcessingTurn || this.combatSystem.isBattleOver()) return;
    if (type !== 'environment' && !this.isCommandAvailable(type)) return;
    if (this.combatSystem.getActiveCombatantId() !== this.player.id) return;

    const action: ICombatAction = {
      type,
      sourceId: this.player.id,
      targetId: type === 'item' ? this.player.id : this.enemy.id,
    };

    // SKILL needs MP; when short, say so and keep the turn.
    if (type === 'skill' && !this.combatSystem.canUseSkill(this.player.id)) {
      this.setBattleLog(this.t('combat.noMp', { cost: this.combatSystem.skillMpCost }));
      return;
    }

    // ITEM consumes a shard from the satchel; with none left the turn is not spent (B6).
    if (type === 'item') {
      const itemId = this.session.pickCombatItem(this.player.stats.maxHp - this.player.stats.hp);
      if (!this.session.inventory.removeItem(itemId, 1)) {
        const name = this.session.inventory.getItemDefinition(itemId)?.name ?? itemId;
        this.setBattleLog(this.t('combat.noItem', { name }));
        return;
      }
      action.itemId = itemId;
    }

    // ENVIRONMENT: only when the boss currently offers one (key 6 is ignored otherwise).
    if (type === 'environment') {
      const cores = this.combatSystem.getEnvironmentOptions(this.enemy.id);
      const env =
        cores.length > 0
          ? cores[choice]
          : this.combatSystem.getAvailableEnvironmentAction(this.enemy.id);
      if (!env) return;
      action.environmentId = env.id;
    }

    this.isProcessingTurn = true;
    this.setButtonsEnabled(false);

    const result = this.combatSystem.executeAction(action);
    this.updateStatusBars();
    this.setBattleLog(result.message);

    // Attack: slash + lunge. Skill: Temporal Sight wind-up, then the same strike.
    const onImpact = (): void => {
      if (result.damageDealt <= 0) return;
      this.showHitSpark(this.enemySprite, PLAYER_HIT_TINT);
      this.showFloatingNumber(
        this.enemySprite.x,
        this.enemySprite.y - 20,
        `-${result.damageDealt}`,
        '#ff4d79',
      );
    };
    if (type === 'attack') {
      this.animatePeterStrike(onImpact);
    } else if (type === 'environment') {
      // The lighthouse answers: a flash of chronal light and a burst on the boss.
      this.playPeterAnim('temporal_sight');
      this.cameras.main.flash(300, 136, 237, 255);
      this.time.delayedCall(300, () => {
        this.enemySprite.setTint(0x88edff);
        this.showHitSpark(this.enemySprite, PLAYER_HIT_TINT);
        this.time.delayedCall(250, () => this.enemySprite.clearTint());
        this.playPeterAnim('idle');
        onImpact();
      });
    } else if (type === 'skill') {
      this.playPeterAnim('temporal_sight');
      this.time.delayedCall(SKILL_CHARGE_MS, () => this.animatePeterStrike(onImpact));
    } else if (result.healingDone > 0) {
      this.showFloatingNumber(
        this.playerSprite.x,
        this.playerSprite.y - 20,
        `+${result.healingDone}`,
        '#22c55e',
      );
    }

    const endAt = this.enemyTemplate.script?.endAtEnemyPct;
    if (endAt && this.enemy.isAlive && this.enemy.stats.hp <= this.enemy.stats.maxHp * endAt) {
      this.combatSystem.forceVictory();
    }
    this.allyStrike();
    this.endTurn(PLAYER_TO_ENEMY_DELAY_MS);
  }

  /** An ally beside Peter (Kuro) strikes every few rounds. */
  private allyStrike(): void {
    const a = this.enemyTemplate.script?.allyStrike;
    if (!a || !this.session.getFlag(a.requiresFlag) || this.combatSystem.isBattleOver()) return;
    if (this.combatSystem.getState().turnCount % a.everyTurns !== 0) return;
    const dealt = this.combatSystem.allyHit(
      this.enemy.id,
      Math.ceil(this.enemy.stats.maxHp * a.damagePct),
    );
    this.time.delayedCall(450, () => {
      this.setBattleLog(a.message.replace('{damage}', String(dealt)));
      this.showHitSpark(this.enemySprite, 0xb09aff);
      this.showFloatingNumber(this.enemySprite.x, this.enemySprite.y - 30, `-${dealt}`, '#b09aff');
      this.updateStatusBars();
    });
  }

  // ------------------------------------------------------------- animation

  /**
   * Plays one of Peter's profile animations (row "right"). One-shot animations return to the
   * idle loop when they finish; missing animations are ignored so placeholder art never crashes.
   */
  /** Unlocked by story flags (player.json commandFlags) and not locked by the battle script. */
  private isCommandAvailable(type: PlayerCommand): boolean {
    const script = this.enemyTemplate.script;
    if (script?.lockedCommands?.includes(type)) return false;
    if (this.combatSystem?.getLockedCommand(this.enemy.id) === type) return false;
    if (script?.unlockedCommands?.includes(type)) return true;
    return this.session.isCommandUnlocked(type);
  }

  /**
   * Plays a scripted event: its dialogue lines one by one in the battle log (and an ally fading in
   * beside Peter), then sets its flags — e.g. the Elder throwing Peter the Broken Blade.
   */
  private runBattleEvent(event: BattleEvent, done: () => void): void {
    this.firedEvents.add(event);
    this.isProcessingTurn = true;
    this.setButtonsEnabled(false);

    if (event.ally && this.textures.exists(event.ally.texture)) {
      const ally = this.add
        .sprite(this.playerSprite.x - 70, this.playerSprite.y - 6, event.ally.texture, 0)
        .setScale(2)
        .setAlpha(0);
      if (event.ally.anim && this.anims.exists(event.ally.anim)) ally.play(event.ally.anim);
      this.tweens.add({ targets: ally, alpha: 1, duration: 600 });
    }

    const db = this.cache.json.get('data_dialogue') as DialogueDatabase | undefined;
    const node = event.dialogueId ? db?.dialogues[event.dialogueId] : undefined;
    // Lines are self-contained (narration or "Speaker: …"), shown as written.
    const lines = node ? [...node.lines] : [];
    const LINE_MS = 2000;
    lines.forEach((line, i) => this.time.delayedCall(i * LINE_MS, () => this.setBattleLog(line)));

    this.time.delayedCall(lines.length * LINE_MS, () => {
      for (const flag of event.setFlags ?? []) this.session.setFlag(flag);
      if (event.setFlags?.includes(FLAGS.hasBlade)) {
        this.cameras.main.flash(400, 136, 237, 255);
        this.playPeterAnim('idle');
      }
      done();
    });
  }

  private playPeterAnim(anim: PeterCombatAnim): void {
    // Before the Broken Blade, Peter stands empty-handed (if that sheet is loaded).
    const unarmed =
      anim === 'idle' &&
      !this.session.getFlag(FLAGS.hasBlade) &&
      this.anims.exists('peter_idle_unarmed_right');
    const key = unarmed ? 'peter_idle_unarmed_right' : `peter_${anim}_right`;
    if (!this.anims.exists(key)) return;
    if (anim === 'idle') {
      // Idle lives on its own texture; switch back explicitly.
      this.playerSprite.play(key);
      return;
    }
    this.playerSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.playerSprite.play(key);
    if (anim !== 'temporal_sight') {
      this.playerSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
        this.playPeterAnim('idle'),
      );
    }
  }

  /** Slash animation + lunge; `onImpact` fires when the blade connects. */
  private animatePeterStrike(onImpact: () => void): void {
    this.playPeterAnim('attack');
    const origX = this.playerSprite.x;
    this.tweens.add({
      targets: this.playerSprite,
      x: origX + 35,
      duration: 140,
      yoyo: true,
      onYoyo: () => {
        this.cameras.main.shake(120, 0.005);
        this.enemySprite.setTint(0xff4d79);
        this.time.delayedCall(150, () => this.enemySprite.clearTint());
        onImpact();
      },
    });
  }

  /** Near-white 4-frame spark (UI_SET_001) tinted per attacker; destroyed when it finishes. */
  private showHitSpark(target: Phaser.GameObjects.Sprite, tint: number): void {
    if (!this.anims.exists('hit_spark_burst')) return;
    const spark = this.add
      .sprite(
        target.x + Phaser.Math.Between(-6, 6),
        target.y + Phaser.Math.Between(-8, 4),
        'hit_spark',
        0,
      )
      .setScale(2.5)
      .setTint(tint)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(target.depth + 1);
    spark.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => spark.destroy());
    spark.play('hit_spark_burst');
  }

  private executeEnemyTurn(): void {
    if (this.combatSystem.isBattleOver()) return;

    // Bosses may lose the turn (stunned) or spend it recovering at their HP floor.
    const prelude = this.combatSystem.beginEnemyTurn(this.enemy.id);
    if (prelude.skip) {
      this.setBattleLog(prelude.message ?? '');
      if (prelude.healingDone) {
        this.updateStatusBars();
        this.showFloatingNumber(
          this.enemySprite.x,
          this.enemySprite.y - 20,
          `+${prelude.healingDone}`,
          '#88edff',
        );
      }
      this.announceSentence();
      this.endTurn(ENEMY_TO_PLAYER_DELAY_MS);
      return;
    }

    const mirror = this.enemyTemplate.mechanic?.mirror;
    const copy = mirror ? this.combatSystem.mirrorCommand() : 'attack';
    if (mirror && copy === 'defend') {
      this.combatSystem.executeAction({
        type: 'defend',
        sourceId: this.enemy.id,
        targetId: this.enemy.id,
      });
      this.setBattleLog(mirror.defendMessage);
      this.announceSentence();
      this.endTurn(ENEMY_TO_PLAYER_DELAY_MS);
      return;
    }
    if (mirror && copy === 'item') {
      const before = this.enemy.stats.hp;
      this.enemy.stats.hp = Math.min(
        this.enemy.stats.maxHp,
        before + Math.ceil(this.enemy.stats.maxHp * mirror.healPct),
      );
      this.updateStatusBars();
      this.setBattleLog(mirror.healMessage);
      this.showFloatingNumber(
        this.enemySprite.x,
        this.enemySprite.y - 20,
        `+${this.enemy.stats.hp - before}`,
        '#88edff',
      );
      this.announceSentence();
      this.endTurn(ENEMY_TO_PLAYER_DELAY_MS);
      return;
    }
    const heavy = mirror && copy === 'skill' ? mirror.skillMult : 1;
    if (heavy > 1 && mirror) {
      this.combatSystem.lockCommand(this.enemy.id, 'skill', 1);
      this.setBattleLog(mirror.skillMessage);
    }
    const tb = this.enemyTemplate.timedBlock;
    if (tb) {
      const second = (first: boolean): void =>
        this.runBlockRing(tb, (blocked2, pressed2) => {
          this.blockFeedback(blocked2, pressed2);
          const blocks = (first ? 1 : 0) + (blocked2 ? 1 : 0);
          const factor = blocks === 0 ? 1 : blocks === 1 ? (1 + tb.factor) / 2 : tb.factor;
          this.performEnemyAttack(factor * heavy);
        });
      if (tb.double) {
        this.runBlockRing(tb, (blocked1, pressed1) => {
          this.blockFeedback(blocked1, pressed1);
          this.time.delayedCall(120, () => second(blocked1));
        });
        return;
      }
      this.runBlockRing(tb, (blocked, pressed) => {
        if (blocked) {
          this.showFloatingNumber(
            this.playerSprite.x,
            this.playerSprite.y - 34,
            this.t('combat.blocked'),
            '#9fe8ff',
          );
          this.cameras.main.flash(120, 160, 230, 255);
        } else if (pressed) {
          this.showFloatingNumber(
            this.playerSprite.x,
            this.playerSprite.y - 34,
            this.t('combat.blockMiss'),
            '#c8c0b0',
          );
        }
        this.performEnemyAttack((blocked ? tb.factor : 1) * heavy);
      });
      return;
    }
    this.performEnemyAttack(heavy);
  }

  private blockFeedback(blocked: boolean, pressed: boolean): void {
    if (blocked) {
      this.showFloatingNumber(
        this.playerSprite.x,
        this.playerSprite.y - 34,
        this.t('combat.blocked'),
        '#9fe8ff',
      );
      this.cameras.main.flash(120, 160, 230, 255);
    } else if (pressed) {
      this.showFloatingNumber(
        this.playerSprite.x,
        this.playerSprite.y - 34,
        this.t('combat.blockMiss'),
        '#c8c0b0',
      );
    }
  }

  /** The enemy's attack on Peter (`damageFactor` from a timed block). */
  private performEnemyAttack(damageFactor?: number): void {
    if (this.combatSystem.isBattleOver()) return;
    const enemyAction: ICombatAction = {
      type: 'attack',
      sourceId: this.enemy.id,
      targetId: this.player.id,
      damageFactor,
    };

    // Animate enemy lunge
    const origX = this.enemySprite.x;
    this.tweens.add({
      targets: this.enemySprite,
      x: origX - 40,
      duration: 160,
      yoyo: true,
      onYoyo: () => {
        this.cameras.main.shake(150, 0.008);
        if (result.damageDealt > 0) {
          this.playPeterAnim('hurt');
          this.showHitSpark(this.playerSprite, ENEMY_HIT_TINT);
        }
      },
    });

    const result = this.combatSystem.executeAction(enemyAction);
    this.updateStatusBars();
    this.setBattleLog(result.message);

    if (result.damageDealt > 0) {
      this.showFloatingNumber(
        this.playerSprite.x,
        this.playerSprite.y - 20,
        `-${result.damageDealt}`,
        '#ff3355',
      );
    }

    // Scripted rescue: Peter is about to fall — someone steps in and the fight ends here.
    const rescue = this.enemyTemplate.script?.rescue;
    if (rescue && this.player.stats.hp <= Math.ceil(this.player.stats.maxHp * rescue.belowHpPct)) {
      this.time.delayedCall(ENEMY_TO_PLAYER_DELAY_MS, () =>
        this.runBattleEvent({ atTurn: 0, ...rescue.event }, () => this.endWithRescue()),
      );
      return;
    }

    this.announceSentence();
    this.endTurn(ENEMY_TO_PLAYER_DELAY_MS);
  }

  /** Sentence bosses: shows the verdict on Peter's next move, with a red flash. */
  private announceSentence(): void {
    const lines = this.combatSystem.bossTurnCues(this.enemy.id);
    const verdict = this.combatSystem.announceSentence(this.enemy.id);
    if (verdict) lines.push(verdict);
    if (lines.length === 0) return;
    this.time.delayedCall(700, () => {
      this.setBattleLog(lines.join(' '));
      this.cameras.main.flash(200, 255, 80, 60);
      this.setButtonsEnabled(
        this.combatSystem.getActiveCombatantId() === this.player.id && !this.isProcessingTurn,
      );
    });
  }

  /** Ends a scripted fight after the rescue: back to the map, which opens the rescue dialogue. */
  private endWithRescue(): void {
    const rescue = this.enemyTemplate.script?.rescue;
    this.session.applyBattleHp(this.player.stats.hp);
    this.combatSystem.endBattle();
    const data: ExplorationSceneData = {
      returnPosition: this.sceneData.returnPosition,
      openDialogueId: rescue?.dialogueId,
    };
    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(350, () => this.scene.start('ExplorationScene', data));
    });
  }

  private handleBattleEnd(): void {
    const phase = this.combatSystem.getPhase();
    this.session.applyBattleHp(this.player.stats.hp);
    this.combatSystem.endBattle();

    if (phase === 'victory') {
      if (this.sceneData.victoryFlag) {
        this.session.setFlag(this.sceneData.victoryFlag);
      }
      const rewards = this.session.claimEnemyRewards(this.enemyTemplate);
      const rewardText = this.session.describeRewards(rewards);

      const released = this.enemyTemplate.mechanic?.releasedFrame;
      if (released !== undefined) {
        // A released boss kneels instead of dissolving.
        this.tweens.killTweensOf(this.enemySprite);
        this.enemySprite.stop().setFrame(released);
        this.cameras.main.flash(500, 136, 237, 255);
      } else {
        this.tweens.add({
          targets: this.enemySprite,
          alpha: 0,
          scale: 0.1,
          duration: 800,
          ease: 'Power2',
        });
      }

      const vars = { enemy: this.enemy.name, rewards: rewardText };
      this.setBattleLog(this.t('combat.victoryLog', vars));
      this.returnToExploration(released !== undefined ? 2600 : 1600, {
        title: this.t('combat.victoryTitle'),
        subtitle: this.t('combat.victorySubtitle', vars),
      });
    } else if (phase === 'defeat') {
      this.setBattleLog(this.t('combat.defeatLog'));
      const revive = this.sceneData.revivePosition;
      if (revive) {
        this.session.applyBattleHp(this.session.getStats().maxHp);
        const data: ExplorationSceneData = {
          returnPosition: revive,
          notice: {
            title: this.t('combat.fallenTitle'),
            subtitle: this.t('combat.fallenSubtitle'),
          },
        };
        this.time.delayedCall(1600, () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.time.delayedCall(350, () => this.scene.start('ExplorationScene', data));
        });
      } else {
        this.time.delayedCall(1600, () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.time.delayedCall(350, () => this.scene.start('MainMenuScene'));
        });
      }
    } else if (phase === 'escaped') {
      this.setBattleLog(this.t('combat.escapedLog'));
      this.returnToExploration(1200);
    }
  }

  private returnToExploration(delayMs: number, notice?: ExplorationSceneData['notice']): void {
    const won = this.combatSystem.getPhase() === 'victory';
    const data: ExplorationSceneData = {
      returnPosition: this.sceneData.returnPosition,
      notice,
      openDialogueId: won ? this.sceneData.victoryDialogueId : undefined,
    };
    this.time.delayedCall(delayMs, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(350, () => this.scene.start('ExplorationScene', data));
    });
  }
}
