import Phaser from 'phaser';
import { QUICK_SLOT_COUNT, type GameSession } from '../state/GameSession';
import type { SoundSystem } from '../systems/audio/SoundSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const WIDTH = 460;
const HEIGHT = 272;
const ROW_H = 40;
const VISIBLE_ROWS = 4;
const LIST_Y = 72;

/**
 * Satchel overlay (I / B): Up / Down select, E / Space uses a consumable or equips / takes off a
 * weapon or charm, 1-4 puts the selected consumable on a quick key.
 */
export class SatchelPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly list: Phaser.GameObjects.Container;
  private readonly gear: Phaser.GameObjects.Text;
  private readonly quick: Phaser.GameObjects.Text;
  private open = false;
  private selected = 0;
  private scroll = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly sound: SoundSystem,
    private readonly t: Translate,
    private readonly notify: (title: string, subtitle: string) => void,
    /** HP, MP, stats or quick keys changed (HUD refresh). */
    private readonly onChanged: () => void,
  ) {
    const { width, height } = scene.scale;
    this.container = scene.add
      .container(width / 2 - WIDTH / 2, height / 2 - HEIGHT / 2)
      .setScrollFactor(0)
      .setDepth(250)
      .setVisible(false);
    const bg = createPanel(scene, 0, 0, WIDTH, HEIGHT);
    const title = scene.add.text(18, 12, t('satchel.title'), {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#00e1ff',
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    this.gear = scene.add.text(18, 30, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffd166',
    });
    this.quick = scene.add.text(18, 46, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#8fb8ff',
    });
    const divider = scene.add.graphics();
    divider.lineStyle(1, 0x1f2b45, 1);
    divider.lineBetween(18, 63, WIDTH - 18, 63);
    this.list = scene.add.container(18, LIST_Y);
    const footer = scene.add
      .text(WIDTH / 2, HEIGHT - 14, t('satchel.footer'), {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#65789e',
      })
      .setOrigin(0.5);
    this.container.add([bg, title, this.gear, this.quick, divider, this.list, footer]);
  }

  public get isOpen(): boolean {
    return this.open;
  }

  public toggle(): void {
    this.open = !this.open;
    if (this.open) {
      const inv = this.session.inventory;
      const first = inv
        .getAllItems()
        .findIndex((s) => inv.getItemDefinition(s.itemId)?.type === 'consumable');
      this.selected = Math.max(0, first);
      this.refresh();
    }
    this.container.setVisible(this.open);
  }

  public navigate(direction: number): void {
    const count = this.session.inventory.getAllItems().length;
    if (count === 0) {
      this.selected = 0;
      return;
    }
    this.selected = (this.selected + direction + count) % count;
    this.sound.playCursorBlip();
    this.refresh();
  }

  private selectedStack() {
    const items = this.session.inventory.getAllItems();
    if (items.length === 0) return undefined;
    this.selected = Math.min(this.selected, items.length - 1);
    return items[this.selected];
  }

  /** E / Space: use a consumable, or equip / take off a weapon or charm. */
  public useSelected(): void {
    const stack = this.selectedStack();
    if (!stack) {
      this.notify(this.t('satchel.emptyTitle'), this.t('satchel.emptyDetail'));
      return;
    }
    const s = this.session;
    const slot = s.slotOf(stack.itemId);
    const name = s.inventory.getItemDefinition(stack.itemId)?.name ?? stack.itemId;
    if (slot) {
      if (s.equipment[slot] === stack.itemId) {
        s.unequip(slot);
        this.notify(this.t('satchel.unequippedTitle'), name);
      } else {
        s.equip(stack.itemId);
        this.notify(this.t('satchel.equippedTitle'), name);
      }
      this.sound.playSelect();
      this.onChanged();
      this.refresh();
      return;
    }
    const result = s.useConsumable(stack.itemId);
    if (!result.ok) {
      const max = s.getStats();
      const [title, detail] =
        result.reason === 'full'
          ? ['satchel.hpFullTitle', 'satchel.hpFullDetail']
          : result.reason === 'none'
            ? ['satchel.noItemTitle', 'satchel.noItemDetail']
            : ['satchel.cannotUseTitle', 'satchel.cannotUseDetail'];
      this.notify(
        this.t(title),
        this.t(detail, { name: result.name, hp: max.maxHp, maxHp: max.maxHp }),
      );
      return;
    }
    this.sound.playHeal();
    this.onChanged();
    this.refresh();
    const max = s.getStats();
    this.notify(
      this.t('satchel.usedTitle'),
      this.t(
        result.restoredMp > 0 && result.healed === 0
          ? 'satchel.usedDetailMp'
          : 'satchel.usedDetail',
        {
          name: result.name,
          healed: result.healed,
          mp: result.restoredMp,
          hp: s.hp,
          maxHp: max.maxHp,
        },
      ),
    );
  }

  /** 1-4 while the bag is open: put the selected consumable on that quick key. */
  public assignQuick(index: number): void {
    const stack = this.selectedStack();
    if (!stack || !this.session.assignQuickSlot(index, stack.itemId)) {
      this.notify(this.t('satchel.quickOnlyTitle'), this.t('satchel.quickOnlyDetail'));
      return;
    }
    this.sound.playCursorBlip();
    this.onChanged();
    this.refresh();
  }

  private refresh(): void {
    const s = this.session;
    const inv = s.inventory;
    const nameOf = (id: string | null): string =>
      id ? (inv.getItemDefinition(id)?.name ?? id) : this.t('satchel.none');
    this.gear.setText(
      this.t('satchel.gear', {
        weapon: nameOf(s.equipment.weapon),
        charm: nameOf(s.equipment.charm),
      }),
    );
    const keys = Array.from({ length: QUICK_SLOT_COUNT }, (_, i) => {
      const id = s.quickSlots[i];
      return `[${i + 1}] ${id ? `${nameOf(id)} x${inv.getItemCount(id)}` : '—'}`;
    });
    this.quick.setText(`${this.t('satchel.quick')} ${keys.join('  ')}`);

    this.list.removeAll(true);
    const items = inv.getAllItems();
    const text = (
      x: number,
      y: number,
      value: string,
      style: Phaser.Types.GameObjects.Text.TextStyle,
    ) => this.scene.add.text(x, y, value, { fontFamily: 'monospace', ...style });

    if (items.length === 0) {
      this.selected = 0;
      this.list.add(text(10, 20, this.t('satchel.empty'), { fontSize: '11px', color: '#677594' }));
      return;
    }
    this.selected = Math.min(this.selected, items.length - 1);
    if (this.selected < this.scroll) this.scroll = this.selected;
    if (this.selected >= this.scroll + VISIBLE_ROWS) this.scroll = this.selected - VISIBLE_ROWS + 1;

    items.slice(this.scroll, this.scroll + VISIBLE_ROWS).forEach((stack, row) => {
      const idx = this.scroll + row;
      const def = inv.getItemDefinition(stack.itemId);
      if (!def) return;
      const isSel = idx === this.selected;
      const y = row * ROW_H;
      const slot = s.slotOf(stack.itemId);
      const worn = slot !== null && s.equipment[slot] === stack.itemId;
      const color =
        def.type === 'key_item'
          ? '#ffd700'
          : def.type === 'consumable'
            ? '#00e1ff'
            : slot
              ? '#ffb86b'
              : '#99b0d1';
      if (isSel) {
        const bar = this.scene.add.graphics();
        bar.fillStyle(0x16243d, 0.85);
        bar.fillRect(-6, y - 3, WIDTH - 24, ROW_H - 4);
        bar.lineStyle(1, 0x00e1ff, 0.7);
        bar.strokeRect(-6, y - 3, WIDTH - 24, ROW_H - 4);
        this.list.add(bar);
      }
      const typeLabel = this.t(`satchel.type.${def.type}`);
      const hint = !isSel
        ? ''
        : slot
          ? `  ${this.t(worn ? 'satchel.unequipHint' : 'satchel.equipHint')}`
          : def.type === 'consumable'
            ? `  ${this.t('satchel.useHint')}`
            : '';
      const wornMark = worn ? ` ${this.t('satchel.worn')}` : '';
      this.list.add([
        text(
          0,
          y,
          `${isSel ? '▶ ' : '  '}[${typeLabel}] ${def.name}  x${stack.quantity}${wornMark}${hint}`,
          { fontSize: '11px', color: isSel ? '#ffffff' : color, fontStyle: 'bold' },
        ),
        text(14, y + 15, def.description, {
          fontSize: '10px',
          color: isSel ? '#dce7f7' : '#b8c5de',
          wordWrap: { width: WIDTH - 50 },
          maxLines: 1,
        }),
      ]);
    });
    if (items.length > VISIBLE_ROWS) {
      this.list.add(
        text(WIDTH - 60, VISIBLE_ROWS * ROW_H - 6, `${this.selected + 1}/${items.length}`, {
          fontSize: '9px',
          color: '#65789e',
        }),
      );
    }
  }
}
