export type QuestStage = 'inactive' | 'started' | 'completed' | 'failed';

export interface IQuestObjective {
  id: string;
  description: string;
  completed: boolean;
  currentCount?: number;
  targetCount?: number;
  /** Session flag that completes this objective automatically once it is true. */
  completeOnFlag?: string;
}

export interface IQuestReward {
  experience?: number;
  items?: string[];
  gold?: number;
}

export interface IQuest {
  id: string;
  title: string;
  description: string;
  stage: QuestStage;
  objectives: IQuestObjective[];
  rewards?: IQuestReward;
  /** Quest started automatically once this one is completed. */
  followUpQuestId?: string;
}

export interface QuestDatabase {
  quests: IQuest[];
}
