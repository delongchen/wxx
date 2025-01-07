import { load, type Store } from '@tauri-apps/plugin-store';

interface ConfigTransaction<T> {
  peek: () => T,
  add: (state: Partial<T>) => void,
  replace: (state: T) => void,
}

const ConfigFileDir = 'configs';

export const createConfigHelper = (namespace: string) => {
  let store: Store | null = null;

  const getStore = async () => {
    if (store === null) {
      store = await load(`${ConfigFileDir}/${namespace}.json`, { autoSave: false });
    }
    return store;
  };

  const open = <T>(key: string, initFn: () => T) => {
    const transaction = async (
      task: (tran: ConfigTransaction<T>) => void,
    ) => {
      const store = await getStore();
      const prev = await store.get<T>(key);

      let stage: T = prev ?? initFn();
      let changed = prev === undefined;

      const peek = () => stage;

      const add = (state: Partial<T>) => {
        stage = { ...stage, ...state };
        changed = true;
      };

      const replace = (state: T) => {
        stage = state;
        changed = true;
      };

      const commit = async () => {
        await store.set(key, stage);
        await store.save();
      };

      task({ peek, add, replace });

      if (changed) await commit();
    };

    return {
      transaction,
    };
  };

  return {
    open,
  };
};