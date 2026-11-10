import { IQuestSystem } from './IQuestSystem';
import { IQuest, IQuestObjective, QuestDatabase, QuestStage } from './QuestTypes';

export type QuestEventType =
  | 'quest_started'
  | 'objective_completed'
  | 'quest_completed'
  | 'quest_failed';

export interface QuestEvent {
  type: QuestEventType;
  quest: IQuest;
  objective?: IQuestObjective;
}

export type QuestEventListener = (event: QuestEvent) => void;

export class QuestSystem implements IQuestSystem {
  private quests: Map<string, IQuest> = new Map();
  private listeners: QuestEventListener[] = [];

  public loadDatabase(data: QuestDatabase): void {
    this.quests.clear();
    for (const q of data.quests) {
      // Deep clone so runtime state modifications don't mutate raw cache
      const cloned: IQuest = {
        ...q,
        objectives: q.objectives.map((obj) => ({ ...obj })),
      };
      this.quests.set(cloned.id, cloned);
    }
  }

  public addEventListener(listener: QuestEventListener): void {
    this.listeners.push(listener);
  }

  public removeEventListener(listener: QuestEventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private emit(event: QuestEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public getQuest(questId: string): IQuest | undefined {
    return this.quests.get(questId);
  }

  public getAllQuests(): IQuest[] {
    return Array.from(this.quests.values());
  }

  public loadFromState(savedQuests: IQuest[]): void {
    for (const sq of savedQuests) {
      this.quests.set(sq.id, JSON.parse(JSON.stringify(sq)));
    }
  }

  public getActiveQuests(): IQuest[] {
    const active: IQuest[] = [];
    for (const quest of this.quests.values()) {
      if (quest.stage === 'started') {
        active.push(quest);
      }
    }
    return active;
  }

  public getQuestStage(questId: string): QuestStage {
    const quest = this.quests.get(questId);
    return quest ? quest.stage : 'inactive';
  }

  public startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.stage === 'started' || quest.stage === 'completed') {
      return false;
    }

    quest.stage = 'started';
    this.emit({
      type: 'quest_started',
      quest,
    });
    return true;
  }

  public completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.stage !== 'started') {
      return false;
    }

    const objective = quest.objectives.find((obj) => obj.id === objectiveId);
    if (!objective || objective.completed) {
      return false;
    }

    objective.completed = true;
    this.emit({
      type: 'objective_completed',
      quest,
      objective,
    });

    // Check if all objectives are now completed
    const allCompleted = quest.objectives.every((obj) => obj.completed);
    if (allCompleted) {
      this.completeQuest(questId);
    }

    return true;
  }

  public completeQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.stage === 'completed') {
      return false;
    }

    quest.stage = 'completed';
    // Ensure all objectives are marked completed
    for (const obj of quest.objectives) {
      obj.completed = true;
    }

    this.emit({
      type: 'quest_completed',
      quest,
    });
    return true;
  }

  public failQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.stage === 'completed' || quest.stage === 'failed') {
      return false;
    }

    quest.stage = 'failed';
    this.emit({
      type: 'quest_failed',
      quest,
    });
    return true;
  }

  public isQuestCompleted(questId: string): boolean {
    const quest = this.quests.get(questId);
    return quest ? quest.stage === 'completed' : false;
  }
}

