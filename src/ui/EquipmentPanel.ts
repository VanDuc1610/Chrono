import Phaser from 'phaser';
import type { PlayerStats } from '../state/GameDatabase';
import type { GameSession } from '../state/GameSession';
import type { SoundSystem } from '../systems/audio/SoundSystem';
import type { SkillDatabase, SkillDef } from '../systems/action/AuthorityRules';
import {
  rarityOf,
  setOf,
  type GearEffect,
  type GearProfile,
  type SetBonus,
} from '../systems/inventory/GearRules';
import { EQUIP_SLOTS, type EquipSlot } from '../systems/inventory/InventoryTypes';
import { keyLabel } from './keys';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const W = 580;
const H = 316;
const ROW_H = 20;
const ROWS_X = 150;
const ROWS_W = 210;
const DETAIL_X = 372;
const LIST_ROWS = 9;
const STAT_KEYS: (keyof PlayerStats)[] = ['maxHp', 'maxMp', 'attack', 'defense', 'speed'];

/** A row of the left list: a gear slot or a skill slot. */
type Row = { kind: 'gear'; slot: EquipSlot } | { kind: 'skill'; index: number };

/** A choice in the picker: an item / skill, or "take off" (null). */
interface Choice {
  id: string | null;
}

/**
 * Peter's gear screen (U, owner 2026-11-18): his portrait and stats, the four gear slots and the
 * three Authority slots. E on a row opens the picker: owned items for that slot (rarity colour,
 * stat change, effects, set) or known skills. The bottom lists the sets worn and their bonuses.
 */
