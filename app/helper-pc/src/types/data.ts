import {
  LolMatchHistoryMatchHistoryList,
  LolSummonerSummoner,
} from "./lcu-open-api.ts";

export interface EnhanceLolSummonerSummoner extends LolSummonerSummoner {
  matchHistory?: LolMatchHistoryMatchHistoryList;
}

export interface LolGameSessionTeam {
  championId: number;
  lastSelectedSkinIndex: number;
  profileIconId: number;
  puuid: string;
  summonerId: number;
  summonerInternalName: string;
  summonerName: string;
  teamOwner: boolean;
  teamParticipantId: number;
  matchHistory?: LolMatchHistoryMatchHistoryList;
}
