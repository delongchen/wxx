import { GameNumStatsKey, type MatchReport, type ParticipantExt, TeamStatsKeys } from '../types';
import type { Game } from 'tauri-plugin-wxx-core';

export class MatchAnalyzeHelper {
  private participantMap: Map<string, ParticipantExt> = new Map();
  private teamMap: Map<string, ParticipantExt[]> = new Map();

  constructor(private readonly game: Game) {
    // idMap and teamIdMap are just temp variable
    const idMap = new Map(
      this.game.participants.map(p => [p.participantId, p]),
    );
    // build puuid to participant map
    for (const id of this.game.participantIdentities) {
      this.participantMap.set(
        id.player.puuid,
        [id, idMap.get(id.participantId)!],
      );
    }
    // build puuid to team map
    const teamIdMap = new Map<number, ParticipantExt[]>;
    for (const pair of this.participantMap.values()) {
      const team = teamIdMap.get(pair[1].teamId);
      if (team === undefined) {
        teamIdMap.set(pair[1].teamId, [pair]);
      } else {
        team.push(pair);
      }
    }
    for (const [id, participant] of this.participantMap.values()) {
      this.teamMap.set(id.player.puuid, teamIdMap.get(participant.teamId)!);
    }
  }

  private getParticipantByPuuid(puuid: string) {
    return this.participantMap.get(puuid) ?? null;
  }

  //
  private getTeamStatSum(puuid: string, keys: GameNumStatsKey[] = TeamStatsKeys) {
    const team = this.teamMap.get(puuid);
    if (team === undefined || team.length === 0) return null;

    const result = {} as Record<GameNumStatsKey, number>;
    for (const [, { stats }] of team) {
      for (const key of keys) {
        result[key] = (result[key] ?? 0) + stats[key];
      }
    }

    return result;
  }

  public genMatchReport(puuid: string): MatchReport | null {
    const participant = this.getParticipantByPuuid(puuid);
    if (participant === null) return null;

    const [, { stats, championId }] = participant;
    const { gameCreation, gameId } = this.game;
    const { win } = stats;
    const teamStatSumRecord = this.getTeamStatSum(puuid)!;
    const teammates = this.teamMap
      .get(puuid)!
      .map(([id]) => id.player.puuid)
      .filter(uid => uid !== puuid);
    const gameDataRaw: Record<string, number> = {};

    for (const key of TeamStatsKeys) {
      gameDataRaw[key] = stats[key];
      gameDataRaw[`$${key}`] = stats[key] / teamStatSumRecord[key];
    }

    const gameDataExt: Record<string, number> = {};

    return {
      puuid,
      championId,
      win,
      teammates,
      gameDataRaw,
      gameDataExt,
      gameCreation,
      gameId,
    };
  }
}
