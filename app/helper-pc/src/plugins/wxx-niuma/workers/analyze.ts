import type { Game, Participant, Stats, ParticipantIdentity } from 'tauri-plugin-wxx-core'
import { parseMatchesBuffer } from './parse'

type KeysByValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
type GameNumStatsKey = KeysByValueType<Stats, number>
type ParticipantExt = [ParticipantIdentity, Participant]
const TeamStatsKeys: GameNumStatsKey[] = [
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

export interface NiumaChartDataType {
  dataVecMap: Record<string, number[]>
  creationVec: number[]
}

interface NiumaAnalyzeContext {
  mainPuuid: string
  reports: MatchReport[]
  result: NiumaChartDataType
}

export interface NiumaAnalyzeProps {
  puuid: string
  matchesBuffer: ArrayBuffer
}

interface MatchReport {
  puuid: string,
  championId: number,
  win: boolean,
  teammates: string[],
  gameDataRaw: Record<string, number>,
  gameDataExt: Record<string, number>,
  gameCreation: number,
  gameId: number,
}

class MatchAnalyzeHelper {
  private participantMap: Map<string, ParticipantExt> = new Map()
  private teamMap: Map<string, ParticipantExt[]> = new Map()

  constructor(private readonly game: Game) {
    // idMap and teamIdMap are just temp variable
    const idMap = new Map(
      this.game.participants.map(p => [p.participantId, p])
    )
    // build puuid to participant map
    for (const id of this.game.participantIdentities) {
      this.participantMap.set(
        id.player.puuid,
        [id, idMap.get(id.participantId)!],
      )
    }
    // build puuid to team map
    const teamIdMap = new Map<number, ParticipantExt[]>
    for (const pair of this.participantMap.values()) {
      const team = teamIdMap.get(pair[1].teamId)
      if (team === undefined) {
        teamIdMap.set(pair[1].teamId, [pair])
      } else {
        team.push(pair)
      }
    }
    for (const [id, participant] of this.participantMap.values()) {
      this.teamMap.set(id.player.puuid, teamIdMap.get(participant.teamId)!)
    }
  }

  private getParticipantByPuuid(puuid: string) {
    return this.participantMap.get(puuid) ?? null
  }

  //
  private getTeamStatSum(puuid: string, keys: GameNumStatsKey[] = TeamStatsKeys) {
    const team = this.teamMap.get(puuid)
    if (team === undefined || team.length === 0) return null

    const result = {} as Record<GameNumStatsKey, number>
    for (const [, { stats }] of team) {
      for (const key of keys) {
        result[key] = (result[key] ?? 0) + stats[key]
      }
    }

    return result
  }

  public genMatchReport(puuid: string): MatchReport | null {
    const participant = this.getParticipantByPuuid(puuid)
    if (participant === null) return null

    const [, { stats, championId }] = participant
    const { gameCreation, gameId } = this.game
    const { win } = stats
    const teamStatSumRecord = this.getTeamStatSum(puuid)!
    const teammates = this.teamMap
      .get(puuid)!
      .map(([id]) => id.player.puuid)
      .filter(uid => uid !== puuid)
    const gameDataRaw: Record<string, number> = {}

    for (const key of TeamStatsKeys) {
      gameDataRaw[key] = stats[key]
      gameDataRaw[`$${key}`] = stats[key] / teamStatSumRecord[key]
    }

    const gameDataExt: Record<string, number> = {}

    return {
      puuid,
      championId,
      win,
      teammates,
      gameDataRaw,
      gameDataExt,
      gameCreation,
      gameId,
    }
  }
}

const analyze = (ctx: NiumaAnalyzeContext) => {
  const {
    reports,
    result: {
      dataVecMap,
      creationVec,
    },
  } = ctx

  for (const { gameDataRaw, gameCreation } of reports) {
    creationVec.push(gameCreation)

    const keys = Object.keys(gameDataRaw)
    for (const key of keys) {
      const exist = dataVecMap[key]
      if (exist === undefined) {
        dataVecMap[key] = [gameDataRaw[key]]
      } else {
        exist.push(gameDataRaw[key])
      }
    }
  }
}

export const analyzeMatches = (props: NiumaAnalyzeProps): NiumaChartDataType => {
  const { puuid, matchesBuffer } = props
  const rawGames = parseMatchesBuffer(matchesBuffer)
  const games = rawGames.map(it => new MatchAnalyzeHelper(it))
  const reports = games
    .map(game => game.genMatchReport(puuid))
    .filter(report => report !== null) as MatchReport[]

  const ctx: NiumaAnalyzeContext = {
    reports,
    mainPuuid: puuid,
    result: {
      dataVecMap: {},
      creationVec: [],
    }
  }

  analyze(ctx)

  return ctx.result
}