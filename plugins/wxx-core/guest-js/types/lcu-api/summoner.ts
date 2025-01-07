export interface SummonerInfo {
  unnamed: boolean;
  nameChangeFlag: boolean;
  accountId: number;
  percentCompleteForNextLevel: number;
  profileIconId: number;
  summonerId: number;
  summonerLevel: number;
  xpSinceLastLevel: number;
  xpUntilNextLevel: number;
  displayName: string;
  gameName: string;
  internalName: string;
  privacy: 'PUBLIC' | 'PRIVATE' | string;
  puuid: string;
  tagLine: string;
  rerollPoints: RerollPoints;
}

export type SummonerInfoWithoutReRoll = Omit<SummonerInfo, 'rerollPoints'>;

export interface RerollPoints {
  currentPoints: number;
  maxRolls: number;
  numberOfRolls: number;
  pointsCostToRoll: number;
  pointsToReroll: number;
}
