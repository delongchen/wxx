import { WxxPluginRaw, WxxPluginContext } from './types';
import { createWxxPluginContext, getEnabledPlugins } from './context';

const pluginMap: Map<string, [WxxPluginContext<unknown>, unknown]> = new Map();

export const use = <T>(plugin: WxxPluginRaw<T>, options?: T) => {
  const ctx = createWxxPluginContext(plugin);
  pluginMap.set(ctx.name, [ctx as WxxPluginContext<unknown>, options]);
};

export const loadPlugins = async () => {
  const pluginEnableRecord = await getEnabledPlugins();

  for (const [pluginCtx, options] of pluginMap.values()) {
    const enable = pluginEnableRecord[pluginCtx.name];
    if (enable === undefined) {
      pluginCtx
        .start(options)
        .catch(console.error);
    } else {
      if (enable) {
        pluginCtx
          .start(options, false)
          .catch(console.error);
      }
    }
  }
}

export const getPlugins = () => (
  [...pluginMap.values()].map(it => it[0])
);
