import { FC } from 'react';
import { WxxRoute } from '@/types/router';
import { BehaviorSubject } from 'rxjs';
import { emitRoutesChange, registerRoute, unregisterRoute } from '@/router';
import { addBarItem, removeBarItem } from '@/app/status-bar';
import { AppContext } from '../context/app-context';
import {
  PluginQuitTask,
  WxxPluginContext,
  WxxPluginInfo,
  WxxPluginPageInfo,
  WxxPluginRaw,
  WxxPluginStatus,
} from './types';
import { createConfigHelper } from '@/utils/config-helper'


const config = createConfigHelper('app')
const { transaction } = config.open<Record<string, boolean>>('enable-plugin', () => ({}))
export const getEnabledPlugins = async () => {
  return await transaction(({ peek }) => peek())
}

export const createWxxPluginContext = <T>(raw: WxxPluginRaw<T>): WxxPluginContext<T> => {
  const statusSubject = new BehaviorSubject<WxxPluginStatus>(WxxPluginStatus.Stopped);
  const quitTasks: PluginQuitTask[] = [];

  const pageMap: Map<string, WxxRoute> = new Map();
  const barItemMap: Map<string, FC> = new Map();

  const pluginName = raw.name;
  const { version = '', description = [], cover = '' } = raw;

  const getInfo = (): WxxPluginInfo => {
    return {
      cover,
      version,
      description: Array.isArray(description) ? description : [description],
    };
  };

  const mapPageInfo = (info: WxxPluginPageInfo, isRoot: boolean = false): WxxRoute => {
    const { name, component, icon, fullPage, children, isIndexPage } = info;

    const path = isRoot ? `/${pluginName}/${name}` : name;
    let childrenPage: WxxRoute[] | undefined = undefined;

    if (children !== undefined && children.length > 0) {
      childrenPage = children.map((child) => mapPageInfo(child));
    }

    return {
      path,
      component,
      isIndexPage,
      meta: { icon },
      isFullPage: fullPage,
      isOuter: true,
      children: childrenPage,
    };
  };
  /**
   * register a page
   * if icon equal to undefined, it will not be shown at the side menu
   * if fullPage is true you can use your own layout
   */
  const page = (info: WxxPluginPageInfo) => {
    const route = mapPageInfo(info, true);
    pageMap.set(route.path, route);
  };

  const clear = () => {
    for (const routePath of pageMap.keys()) {
      unregisterRoute(routePath);
    }

    for (const barItemKey of barItemMap.keys()) {
      removeBarItem(barItemKey);
    }

    pageMap.clear();
    barItemMap.clear();
  };

  const statusBar = (name: string, component: FC) => {
    barItemMap.set(`${pluginName}/${name}`, component);
  };

  const setEnable = async (enable: boolean) => {
    await transaction(({ add }) => {
      add({ [pluginName]: enable });
    })
  }

  const shutdown = async (sync: boolean = true) => {
    if (sync) await setEnable(false)

    statusSubject.next(WxxPluginStatus.Stopping);

    if (quitTasks.length > 0) {
      await Promise.allSettled(quitTasks.map((task) => task()));
      quitTasks.length = 0;
    }
    clear();
    emitRoutesChange();

    statusSubject.next(WxxPluginStatus.Stopped);
  };

  const quit = (...tasks: PluginQuitTask[]) => {
    quitTasks.push(...tasks);
  };

  const restart = async (options?: T) => {
    if (statusSubject.getValue() === WxxPluginStatus.Started) {
      await shutdown(false);
    }
    await start(options, false);
  };

  const start = async (options?: T, sync: boolean = true) => {
    if (sync) await setEnable(true)

    statusSubject.next(WxxPluginStatus.Starting);

    try {
      await raw.install({ page, statusBar, quit, AppContext }, options);
    } catch (e: unknown) {
      await shutdown(false);
      throw e;
    }

    for (const route of pageMap.values()) {
      registerRoute(route);
    }

    for (const [key, barItem] of barItemMap.entries()) {
      addBarItem(key, barItem);
    }

    emitRoutesChange();

    statusSubject.next(WxxPluginStatus.Started);
  };

  return {
    name: pluginName,
    page,
    statusBar,
    statusSubject,
    start,
    restart,
    quit,
    getInfo,
    shutdown,
  };
};
