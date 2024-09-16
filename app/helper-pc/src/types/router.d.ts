import * as React from 'react';
import { BrowserRouterProps } from 'react-router-dom';

interface WxxRouteMeta {
  title?: string;
  icon?: React.FC;
  hidden?: boolean;
  index?: number;
}

interface WxxRoute {
  path: string;
  isFullPage?: boolean;
  redirect?: string;
  component?: React.FC<BrowserRouterProps>;
  children?: WxxRoute[];
  meta?: WxxRouteMeta;
  isOuter?: boolean;
}

export type { WxxRoute, WxxRouteMeta };
