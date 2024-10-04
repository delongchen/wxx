import { WxxRoute } from '@/types/router';
import { useState } from 'react';
import { Subject } from 'rxjs';
import { useSubscribe } from 'tauri-plugin-wxx-core/hooks'

const routeModules = import.meta.glob(['./modules/**/*.ts', './modules/**/*.tsx'], { eager: true });

const flatModules = (modules: Record<string, unknown>) => {
  const result: WxxRoute[] = [];

  const mods = Object.values(modules);
  for (const mod of mods) {
    if (typeof mod !== 'object' || mod === null) {
      continue;
    }

    const defaultExport = Reflect.get(mod, 'default');
    if (Array.isArray(defaultExport)) {
      result.push(...defaultExport);
    } else {
      result.push(defaultExport);
    }
  }

  return result;
};

const staticRoutes: WxxRoute[] = [
  {
    path: '/',
    redirect: '/home',
  },
];
const internalRoutes = [...staticRoutes, ...flatModules(routeModules)];

const outerRoutes: Map<string, WxxRoute> = new Map();
export const registerRoute = (route: WxxRoute) => {
  outerRoutes.set(route.path, route);
};
export const unregisterRoute = (path: string) => {
  outerRoutes.delete(path);
};

const getAllRoutes = () => {
  return [...internalRoutes, ...outerRoutes.values()];
};

export const RoutesChangeEmitter = new Subject<void>();
export const emitRoutesChange = () => {
  RoutesChangeEmitter.next();
};

export const useWxxRoutes = () => {
  const [routes, setRoutes] = useState<WxxRoute[]>(getAllRoutes());

  useSubscribe(RoutesChangeEmitter, () => {
    setRoutes(getAllRoutes());
  });

  return routes;
};
