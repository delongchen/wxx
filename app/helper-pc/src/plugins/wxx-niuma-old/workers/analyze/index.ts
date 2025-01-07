import type {
  MatchReport,
  NiumaAnalyzeContext,
  NiumaAnalyzeProps, NiumaChartDataType,
  DataStatistic,
} from '../types';
import type { Game } from 'tauri-plugin-wxx-core';
import { BytesList } from 'wxx-protobufs/common';
import { Game as GameProto } from 'wxx-protobufs/lcu.matchHistory';
import { invokeTasks } from './tasks';
import { MatchAnalyzeHelper } from './analyze-helper';

const SetKeysMap = new Map<string, Set<string>>();

const createRecordAndItsProxy = <T>(key: string) => {
  const record: Record<string, T> = {};
  const setKeys = new Set<string>();
  SetKeysMap.set(key, setKeys);

  const proxy = new Proxy(record, {
    set(target: Record<string, T>, p: string, newValue: unknown, receiver: unknown): boolean {
      if (setKeys.has(p)) {
        console.warn(`${key}: ${p} has been set multi times!`);
      } else {
        setKeys.add(p);
      }
      return Reflect.set(target, p, newValue, receiver);
    },
  });

  return [record, proxy];
};

const createAnalyzeContext = (mainPuuid: string, reports: MatchReport[]): NiumaAnalyzeContext => {
  const [dataVecMap, dataVecMapProxy] = createRecordAndItsProxy<number[]>('data-vec-map');
  const [dataStatisticMap, dataStatisticMapProxy] = createRecordAndItsProxy<DataStatistic>('data-statistic-map');
  const [chartState, chartStateProxy] = createRecordAndItsProxy<unknown>('chart-state');

  const mapReportsAndSave = (to: string, fn: (r: MatchReport) => number) => {
    dataVecMapProxy[to] = reports.map(fn);
  };

  const statistical = (key: string) => {
    const target = dataVecMapProxy[key];
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
    state: chartStateProxy,
    dataVecMap: dataVecMapProxy,
    dataStatisticMap: dataStatisticMapProxy,
    mapReportsAndSave,
    statistical,
    result: {
      dataVecMap,
      dataStatisticMap,
      state: chartState,
    },
  };
};

const isGame = (raw: unknown): raw is Game => {
  return typeof raw === 'object' && raw !== null;
};

const parseBufferToGames = (buf: ArrayBuffer) => {
  const { data } = BytesList.decode(new Uint8Array(buf));
  const result: Game[] = [];

  for (const buf of data) {
    const game = GameProto.decode(buf);
    if (isGame(game)) {
      result.push(game);
    }
  }

  return result;
};

const showKeysBeenSet = () => {
  console.debug([...SetKeysMap].map(([key, setKeys]) => {
    return [key, [...setKeys]];
  }));
};

export const analyzeMatches = (props: NiumaAnalyzeProps): NiumaChartDataType => {
  const { puuid, matchesBuffer } = props;

  const games = parseBufferToGames(matchesBuffer)
    .map(item => new MatchAnalyzeHelper(item));

  const reports = games
    .map(game => game.genMatchReport(puuid))
    .filter(report => report !== null) as MatchReport[];

  const ctx = createAnalyzeContext(puuid, reports);
  invokeTasks(ctx);

  showKeysBeenSet();

  return ctx.result;
};
