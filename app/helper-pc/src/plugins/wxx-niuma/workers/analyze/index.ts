import type {
  MatchReport,
  NiumaAnalyzeContext,
  NiumaAnalyzeProps, NiumaChartDataType,
  DataStatistic,
} from '../types';
import { parseMatchesBuffer } from '../parse';
import { invokeTasks } from './tasks';
import { MatchAnalyzeHelper } from './analyze-helper.ts';

const createAnalyzeContext = (mainPuuid: string, reports: MatchReport[]): NiumaAnalyzeContext => {
  const dataVecMap: Record<string, number[]> = {};
  const dataStatisticMap: Record<string, DataStatistic> = {};

  const chartData: NiumaChartDataType = {
    dataVecMap,
    state: {},
    dataStatisticMap,
  };

  const mapReportsAndSave = (to: string, fn: (r: MatchReport) => number) => {
    dataVecMap[to] = reports.map(fn);
  };

  const statistical = (key: string) => {
    const target = dataVecMap[key];
    if (target === undefined || target.length === 0) return;

    let max = -Infinity;
    let min = Infinity;

    for (const n of target) {
      if (n < min) min = n;
      if (n > max) max = n;


    }
  };

  return {
    mainPuuid,
    reports,
    mapReportsAndSave,
    statistical,
    result: chartData,
  };
};

export const analyzeMatches = (props: NiumaAnalyzeProps): NiumaChartDataType => {
  const { puuid, matchesBuffer } = props;
  const rawGames = parseMatchesBuffer(matchesBuffer);
  const games = rawGames.map(it => new MatchAnalyzeHelper(it));
  const reports = games
    .map(game => game.genMatchReport(puuid))
    .filter(report => report !== null) as MatchReport[];

  const ctx = createAnalyzeContext(puuid, reports);
  invokeTasks(ctx);

  return ctx.result;
};
