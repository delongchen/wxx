import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NiumaContext } from './ctx';
import MatchesParserWorker from '../workers?worker';
import { readLocalMatches } from 'tauri-plugin-wxx-core/api';
import { NiumaChartDataType } from '../workers/types';

export const useNiumaContext = () => {
  return useContext(NiumaContext);
};

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

export const useNiumaChartData = (puuid: string) => {
  const { invoke } = useNiumaContext();
  const [pending, setPending] = useState(false);
  const [chartData, setChartData] = useState<NiumaChartDataType | null>(null);

  const refresh = useCallback(() => {
    if (pending || puuid === '') return;

    setPending(true);
    readLocalMatches(puuid)
      .then(matchesBuffer => invoke<NiumaChartDataType>('analyze', { puuid, matchesBuffer }))
      .then(setChartData)
      .catch(() => setChartData(null))
      .finally(() => setPending(false));
  }, [puuid]);

  useEffect(refresh, []);

  return {
    pending,
    chartData,
    refresh,
  };
};
