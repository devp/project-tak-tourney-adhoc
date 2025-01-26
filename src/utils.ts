export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce(
    (acc, item) => {
      const key = getKey(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
};

export const sum = (values: number[]): number => {
  return values.reduce((acc, curr) => acc + curr, 0);
};

export const uniqBy = <T, K extends string | number | symbol>(
  array: T[],
  getKey: (item: T) => K
): T[] => {
  return array.filter(
    (item, index, self) => self.findIndex((i) => getKey(i) === getKey(item)) === index
  );
};
