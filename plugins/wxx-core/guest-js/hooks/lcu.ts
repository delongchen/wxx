import { useEffect, useState } from 'react';
import { LcuProcessStatus } from '../events';
import { useSubscribe } from './common';
import { LCU_PROCESS_STATUS_BUS, currentSummonerUpdateStream } from '../streams';
import { SummonerInfo } from '../types/lcu-api/summoner';
import { getCurrentSummoner } from '../api/lcu-api/summoner';
import { withRetry } from '../tools';

export const useLcuProcessStatus = () => {
  const [status, setStatus] = useState<number>(LcuProcessStatus.NotStarted);

  useSubscribe(LCU_PROCESS_STATUS_BUS, setStatus);

  return {
    status,
  };
};

export const useLcuAvailable = () => {
  const { status } = useLcuProcessStatus();
  const [available, setAvailable] = useState(status === LcuProcessStatus.Started);

  useEffect(() => {
    setAvailable(status === LcuProcessStatus.Started);
  }, [status]);

  return available;
};

export const useCurrentSummoner = () => {
  const [currentSummoner, setCurrentSummoner] = useState<SummonerInfo | null>(null);
  const available = useLcuAvailable();

  useEffect(() => {
    if (available) {
      withRetry(getCurrentSummoner).then(setCurrentSummoner);
    } else {
      setCurrentSummoner(null);
    }
  }, [available]);

  useSubscribe(currentSummonerUpdateStream, setCurrentSummoner);

  return currentSummoner;
};
