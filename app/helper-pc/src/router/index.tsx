import { WxxRoute } from "@/types/router";

const routeModules = import.meta.glob(
  [
    './modules/**/*.ts',
    './modules/**/*.tsx',
  ],
  { eager: true }
);

const flatModules = (modules: Record<string, unknown>) => {
  const result: WxxRoute[] = []

  const mods = Object.values(modules)
  for (const mod of mods) {
    if (typeof mod !== 'object' || mod === null) {
      continue
    }

    const defaultExport = Reflect.get(mod, 'default')
    if (Array.isArray(defaultExport)) {
      result.push(...defaultExport)
    } else {
      result.push(defaultExport)
    }
  }

  return result
}

const staticRoutes: WxxRoute[] = [
  {
    path: '/',
    redirect: '/home'
  }
]

export const allRoutes: WxxRoute[] = [
  ...staticRoutes,
  ...flatModules(routeModules)
]
