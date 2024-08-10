import {WxxPluginContext, WxxPluginType} from "@/types/plugin";
import {WxxRoute} from "@/types/router";
import {registerRoute} from "@/router";
import {FC} from "react";
import {StatusBarItems} from "@/app/status-bar";

const pluginMap: Map<string, WxxPluginType> = new Map

export const use = (plugin: WxxPluginType) => {
  pluginMap.set(plugin.name, plugin)
}

const createPluginCtx = (plugin: WxxPluginType): WxxPluginContext => {
  const prefix = '/' + plugin.name

  const registerPage = (route: WxxRoute) => {
    let routePath: string

    if (route.path.startsWith('/')) {
      routePath = prefix + route.path
    } else {
      routePath = [prefix, route.path].join('/')
    }

    registerRoute({
      ...route,
      path: routePath,
    })
  }

  const registerStatusBarItem = (component: FC) => {
    StatusBarItems.push(component)
  }

  return {
    registerPage,
    registerStatusBarItem,
  }
}

export const initPlugins = async () => {
  for (const plugin of pluginMap.values()) {
    const ctx = createPluginCtx(plugin)

    await plugin
      .install(ctx)
      .catch(err => {
        console.warn(`${plugin.name}: Failed to install plugin.`, err)
      })
  }
}
