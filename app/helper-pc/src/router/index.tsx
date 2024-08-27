import { WxxRoute } from '@/types/router';

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
const outerRoutes: WxxRoute[] = [];

const internalRoutePathSet = new Set(internalRoutes.map(it => it.path));

export const registerRoute = (route: WxxRoute) => {
  if (!internalRoutePathSet.has(route.path)) {
    route.isOuter = true;
    outerRoutes.push(route);
  }
};

export const getAllRoutes = (): WxxRoute[] => {
  return [...internalRoutes, ...outerRoutes];
};
