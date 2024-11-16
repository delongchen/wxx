export function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
  const length = Math.min(arr1.length, arr2.length);
  const result: [T, U][] = [];

  for (let i = 0; i < length; i++) {
    result.push([arr1[i], arr2[i]]);
  }

  return result;
}

export function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

type StrNum = string | number;
type CountTuple = [StrNum, number, number];
interface MatchCounter {
  key: StrNum;
  count: number;
  win: number;
}

export const countMatch = <T>(
  keyVec: T[],
  winVec: number[],
  keysMapper: (key: T) => StrNum | StrNum[],
): CountTuple[] => {
  const map: Map<StrNum, MatchCounter> = new Map();

  const update = (key: StrNum, win: number) => {
    const exist = map.get(key);
    if (exist === undefined) {
      map.set(key, { key, count: 1, win });
    } else {
      exist.win += win;
      exist.count += 1;
    }
  };

  for (const [keyRaw, win] of zip(keyVec, winVec)) {
    const keys = keysMapper(keyRaw);
    if (Array.isArray(keys)) {
      for (const key of keys) {
        update(key, win);
      }
    } else {
      update(keys, win);
    }
  }

  return [...map.values()].map(({ key, count, win }) => [key, count, win]);
};
