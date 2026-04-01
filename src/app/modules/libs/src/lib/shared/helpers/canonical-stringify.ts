export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }

  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  const keyValuePairs = keys.map((key) => JSON.stringify(key) + ':' + canonicalStringify(obj[key]));
  return '{' + keyValuePairs.join(',') + '}';
}
