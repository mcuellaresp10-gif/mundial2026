/** Primera URL no vacía, o null si ninguna sirve para next/image. */
export function pickImageSrc(
  ...values: (string | null | undefined)[]
): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}
