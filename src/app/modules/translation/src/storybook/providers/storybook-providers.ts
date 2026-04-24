import { importProvidersFrom } from '@angular/core';
import { ModuleTranslationService } from '@dcx/module/translation';
import { ConfigService } from '@dcx/ui/libs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { ConfigServiceFake } from '../mocks/config.service.fake';
import { ModuleTranslationServiceFake } from '../mocks/module-translation.service.fake';
import { FakeTranslateLoader } from '../mocks/translation-fake-loader';

export const STORYBOOK_PROVIDERS = [
  { provide: ConfigService, useClass: ConfigServiceFake },
  { provide: ModuleTranslationService, useClass: ModuleTranslationServiceFake },
  importProvidersFrom(
    TranslateModule.forRoot({
      fallbackLang: 'es-ES',
      loader: {
        provide: TranslateLoader,
        useClass: FakeTranslateLoader,
      },
    })
  ),
];
