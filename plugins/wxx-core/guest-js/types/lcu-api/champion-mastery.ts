export interface PlayerChampionMastery {
  masteries: Mastery[];
  puuid: string;
  score: number;
  summonerId: number;
}

export interface Mastery {
  championId: number;
  championLevel: number;
  championPoints: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  championSeasonMilestone: number;
  highestGrade: string;
  lastPlayTime: number;
  markRequiredForNextLevel: number;
  milestoneGrades: any[];
  nextSeasonMilestone: NextSeasonMilestone;
  puuid: string;
  tokensEarned: number;
}

export interface NextSeasonMilestone {
  bonus: boolean;
  requireGradeCounts: RequireGradeCounts;
  rewardConfig: RewardConfig;
  rewardMarks: number;
}

export interface RewardConfig {
  maximumReward: number;
  rewardValue: string;
}

export interface RequireGradeCounts {
  [key: string]: number;
}
