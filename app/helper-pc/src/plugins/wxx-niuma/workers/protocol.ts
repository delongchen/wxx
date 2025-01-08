type TaskMessageType<T> = {
  id: number,
  data: T,
  ok: boolean,
}

type CmdMessageType<T> = {
  id: number,
  cmd: string,
  payload: T,
}

export type TaskHandlerTuple<T = unknown> = [(value: T | Promise<T>) => void, (reason?: unknown) => void];

const rejectAfter = (ms: number) => new Promise((_, reject) => {
  setTimeout(() => {
    reject({ msg: `timeout: ${ms}` });
  }, ms);
});

const createCmdMessageSendUtils = (target: Window & typeof globalThis) => {
  const postResult = (id: number, ok: boolean, data: unknown) => {
    target.postMessage({ id, ok, data });
  };

  const ok = (id: number, data: unknown) => {
    postResult(id, true, data);
  };

  const err = (id: number, data: unknown) => {
    postResult(id, false, data);
  };

  return { ok, err };
};

export const createCmdMessageHandler = (
  target: Window & typeof globalThis,
  maxPending: number,
  onCmd: (cmd: string, payload: unknown) => Promise<unknown>,
) => {
  const { ok, err } = createCmdMessageSendUtils(target);

  return async (message: MessageEvent<CmdMessageType<unknown>>) => {
    const { data: { id, cmd, payload } } = message;

    try {
      const result = await Promise.race([
        onCmd(cmd, payload),
        rejectAfter(maxPending),
      ]);
      ok(id, result);
    } catch (e: unknown) {
      err(id, e);
    }
  };
};

export const createTaskManager = () => {
  const TaskMap: Map<number, TaskHandlerTuple> = new Map;

  const resolveTask = ({ id, data, ok }: TaskMessageType<unknown>) => {
    const exist = TaskMap.get(id);
    if (exist !== undefined) {
      window.clearTimeout(id);
      const [resolve, reject] = exist;
      (ok ? resolve : reject)(data);
      TaskMap.delete(id);
    }
  };

  const addTask = (tuple: TaskHandlerTuple, ms: number) => {
    const id = window.setTimeout(() => {
      resolveTask({
        id,
        ok: false,
        data: 'timeout',
      });
    }, ms);

    TaskMap.set(id, tuple);

    return id;
  };

  const rejectAllTasks = (data: unknown) => {
    for (const [, reject] of TaskMap.values()) {
      reject(data);
    }
    TaskMap.clear();
  };

  return {
    addTask,
    rejectAllTasks,
    resolveTask,
  };
};
