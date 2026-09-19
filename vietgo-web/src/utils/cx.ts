type ClassValue = string | false | null | undefined;

/** Joins truthy class names into a single string. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
