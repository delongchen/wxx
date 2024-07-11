import * as React from "react";
import { BrowserRouterProps } from "react-router-dom";

interface WxxRouteMeta {
  title?: string
  icon?: React.FC
  hidden?: boolean
  index?: number
}

interface WxxRoute {
  path: string
  redirect?: string
  component?: React.FC<BrowserRouterProps>
  children?: WxxRoute[]
  meta?: WxxRouteMeta
}

export type {
  WxxRoute,
  WxxRouteMeta,
}
