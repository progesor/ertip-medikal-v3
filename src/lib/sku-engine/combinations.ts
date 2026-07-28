export function calculateCombinationCount(arrays: readonly string[][]): number {
  if (arrays.length === 0) return 0;

  return arrays.reduce((count, values) => {
    if (count === 0 || values.length === 0) return 0;
    const nextCount = count * values.length;
    return Number.isSafeInteger(nextCount) ? nextCount : Number.POSITIVE_INFINITY;
  }, 1);
}

export function getCombinations(arrays: readonly string[][]): string[][] {
  if (arrays.length === 0) return [];

  return arrays.reduce<string[][]>(
    (combinations, values) =>
      combinations.flatMap((combination) =>
        values.map((value) => [...combination, value]),
      ),
    [[]],
  );
}
