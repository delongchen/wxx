import type {
  MatchReport,
  NiumaAnalyzeContext,
  NiumaAnalyzeProps, NiumaChartDataType,
  DataStatistic,
} from '../types';
import type { Game } from 'tauri-plugin-wxx-core'
import { BytesList } from 'wxx-protobufs/common'
import { Game as GameProto } from 'wxx-protobufs/lcu.matchHistory'
import { invokeTasks } from './tasks';
import { MatchAnalyzeHelper } from './analyze-helper';

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

const isGame = (raw: unknown): raw is Game => {
  return typeof raw === 'object' && raw !== null;
}

const parseBufferToGames = (buf: ArrayBuffer) => {
  const { data } = BytesList.decode(new Uint8Array(buf));
  const result: Game[] = [];

  for (const buf of data) {
    const game = GameProto.decode(buf)
    if (isGame(game)) {
      result.push(game)
    }
  }

  return result
}

export const analyzeMatches = (props: NiumaAnalyzeProps): NiumaChartDataType => {
  const { puuid, matchesBuffer } = props;

  const games = parseBufferToGames(matchesBuffer)
    .map(item => new MatchAnalyzeHelper(item))

  const reports = games
    .map(game => game.genMatchReport(puuid))
    .filter(report => report !== null) as MatchReport[];

  const ctx = createAnalyzeContext(puuid, reports);
  invokeTasks(ctx);

  return ctx.result;
};
