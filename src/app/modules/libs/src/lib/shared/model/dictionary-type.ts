/**
 * Dictionary Type
 * Used in translations object from config
 */
export interface DictionaryType<T = string> {
  /**
   * Dictionary item
   */
  [key: string]: T;
}
