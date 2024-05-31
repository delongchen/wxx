import { useQuery } from "@tanstack/react-query";
import {
  getLolGameflowV1Session,
  getLolLobbyType,
  getMatchHistoryByPUUIDS,
  getSummonersById,
  getTeamSummonerId,
} from "../api/lcu.ts";
import { GameState } from "../constant/game";
import { EnhanceLolSummonerSummoner } from "../types/data.ts";
import { matchHistoryFillter } from "../utils";
import { useCurrentSummoner } from "./useCurrentSummoner.ts";

export const useLobbyType = (state: GameState) => {
  return useQuery({
    queryKey: ["getLolLobbyType", state],
    queryFn: () => getLolLobbyType(),
    enabled: state === GameState.GameStateLobby,
  });
};

export const useSummoners = (state: GameState) => {
  const { data: currentSummoner } = useCurrentSummoner();
  const { data: lobbyType } = useLobbyType(state);
  const { data: teams } = useQuery({
    queryKey: ["getTeams"],
    queryFn: async () => {
      const ids = (await getTeamSummonerId()) ?? [];
      const summoners: EnhanceLolSummonerSummoner[] =
        (await getSummonersById(ids)) ?? [];
      const matchHistoryList = await getMatchHistoryByPUUIDS(
        summoners.map((summoner) => summoner.puuid)
      );
      return summoners.map((summoner) => {
        summoner["matchHistory"] = matchHistoryFillter(
          matchHistoryList.find(
            (match) => match?.accountId === summoner.accountId
          ),
          lobbyType
        );
        return summoner;
      });
    },
    enabled: state === GameState.GameStateChampSelect,
  });

  const { data: enemies } = useQuery({
    queryKey: ["getEnemy"],
    queryFn: async () => {
      const gameflow = await getLolGameflowV1Session();
      const enemies = gameflow?.gameData?.teamOne?.find(
        (member) => member.summonerId === currentSummoner?.accountId
      )
        ? gameflow?.gameData?.teamTwo
        : gameflow?.gameData?.teamOne;
      const matchHistoryList = await getMatchHistoryByPUUIDS(
        (enemies ?? [])?.map((summoner) => summoner.puuid)
      );
      return enemies?.map((enemy) => {
        enemy["matchHistory"] = matchHistoryFillter(
          matchHistoryList.find(
            (match) => match?.accountId === enemy.summonerId
          ),
          lobbyType
        );
        return enemy;
      });
    },
    enabled: state === GameState.GameStateStart,
  });

  return {
    lobbyType,
    teams,
    enemies,
  };
};
