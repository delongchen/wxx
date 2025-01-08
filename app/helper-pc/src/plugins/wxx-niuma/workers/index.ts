import NiumaWorkerClass from './main?worker';
import { createTaskManager, type TaskHandlerTuple } from './protocol';


export interface NiumaWorker {
  cleanup: () => Promise<void>,
  invoke: <T, P = unknown>(cmd: string, payload?: P, timeout?: number) => Promise<T>,
}

export const newNiumaWorker = (): NiumaWorker => {
  const worker = new NiumaWorkerClass();
  const { addTask, rejectAllTasks, resolveTask } = createTaskManager();

  worker.onmessage = event => {
    resolveTask(event.data);
  };

  const invoke = <T, P = unknown>(cmd: string, payload?: P, timeout: number = 2000) => {
    return new Promise<T>((resolve, reject) => {
      const id = addTask([resolve, reject] as TaskHandlerTuple, timeout);
      worker.postMessage({ id, cmd, payload });
    });
  };

  const cleanup = async () => {
    await invoke('stop', null).catch(() => {
    });
    worker.terminate();

    rejectAllTasks('stop');
  };

  return {
    cleanup,
    invoke,
  };
};
