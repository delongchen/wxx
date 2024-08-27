import { WxxRoute } from './router';
import { FC } from 'react';

export interface WxxPluginContext {
  registerPage: (route: WxxRoute) => void;
  registerStatusBarItem: (component: FC) => void;
}

export interface WxxPluginType {
  name: string;
  install: (ctx: WxxPluginContext) => Promise<void>;
}
