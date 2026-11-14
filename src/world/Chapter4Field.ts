import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import type { InteractionSystem } from '../systems/interaction/InteractionSystem';
import { SoundSystem } from '../systems/audio/SoundSystem';
import type { MapBeam, MapDefinition, MapDial, MapScale, MapVolley } from './MapTypes';
import { conditionHolds } from './MapRegistry';
import { dialFlags, dialIndex, readScale, type Pans } from './PuzzleRules';
import { stepIndex, tileKey, traceBeam, type Mirror } from './Chapter6Rules';
import type { Translate } from '../ui/Strings';

export interface FieldHost {
  openDialogue(id: string): void;
  /** Hazard damage through Peter's dodge / hurt invulnerability; false when it did not land. */
  hurt(damage: number): boolean;
  refreshHud(): void;
  isPaused(): boolean;
}

const tileCenter = (t: { x: number; y: number }) => ({ x: t.x * 32 + 16, y: t.y * 32 + 16 });

/**
 * Chapter 4 map mechanics (CHAPTER_04_DESIGN.md §13.2-§13.3): dials turned with [E], the two-pan
 * hydraulic scale fed by dialogue effects, and telegraphed arrow volleys with cover tiles.
 */
export class Chapter4Field {
  private readonly pans = new Map<string, Pans>();
  private readonly sound = SoundSystem.getInstance();
  private volleyAt: number[] = [];
  private readonly shadows: Phaser.GameObjects.Graphics;
  /** Dialogue to open once the current one closes (scale results). */
  public pendingDialogue: string | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly player: Phaser.GameObjects.Components.Transform,
    private readonly map: MapDefinition,
    private readonly host: FieldHost,
    private readonly t: Translate,
  ) {
    this.shadows = scene.add.graphics().setDepth(46);
    this.volleyAt = (map.volleys ?? []).map(() => scene.time.now + 1500);
  }

  // ------------------------------------------------------------------ dials

  public registerDials(interaction: InteractionSystem): void {
    const flag = (f: string) => this.session.getFlag(f);
    for (const def of this.map.dials ?? []) {
      if (!conditionHolds(def.visibleWhen, flag)) continue;
      // A dial with no value set yet shows its first value.
      if (!def.values.some((v) => flag(`${def.id}_${v.key}`))) this.setDial(def.id, def.values, 0);
      const pos = new Phaser.Math.Vector2(tileCenter(def.tile).x, tileCenter(def.tile).y);
      const label = () => this.dialLabel(def);
      interaction.register({
        id: def.id,
        get interactPrompt() {
          return `${def.prompt}: ${label()}`;
        },
        getInteractionPosition: () => pos,
        getInteractionRadius: () => def.radius ?? 40,
        canInteract: () =>
          (!def.requiresFlag || flag(def.requiresFlag)) &&
          (def.requiresItems ?? []).every((id) => this.session.inventory.hasItem(id, 1)),
        onInteract: () => {
          const next = (dialIndex(def.id, def.values, flag) + 1) % def.values.length;
          this.setDial(def.id, def.values, next);
          for (const c of def.couples ?? []) {
            const other = (this.map.dials ?? []).find((d) => d.id === c.dialId);
            if (!other) continue;
            const i = dialIndex(other.id, other.values, flag);
            this.setDial(other.id, other.values, stepIndex(i, c.step, other.values.length));
          }
          this.drawBeams();
          this.sound.playSelect();
          this.float(pos.x, pos.y - 20, label(), '#ffd88a');
        },
      });
    }
  }

  /** The dial's current value; a glyph not learned yet shows its unknown label. */
  private dialLabel(def: MapDial): string {
    const v = def.values[dialIndex(def.id, def.values, (f) => this.session.getFlag(f))];
    if (!v) return '';
    if (v.knownFlag && v.unknownLabel && !this.session.getFlag(v.knownFlag)) return v.unknownLabel;
    return v.label;
  }

  // ------------------------------------------------------------------ beams

  private beamGfx: Phaser.GameObjects.Graphics | null = null;
  private beamBlocked: ((x: number, y: number) => boolean) | null = null;

  /** Light beams (Chapter 6): drawn now and after every dial turn. */
  public setupBeams(blocked: (x: number, y: number) => boolean): void {
    if (!this.map.beams?.length) return;
    this.beamBlocked = blocked;
    this.beamGfx = this.scene.add.graphics().setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
    this.drawBeams();
  }

  private drawBeams(): void {
    const g = this.beamGfx;
    const blocked = this.beamBlocked;
    if (!g || !blocked) return;
    g.clear();
    for (const beam of this.map.beams ?? []) {
      if (beam.requiresFlag && !this.session.getFlag(beam.requiresFlag)) continue;
      const trace = this.trace(beam, blocked);
      const pts = trace.path.map(tileCenter);
      let blue = false;
      const prisms = new Set((beam.prisms ?? []).map(tileKey));
      for (let i = 1; i < pts.length; i++) {
        const color = blue ? 0x58b8ff : 0xfff4c8;
        g.lineStyle(6, color, 0.25).lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
        g.lineStyle(2, color, 0.95).lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y);
        if (prisms.has(tileKey(trace.path[i]))) blue = true;
      }
      const end = pts[pts.length - 1];
      if (end) g.fillStyle(trace.lit ? 0x58b8ff : 0xffe0a0, 0.8).fillCircle(end.x, end.y, 5);
      if (trace.lit && !this.session.getFlag(beam.solvedFlag)) {
        this.session.setFlag(beam.solvedFlag);
        this.sound.playSelect();
        this.scene.time.delayedCall(500, () => this.host.openDialogue(beam.solvedDialogueId));
      }
    }
  }

  private trace(beam: MapBeam, blocked: (x: number, y: number) => boolean) {
    const mirrors = new Map<string, Mirror>();
    for (const m of beam.mirrors) {
      const dial = (this.map.dials ?? []).find((d) => d.id === m.dialId);
      if (!dial) continue;
      const key = dial.values[dialIndex(dial.id, dial.values, (f) => this.session.getFlag(f))]?.key;
      if (key === 'slash') mirrors.set(tileKey(m.tile), '/');
      else if (key === 'backslash') mirrors.set(tileKey(m.tile), '\\');
    }
    return traceBeam({
      start: beam.start,
      dir: beam.dir,
      mirrors,
      prisms: new Set((beam.prisms ?? []).map(tileKey)),
      brass: new Set((beam.brass ?? []).map(tileKey)),
      target: beam.target,
      blocked,
    });
  }

  private setDial(id: string, values: { key: string; label: string }[], index: number): void {
    for (const [f, on] of Object.entries(dialFlags(id, values, index))) this.session.setFlag(f, on);
  }

  // ------------------------------------------------------------------ scales

  private scale(id: string): MapScale | undefined {
    return (this.map.scales ?? []).find((s) => s.id === id);
  }

  /** scalePut: one sack from the satchel onto a pan; a balance or overload opens its dialogue. */
  public put(scaleId: string, pan: 'left' | 'right', itemId: string): void {
    const def = this.scale(scaleId);
    if (!def) return;
    if (!this.session.inventory.removeItem(itemId, 1)) {
      this.float(this.player.x, this.player.y - 24, this.t('field.noSack'), '#c8c0b0');
      return;
    }
    const pans = this.pans.get(scaleId) ?? { left: [], right: [] };
    pans[pan].push(itemId);
    this.pans.set(scaleId, pans);
    const reading = readScale(def, pans);
    if (reading === 'balanced' || reading === 'overload') {
      // The sacks are spent: the pistons took them.
      this.pans.delete(scaleId);
      this.pendingDialogue =
        reading === 'balanced' ? def.balancedDialogueId : def.overloadDialogueId;
      return;
    }
    this.float(this.player.x, this.player.y - 24, this.t(`field.scale.${reading}`), '#ffd88a');
  }

  /** scaleReset (and leaving the map, saving): every sack on the scale goes back to the satchel. */
  public reset(scaleId?: string): void {
    for (const [id, pans] of [...this.pans]) {
      if (scaleId && id !== scaleId) continue;
      for (const item of [...pans.left, ...pans.right]) this.session.inventory.addItem(item, 1);
      this.pans.delete(id);
    }
  }

  // ------------------------------------------------------------------ arrow volleys

  public update(): void {
    const now = this.scene.time.now;
    (this.map.volleys ?? []).forEach((v, i) => {
      if (v.untilFlag && this.session.getFlag(v.untilFlag)) return;
      if (this.host.isPaused()) {
        this.volleyAt[i] = Math.max(this.volleyAt[i] ?? 0, now + 600);
        return;
      }
      if (now < (this.volleyAt[i] ?? 0)) return;
      this.volleyAt[i] = now + v.everyMs;
      this.fireVolley(v);
    });
  }

  private inside(v: MapVolley, x: number, y: number): boolean {
    const tx = Math.floor(x / 32);
    const ty = Math.floor(y / 32);
    return tx >= v.area.x && ty >= v.area.y && tx < v.area.x + v.area.w && ty < v.area.y + v.area.h;
  }

  private fireVolley(v: MapVolley): void {
    const spots: { x: number; y: number }[] = [];
    if (this.inside(v, this.player.x, this.player.y))
      spots.push({ x: this.player.x, y: this.player.y });
    for (let k = spots.length; k < v.shots; k++) {
      spots.push({
        x: (v.area.x + Math.random() * v.area.w) * 32,
        y: (v.area.y + Math.random() * v.area.h) * 32,
      });
    }
    const marks = spots.map((p) =>
      this.scene.add
        .ellipse(p.x, p.y, v.radius * 2, v.radius * 1.2, 0x000000, 0.18)
        .setStrokeStyle(1, 0xff6a4a, 0.6)
        .setDepth(46),
    );
    for (const m of marks)
      this.scene.tweens.add({ targets: m, fillAlpha: 0.45, duration: v.warnMs });
    this.scene.time.delayedCall(v.warnMs, () => {
      for (const m of marks) m.destroy();
      if (!this.scene.sys.isActive()) return;
      this.sound.playSlash();
      for (const p of spots) this.impact(p.x, p.y);
      const hit = spots.some(
        (p) => Math.hypot(p.x - this.player.x, p.y - this.player.y) <= v.radius,
      );
      if (!hit) return;
      const tx = Math.floor(this.player.x / 32);
      const ty = Math.floor(this.player.y / 32);
      if (v.cover.some((c) => c.x === tx && c.y === ty)) {
        this.float(this.player.x, this.player.y - 24, this.t('action.arrowCover'), '#c8c0b0');
        return;
      }
      this.host.hurt(v.damage);
    });
  }

  private impact(x: number, y: number): void {
    const g = this.scene.add.graphics().setDepth(47);
    g.lineStyle(2, 0x5a402a, 1);
    for (let k = 0; k < 5; k++) {
      const ax = x + (Math.random() - 0.5) * 30;
      const ay = y + (Math.random() - 0.5) * 18;
      g.lineBetween(ax, ay, ax + 3, ay - 10);
    }
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      delay: 500,
      duration: 400,
      onComplete: () => g.destroy(),
    });
  }

  // ------------------------------------------------------------------ helpers

  private float(x: number, y: number, text: string, color: string): void {
    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color,
        stroke: '#0a0a0a',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.scene.tweens.add({
      targets: label,
      y: y - 16,
      alpha: 0,
      duration: 900,
      onComplete: () => label.destroy(),
    });
  }

  public destroy(): void {
    this.reset();
    this.shadows.destroy();
  }
}
