import { NiumaAnalyzeContext, TeamStatsKeys } from '../../types';
import { formatTimestamp, countMatch, encodePlayerTuple } from './utils';
import type { Player } from 'tauri-plugin-wxx-core';

type AnalyzeTask = (ctx: NiumaAnalyzeContext) => void

const gatherBaseInfo: AnalyzeTask = ctx => {
  ctx.mapReportsAndSave('creation', report => report.gameCreation);
  ctx.mapReportsAndSave('win', report => report.win ? 1 : 0);
  ctx.mapReportsAndSave('champion', report => report.championId);

  for (const key of TeamStatsKeys) {
    ctx.mapReportsAndSave(key, report => report.gameDataRaw[key]);
    ctx.mapReportsAndSave(`%${key}`, report => report.gameDataRaw[`%${key}`]);
  }
};

const countChampions: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx.result;

  state['championUsage'] = countMatch(
    dataVecMap['champion'],
    dataVecMap['win'],
    it => it,
    true,
  );
};

const countTeammates: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx.result;
  const teammatesVec = ctx.reports.map(report => report.teammates);

  state['teammates'] = countMatch(
    teammatesVec,
    dataVecMap['win'],
    players => players.map(player => player.puuid),
    true,
  ).filter(count => count[1] >= 5);
};

const countGamesByDay: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx.result;

  state['daily'] = countMatch(
    dataVecMap['creation'],
    dataVecMap['win'],
    formatTimestamp,
  );
};

const reducePlayers: AnalyzeTask = ctx => {
  const { reports } = ctx;
  const { state } = ctx.result;
  const playerMap: Map<string, Player> = new Map;

  for (const { teammates } of reports) {
    for (const mate of teammates) {
      playerMap.set(mate.puuid, mate);
    }
  }

  state['players'] = [...playerMap.values()]
    .map(encodePlayerTuple);
};

export const invokeTasks = (ctx: NiumaAnalyzeContext) => {
  [
    gatherBaseInfo,
    countChampions,
    countTeammates,
    countGamesByDay,
    reducePlayers,
  ].forEach(task => task(ctx));
};