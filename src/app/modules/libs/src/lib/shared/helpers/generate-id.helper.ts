/**
 * Legacy Helper - avoid use
 * @param prefix
 * @returns
 */
export function generateIdWithUUID(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
