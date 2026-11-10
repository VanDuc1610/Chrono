import { IQuest, QuestDatabase, QuestStage } from './QuestTypes';

export interface IQuestSystem {
  loadDatabase(data: QuestDatabase): void;
  getQuest(questId: string): IQuest | undefined;
  getActiveQuests(): IQuest[];
  getAllQuests(): IQuest[];
  getQuestStage(questId: string): QuestStage;
  startQuest(questId: string): boolean;
  completeObjective(questId: string, objectiveId: string): boolean;
  completeQuest(questId: string): boolean;
  failQuest(questId: string): boolean;
  isQuestCompleted(questId: string): boolean;
}
