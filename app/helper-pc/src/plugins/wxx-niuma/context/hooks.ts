import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NiumaContext } from './ctx';
import { getGamesByPuuid } from 'tauri-plugin-wxx-core/api'
import MatchesParserWorker from '../workers?worker';
import { NiumaChartDataType } from '../workers/types';
import { getVersions, ChampionComplex, getChampions } from '../api/dragon';

export const useNiumaContext = () => {
  return useContext(NiumaContext);
};

export const useLolChampions = (version: string, lang: 'zh_CN' | 'en_US') => {
  const [champions, setChampions] = useState<ChampionComplex | null>(null)

  useEffect(() => {
    getChampions(version, lang)
      .then(setChampions)
      .catch(() => {
        setChampions(null);
      })
  }, []);

  return champions;
}

export const useLolLatestVersion = () => {
  const [latestVersion, setLatestVersion] = useState('14.24.1')

  useEffect(() => {
    getVersions()
      .then(versions => {
        if (versions.length > 0) {
          setLatestVersion(versions[0])
        }
      })
  }, []);

  return {
    latestVersion,
  }
}

type TaskHandler<T = unknown> = [(value: T | Promise<T>) => void, (reason?: unknown) => void];

let TaskID = 0;
const TaskMap: Map<number, TaskHandler> = new Map;
const handleWorkerMessage = (msg: MessageEvent<{ id: number, data: unknown, ok: boolean }>) => {
  const { data: { id, data, ok } } = msg;
  const existHandler = TaskMap.get(id);
  if (existHandler !== undefined) {
    const [resolve, reject] = existHandler;
    (ok ? resolve : reject)(data);
    TaskMap.delete(id);
  }
};

export const useMatchesParserWorker = () => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new MatchesParserWorker;
    worker.onmessage = handleWorkerMessage;
    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      TaskMap.clear();
    };
  }, []);

  const invoke = <T, P = unknown>(
    cmd: string,
    payload?: P,
  ) => {
    return new Promise<T>((resolve, reject) => {
      if (workerRef.current !== null) {
        const taskID = TaskID++;

        TaskMap.set(taskID, [resolve, reject] as TaskHandler);

        workerRef.current.postMessage({
          cmd,
          payload,
          id: taskID,
        });
      } else {
        reject(new Error('worker not available'));
      }
    });
  };

  return {
    invoke,
  };
};

interface ChartDataExt extends NiumaChartDataType {
  showUsage?: () => void
}

/**
 * for development
 * show path that is using
 */
const createChartDataProxy = (raw: NiumaChartDataType) => {
  const topLevelEntries = Object.entries(raw) as [string, Record<string, unknown>][];
  const pathSet = new Set<string>();
  const usedPathSet = new Set<string>();

  for (const [key, record] of topLevelEntries) {
    for (const subKey of Object.keys(record)) {
      pathSet.add(`${key}.${subKey}`);
    }

    Reflect.set(raw, key, new Proxy(record, {
      get(target: Record<string, unknown>, p: string, receiver: unknown): unknown {
        usedPathSet.add(`${key}.${p}`)
        return Reflect.get(target, p, receiver);
      }
    }))
  }

  Reflect.set(raw, 'showUsage', () => {
    console.log('used path set: ', [...usedPathSet]);
    console.log('unused path set: ', [...pathSet].filter(it => !usedPathSet.has(it)));
  })

  return raw
}

export const useNiumaChartData = (puuid: string) => {
  const { invoke } = useNiumaContext();
  const [pending, setPending] = useState(false);
  const [chartData, setChartData] = useState<NiumaChartDataType | null>(null);

  const refresh = useCallback(() => {
    setPending(true);

    getGamesByPuuid(puuid)
      .then(buf => invoke<NiumaChartDataType>('analyze', { puuid, matchesBuffer: buf }))
      .then(createChartDataProxy)
      .then(setChartData)
      .finally(() => {
        setPending(false);
      })
  }, [puuid]);

  useEffect(refresh, []);

  useEffect(() => {
    if (chartData !== null) {
      const data = chartData as ChartDataExt
      data.showUsage && data.showUsage();
    }
  }, [chartData]);

  return {
    pending,
    chartData,
    refresh,
  };
};
