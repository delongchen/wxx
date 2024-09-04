import { Subscription, Observable } from 'rxjs';

type CancelFn = () => void;
export type CancellableService = () => CancelFn;

export const concat =
  (...services: CancellableService[]): CancellableService =>
  () => {
    const cancelFns = services.map(it => it());

    return () => {
      cancelFns.forEach(cancel => cancel());
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
  const need = (key: K, exist: (value: V) => void, not?: () => V | undefined) => {
    const target = map.get(key);
    if (target !== undefined) {
      exist(target);
    } else {
      if (not !== undefined) {
        const toInsert = not();

        if (toInsert !== undefined) {
          map.set(key, toInsert);
        }
      }
    }
  };

  return {
    need,
  };
};
