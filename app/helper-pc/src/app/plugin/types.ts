import { FC, Context } from 'react';
import { BehaviorSubject } from 'rxjs';
import { AppContextType } from '../context/app-context';

export interface WxxPluginInfo {
  version: string;
  description: string[];
  cover: string;
}

export const enum WxxPluginStatus {
  Stopped,
  Starting,
  Started,
  Stopping,
}

export type PluginQuitTask = () => Promise<void>;

export interface WxxPluginRaw<T = void> {
  name: string;
  install: (
    ctx: Pick<WxxPluginContext<T>, 'page' | 'statusBar' | 'quit'> & { AppContext: Context<AppContextType> },
    options?: T,
  ) => Promise<void>;
  version?: string;
  description?: string | string[];
  cover?: string;
}

export interface WxxPluginPageInfo {
  name: string;
  component?: FC;
  icon?: FC;
  fullPage?: boolean;
  redirect?: string;
  isIndexPage?: boolean;
  children?: WxxPluginPageInfo[];
  meta?: Record<string, unknown>;
}

export interface WxxPluginContext<T> {
  name: string;
  statusSubject: BehaviorSubject<WxxPluginStatus>;
  page: (info: WxxPluginPageInfo) => void;
  statusBar: (name: string, component: FC) => void;
  quit: (...tasks: PluginQuitTask[]) => void;
  start: (options?: T) => Promise<void>;
  restart: (options?: T) => Promise<void>;
  shutdown: () => Promise<void>;
  getInfo: () => WxxPluginInfo;
}
