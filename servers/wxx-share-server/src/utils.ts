type ValueSetter<T> = (value: T) => void;

export const createMapHelper = <K, V>(map: Map<K, V>) => {
  const need = (
    key: K,
    exist: (value: V, setter: ValueSetter<V>) => void,
    not?: (setter: ValueSetter<V>) => void,
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

