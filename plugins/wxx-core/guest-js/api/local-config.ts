import { invoke } from '@tauri-apps/api/core';

export const readLocalConfig = async <T>(
  namespace: string,
  configName: string,
  configType: 'json' | 'toml' | 'yaml' = 'json',
) => {
  return invoke<T>(
    'plugin:wxx-core|read_config',
    {
      namespace,
      configName,
      configType,
    },
  );
};

export const writeLocalConfig = async <
  T extends Record<string, any>,
>(
  namespace: string,
  configName: string,
  configType: 'json' | 'toml' | 'yaml' = 'json',
  data: Partial<T> = {},
) => {
  return invoke<T>(
    'plugin:wxx-core|write_config',
    {
      namespace,
      configName,
      configType,
      data,
    },
  );
};

export const readLocalConfigWithInit = async <
  T extends Record<string, any>,
>(
  namespace: string,
  configName: string,
  configType: 'json' | 'toml' | 'yaml' = 'json',
  data: Partial<T> = {},
) => {
  const exist = await readLocalConfig<T>(
    namespace,
    configName,
    configType,
  ).catch(() => null);

  if (exist === null) {
    return writeLocalConfig<T>(
      namespace,
      configName,
      configType,
      data,
    );
  }

  return exist;
};

export const createConfigHandle = <T extends Record<string, any>>(
  namespace: string,
  configName: string,
  configType: 'json' | 'toml' | 'yaml' = 'json',
) => {
  const read = () => readLocalConfig<T>(namespace, configName, configType);
  const readWithInit = (data: Partial<T> = {}) => readLocalConfigWithInit<T>(
    namespace,
    configName,
    configType,
    data,
  );
  const write = (data: Partial<T> = {}) => writeLocalConfig<T>(
    namespace,
    configName,
    configType,
    data,
  );

  return {
    write,
    read,
    readWithInit,
  };
};
