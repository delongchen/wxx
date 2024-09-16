import { useEffect, useState } from 'react';
import { SummonerInfo } from 'tauri-plugin-wxx-core';
import { getCurrentSummoner } from 'tauri-plugin-wxx-core/lcu-api/summoner';
import { LcuProcessStatus } from 'tauri-plugin-wxx-core/events';
import { currentSummonerUpdateStream } from '../lcu/event-stream';
import { Observable } from 'rxjs';
import { lcuProcessStatusBus } from '../lcu/process';

export const useSubscribe = <T>(source: Observable<T>, ob: (data: T) => void) => {
  useEffect(() => {
    const subscription = source.subscribe(ob);

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

export const useLcuProcessStatus = () => {
  const [status, setStatus] = useState<number>(LcuProcessStatus.NotStarted);

  useSubscribe(lcuProcessStatusBus, setStatus);

  return {
    status,
  };
};

/**
 * todo:
 * 监听lcu-process的状态 当使用管理员启动后返回true
 * 但是当英雄联盟客户端启动后于wxx时
 * 即使available为true 此时lcu-fetch也可能不可用 因为英雄联盟没有初始化好
 * 这里还要改 或者后续lcu-fetch使用retry
 * 但是英雄联盟已经启动了 wxx再启动就没有这个问题
 */
export const useLcuAvailable = () => {
  const { status } = useLcuProcessStatus();
  const [available, setAvailable] = useState(status === LcuProcessStatus.Started);

  useEffect(() => {
    setAvailable(status === LcuProcessStatus.Started);
  }, [status]);

  return { available };
};

export const useCurrentSummoner = () => {
  const [currentSummoner, setCurrentSummoner] = useState<SummonerInfo | null>(null);
  const { available } = useLcuAvailable();

  useEffect(() => {
    if (available) {
      getCurrentSummoner().then(setCurrentSummoner);
    } else {
      setCurrentSummoner(null);
    }
  }, [available]);

  useSubscribe(currentSummonerUpdateStream, setCurrentSummoner);

  return currentSummoner;
};

// const useRetry = () => {}
