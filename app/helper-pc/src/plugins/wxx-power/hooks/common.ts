import { useEffect, useState } from "react";
import { SummonerInfo } from "tauri-plugin-wxx-core"
import { lcuFetch } from 'tauri-plugin-wxx-core/api'
import {
  processStatusStream,
  LcuProcessStatus
} from 'tauri-plugin-wxx-core/events'
import { currentSummonerUpdateStream } from "../lcu/event-stream";

export const useLcuProcessStatus = () => {
  const [status, setStatus] = useState<number>(LcuProcessStatus.NotStarted)

  useEffect(() => {
    const subscription = processStatusStream
      .subscribe(setStatus)

    return () => {
      subscription.unsubscribe()
    }
  }, []);

  return {
    status,
  }
}

export const useCurrentSummoner = () => {
  const [
    currentSummoner,
    setCurrentSummoner
  ] = useState<SummonerInfo | null>(null)

  useEffect(() => {
    const fn = async () => {
      setCurrentSummoner(await lcuFetch<SummonerInfo>({
        endpoint: '/lol-summoner/v1/current-summoner',
        method: 'get',
      }))
    }

    fn().catch(() => {})
  }, [])

  useEffect(() => {
    const subscription = currentSummonerUpdateStream
      .subscribe(info => {
        setCurrentSummoner(info)
      })

    return () => subscription.unsubscribe()
  }, [])

  return currentSummoner
}
