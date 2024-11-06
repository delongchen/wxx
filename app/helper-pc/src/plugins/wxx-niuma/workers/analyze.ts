import type { Game, Participant, Stats } from 'tauri-plugin-wxx-core'
import { parseMatchesBuffer } from './parse'

type KeysOfValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
type GameNumStatsKeys = KeysOfValueType<Stats, number>
const TeamStatsKeys: GameNumStatsKeys[] = [
  // KDA
  'kills',
  'deaths',
  'assists',
  //
  'damageDealtToObjectives',
  'damageDealtToTurrets',
  'damageSelfMitigated',
  //
  'goldSpent',
  'goldEarned',
  //
  'longestTimeSpentLiving',
  //
  'magicDamageDealt',
  'magicDamageDealtToChampions',
  'magicalDamageTaken',
  //
  'physicalDamageDealt',
  'physicalDamageDealtToChampions',
  'physicalDamageTaken',
  //
  'trueDamageDealt',
  'trueDamageDealtToChampions',
  'trueDamageTaken',
  //
  'totalDamageDealt',
  'totalDamageDealtToChampions',
  'totalDamageTaken',
  //
  'totalHeal',
  'totalMinionsKilled',
  'totalTimeCrowdControlDealt',
  'timeCCingOthers',
]

class GameHelper {
  private participantMap: Map<string, Participant> = new Map()

  constructor(private readonly game: Game) {
    const idMap = new Map(game.participants.map(p => [p.participantId, p]))

    for (const { player, participantId } of this.game.participantIdentities) {
      this.participantMap.set(
        player.puuid,
        idMap.get(participantId)!,
      )
    }
  }

  public getParticipantByPuuid(puuid: string) {
    return this.participantMap.get(puuid) ?? null
  }
}

export interface NiumaChartDataType {
  duration: number
}

interface NiumaAnalyzeContext {
  mainPuuid: string
  games: GameHelper[]
}

export interface NiumaAnalyzeProps {
  puuid: string
  matchesBuffer: ArrayBuffer
}

export const analyzeMatches = (props: NiumaAnalyzeProps): NiumaChartDataType => {
  const { puuid, matchesBuffer } = props

  const taskStart = performance.now()
  const rawGames = parseMatchesBuffer(matchesBuffer)
  const games = rawGames.map(it => new GameHelper(it))
  const taskEnd = performance.now()

  console.log(games[games.length - 1].getParticipantByPuuid(puuid));

  return {
    duration: taskEnd - taskStart,
  }
}