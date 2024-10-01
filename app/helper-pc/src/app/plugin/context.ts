import { FC } from 'react';
import { WxxRoute } from '@/types/router';
import { emitRoutesChange, registerRoute, unregisterRoute } from '@/router';
import { removeBarItem } from '@/app/status-bar';
import {
  PluginQuitTask,
  WxxPluginContext,
  WxxPluginInfo,
  WxxPluginRaw,
  WxxPluginStatus,
} from './types';

export const createWxxPluginContext = <T>(raw: WxxPluginRaw<T>): WxxPluginContext<T> => {
  let status: WxxPluginStatus = WxxPluginStatus.Stop;
  const quitTasks: PluginQuitTask[] = [];

  const pageMap: Map<string, WxxRoute> = new Map();
  const barItemMap: Map<string, FC> = new Map();

  const installer = raw.install;
  const pluginName = raw.name;
  const { version = '0.0.0', description = 'no description', cover = '' } = raw;

  const getInfo = (): WxxPluginInfo => {
    return {
      version,
      description,
      cover,
    };
  };

  const page = (name: string, component: FC, icon: FC, fullPage: boolean = false) => {
    const pagePath = `/${pluginName}/${name}`;
    pageMap.set(pagePath, {
      component,
      path: pagePath,
      meta: { icon },
      isFullPage: fullPage,
      isOuter: true,
    });
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

  const shutdown = async () => {
    status = WxxPluginStatus.Stopping;
    if (quitTasks.length > 0) {
      await Promise.allSettled(quitTasks.map((task) => task()));
      quitTasks.length = 0;
    }
    clear();
    emitRoutesChange();
    status = WxxPluginStatus.Stop;
  };

  const quit = (...tasks: PluginQuitTask[]) => {
    quitTasks.push(...tasks);
  };

  const start = async (options?: T) => {
    if (status === WxxPluginStatus.Started) {
      await shutdown();
    }

    status = WxxPluginStatus.Starting;

    try {
      await installer({ page, statusBar, quit }, options);
    } catch (e: unknown) {
      clear();
      status = WxxPluginStatus.Stop;
      return;
    }

    for (const route of pageMap.values()) {
      registerRoute(route);
    }
    emitRoutesChange();
    status = WxxPluginStatus.Started;
  };

  const getStatus = () => status;

  return {
    name: pluginName,
    page,
    statusBar,
    start,
    quit,
    getInfo,
    shutdown,
    getStatus,
  };
};
