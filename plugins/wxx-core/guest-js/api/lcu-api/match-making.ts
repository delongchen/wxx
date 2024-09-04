import {api} from "./utils";
import {GetSearch} from "../../types/lcu-api/matchmaking";

export const accept = api('/lol-matchmaking/v1/ready-check/accept')
  .noPayload<void>('post')

export const decline = api('/lol-matchmaking/v1/ready-check/decline')
  .noPayload<void>('post')

export const getSearch = api('/lol-matchmaking/v1/search')
  .noPayload<GetSearch>('get')
