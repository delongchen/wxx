import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';

export const useSubscribe = <T>(
  source: Observable<T>,
  cb: (data: T) => void,
) => {
  useEffect(() => {
    const subscription = source.subscribe(cb);

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};

export const useSubscribeState = <T>(source: Observable<T>) => {
  const [value, setValue] = useState<T | undefined>(undefined)

  useSubscribe(source, setValue)

  return value
}
