import { GameState, GameType } from "../constant";
import {
  LolChampSelectChampSelectSession,
  LolChatConversationResource,
  LolGameflowGameflowSession,
  LolLobbyLobbyDto,
  LolMatchHistoryMatchHistoryList,
  LolSummonerSummoner,
} from "../types";
import { Client } from "../utils";

export const getCurrentSummoner = async () => {
  return await Client.get<LolSummonerSummoner>(
    "/lol-summoner/v1/current-summoner"
  );
};

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

/**
 * not implemented: please use the puuid query
 */
export const getMatchHistoryByAccount = async (
  accountId?: number,
  params?: {
    begIndex?: number;
    endIndex?: number;
  }
) => {
  return await Client.get<LolMatchHistoryMatchHistoryList>(
    `/lol-match-history/v3/matchlist/account/${accountId}`,
    params
  );
};

export const getMatchHistoryByPUUID = async (
  puuid?: string,
  params?: {
    begIndex?: number;
    endIndex?: number;
  }
) => {
  return await Client.get<LolMatchHistoryMatchHistoryList>(
    `/lol-match-history/v1/products/lol/${puuid}/matches`,
    params
  );
};

export const getMatchHistoryByAccounts = async (
  accounts: (number | undefined)[],
  params?: {
    begIndex?: number;
    endIndex?: number;
  }
) => {
  return Promise.all(
    accounts.map((accountId) => {
      return getMatchHistoryByAccount(accountId, params);
    })
  );
};

export const getMatchHistoryByPUUIDS = async (
  puuid: (string | undefined)[],
  params?: {
    begIndex?: number;
    endIndex?: number;
  }
) => {
  return Promise.all(
    puuid.map((puuid) => {
      return getMatchHistoryByPUUID(puuid, params);
    })
  );
};

export const getLolLobbyType = async () => {
  const res = await Client.get<LolLobbyLobbyDto>("/lol-lobby/v2/lobby");
  return res?.gameConfig?.queueId as GameType;
};

export const getLolGameflowV1Session = async () => {
  return await Client.get<LolGameflowGameflowSession>(
    "/lol-gameflow/v1/session"
  );
};
