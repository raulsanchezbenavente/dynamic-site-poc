import { ComposerService, ConfigService, LoggerService } from '@dcx/ui/libs';
import { LoggerServiceFake } from '@dcx/ui/mock-repository';

import { ConfigServiceFake } from '../../stories/mocks/config.service.fake';

export const STORYBOOK_PROVIDERS = [
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
