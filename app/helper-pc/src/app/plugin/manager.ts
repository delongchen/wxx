import { WxxPluginRaw, WxxPluginContext } from './types';
import { createWxxPluginContext } from './context';

const pluginMap: Map<string, WxxPluginContext<unknown>> = new Map();

export const use = <T>(plugin: WxxPluginRaw<T>, options?: T) => {
  const ctx = createWxxPluginContext(plugin);
  pluginMap.set(ctx.name, ctx as WxxPluginContext<unknown>);
  ctx.start(options).catch(console.error);
};

export const getPlugins = () => [...pluginMap.values()];
