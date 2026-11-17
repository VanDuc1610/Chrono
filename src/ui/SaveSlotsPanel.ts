import Phaser from 'phaser';
import { createPanel } from './Panel';
import type { Translate } from './Strings';
import type { ISaveMetadata } from '../systems/save/SaveTypes';
import type { MapDatabase } from '../world/MapTypes';

export const SLOT_COUNT = 3;
/** Registry key: the slot this playthrough saves to (K and the pause menu default). */
export const ACTIVE_SLOT = 'activeSaveSlot';

/** "Ô 1 · Chương 4 — Doanh Trại Veridia" + "Cấp 14 · 02:15:30 · 17/11/2026 11:15". */
export function slotLines(
  t: Translate,
  slot: number,
  meta: ISaveMetadata | null,
  maps: MapDatabase | undefined,
): [string, string] {
  if (!meta) return [t('slots.empty', { n: slot }), ''];
  const def = maps?.maps[meta.mapId];
  const chapter = def?.chapter ?? 0;
  const where = def?.name ?? meta.mapId;
  const head =
    chapter > 0
      ? t('slots.titleChapter', { n: slot, chapter, map: where })
      : t('slots.titlePrologue', { n: slot, map: where });
  const sec = Math.max(0, Math.floor(meta.playtimeSeconds));
  const hms = [Math.floor(sec / 3600), Math.floor(sec / 60) % 60, sec % 60]
    .map((v) => String(v).padStart(2, '0'))
    .join(':');
  const d = new Date(meta.timestamp);
  const pad = (v: number) => String(v).padStart(2, '0');
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return [head, t('slots.detail', { level: meta.playerLevel, time: hms, date })];
}

/**
 * T-96 save slots (docs/design/SETTINGS_UX.md §4): three cards; Enter saves or loads the chosen
 * slot (saving over a used slot asks first, focus on "Huỷ"), Del/X deletes after a confirmation,
 * ESC goes back. Mouse: click a card.
 */
