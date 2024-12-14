import { invoke } from '@tauri-apps/api/core';
import { resolveCmdName } from '../resolve';
import { SummonerInfoWithoutReRoll } from '../../types/lcu-api/summoner'

const CMD_QUERY_GAME = resolveCmdName("query_game")
const CMD_QUERY_SUMMONERS = resolveCmdName("query_summoners")

export const getGamesByPuuid = async (puuid: string) => {
  return await invoke<ArrayBuffer>(CMD_QUERY_GAME, { puuid })
}

interface SummonerQuery {
  action: 'del' | 'get'
}

interface SummonerDelQuery extends SummonerQuery {
  action: 'del',
  puuid: string,
}

interface SummonerGetQuery extends SummonerQuery {
  action: 'get',
  fullUpdated: boolean
}

interface SummonerQueryResult {
  summoner: SummonerInfoWithoutReRoll,
  latestSync: number,
}

const querySummoners = async (query: SummonerGetQuery | SummonerDelQuery) => {
  const { action } = query
  const { fullUpdated = false } = query as SummonerGetQuery
  const { puuid = '' } = query as SummonerDelQuery
  
  return await invoke<SummonerQueryResult[] | null>(CMD_QUERY_SUMMONERS, {
    action, fullUpdated, puuid
  })
}

export const getSummoners = async (fullUpdated: boolean) => {
  return (await querySummoners({ action: 'get', fullUpdated })) ?? []
}

export const deleteSummonerByPuuid = async (puuid: string) => {
  await querySummoners({ action: 'del', puuid })
}
