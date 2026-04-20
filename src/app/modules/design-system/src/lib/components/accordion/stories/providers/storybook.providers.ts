import type { Provider } from '@angular/core';
import { ComposerService, ConfigService, LoggerService } from '@dcx/ui/libs';
import { LoggerServiceFake } from '@dcx/ui/mock-repository';

import { ConfigServiceFake } from '../mocks/config.service.fake';

export const STORYBOOK_PROVIDERS: Provider[] = [
  ComposerService,
  {
    provide: ConfigService,
    useClass: ConfigServiceFake,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
];
