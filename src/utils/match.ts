import { GameType } from "../constant";
import { LolMatchHistoryMatchHistoryList } from "../types/index.ts";
import { isDev } from "./dev.ts";

const INVALID_GAME_DURATION = 5 * 60;

export const matchHistoryFillter = (
  matchHisotry: LolMatchHistoryMatchHistoryList | undefined,
  gameType: GameType | undefined
) => {
  if (!matchHisotry?.games) {
    return;
  }

  console.log("matchHisotry", matchHisotry);
  return {
    ...matchHisotry,
    games: {
      ...matchHisotry.games,
      games: matchHisotry?.games?.games?.filter((game) => {
        return (
          (isDev() || !gameType || game.queueId === gameType) &&
          game.endOfGameResult === "GameComplete" &&
          game.gameDuration &&
          game.gameDuration >= INVALID_GAME_DURATION
        );
      }),
    },
  };
};
