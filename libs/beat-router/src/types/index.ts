export interface RouteRecordRaw {
  key: string;
  title?: string;
  desc?: string;
  actions?: string[];
  children?: RouteRecordRaw[];
}
