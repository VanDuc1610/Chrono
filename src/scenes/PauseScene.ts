import Phaser from 'phaser';
import { createPanel } from '../ui/Panel';
import { getStrings, type Translate } from '../ui/Strings';
import { OptionsPanel } from '../ui/OptionsPanel';
import { ACTIVE_SLOT, SaveSlotsPanel } from '../ui/SaveSlotsPanel';
import { controlList } from '../ui/controlList';
import { SaveSystem } from '../systems/save/SaveSystem';
import { SoundSystem } from '../systems/audio/SoundSystem';
import { startSessionFromSave } from '../state/GameSession';

/** What the pause menu needs from the map it paused. */
export interface Pausable {
  readonly inBossFight: boolean;
  saveToSlot(slot: number): Promise<boolean>;
  quitToTitle(): void;
}

type Item = 'resume' | 'save' | 'load' | 'options' | 'controls' | 'titleScreen';
const ITEMS: Item[] = ['resume', 'save', 'load', 'options', 'controls', 'titleScreen'];

/**
 * T-96 pause menu (docs/design/SETTINGS_UX.md §3), over a paused ExplorationScene: resume, save,
 * load, options, controls, back to the title (with a confirmation). Saving and loading are closed
 * during a boss fight. ESC resumes.
 */
export class PauseScene extends Phaser.Scene {
  private t!: Translate;
  private host!: Pausable;
  private index = 0;
  private lines: Phaser.GameObjects.Text[] = [];
  private note!: Phaser.GameObjects.Text;
  /** An options or slots panel is open over the menu. */
  private busy = false;
  private confirmQuit = false;
  private readonly saves = new SaveSystem();

  constructor() {
    super({ key: 'PauseScene' });
  }

  public init(): void {
    this.index = 0;
    this.lines = [];
    this.busy = false;
    this.confirmQuit = false;
  }

  public create(): void {
    this.t = getStrings(this);
    this.host = this.scene.get('ExplorationScene') as unknown as Pausable;
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x03040a, 0.6).setOrigin(0);
    const w = 220;
    const h = 30 + ITEMS.length * 20 + 26;
    const x0 = (width - w) / 2;
    const y0 = (height - h) / 2;
    createPanel(this, x0, y0, w, h);
    this.add
      .text(width / 2, y0 + 10, this.t('pause.title'), { fontSize: '11px', color: '#00d2ff' })
      .setOrigin(0.5, 0);
    ITEMS.forEach((item, i) => {
      const line = this.add
        .text(x0 + 28, y0 + 32 + i * 20, this.t(`pause.${item}`), { fontSize: '10px' })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          if (this.busy) return;
          this.index = i;
          this.draw();
        })
        .on('pointerdown', () => {
          if (this.busy) return;
          this.index = i;
          this.choose();
        });
      this.lines.push(line);
    });
    this.note = this.add
      .text(width / 2, y0 + h + 8, '', { fontSize: '8px', color: '#8b97b8', align: 'center' })
      .setOrigin(0.5, 0);
    const kb = this.input.keyboard;
    kb?.on('keydown', (e: KeyboardEvent) => this.key(e));
    this.draw();
  }

  private enabled(item: Item): boolean {
    return !(this.host.inBossFight && (item === 'save' || item === 'load'));
  }

  private draw(): void {
    this.lines.forEach((line, i) => {
      const item = ITEMS[i];
      const sel = i === this.index;
      const on = this.enabled(item);
      line
        .setText(`${sel ? '▶ ' : '  '}${this.t(`pause.${item}`)}`)
        .setColor(!on ? '#454e66' : sel ? '#ffffff' : '#c8d4ec');
    });
    const item = ITEMS[this.index];
    this.note.setText(
      this.confirmQuit
        ? this.t('pause.quitConfirm')
        : !this.enabled(item)
          ? this.t('pause.noSaveInBoss')
          : this.t('pause.hint'),
    );
    this.note.setColor(this.confirmQuit ? '#ffb38a' : '#8b97b8');
  }

  private key(e: KeyboardEvent): void {
    if (this.busy) return;
    const k = e.key;
    if (k === 'Escape') {
      if (this.confirmQuit) {
        this.confirmQuit = false;
        this.draw();
      } else this.resume();
      return;
    }
    if (k === 'ArrowUp' || k === 'w' || k === 'W')
      this.index = (this.index + ITEMS.length - 1) % ITEMS.length;
    else if (k === 'ArrowDown' || k === 's' || k === 'S')
      this.index = (this.index + 1) % ITEMS.length;
    else if (k === 'Enter' || k === ' ') return this.choose();
    else return;
    this.confirmQuit = false;
    SoundSystem.getInstance().playCursorBlip();
    this.draw();
  }

  private choose(): void {
    const item = ITEMS[this.index];
    if (!this.enabled(item)) return;
    SoundSystem.getInstance().playSelect();
    if (item === 'resume') return this.resume();
    if (item === 'titleScreen') {
      if (!this.confirmQuit) {
        this.confirmQuit = true;
        return this.draw();
      }
      this.scene.resume('ExplorationScene');
      this.host.quitToTitle();
      this.scene.stop();
      return;
    }
    this.busy = true;
    const done = (): void => {
      this.busy = false;
      this.draw();
    };
    const list = () => Promise.all([1, 2, 3].map((n) => this.saves.getMetadata(n)));
    const remove = async (slot: number) => {
      await this.saves.delete(slot);
    };
    const active = Number(this.registry.get(ACTIVE_SLOT) ?? 1);
    if (item === 'options' || item === 'controls') {
      const panel = new OptionsPanel(this, this.t, controlList(this.t), done);
      if (item === 'controls') panel.setTab(2);
    } else if (item === 'save') {
      new SaveSlotsPanel(
        this,
        this.t,
        'save',
        list,
        async (slot) => {
          if (await this.host.saveToSlot(slot)) this.registry.set(ACTIVE_SLOT, slot);
        },
        remove,
        done,
        active,
      );
    } else {
      new SaveSlotsPanel(
        this,
        this.t,
        'load',
        list,
        (slot) => this.loadSlot(slot),
        remove,
        done,
        active,
      );
    }
  }

  private async loadSlot(slot: number): Promise<void> {
    const data = await this.saves.load(slot);
    if (!data) return;
    this.registry.set(ACTIVE_SLOT, slot);
    startSessionFromSave(this, data);
    this.scene.stop('ExplorationScene');
    this.scene.start('ExplorationScene', {});
  }

  private resume(): void {
    SoundSystem.getInstance().playMenuCancel();
    this.scene.resume('ExplorationScene');
    this.scene.stop();
  }
}
