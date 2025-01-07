export interface GameclientEogStatsBlock {
  gameId: number;
  gameMode: string;
  isRanked: boolean;
  queueId: number;
  queueType: string;
  statsBlock: StatsBlock;
}

export interface StatsBlock {
  gameLengthSeconds: number;
  players: Player[];
}

export interface Player {
  PUUID: string;
  augmentPlatformIds: number[];
  championId: number;
  championLevel: number;
  championName: string;
  championSkinId: number;
  damageDealt: number;
  damageDealtToChampions: number;
  damageTaken: number;
  goldEarned: number;
  itemIds: number[];
  playerAssists: number;
  playerDeaths: number;
  playerId: number;
  playerKills: number;
  subteamId: number;
  subteamStanding: number;
  summonerSpell1: number;
  summonerSpell2: number;
}
