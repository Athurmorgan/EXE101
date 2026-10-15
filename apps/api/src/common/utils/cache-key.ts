/**
 * Tao cache key determinstic tu mot object.
 *
 * - Sap xep key theo alphabet de `{"a":1,"b":2}` va `{"b":2,"a":1}` cung key.
 * - Bo qua `undefined` value.
 * - Su dung `JSON.stringify` an toan cho primitive + plain object + array.
 *
 * Tra ve chuoi ngan gon: `prefix:hash` (hash 16 ky tu bang FNV-1a 32-bit).
 */
export function cacheKey(prefix: string, params: Record<string, unknown>): string {
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(params).sort()) {
    const v = params[k];
    if (v !== undefined) sorted[k] = v;
  }
  return `${prefix}:${fnv1a(JSON.stringify(sorted)).toString(16)}`;
}

/** FNV-1a 32-bit hash — nhanh, khong can crypto, chi cho muc dich cache key. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash >>> 0;
}
