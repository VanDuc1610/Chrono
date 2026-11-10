import { ISaveData, ISaveMetadata } from './SaveTypes';

export interface ISaveSystem {
  save(slot: number, data: ISaveData): Promise<boolean>;
  load(slot: number): Promise<ISaveData | null>;
  delete(slot: number): Promise<boolean>;
  getMetadata(slot: number): Promise<ISaveMetadata | null>;
  listSlots(): Promise<ISaveMetadata[]>;
  hasSave(slot: number): boolean;
}

