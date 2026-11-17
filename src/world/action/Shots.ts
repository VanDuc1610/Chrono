import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import { type GameSession } from '../../state/GameSession';
import { distance, facingFromAngle, type Point } from '../../systems/action/ActionRules';
import { ShotSystem, type ShotTarget } from '../../systems/action/ShotSystem';
import { rangedAttack } from '../../systems/action/WeaponRules';
import { SoundSystem } from '../../systems/audio/SoundSystem';
import type { Translate } from '../../ui/Strings';
import { ActionHost, CombatExtension, PeterAct, Roamer } from './ActionTypes';
export interface ShotsContext {
  scene: Phaser.Scene;
  session: GameSession;
  canAct: boolean;
  nextShot: number;
  refused: (kind: PeterAct) => boolean;
  floatText: (x: number, y: number, text: string, color: string) => void;
  player: Player;
  t: Translate;
  host: ActionHost;
  extension: CombatExtension | null;
  sound: SoundSystem;
  shots: ShotSystem;
  roamers: Roamer[];
  strikeRoamer: (
    r: Roamer,
    attack: number,
    now: number,
    mult?: number,
    critBonus?: number,
  ) => number | null;
  walls: Phaser.Tilemaps.TilemapLayer;
  faceX: (r: Roamer, dx: number) => void;
}

export function fire(this: ShotsContext, worldX: number, worldY: number): void {
  const now = this.scene.time.now;
  const ranged = this.session.rangedProfile;
  if (!this.canAct || !ranged || now < this.nextShot) return;
  if (this.refused('shot')) return;
  const cost = ranged.mpCost ?? 0;
  if (cost > 0 && this.session.mp < cost) {
    this.floatText(this.player.x, this.player.y - 22, this.t('action.noMp'), '#8fb8ff');
    return;
  }
  this.session.mp -= cost;
  if (cost > 0) this.host.refreshHud();
  this.nextShot = now + ranged.fireMs;
  this.extension?.onAction?.('shot');
  const origin = { x: this.player.x, y: this.player.y };
  const aim = Math.atan2(worldY - origin.y, worldX - origin.x);
  const shotAnim = this.scene.anims.exists('peter_shoot_down') ? 'peter_shoot' : 'peter_attack';
  this.player.playAction(shotAnim, facingFromAngle(aim), 290);
  this.sound.playSlash();
  this.shots.fire(origin, aim, ranged);
}

export function updateShots(this: ShotsContext, delta: number, now: number): void {
  const ranged = this.session.rangedProfile;
  const meleeId = this.session.equipment.weapon;
  const meleeAtk =
    (meleeId && this.session.inventory.getItemDefinition(meleeId)?.equip?.attack) || 0;
  const attack = rangedAttack(this.session.getStats().attack, meleeAtk, ranged?.attack ?? 0);
  const mult = ranged?.damageMult ?? 0.7;
  const targets: ShotTarget[] = this.roamers
    .filter((r) => r.alive && !r.enemy.field?.twin && now >= (r.shiftedUntil ?? 0))
    .map((r) => ({
      x: r.sprite.x,
      y: r.sprite.y,
      radius: 12,
      hit: () => {
        if (!r.alive) return false;
        this.strikeRoamer(r, attack, now, mult);
        return true;
      },
    }));
  if (this.extension) targets.push(...this.extension.shotTargets(attack, mult));
  this.shots.update(delta, targets, (x, y) => !!this.walls.getTileAtWorldXY(x, y)?.collides);
}

export function blinkOnWhiff(this: ShotsContext, origin: Point, aim: number): void {
  for (const r of this.roamers) {
    const b = r.enemy.field?.blinkOnWhiff;
    if (!b || !r.alive || r.clone || distance(r.sprite, origin) > b.range) continue;
    const puff = this.scene.add.circle(r.sprite.x, r.sprite.y, 12, 0x6a3a9a, 0.5).setDepth(40);
    this.scene.tweens.add({
      targets: puff,
      alpha: 0,
      radius: 22,
      duration: 300,
      onComplete: () => puff.destroy(),
    });
    const bx = origin.x - Math.cos(aim) * 24;
    const by = origin.y - Math.sin(aim) * 24;
    r.sprite.setPosition(bx, by);
    r.sprite.setVelocity(0, 0);
    this.faceX(r, origin.x - bx);
    r.brain = { ...r.brain, state: 'windup', timer: 400 };
    r.sprite.setTint(0xff7070);
  }
}
