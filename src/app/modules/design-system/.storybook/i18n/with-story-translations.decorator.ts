import { Provider } from '@angular/core';
import { TranslationLoadStatusDirective, ModuleTranslationService } from '@dcx/module/translation';
import { moduleMetadata } from '@storybook/angular';

import { StoryModuleTranslationService } from './story-module-translation.service';
import { STORY_DICTIONARY, StoryDictionary, TRANSLATION_BASE_URL } from './tokens';

type Opts = {
  baseUrl?: string;
  mock?: StoryDictionary;
  api?: boolean;
};

export function withStoryTranslations(opts: Opts = {}): any {
  const providers: Provider[] = [
    ...(opts.api === false
      ? [{ provide: TRANSLATION_BASE_URL, useValue: undefined }]
      : opts.api === true && opts.baseUrl
        ? [{ provide: TRANSLATION_BASE_URL, useValue: opts.baseUrl }]
        : []),

    { provide: STORY_DICTIONARY, useValue: opts.mock ?? {} },
    { provide: ModuleTranslationService, useClass: StoryModuleTranslationService },
  ];

  return moduleMetadata({
    imports: [TranslationLoadStatusDirective],
    providers,
  });
}
