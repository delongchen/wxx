import { syncGamesByPuuid } from 'tauri-plugin-wxx-core/api';
import { useCallback, useEffect, useState } from 'react';

export const enum SyncTaskStatus {
  Ready,
  Waiting,
  FetchingGameHistory,
  FetchingGameDetails,
}

export const fmtTime = (time: number) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
};

export const useSyncGameHistoryTask = (puuid: string) => {
  const [status, setStatus] = useState<SyncTaskStatus>(SyncTaskStatus.Ready);
  const [pending, setPending] = useState(false);
  const [data, setData] = useState<number[]>([]);
  const [tip, setTip] = useState<string>('');

  useEffect(() => {}, []);

  const reset = useCallback(() => {
    setStatus(SyncTaskStatus.Ready);
    setPending(false);
    setData([]);
    setTip('');
  }, []);

  const start = useCallback(() => {
    if (pending) return;

    reset();

    setStatus(SyncTaskStatus.Waiting);
    setPending(true);

    syncGamesByPuuid(puuid, {
      fetchHistoryStart: () => {
        setStatus(SyncTaskStatus.FetchingGameHistory);
      },
      fetchHistoryProcessing: (start, end) => {
        setData([start, end]);
      },
      fetchHistoryEnd: all => {
        setStatus(SyncTaskStatus.FetchingGameDetails);
        setData([0, all]);
      },
      fetchDetailStart: () => {
      },
      fetchDetailProcessing: (fetched, all) => {
        setData([fetched, all]);
      },
      taskEnd: endStatus => {
        let tipText: string;

        if (endStatus === 0) {
          tipText = '刚刚同步';
        } else if (endStatus === 1) {
          tipText = 'LCU出错了捏';
        } else if (endStatus === 2) {
          tipText = '反正出了点什么错';
        } else {
          tipText = '';
        }

        setTip(tipText);
      },
    }).finally(() => {
      setStatus(SyncTaskStatus.Ready);
      setPending(false);
    });
  }, [pending]);

  return {
    status,
    start,
    data,
    tip,
  };
};
