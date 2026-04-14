import { InjectionToken } from '@angular/core';

export const MODULE_TRANSLATION_MAP_TOKEN = new InjectionToken<Record<string, string[]>>(
  'MODULE_TRANSLATION_MAP_TOKEN'
);
