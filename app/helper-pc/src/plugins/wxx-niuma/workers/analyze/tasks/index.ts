import { NiumaAnalyzeContext, TeamStatsKeys } from '../../types';
import { BaseItemSet } from '../../consts';
import { formatTimestamp, countMatch, encodePlayerTuple } from './utils';
import type { Player } from 'tauri-plugin-wxx-core';

type AnalyzeTask = (ctx: NiumaAnalyzeContext) => void

const gatherBaseInfo: AnalyzeTask = ctx => {
  ctx.mapReportsAndSave('creation', report => report.gameCreation);
  ctx.mapReportsAndSave('win', report => report.win ? 1 : 0);
  ctx.mapReportsAndSave('champion', report => report.championId);
  ctx.mapReportsAndSave('gameId', report => report.gameId)
  ctx.mapReportsAndSave('kda', report => {
    const k = report.gameDataRaw['kills']
    const d = report.gameDataRaw['deaths']
    const a = report.gameDataRaw['assists']

    return ((100 * ((k + a) / 3 * d)) << 0) / 100
  })

  for (const key of TeamStatsKeys) {
    ctx.mapReportsAndSave(key, report => report.gameDataRaw[key]);
    ctx.mapReportsAndSave(`%${key}`, report => report.gameDataRaw[`%${key}`]);
  }
};

const countChampions: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx;

  state['championUsage'] = countMatch(
    dataVecMap['champion'],
    dataVecMap['win'],
    it => it,
    false,
  );
};

const countTeammates: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx;
  const teammatesVec = ctx.reports.map(report => report.teammates);

  state['teammates'] = countMatch(
    teammatesVec,
    dataVecMap['win'],
    players => players.map(player => player.puuid),
    true,
  ).filter(count => count[1] >= 5);
};

const countGamesByDay: AnalyzeTask = ctx => {
  const { state, dataVecMap } = ctx;

  state['daily'] = countMatch(
    dataVecMap['creation'],
    dataVecMap['win'],
    formatTimestamp,
  );
};

const countItems: AnalyzeTask = ctx => {
  const { reports } = ctx;

  const globalMap: Map<number, number> = new Map();
  const versionMap: Map<string, Map<number, number>> = new Map();

  const update = (map: Map<number, number>, keys: number[]) => {
    for (const key of keys) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  };

  const fixVersion = (raw: string) => {
    const [a, b, c] = raw.split('.');
    return [a, b, c].join('.');
  };

  const filterBaseItem = ([itemId]: [number, number]): boolean => !BaseItemSet.has(itemId);

  for (const { items: [versionRaw, ...items] } of reports) {
    update(globalMap, items);

    const version = fixVersion(versionRaw);
    const versionExist = versionMap.get(version);
    if (versionExist === undefined) {
      versionMap.set(
        version,
        new Map(items.map(item => [item, 1])),
      );
    } else {
      update(versionExist, items);
    }
  }

  const versions = [...versionMap]
    .map<[string, [number, number][]]>(([version, map]) => [
      version,
      [...map]
        .filter(filterBaseItem)
        .sort((a, b) => b[1] - a[1]),
    ]);

  ctx.state['items'] = {
    versions,
    all: [...globalMap]
      .filter(filterBaseItem)
      .sort((a, b) => b[1] - a[1]),
  };
};

const reducePlayers: AnalyzeTask = ctx => {
  const { reports, state } = ctx;
  const playerMap: Map<string, Player> = new Map;

  for (const { teammates } of reports) {
    for (const mate of teammates) {
      playerMap.set(mate.puuid, mate);
    }
  }

  state['players'] = [...playerMap.values()].map(encodePlayerTuple);
};

export const invokeTasks = (ctx: NiumaAnalyzeContext) => {
  [
    gatherBaseInfo,
    countChampions,
    countTeammates,
    countGamesByDay,
    countItems,
    reducePlayers,
  ].forEach(task => task(ctx));
};