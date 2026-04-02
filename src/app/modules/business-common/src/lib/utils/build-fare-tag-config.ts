import { TranslateService } from '@ngx-translate/core';
import { TagConfig } from '@dcx/ui/design-system';

export function buildFareTagConfig(
  textKey: string,
  translate: TranslateService,
  cssClass?: string,
): TagConfig {
  return {
    text: translate.instant(`Services.Fares.${textKey.toUpperCase()}`),
    cssClass,
  };
}