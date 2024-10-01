import { useEffect } from 'react';
import { Observable } from 'rxjs'

export const useSubscribe = <T>(source: Observable<T>, ob: (data: T) => void) => {
  useEffect(() => {
    const subscription = source.subscribe(ob);

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};