export class SaveSlotsPanel {
  private readonly root: Phaser.GameObjects.Container;
  private readonly cards: { head: Phaser.GameObjects.Text; detail: Phaser.GameObjects.Text }[] = [];
  private readonly frame: Phaser.GameObjects.Graphics;
  private metas: (ISaveMetadata | null)[] = [];
  private index = 0;
  private confirm: { text: Phaser.GameObjects.Text; yes: boolean; run: () => void } | null = null;
  private readonly onKey: (e: KeyboardEvent) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly t: Translate,
    private readonly mode: 'save' | 'load',
    private readonly list: () => Promise<(ISaveMetadata | null)[]>,
    private readonly act: (slot: number) => Promise<void> | void,
    private readonly remove: (slot: number) => Promise<void>,
    private readonly onClose: () => void,
    startSlot = 1,
  ) {
    const { width, height } = scene.scale;
    const w = 460;
    const h = 236;
    const x0 = (width - w) / 2;
    const y0 = (height - h) / 2;
    this.index = Phaser.Math.Clamp(startSlot - 1, 0, SLOT_COUNT - 1);
    this.root = scene.add.container(x0, y0).setScrollFactor(0).setDepth(410);
    const shade = scene.add
      .rectangle(-x0, -y0, width, height, 0x000000, 0.55)
      .setOrigin(0)
      .setInteractive();
    this.root.add([shade, createPanel(scene, 0, 0, w, h)]);
    this.root.add(
      scene.add
        .text(w / 2, 12, t(mode === 'save' ? 'slots.titleSave' : 'slots.titleLoad'), {
          fontSize: '11px',
          color: '#00d2ff',
        })
        .setOrigin(0.5, 0),
    );
    this.frame = scene.add.graphics();
    this.root.add(this.frame);
    for (let i = 0; i < SLOT_COUNT; i++) {
      const y = 38 + i * 56;
      const zone = scene.add
        .rectangle(16, y, w - 32, 48, 0x000000, 0)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.index = i;
          this.choose();
        });
      const head = scene.add.text(28, y + 8, '', { fontSize: '9px', color: '#e4ebf5' });
      const detail = scene.add.text(28, y + 26, '', { fontSize: '8px', color: '#8b97b8' });
      this.root.add([zone, head, detail]);
      this.cards.push({ head, detail });
    }
    this.root.add(
      scene.add
        .text(w / 2, h - 18, t('slots.hint'), { fontSize: '7px', color: '#6f7da3' })
        .setOrigin(0.5, 0),
    );
    // The key that opened the panel must not also act inside it: listen from the next frame.
    this.onKey = (e) => this.key(e);
    scene.time.delayedCall(1, () => {
      if (this.root.active) scene.input.keyboard?.on('keydown', this.onKey);
    });
    void this.reload();
  }

  private async reload(): Promise<void> {
    this.metas = await this.list();
    this.draw();
  }

  private draw(): void {
    const maps = this.scene.cache.json.get('data_maps') as MapDatabase | undefined;
    this.frame.clear();
    this.cards.forEach((c, i) => {
      const [head, detail] = slotLines(this.t, i + 1, this.metas[i] ?? null, maps);
      const sel = i === this.index;
      c.head.setText(`${sel ? '▶ ' : '  '}${head}`).setColor(sel ? '#ffffff' : '#c8d4ec');
      c.detail.setText(detail);
      this.frame.lineStyle(1, sel ? 0x00d2ff : 0x2a3550, 1).strokeRect(16, 38 + i * 56, 428, 48);
    });
  }

  private key(e: KeyboardEvent): void {
    const k = e.key;
    if (this.confirm) {
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'a' || k === 'd') {
        this.confirm.yes = !this.confirm.yes;
        this.drawConfirm();
      } else if (k === 'Enter' || k === ' ') {
        const c = this.confirm;
        this.closeConfirm();
        if (c.yes) c.run();
      } else if (k === 'Escape') this.closeConfirm();
      return;
    }
    if (k === 'Escape') return this.close();
    if (k === 'ArrowUp' || k === 'w' || k === 'W')
      this.index = (this.index + SLOT_COUNT - 1) % SLOT_COUNT;
    else if (k === 'ArrowDown' || k === 's' || k === 'S')
      this.index = (this.index + 1) % SLOT_COUNT;
    else if (k === 'Enter' || k === ' ') return this.choose();
    else if (k === 'Delete' || k === 'x' || k === 'X') return this.askDelete();
    else return;
    this.draw();
  }

  private choose(): void {
    const slot = this.index + 1;
    const meta = this.metas[this.index] ?? null;
    if (this.mode === 'load') {
      if (meta) void this.act(slot);
      return;
    }
    if (!meta) {
      void Promise.resolve(this.act(slot)).then(() => this.reload());
      return;
    }
    this.ask(this.t('slots.overwrite', { n: slot, level: meta.playerLevel }), () => {
      void Promise.resolve(this.act(slot)).then(() => this.reload());
    });
  }

  private askDelete(): void {
    const slot = this.index + 1;
    if (!this.metas[this.index]) return;
    this.ask(this.t('slots.delete', { n: slot }), () => {
      void this.remove(slot).then(() => this.reload());
    });
  }

  private ask(question: string, run: () => void): void {
    const { width, height } = this.scene.scale;
    const text = this.scene.add
      .text(width / 2, height / 2, '', {
        fontSize: '9px',
        color: '#ffe08a',
        backgroundColor: '#07080ff2',
        padding: { left: 14, right: 14, top: 10, bottom: 10 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(420);
    this.confirm = { text, yes: false, run };
    (text as Phaser.GameObjects.Text & { question?: string }).question = question;
    this.drawConfirm();
  }

  private drawConfirm(): void {
    const c = this.confirm;
    if (!c) return;
    const q = (c.text as Phaser.GameObjects.Text & { question?: string }).question ?? '';
    const no = c.yes ? `  ${this.t('slots.cancel')}  ` : `[ ${this.t('slots.cancel')} ]`;
    const yes = c.yes ? `[ ${this.t('slots.confirm')} ]` : `  ${this.t('slots.confirm')}  `;
    c.text.setText(`${q}\n\n${no}      ${yes}`);
  }

  private closeConfirm(): void {
    this.confirm?.text.destroy();
    this.confirm = null;
  }

  public close(): void {
    this.closeConfirm();
    this.scene.input.keyboard?.off('keydown', this.onKey);
    this.root.destroy();
    this.onClose();
  }
}
