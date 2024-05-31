import { GameType } from "../constant/game.ts";
import {
  EnhanceLolSummonerSummoner,
  LolGameSessionTeam,
  LolMatchHistoryMatchHistoryList,
} from "../types/index.ts";

const calcKDA = (k: number = 0, d: number = 1, a: number = 0) => {
  return (((k + a) / d) * 3).toFixed(2);
};
export const getCurrentRecord = (
  matchHistory?: LolMatchHistoryMatchHistoryList,
  count: number = 5
) => {
  return matchHistory?.games?.games?.slice(0, count).reduce(
    (data, game, index, { length }) => {
      const stats = game.participants?.[0].stats;
      if (stats) {
        data.match.push({
          record: `${stats.kills}/${stats.deaths}/${stats.assists}`,
          type: game.queueId,
        });
        data.kills = data.kills + (stats?.kills ?? 0);
        data.deaths = data.deaths + (stats?.deaths ?? 0);
        data.assists = data.assists + (stats?.assists ?? 0);
      }
      if (index === length - 1) {
        data.KDA = calcKDA(data.kills, data.deaths, data.assists);
      }
      return data;
    },
    {
      match: new Array<{
        type?: GameType;
        record: string;
      }>(),
      KDA: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
    }
  );
};

export const getSummonerName = (
  data: EnhanceLolSummonerSummoner | LolGameSessionTeam
) => {
  if ("summonerName" in data) {
    return data.summonerName;
  } else {
    return data.displayName;
  }
};
