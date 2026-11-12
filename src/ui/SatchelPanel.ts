import Phaser from 'phaser';
import { QUICK_SLOT_COUNT, type GameSession } from '../state/GameSession';
import type { SoundSystem } from '../systems/audio/SoundSystem';
import type {
  IItemDefinition,
  IItemStack,
  ItemCategory,
} from '../systems/inventory/InventoryTypes';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const WIDTH = 460;
const HEIGHT = 272;
const ROW_H = 40;
const VISIBLE_ROWS = 4;
const LIST_Y = 76;

/** Bag tabs, in order; each shows the item types listed. */
const TABS: { key: string; types: ItemCategory[] }[] = [
  { key: 'gear', types: ['weapon', 'charm', 'equipment'] },
  { key: 'items', types: ['consumable', 'material'] },
  { key: 'notes', types: ['document'] },
  { key: 'clues', types: ['key_item', 'puzzle'] },
];

/**
 * Satchel overlay (I / B) in four tabs (Left / Right / Tab): Gear, Items, Notes, Clues.
 * Up / Down select; E / Space uses a consumable, equips / takes off gear, or opens a note to read;
 * 1-4 puts the selected consumable on a quick key; ESC closes the note, then the bag.
 */
export class SatchelPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly list: Phaser.GameObjects.Container;
  private readonly tabs: Phaser.GameObjects.Container;
  private readonly info: Phaser.GameObjects.Text;
  private readonly footer: Phaser.GameObjects.Text;
  private open = false;
  private tab = 0;
  private selected = 0;
  private scroll = 0;
  /** The note being read, and its page. */
  private reading: IItemDefinition | null = null;
  private page = 0;

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
    this.tabs = scene.add.container(18, 32);
    this.info = scene.add.text(18, 52, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffd166',
    });
    const divider = scene.add.graphics();
    divider.lineStyle(1, 0x1f2b45, 1);
    divider.lineBetween(18, 68, WIDTH - 18, 68);
    this.list = scene.add.container(18, LIST_Y);
    this.footer = scene.add
      .text(WIDTH / 2, HEIGHT - 14, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#65789e',
      })
      .setOrigin(0.5);
    this.container.add([bg, title, this.tabs, this.info, divider, this.list, this.footer]);
  }

  public get isOpen(): boolean {
    return this.open;
  }

  /** True while a note is open for reading. */
  public get isReading(): boolean {
    return this.reading !== null;
  }

  public toggle(): void {
    this.open = !this.open;
    this.reading = null;
    if (this.open) {
      // Open on the Items tab when Peter carries something usable, else the first non-empty tab.
      const firstUsable = TABS.findIndex((t) => t.key === 'items' && this.stacksOf(t).length > 0);
      const firstAny = TABS.findIndex((t) => this.stacksOf(t).length > 0);
      this.tab = Math.max(0, firstUsable >= 0 ? firstUsable : firstAny);
      this.selected = 0;
      this.scroll = 0;
      this.refresh();
    }
    this.container.setVisible(this.open);
  }

  private stacksOf(tab: (typeof TABS)[number]): IItemStack[] {
    const inv = this.session.inventory;
    return inv.getAllItems().filter((s) => {
      const type = inv.getItemDefinition(s.itemId)?.type;
      return type !== undefined && tab.types.includes(type);
    });
  }

  private get stacks(): IItemStack[] {
    return this.stacksOf(TABS[this.tab]);
  }

  /** Left / Right: previous / next page while reading, else previous / next tab. */
  public left(): void {
    this.step(-1);
  }

  public right(): void {
    this.step(1);
  }

  private step(dir: number): void {
    if (this.reading) {
      const pages = this.reading.pages?.length ?? 1;
      const next = Math.min(pages - 1, Math.max(0, this.page + dir));
      if (next === this.page) return;
      this.page = next;
    } else {
      this.tab = (this.tab + dir + TABS.length) % TABS.length;
      this.selected = 0;
      this.scroll = 0;
    }
    this.sound.playCursorBlip();
    this.refresh();
  }

  /** ESC: closes the open note. Returns false when there was nothing to close (close the bag). */
  public back(): boolean {
    if (!this.reading) return false;
    this.reading = null;
    this.refresh();
    return true;
  }

  public navigate(direction: number): void {
    if (this.reading) return;
    const count = this.stacks.length;
    if (count === 0) {
      this.selected = 0;
      return;
    }
    this.selected = (this.selected + direction + count) % count;
    this.sound.playCursorBlip();
    this.refresh();
  }

  private selectedStack(): IItemStack | undefined {
    const items = this.stacks;
    if (items.length === 0) return undefined;
    this.selected = Math.min(this.selected, items.length - 1);
    return items[this.selected];
  }

  /** E / Space: read a note, equip / take off gear, or use a consumable. */
  public useSelected(): void {
    if (this.reading) {
      this.back();
      return;
    }
    const stack = this.selectedStack();
    if (!stack) {
      this.notify(this.t('satchel.emptyTitle'), this.t('satchel.emptyDetail'));
      return;
    }
    const s = this.session;
    const def = s.inventory.getItemDefinition(stack.itemId);
    const name = def?.name ?? stack.itemId;
    if (def?.type === 'document') {
      this.reading = def;
      this.page = 0;
      this.sound.playSelect();
      this.refresh();
      return;
    }
    const slot = s.slotOf(stack.itemId);
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
    if (def?.type === 'key_item' || def?.type === 'puzzle') {
      this.notify(this.t('satchel.clueTitle'), this.t('satchel.clueDetail', { name }));
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
    if (this.reading) return;
    const stack = this.selectedStack();
    if (!stack || !this.session.assignQuickSlot(index, stack.itemId)) {
      this.notify(this.t('satchel.quickOnlyTitle'), this.t('satchel.quickOnlyDetail'));
      return;
    }
    this.sound.playCursorBlip();
    this.onChanged();
    this.refresh();
  }

  // ------------------------------------------------------------------ drawing

  private text(
    x: number,
    y: number,
    value: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ) {
    return this.scene.add.text(x, y, value, { fontFamily: 'monospace', ...style });
  }

  private refresh(): void {
    this.drawTabs();
    this.list.removeAll(true);
    if (this.reading) {
      this.drawReader(this.reading);
      return;
    }
    this.drawInfo();
    this.footer.setText(this.t('satchel.footer'));
    this.drawList();
  }

  private drawTabs(): void {
    this.tabs.removeAll(true);
    let x = 0;
    TABS.forEach((tab, i) => {
      const active = i === this.tab;
      const count = this.stacksOf(tab).length;
      const label = this.text(x, 0, ` ${this.t(`satchel.tab.${tab.key}`)} (${count}) `, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: active ? '#0c101c' : count > 0 ? '#8fb8ff' : '#4a5878',
        backgroundColor: active ? '#00e1ff' : '#101a2e',
        padding: { left: 2, right: 2, top: 2, bottom: 2 },
      });
      this.tabs.add(label);
      x += label.width + 6;
    });
  }

  private drawInfo(): void {
    const s = this.session;
    const inv = s.inventory;
    const nameOf = (id: string | null): string =>
      id ? (inv.getItemDefinition(id)?.name ?? id) : this.t('satchel.none');
    const key = TABS[this.tab].key;
    if (key === 'gear') {
      this.info.setText(
        this.t('satchel.gear', {
          weapon: nameOf(s.equipment.weapon),
          charm: nameOf(s.equipment.charm),
        }),
      );
    } else if (key === 'items') {
      const keys = Array.from({ length: QUICK_SLOT_COUNT }, (_, i) => {
        const id = s.quickSlots[i];
        return `[${i + 1}] ${id ? `${nameOf(id)} x${inv.getItemCount(id)}` : '—'}`;
      });
      this.info.setText(`${this.t('satchel.quick')} ${keys.join('  ')}`);
    } else {
      this.info.setText(this.t(`satchel.tabHint.${key}`));
    }
  }

  private drawList(): void {
    const s = this.session;
    const inv = s.inventory;
    const items = this.stacks;
    if (items.length === 0) {
      this.selected = 0;
      this.list.add(
        this.text(10, 20, this.t(`satchel.emptyTab.${TABS[this.tab].key}`), {
          fontSize: '11px',
          color: '#677594',
        }),
      );
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
        def.type === 'key_item' || def.type === 'puzzle'
          ? '#ffd700'
          : def.type === 'consumable'
            ? '#00e1ff'
            : def.type === 'document'
              ? '#e8d9b0'
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
      const hintKey = !isSel
        ? null
        : slot
          ? worn
            ? 'satchel.unequipHint'
            : 'satchel.equipHint'
          : def.type === 'consumable'
            ? 'satchel.useHint'
            : def.type === 'document'
              ? 'satchel.readHint'
              : null;
      const hint = hintKey ? `  ${this.t(hintKey)}` : '';
      const wornMark = worn ? ` ${this.t('satchel.worn')}` : '';
      const qty = def.stackable ? `  x${stack.quantity}` : '';
      this.list.add([
        this.text(0, y, `${isSel ? '▶ ' : '  '}${def.name}${qty}${wornMark}${hint}`, {
          fontSize: '11px',
          color: isSel ? '#ffffff' : color,
          fontStyle: 'bold',
        }),
        this.text(14, y + 15, def.description, {
          fontSize: '10px',
          color: isSel ? '#dce7f7' : '#b8c5de',
          wordWrap: { width: WIDTH - 50 },
          maxLines: 1,
        }),
      ]);
    });
    if (items.length > VISIBLE_ROWS) {
      this.list.add(
        this.text(WIDTH - 60, VISIBLE_ROWS * ROW_H - 6, `${this.selected + 1}/${items.length}`, {
          fontSize: '9px',
          color: '#65789e',
        }),
      );
    }
  }

  /** A note open for reading: its name, the current page, page count. */
  private drawReader(def: IItemDefinition): void {
    const pages = def.pages?.length ? def.pages : [def.description];
    this.info.setText(`✎ ${def.name}`);
    this.list.add(
      this.text(4, 0, pages[this.page] ?? '', {
        fontSize: '11px',
        color: '#e8d9b0',
        lineSpacing: 4,
        wordWrap: { width: WIDTH - 46 },
      }),
    );
    this.footer.setText(
      this.t('satchel.readerFooter', { page: this.page + 1, pages: pages.length }),
    );
  }
}
