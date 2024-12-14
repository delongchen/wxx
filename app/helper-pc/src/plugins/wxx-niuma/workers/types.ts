import type { Participant, ParticipantIdentity, Stats, Player } from 'tauri-plugin-wxx-core';
// import type { Participant, ParticipantIdentity, Stats, Player } from 'wxx-protobufs/lcu.matchHistory'

type KeysByValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
export type GameNumStatsKey = KeysByValueType<Stats, number>
export type ParticipantExt = [ParticipantIdentity, Participant]
export const TeamStatsKeys: GameNumStatsKey[] = [
  /** KDA */
  'kills',
  'deaths',
  'assists',
  /** Turrets & Obj Damage */
  'damageDealtToTurrets',
  // 'damageDealtToObjectives',

  /** About Gold */
  'goldSpent',
  'goldEarned',

  /** Live Time */
  'longestTimeSpentLiving',

  /** Magic Damage */
  'magicDamageDealtToChampions',
  // 'magicDamageDealt',
  // 'magicalDamageTaken',

  /* Physical Damage */
  'physicalDamageDealtToChampions',
  // 'physicalDamageDealt',
  // 'physicalDamageTaken',

  /** True Damage */
  // 'trueDamageDealtToChampions',
  // 'trueDamageDealt',
  // 'trueDamageTaken',

  /** Total Damage */
  'totalDamageDealtToChampions',
  // 'totalDamageDealt',
  // 'totalDamageTaken',

  /** Other */
  'totalHeal',
  'totalMinionsKilled',
  // 'damageSelfMitigated',
  // 这两个有什么区别 还待研究
  // 'totalTimeCrowdControlDealt',
  'timeCCingOthers',
] as const;

export interface DataStatistic {

}

export interface NiumaChartDataType {
  dataVecMap: Record<string, number[]>;
  state: Record<string, unknown>;
  dataStatisticMap: Record<string, DataStatistic>;
}

export interface NiumaAnalyzeContext {
  mainPuuid: string;
  reports: MatchReport[];
  result: NiumaChartDataType;

  mapReportsAndSave: (to: string, fn: (report: MatchReport) => number) => void;
  statistical: (key: string) => void;
}

export interface NiumaAnalyzeProps {
  puuid: string;
  matchesBuffer: ArrayBuffer;
}

export type ItemTuple = [string, number, number, number, number, number, number, number]

export interface MatchReport {
  puuid: string,
  championId: number,
  win: boolean,
  items: ItemTuple,
  teammates: Player[],
  gameDataRaw: Record<string, number>,
  gameCreation: number,
  gameId: number,
}

export type PlayerTuple = [number, number, string, string, string, number, number, string, string, string, string]
