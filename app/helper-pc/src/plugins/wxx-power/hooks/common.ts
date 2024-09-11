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

export const useCurrentSummoner = () => {
  const [currentSummoner, setCurrentSummoner] = useState<SummonerInfo | null>(null);

  useEffect(() => {
    const fn = async () => {
      setCurrentSummoner(await getCurrentSummoner());
    };

    fn().catch(() => {});
  }, []);

  useSubscribe(currentSummonerUpdateStream, setCurrentSummoner);
  useSubscribe(lcuProcessStatusBus, status => {
    if (status === LcuProcessStatus.NotStarted) {
      setCurrentSummoner(null);
    }
  });

  return currentSummoner;
};
