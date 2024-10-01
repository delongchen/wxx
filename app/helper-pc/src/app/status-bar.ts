import { FC } from 'react';

const StatusBarItemMap = new Map<string, FC>()

export const addBarItem = (key: string, component: FC) => {
  StatusBarItemMap.set(key, component);
}

export const removeBarItem = (key: string) => {
  StatusBarItemMap.delete(key);
}

export const getBarItems = () => [...StatusBarItemMap.values()]
