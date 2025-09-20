export function toArray<V>(v?: V | V[]): V[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
