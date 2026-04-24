import type { Provider } from '@angular/core';
import {
  ComposerService,
  ConfigService,
  ExternalLinkPipe,
  LoggerService,
  NotificationService,
} from '@dcx/ui/libs';
import { LoggerServiceFake, NotificationServiceFake } from '@dcx/ui/mock-repository';

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
  {
    provide: NotificationService,
    useClass: NotificationServiceFake,
  },
];
