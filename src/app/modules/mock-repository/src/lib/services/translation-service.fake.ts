import type { DictionaryType } from '@dcx/ui/libs';

export class TranslationServiceFake {
  public translate(key: string, translations: string[] | DictionaryType, defaultValue?: string): string {
    return key;
  }
}
