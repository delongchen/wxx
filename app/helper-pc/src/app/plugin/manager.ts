import { WxxPluginRaw, WxxPluginContext } from './types';
import { createWxxPluginContext } from './context';

const pluginMap: Map<string, WxxPluginContext<unknown>> = new Map();

export const use = async <T>(plugin: WxxPluginRaw<T>, options?: T) => {
  const ctx = createWxxPluginContext(plugin);
  await ctx.start(options);
  pluginMap.set(ctx.name, ctx as WxxPluginContext<unknown>);
};

export const getPlugins = () => [...pluginMap.values()]
