import { SummonerInfo } from 'tauri-plugin-wxx-core';
import { syncGamesByPuuid } from 'tauri-plugin-wxx-core/api';
import { useCallback, useEffect, useState } from 'react';

export const enum SyncTaskStatus {
  Ready,
  Waiting,
  FetchingGameHistory,
  FetchingGameDetails,
}

const SummonersStoreKey = 'summoners';

const fmtTime = (time: number) => {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
};

const createLocalSummonerManager = () => {
  const cache = new Map<string, SummonerInfo>();

  const syncToLocal = () => {
    const summoners = JSON.parse(window.localStorage.getItem(SummonersStoreKey) ?? '[]') as SummonerInfo[];

    for (const summoner of summoners) {
      cache.set(summoner.puuid, summoner);
    }
  };

  const writeBack = () => {
    window.localStorage.setItem(SummonersStoreKey, JSON.stringify([...cache.values()]));
  };

  const fetchAndCache = async (getter: () => Promise<SummonerInfo>) => {
    const data = await getter();
    cache.set(data.puuid, data);
    writeBack();
  };

  const readAsArray = () => {
    return [...cache.values()];
  };

  const readLastSyncTimeMap = () => {
    const key = `${SummonersStoreKey}-sync-time`;
    const timeVec = JSON.parse(window.localStorage.getItem(key) ?? '[]') as [string, number][];
    return new Map(timeVec.map(it => [it[0], it[1]]));
  };

  const refreshLastSyncTime = (puuid: string) => {
    const key = `${SummonersStoreKey}-sync-time`;

    const lastSyncTimeMap = readLastSyncTimeMap();
    const now = Date.now();
    lastSyncTimeMap.set(puuid, now);
    window.localStorage.setItem(key, JSON.stringify([...lastSyncTimeMap]));

    return now;
  };

  return {
    syncToLocal,
    writeBack,
    fetchAndCache,
    readAsArray,
    refreshLastSyncTime,
    readLastSyncTimeMap,
  };
};

export const SummonerStore = createLocalSummonerManager();

export const useSyncGameHistoryTask = (puuid: string) => {
  const [status, setStatus] = useState<SyncTaskStatus>(SyncTaskStatus.Ready);
  const [pending, setPending] = useState(false);
  const [data, setData] = useState<number[]>([]);
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    const lastSyncTimeMap = SummonerStore.readLastSyncTimeMap();
    const lastSyncTime = lastSyncTimeMap.get(puuid);
    if (lastSyncTime !== undefined) {
      setTip(`上次同步 ${fmtTime(lastSyncTime)}`);
    } else {
      setTip('数据库内无本牛马');
    }
  }, []);

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
          SummonerStore.refreshLastSyncTime(puuid);
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
