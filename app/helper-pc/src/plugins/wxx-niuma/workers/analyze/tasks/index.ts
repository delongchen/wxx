import { NiumaAnalyzeContext, TeamStatsKeys } from '../../types';
import { formatTimestamp, countMatch } from './utils';

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

const calculateChampionUsage: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx.result;

  state['championUsage'] = countMatch(dataVecMap['champion'], dataVecMap['win'], it => it);
};

const countTeammates: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx.result;

  state['teammates'] = countMatch(
    ctx.reports.map(r => r.teammates),
    dataVecMap['win'],
    it => it,
  );
};

const countGamesByDay: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx.result;

  state['daily'] = countMatch(
    dataVecMap['creation'],
    dataVecMap['win'],
    formatTimestamp,
  );
};

export const invokeTasks = (ctx: NiumaAnalyzeContext) => {
  [
    gatherBaseInfo,
    calculateChampionUsage,
    countTeammates,
    countGamesByDay,
  ].forEach(task => task(ctx));
};