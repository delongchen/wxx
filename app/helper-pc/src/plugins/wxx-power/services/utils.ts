type CancelFn = () => void
export type CancellableService = () => CancelFn


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
