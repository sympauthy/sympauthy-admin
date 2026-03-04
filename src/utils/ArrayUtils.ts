export function isArrayNotEmpty<T>(array: T[] | null | undefined): array is [T, ...T[]] {
  return array != null && array.length > 0;
}