export class EquipmentPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Container;
  private readonly portrait: Phaser.GameObjects.Sprite;
  private readonly footer: Phaser.GameObjects.Text;
  private open = false;
  private row = 0;
  /** The picker for the selected row, or null while choosing a row. */
  private picking: { choices: Choice[]; index: number; scroll: number } | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly sound: SoundSystem,
    private readonly t: Translate,
    /** Stats, MP or skills changed (HUD refresh). */
    private readonly onChanged: () => void,
    /** Peter's current texture and frame, for the portrait. */
    private readonly look: () => { key: string; frame: string | number },
  ) {
    const { width, height } = scene.scale;
    this.container = scene.add
      .container(Math.round(width / 2 - W / 2), Math.round(height / 2 - H / 2))
      .setScrollFactor(0)
      .setDepth(250)
      .setVisible(false);
    const bg = createPanel(scene, 0, 0, W, H);
    const title = this.text(16, 10, t('gear.title'), {
      fontSize: '13px',
      color: '#00e1ff',
      fontStyle: 'bold',
    });
    const halo = scene.add.graphics();
    halo.fillStyle(0x0b1426, 0.9).fillRoundedRect(14, 32, 124, 116, 6);
    halo.lineStyle(1, 0x22365a, 1).strokeRoundedRect(14.5, 32.5, 123, 115, 6);
    this.portrait = scene.add.sprite(76, 142, '__DEFAULT').setOrigin(0.5, 1).setScale(2);
    this.body = scene.add.container(0, 0);
    this.footer = this.text(W / 2, H - 12, '', { fontSize: '10px', color: '#65789e' }).setOrigin(
      0.5,
    );
    this.container.add([bg, title, halo, this.portrait, this.body, this.footer]);
  }

  public get isOpen(): boolean {
    return this.open;
  }

  public toggle(): void {
    this.open = !this.open;
    this.picking = null;
    if (this.open) {
      const look = this.look();
      if (this.scene.textures.exists(look.key)) this.portrait.setTexture(look.key, look.frame);
      this.refresh();
    }
    this.container.setVisible(this.open);
  }

  /** ESC: closes the picker. False when there was none (close the screen). */
  public back(): boolean {
    if (!this.picking) return false;
    this.picking = null;
    this.sound.playCursorBlip();
    this.refresh();
    return true;
  }

  public navigate(dir: number): void {
    if (this.picking) {
      const n = this.picking.choices.length;
      if (n === 0) return;
      this.picking.index = (this.picking.index + dir + n) % n;
    } else {
      this.row = (this.row + dir + this.rows.length) % this.rows.length;
    }
    this.sound.playCursorBlip();
    this.refresh();
  }

  /** E / Space: open the picker on a row, or apply the chosen item / skill. */
  public confirm(): void {
    const row = this.rows[this.row];
    if (!this.picking) {
      const choices = this.choicesFor(row);
      const current = this.currentId(row);
      const at = choices.findIndex((c) => c.id === current);
      this.picking = { choices, index: Math.max(0, at), scroll: 0 };
      this.sound.playSelect();
      this.refresh();
      return;
    }
    const choice = this.picking.choices[this.picking.index];
    if (!choice) return;
    const s = this.session;
    if (row.kind === 'gear') {
      if (choice.id) s.equip(choice.id);
      else s.unequip(row.slot);
    } else {
      s.setSkillSlot(row.index, choice.id);
    }
    this.picking = null;
    this.sound.playSelect();
    this.onChanged();
    this.refresh();
  }

  // ----------------------------------------------------------------- data

  private get rows(): Row[] {
    return [
      ...EQUIP_SLOTS.map((slot): Row => ({ kind: 'gear', slot })),
      ...[0, 1, 2].map((index): Row => ({ kind: 'skill', index })),
    ];
  }

  private get skillDb(): SkillDatabase | null {
    return (this.scene.cache.json.get('data_skills') as SkillDatabase | undefined) ?? null;
  }

  private skill(id: string | null): SkillDef | null {
    return (id && this.skillDb?.skills.find((s) => s.id === id)) || null;
  }

  private currentId(row: Row): string | null {
    return row.kind === 'gear'
      ? this.session.equipment[row.slot]
      : (this.session.skillSlots[row.index] ?? null);
  }

  private choicesFor(row: Row): Choice[] {
    const s = this.session;
    if (row.kind === 'skill') {
      const db = this.skillDb;
      const known = db ? s.knownSkills(db) : [];
      return known.length ? [...known.map((id) => ({ id })), { id: null }] : [];
    }
    const order = ['legendary', 'epic', 'rare', 'common'];
    const owned = s.inventory
      .getAllItems()
      .map((st) => st.itemId)
      .filter((id) => s.slotOf(id) === row.slot)
      .sort(
        (a, b) =>
          order.indexOf(rarityOf(s.gearDb, a)) - order.indexOf(rarityOf(s.gearDb, b)) ||
          a.localeCompare(b),
      );
    if (owned.length === 0) return [];
    return [...owned.map((id) => ({ id })), { id: null }];
  }

  // -------------------------------------------------------------- drawing

  private text(
    x: number,
    y: number,
    value: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.Text {
    return this.scene.add.text(x, y, value, { fontFamily: 'monospace', ...style });
  }

  private rarityColor(id: string): string {
    const db = this.session.gearDb;
    return db?.rarity[rarityOf(db, id)]?.color ?? '#c8d4ec';
  }

  private nameOf(id: string): string {
    return this.session.inventory.getItemDefinition(id)?.name ?? id;
  }

  private refresh(): void {
    this.body.removeAll(true);
    this.drawStats();
    this.drawRows();
    this.drawDetail();
    this.drawSets();
    this.footer.setText(this.t(this.picking ? 'gear.chooseFooter' : 'gear.footer'));
  }

  /** The preview of the highlighted choice: stats and gear as they would be. */
  private preview(): { stats: PlayerStats; gear: GearProfile } | null {
    const row = this.rows[this.row];
    if (!this.picking || row.kind !== 'gear') return null;
    const id = this.picking.choices[this.picking.index]?.id ?? null;
    return {
      stats: this.session.previewStats(row.slot, id),
      gear: this.session.previewGear(row.slot, id),
    };
  }

  private drawStats(): void {
    const now = this.session.getStats();
    const next = this.preview()?.stats;
    STAT_KEYS.forEach((k, i) => {
      const y = 156 + i * 14;
      this.body.add(
        this.text(18, y, `${this.t(`gear.stat.${k}`)}`, { fontSize: '10px', color: '#8b97b8' }),
      );
      this.body.add(
        this.text(62, y, String(now[k]), {
          fontSize: '10px',
          color: '#e8eefc',
          fontStyle: 'bold',
        }),
      );
      const d = next ? next[k] - now[k] : 0;
      if (d !== 0)
        this.body.add(
          this.text(94, y, `${d > 0 ? '▲' : '▼'}${Math.abs(d)}`, {
            fontSize: '10px',
            color: d > 0 ? '#7dff9a' : '#ff7a7a',
            fontStyle: 'bold',
          }),
        );
    });
    // Effects worn now (short list).
    const lines = this.effectLines(this.flatEffects(this.session.gear)).slice(0, 4);
    lines.forEach((l, i) =>
      this.body.add(
        this.text(18, 230 + i * 12, `• ${l}`, {
          fontSize: '8px',
          color: '#b8c5de',
          wordWrap: { width: 124 },
          maxLines: 1,
        }),
      ),
    );
  }

  private drawRows(): void {
    this.body.add(
      this.text(ROWS_X, 32, this.t('gear.slots'), {
        fontSize: '10px',
        color: '#ffd166',
        fontStyle: 'bold',
      }),
    );
    this.body.add(
      this.text(ROWS_X, 32 + 4 * ROW_H + 18, this.t('gear.skills'), {
        fontSize: '10px',
        color: '#ffd166',
        fontStyle: 'bold',
      }),
    );
    this.rows.forEach((row, i) => {
      const y = 48 + i * ROW_H + (row.kind === 'skill' ? 18 : 0);
      const sel = i === this.row;
      if (sel) {
        const g = this.scene.add.graphics();
        g.fillStyle(0x16243d, 0.9).fillRect(ROWS_X - 4, y - 3, ROWS_W, ROW_H - 2);
        g.lineStyle(1, this.picking ? 0x5a6a90 : 0x00e1ff, 0.8);
        g.strokeRect(ROWS_X - 4, y - 3, ROWS_W, ROW_H - 2);
        this.body.add(g);
      }
      const label =
        row.kind === 'gear'
          ? this.t(`satchel.slot.${row.slot}`)
          : `[${keyLabel((['skill1', 'skill2', 'skill3'] as const)[row.index])}]`;
      this.body.add(this.text(ROWS_X, y, label, { fontSize: '9px', color: '#8b97b8' }));
      const id = this.currentId(row);
      let name = this.t('gear.none');
      let color = '#4a5878';
      if (id && row.kind === 'gear') {
        name = this.nameOf(id);
        color = this.rarityColor(id);
      } else if (id) {
        const def = this.skill(id);
        name = this.t(`skill.${id}.name`);
        color = def?.color ?? '#c8d4ec';
      }
      this.body.add(
        this.text(ROWS_X + 56, y, name, {
          fontSize: '10px',
          color,
          fontStyle: 'bold',
          fixedWidth: ROWS_W - 62,
        }),
      );
    });
  }

  /** The right column: the picker (with the highlighted choice's details) or the row's item. */
  private drawDetail(): void {
    const row = this.rows[this.row];
    const x = DETAIL_X;
    if (this.picking) {
      const p = this.picking;
      if (p.choices.length === 0) {
        this.body.add(
          this.text(x, 34, this.t(row.kind === 'gear' ? 'gear.noChoice' : 'gear.noSkills'), {
            fontSize: '10px',
            color: '#677594',
            wordWrap: { width: W - x - 16 },
          }),
        );
        return;
      }
      if (p.index < p.scroll) p.scroll = p.index;
      if (p.index >= p.scroll + LIST_ROWS) p.scroll = p.index - LIST_ROWS + 1;
      const current = this.currentId(row);
      p.choices.slice(p.scroll, p.scroll + LIST_ROWS).forEach((c, k) => {
        const i = p.scroll + k;
        const y = 32 + k * 13;
        const sel = i === p.index;
        let name: string;
        let color: string;
        if (!c.id) {
          name = this.t(row.kind === 'gear' ? 'gear.takeOff' : 'gear.clearSkill');
          color = '#8b97b8';
        } else if (row.kind === 'gear') {
          name = this.nameOf(c.id);
          color = this.rarityColor(c.id);
        } else {
          name = this.t(`skill.${c.id}.name`);
          color = this.skill(c.id)?.color ?? '#c8d4ec';
        }
        const mark = c.id && c.id === current ? ' ✓' : '';
        this.body.add(
          this.text(x, y, `${sel ? '▶' : ' '} ${name}${mark}`, {
            fontSize: '9px',
            color: sel ? '#ffffff' : color,
            backgroundColor: sel ? '#1b2c4a' : undefined,
            fontStyle: sel ? 'bold' : undefined,
            fixedWidth: W - x - 14,
          }),
        );
      });
      const chosen = p.choices[p.index]?.id ?? null;
      this.describe(chosen, row, 32 + Math.min(LIST_ROWS, p.choices.length) * 13 + 6);
      return;
    }
    this.describe(this.currentId(row), row, 34);
  }

  /** Name, rarity, effects and set of an item, or a skill's text, from `y` down. */
  private describe(id: string | null, row: Row, y0: number): void {
    const x = DETAIL_X;
    const width = W - x - 16;
    let y = y0;
    const add = (value: string, color: string, size = 9, bold = false): void => {
      const t = this.text(x, y, value, {
        fontSize: `${size}px`,
        color,
        fontStyle: bold ? 'bold' : undefined,
        wordWrap: { width },
      });
      this.body.add(t);
      y += t.height + 2;
    };
    if (!id) return;
    if (row.kind === 'skill') {
      const def = this.skill(id);
      add(this.t(`skill.${id}.name`), def?.color ?? '#c8d4ec', 11, true);
      if (def)
        add(
          this.t('gear.cost', { mp: def.mpCost, s: Math.round(def.cooldownMs / 100) / 10 }),
          '#8fb8ff',
        );
      add(this.t(`skill.${id}.desc`), '#b8c5de');
      return;
    }
    const s = this.session;
    const def = s.inventory.getItemDefinition(id);
    const rarity = rarityOf(s.gearDb, id);
    add(this.nameOf(id), this.rarityColor(id), 11, true);
    add(this.t(`gear.rarity.${rarity}`), this.rarityColor(id));
    const stats = Object.entries(def?.equip ?? {})
      .filter(([k, v]) => STAT_KEYS.includes(k as keyof PlayerStats) && v)
      .map(([k, v]) => `${this.t(`gear.stat.${k}`)} ${v > 0 ? '+' : ''}${v}`);
    if (stats.length) add(stats.join('  '), '#e8eefc');
    for (const l of this.effectLines(s.gearDb?.items[id]?.effects ?? [])) add(`✦ ${l}`, '#ffd98a');
    const set = setOf(s.gearDb, id);
    if (set) add(`◆ ${this.t(`gear.set.${set}`)}`, '#7fd8c8');
    if (def?.description && y < H - 60) add(def.description, '#7d8aa8', 8);
  }

  /** The worn sets: name, pieces worn, and each bonus (lit when reached). */
  private drawSets(): void {
    const s = this.session;
    const db = s.gearDb;
    const shown = this.preview()?.gear.sets ?? s.gear.sets;
    const y0 = 214;
    const x = ROWS_X;
    this.body.add(
      this.text(x, y0, this.t('gear.sets'), {
        fontSize: '10px',
        color: '#ffd166',
        fontStyle: 'bold',
      }),
    );
    if (!db || shown.length === 0) {
      this.body.add(
        this.text(x, y0 + 14, this.t('gear.noSets'), { fontSize: '9px', color: '#677594' }),
      );
      return;
    }
    let y = y0 + 14;
    for (const st of shown.slice(0, 2)) {
      this.body.add(
        this.text(
          x,
          y,
          this.t('gear.setLine', {
            name: this.t(`gear.set.${st.id}`),
            count: st.count,
            total: st.total,
          }),
          { fontSize: '9px', color: '#7fd8c8', fontStyle: 'bold' },
        ),
      );
      y += 12;
      for (const b of db.sets[st.id].bonuses) {
        const lit = st.count >= b.count;
        this.body.add(
          this.text(
            x + 6,
            y,
            this.t('gear.setBonus', { count: b.count, text: this.bonusText(b) }),
            {
              fontSize: '8px',
              color: lit ? '#e8eefc' : '#4a5878',
              fixedWidth: ROWS_W,
            },
          ),
        );
        y += 10;
      }
      y += 2;
    }
  }

  private bonusText(b: SetBonus): string {
    const parts = Object.entries(b.stats ?? {}).map(
      ([k, v]) => `${this.t(`gear.stat.${k}`)} +${v as number}`,
    );
    return [...parts, ...this.effectLines(b.effects ?? [])].join(', ');
  }

  private flatEffects(g: GearProfile): GearEffect[] {
    const out: GearEffect[] = [];
    for (const [kind, value] of Object.entries(g.totals))
      if (value) out.push({ kind: kind as GearEffect['kind'], value });
    for (const [a, value] of Object.entries(g.skillPower))
      if (value)
        out.push({
          kind: 'skillPower',
          value,
          authority: a === 'all' ? undefined : (a as GearEffect['authority']),
        });
    return out;
  }

  private effectLines(effects: GearEffect[]): string[] {
    return effects.map((e) => {
      const pct = ['mpOnHit', 'dashCut', 'regen'].includes(e.kind);
      const v = pct ? e.value : Math.round(e.value * 100);
      if (e.kind === 'skillPower' && e.authority)
        return this.t('gear.effect.skillPowerOf', {
          a: this.t(`gear.authority.${e.authority}`),
          v,
        });
      return this.t(`gear.effect.${e.kind}`, { v });
    });
  }
}
