import Phaser from 'phaser';
import type { Player } from '../../entities/Player';
import { distance, rollHit, type ActionTuning, type Point } from '../../systems/action/ActionRules';
import type { CombatTuning } from '../../systems/combat/CombatTypes';
import type { Translate } from '../../ui/Strings';
import { KURO_SHIFT_MS, Roamer } from './ActionTypes';
export interface CompanionsContext {
  allyTexture: string | null;
  scene: Phaser.Scene;
  elder: Phaser.Physics.Arcade.Sprite | null;
  player: Player;
  companionTexture: string | null;
  companion: Phaser.Physics.Arcade.Sprite | null;
  tuning: ActionTuning;
  roamers: Roamer[];
  nextCompanionHit: number;
  combat: CombatTuning;
  rng: () => number;
  damageRoamer: (r: Roamer, damage: number, critical: boolean) => void;
  nextAllyHit: number;
  nextShiftAt: number;
  floatText: (x: number, y: number, text: string, color: string) => void;
  t: Translate;
}

export function spawnElder(this: CompanionsContext): void {
  const texture = this.allyTexture;
  if (!texture || !this.scene.textures.exists(texture)) return;
  const standing = this.scene.children.list.some(
    (o) => o instanceof Phaser.GameObjects.Sprite && o.texture.key === texture && o.visible,
  );
  if (standing) return;
  this.elder = this.scene.physics.add.sprite(this.player.x - 26, this.player.y + 4, texture);
  this.elder.body?.setSize(14, 12);
  this.elder.body?.setOffset(9, 18);
  if (this.scene.anims.exists(`${texture}_idle`)) this.elder.play(`${texture}_idle`);
}

export function spawnCompanion(this: CompanionsContext): void {
  const texture = this.companionTexture;
  if (!texture || !this.scene.textures.exists(texture)) return;
  const standing = this.scene.children.list.some(
    (o) => o instanceof Phaser.GameObjects.Sprite && o.texture.key === texture && o.visible,
  );
  if (standing) return;
  this.companion = this.scene.physics.add.sprite(this.player.x + 26, this.player.y + 4, texture);
  this.companion.body?.setSize(14, 12);
  this.companion.body?.setOffset(9, 18);
  if (this.scene.anims.exists(`${texture}_idle`)) this.companion.play(`${texture}_idle`);
}

export function updateCompanion(this: CompanionsContext, now: number): void {
  const c = this.companion;
  if (!c) return;
  const ally = this.tuning.ally;
  if (distance(c, this.player) > 220) {
    c.setPosition(this.player.x + 22, this.player.y + 6);
    c.setVelocity(0, 0);
    return;
  }
  const move = (p: Point, speed: number): void => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const len = Math.hypot(dx, dy) || 1;
    c.setVelocity((dx / len) * speed, (dy / len) * speed);
    if (Math.abs(dx) > 2) c.setFlipX(dx < 0);
  };
  let foe: Roamer | null = null;
  let best = Infinity;
  for (const r of this.roamers) {
    if (!r.alive || r.def.ambush) continue;
    const d = distance(r.sprite, c);
    if (d < 110 && distance(r.sprite, this.player) < 170 && d < best) {
      best = d;
      foe = r;
    }
  }
  if (foe) {
    if (best > ally.reach) move(foe.sprite, ally.speed);
    else {
      c.setVelocity(0, 0);
      if (now >= this.nextCompanionHit) {
        this.nextCompanionHit = now + ally.cooldownMs * 1.3;
        const hit = rollHit(ally.attack, foe.enemy.defense, this.combat, this.rng);
        this.damageRoamer(foe, hit.damage, hit.critical);
      }
    }
    return;
  }
  const d = distance(c, this.player);
  if (d > 46) move(this.player, d > 90 ? ally.speed * 1.3 : ally.speed);
  else c.setVelocity(0, 0);
}

export function updateElder(this: CompanionsContext, now: number): void {
  const elder = this.elder;
  if (!elder) return;
  const ally = this.tuning.ally;
  // Too far behind (map entry, a dash, a loop): he catches up at once.
  if (distance(elder, this.player) > 200) {
    elder.setPosition(this.player.x - 20, this.player.y + 6);
    elder.setVelocity(0, 0);
    return;
  }
  let foe: Roamer | null = null;
  let best = Infinity;
  for (const r of this.roamers) {
    if (!r.alive || r.def.ambush) continue;
    const engaged =
      r.brain.state === 'chase' || r.brain.state === 'windup' || r.brain.state === 'recover';
    const d = distance(r.sprite, elder);
    if ((engaged || d < 90) && distance(r.sprite, this.player) < 170 && d < best) {
      best = d;
      foe = r;
    }
  }
  const moveToward = (p: Point, speed: number): void => {
    const dx = p.x - elder.x;
    const dy = p.y - elder.y;
    const len = Math.hypot(dx, dy) || 1;
    elder.setVelocity((dx / len) * speed, (dy / len) * speed);
    if (Math.abs(dx) > 2) elder.setFlipX(dx < 0);
  };
  if (foe) {
    if (best > ally.reach) {
      moveToward(foe.sprite, ally.speed);
    } else {
      elder.setVelocity(0, 0);
      if (now >= this.nextAllyHit) {
        this.nextAllyHit = now + ally.cooldownMs;
        const kuro = this.allyTexture === 'npc_kuro';
        const hit = rollHit(
          kuro ? ally.attack * 2 : ally.attack,
          foe.enemy.defense,
          this.combat,
          this.rng,
        );
        if (kuro && now >= this.nextShiftAt) {
          // Branch Shift: the foe is pushed into the other branch for 3 s.
          this.nextShiftAt = now + KURO_SHIFT_MS;
          foe.shiftedUntil = now + 3000;
          foe.sprite.setVelocity(0, 0);
          foe.sprite.setAlpha(0.2);
          this.scene.time.delayedCall(3000, () => foe && foe.alive && foe.sprite.setAlpha(1));
          this.floatText(foe.sprite.x, foe.sprite.y - 18, this.t('action.branchShift'), '#b09aff');
        }
        const glow = this.scene.add
          .circle(foe.sprite.x, foe.sprite.y, 12, 0xffd666, 0.5)
          .setDepth(41);
        this.scene.tweens.add({
          targets: glow,
          alpha: 0,
          scale: 1.8,
          duration: 260,
          onComplete: () => glow.destroy(),
        });
        this.damageRoamer(foe, hit.damage, hit.critical);
      }
    }
    return;
  }
  const d = distance(elder, this.player);
  if (d > 40) {
    moveToward(this.player, d > 90 ? ally.speed * 1.3 : ally.speed);
  } else {
    elder.setVelocity(0, 0);
  }
}
