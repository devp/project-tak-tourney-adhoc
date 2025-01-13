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
