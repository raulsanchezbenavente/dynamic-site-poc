export function translateKeys(translations: Record<string, any>, obj: Record<string, any>): Record<string, any> {
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      if (translations[value]) {
        obj[key] = translations[value];
      }
    } else if (typeof value === 'object' && value !== null) {
      translateKeys(translations, value);
    }
  }
  return obj;
}
