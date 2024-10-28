import { Subscription, Observable } from 'rxjs';

type CancelFn = () => void;
export type CancellableService = () => CancelFn;

export const concat =
  (...services: CancellableService[]): CancellableService =>
    () => {
      const cancelFns = services.map((it) => it());

      return () => {
        cancelFns.forEach((cancel) => cancel());
        cancelFns.length = 0;
      };
    };

export const createSubscriptionManager = () => {
  const subscriptions: Subscription[] = [];
  const deferFnSet: Set<() => void> = new Set();

  const manage = (...s: Subscription[]) => {
    subscriptions.push(...s);
  };

  const subscribe = <T>(ob: Observable<T>, f: (value: T) => Promise<void> | void) => {
    manage(ob.subscribe(f));
  };

  const defer = (fn: () => void) => {
    deferFnSet.add(fn);
  };

  const quit = () => {
    for (const subscription of subscriptions) {
      subscription.unsubscribe();
    }
    subscriptions.length = 0;

    for (const fn of deferFnSet) {
      fn();
    }
    deferFnSet.clear();
  };

  return { subscribe, quit, manage, defer };
};

export const createMapHelper = <K, V>(map: Map<K, V>) => {
  const need = (
    key: K,
    exist: (value: V, setter: (value: V) => void) => void,
    not?: (setter: (value: V) => void) => void,
  ) => {
    const target = map.get(key);
    const setter = (value?: V) => {
      if (value === undefined) {
        map.delete(key);
        return;
      }

      map.set(key, value);
    };

    if (target !== undefined) {
      exist(target, setter);
    } else if (not !== undefined) {
      not(setter);
    }
  };

  return {
    need,
  };
};
