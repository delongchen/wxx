import { Subscription, Observable } from 'rxjs'


type CancelFn = () => void
export type CancellableService = ( ) => CancelFn


export const concat = (
  ...services: CancellableService[]
): CancellableService =>
  () => {
    const cancelFns = services.map(it => it())

    return () => {
      cancelFns.forEach(cancel => cancel())
      cancelFns.length = 0
    }
  }

export const createStreamHelper = (
  checkEnable?: () => boolean,
) => {
  const subscriptions: Subscription[] = []

  const subscribe = <T>(
    ob: Observable<T>,
    f: (value: T) => Promise<void> | void,
  ) => {
    subscriptions.push(ob.subscribe(value => {
      if (
        checkEnable === undefined ||
        checkEnable()
      ) {
        f(value)
      }
    }))
  }

  const quit = () => {
    for (const subscription of subscriptions) {
      subscription.unsubscribe()
    }
    subscriptions.length = 0
  }

  return { subscribe, quit }
}
