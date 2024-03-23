import { GameState, GameType } from "../constant";
import {
  LolChampSelectChampSelectSession,
  LolChatConversationResource,
  LolLobbyGameModeDto,
  LolLobbyLobbyDto,
  LolMatchHistoryMatchHistoryList,
  LolSummonerSummoner,
} from "../types";
import { Client } from "../utils";

export const getCurrConversationID = async () => {
  const conversationResource = await Client.get<LolChatConversationResource[]>(
    "/lol-chat/v1/conversations"
  );
  return conversationResource?.find(
    (conversation) => conversation.type === GameState.GameStateChampSelect
  )?.id;
};

export const getTeamSummonerId = async () => {
  //   const conversationId = await getCurrConversationID();
  const champSelectChampSelectSession =
    await Client.get<LolChampSelectChampSelectSession>(
      "/lol-champ-select/v1/session"
    );
  return champSelectChampSelectSession?.myTeam
    ?.map((summoner) => summoner.summonerId)
    .filter((summonerId) => summonerId) as number[] | undefined;
};

export const getSummonersById = async (ids: number[]) => {
  return await Client.get<LolSummonerSummoner[]>("/lol-summoner/v2/summoners", {
    ids: `[${ids.join(",")}]`,
  });
};

export const getMatchHistoryByAccount = async (
  accountId: number,
  params?: {
    begIndex?: number;
    endIndex?: number;
  }
) => {
  return await Client.get<LolMatchHistoryMatchHistoryList[]>(
    `/lol-match-history/v3/matchlist/account/${accountId}`,
    params
  );
};

export const getLolLobbyType = async () => {
  const res = await Client.get<LolLobbyLobbyDto>("/lol-lobby/v2/lobby");
  return res?.gameConfig?.queueId as GameType;
};
