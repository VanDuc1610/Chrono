import Phaser from 'phaser';
import type { GameSession } from '../state/GameSession';
import type { SoundSystem } from '../systems/audio/SoundSystem';
import { createPanel } from './Panel';
import type { Translate } from './Strings';

const WIDTH = 440;
const HEIGHT = 220;

/** Satchel overlay (I / B): list items, Up / Down select, E / Space uses a consumable. */
export class SatchelPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly list: Phaser.GameObjects.Container;
  private open = false;
  private selected = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly sound: SoundSystem,
    private readonly t: Translate,
    private readonly notify: (title: string, subtitle: string) => void,
    private readonly onHpChanged: () => void,
  ) {
    const { width, height } = scene.scale;
    this.container = scene.add
      .container(width / 2 - WIDTH / 2, height / 2 - HEIGHT / 2)
      .setScrollFactor(0)
      .setDepth(250)
      .setVisible(false);
    const bg = createPanel(scene, 0, 0, WIDTH, HEIGHT);
    const title = scene.add.text(18, 14, t('satchel.title'), {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#00e1ff',
      fontStyle: 'bold',
      letterSpacing: 1,
    });
    const subtitle = scene.add.text(18, 28, t('satchel.subtitle'), {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#6e80a3',
    });
    const divider = scene.add.graphics();
    divider.lineStyle(1, 0x1f2b45, 1);
    divider.lineBetween(18, 42, WIDTH - 18, 42);
    this.list = scene.add.container(18, 50);
    const footer = scene.add
      .text(WIDTH / 2, HEIGHT - 16, t('satchel.footer'), {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#65789e',
      })
      .setOrigin(0.5);
    this.container.add([bg, title, subtitle, divider, this.list, footer]);
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

  public useSelected(): void {
    const inv = this.session.inventory;
    const items = inv.getAllItems();
    if (items.length === 0) {
      this.notify(this.t('satchel.emptyTitle'), this.t('satchel.emptyDetail'));
      return;
    }
    this.selected = Math.min(this.selected, items.length - 1);
    const stack = items[this.selected];
    const def = stack ? inv.getItemDefinition(stack.itemId) : undefined;
    if (!stack || !def || stack.quantity <= 0) {
      this.notify(this.t('satchel.noItemTitle'), this.t('satchel.noItemDetail', { name: '' }));
      return;
    }
    const heal = def.effects?.healAmount;
    if (def.type !== 'consumable' || heal === undefined) {
      this.notify(
        this.t('satchel.cannotUseTitle'),
        this.t('satchel.cannotUseDetail', { name: def.name }),
      );
      return;
    }
    const maxHp = this.session.getStats().maxHp;
    if (this.session.hp >= maxHp) {
      this.notify(
        this.t('satchel.hpFullTitle'),
        this.t('satchel.hpFullDetail', { name: this.session.playerName, hp: maxHp, maxHp }),
      );
      return;
    }
    if (!inv.removeItem(stack.itemId, 1)) {
      this.notify(
        this.t('satchel.noItemTitle'),
        this.t('satchel.noItemDetail', { name: def.name }),
      );
      return;
    }
    const before = this.session.hp;
    this.session.applyBattleHp(before + heal);
    this.sound.playHeal();
    this.onHpChanged();
    this.selected = Math.min(this.selected, Math.max(0, inv.getAllItems().length - 1));
    this.refresh();
    this.notify(
      this.t('satchel.usedTitle'),
      this.t('satchel.usedDetail', {
        name: def.name,
        healed: this.session.hp - before,
        hp: this.session.hp,
        maxHp,
      }),
    );
  }

  private refresh(): void {
    this.list.removeAll(true);
    const inv = this.session.inventory;
    const items = inv.getAllItems();
    const text = (
      x: number,
      y: number,
      value: string,
      style: Phaser.Types.GameObjects.Text.TextStyle,
    ) => this.scene.add.text(x, y, value, { fontFamily: 'monospace', ...style });

    if (items.length === 0) {
      this.selected = 0;
      this.list.add(text(10, 20, this.t('satchel.empty'), { fontSize: '10px', color: '#677594' }));
      return;
    }
    this.selected = Math.min(this.selected, items.length - 1);

    items.forEach((stack, idx) => {
      const def = inv.getItemDefinition(stack.itemId);
      if (!def) return;
      const isSel = idx === this.selected;
      const y = idx * 46;
      const color =
        def.type === 'key_item' ? '#ffd700' : def.type === 'consumable' ? '#00e1ff' : '#99b0d1';
      if (isSel) {
        const row = this.scene.add.graphics();
        row.fillStyle(0x16243d, 0.85);
        row.fillRect(-6, y - 3, 412, 38);
        row.lineStyle(1, 0x00e1ff, 0.7);
        row.strokeRect(-6, y - 3, 412, 38);
        this.list.add(row);
      }
      const typeLabel = this.t(`satchel.type.${def.type}`);
      const hint = isSel && def.type === 'consumable' ? `  ${this.t('satchel.useHint')}` : '';
      this.list.add([
        text(0, y, `${isSel ? '▶ ' : '  '}[${typeLabel}] ${def.name}  x${stack.quantity}${hint}`, {
          fontSize: '10px',
          color: isSel ? '#ffffff' : color,
          fontStyle: 'bold',
        }),
        text(14, y + 14, def.description, {
          fontSize: '9px',
          color: isSel ? '#dce7f7' : '#b8c5de',
          wordWrap: { width: 390 },
        }),
      ]);
    });
  }
}
