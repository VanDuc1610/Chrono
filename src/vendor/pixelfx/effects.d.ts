/** Types for the vendored pixelfx subset (see effects.js). */
export interface PixelFrame {
  w: number;
  h: number;
  color: Uint32Array;
  light: Uint32Array;
}

export interface PixelFxMeta {
  name: string;
  size: [number, number];
  origin: [number, number];
  duration: number;
  loop: boolean;
  options?: Record<string, unknown>;
}

export interface PixelFx {
  meta: PixelFxMeta;
  options: Record<string, unknown> & { x?: number; y?: number; flip?: boolean; angle?: number };
  readonly t: number;
  update(dt: number): void;
  draw(frame: PixelFrame, layer?: 'back' | 'front'): void;
  stop(): void;
  done(): boolean;
}

export interface PixelFxModule {
  meta: PixelFxMeta;
}

export type EffectKey =
  | 'hitSpark'
  | 'critHit'
  | 'shieldBlock'
  | 'groundSlam'
  | 'splash'
  | 'waveCrash'
  | 'timeStop'
  | 'blinkIn'
  | 'blinkOut'
  | 'smite'
  | 'holyPillar'
  | 'soulRise'
  | 'poof'
  | 'stunned'
  | 'curse'
  | 'frostNova';

export const EFFECTS: Record<EffectKey, PixelFxModule>;
export function createFrame(w: number, h: number): PixelFrame;
export function clearFrame(frame: PixelFrame): void;
export function createFx(mod: PixelFxModule, options?: Record<string, unknown>): PixelFx;
export function composite(
  frame: PixelFrame,
  out: Uint8ClampedArray,
  bg?: number | Uint32Array | null,
  lightK?: number,
): Uint8ClampedArray;
