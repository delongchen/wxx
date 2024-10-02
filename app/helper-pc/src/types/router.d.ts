import { FC } from 'react';
import { BrowserRouterProps } from 'react-router-dom';

interface WxxRouteMeta {
  title?: string;
  icon?: FC;
  hidden?: boolean;
  index?: number;
}

interface WxxRoute {
  path: string;
  isFullPage?: boolean;
  redirect?: string;
  component?: FC<BrowserRouterProps>;
  children?: WxxRoute[];
  meta?: WxxRouteMeta;
  isOuter?: boolean;
  isIndexPage?: boolean;
}

export type { WxxRoute, WxxRouteMeta };
