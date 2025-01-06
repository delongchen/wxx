import { useEffect, useMemo } from 'react';
import NiumaWorker from './main?worker';

type TaskHandler<T = unknown> = [(value: T | Promise<T>) => void, (reason?: unknown) => void];

const createWorker = () => {
  console.log('createWorker');

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

  const worker = new NiumaWorker();
  worker.onmessage = handleWorkerMessage;

  const invoke = <T, P = unknown>(cmd: string, payload?: P) => {
    return new Promise<T>((resolve, reject) => {
      const taskID = TaskID++;

      TaskMap.set(taskID, [resolve, reject] as TaskHandler);

      worker.postMessage({
        cmd,
        payload,
        id: taskID,
      });
    })
  }

  const cleanup = () => {
    worker.terminate();

    for (const [, reject] of TaskMap.values()) {
      reject()
    }

    TaskMap.clear();
  }

  return {
    invoke,
    cleanup,
  }
}

export const useNiumaWorker = () => {
  const worker = useMemo(createWorker, [])

  useEffect(() => {
    return () => {
      worker.cleanup()
    };
  }, []);

  return worker;
};
