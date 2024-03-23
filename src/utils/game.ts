import { GameType } from "../constant";
import { LolMatchHistoryMatchHistoryList } from "../types/index.ts";

const MIN_GAME_DURATION = 15 * 60;

export const matchHistoryFillter = (
  matchHisotry: LolMatchHistoryMatchHistoryList,
  gameType: GameType
) => {
  return matchHisotry.games?.games?.filter((game) => {
    return (
      game.queueId === gameType &&
      game.gameDuration &&
      game.gameDuration >= MIN_GAME_DURATION
    );
  });
};
