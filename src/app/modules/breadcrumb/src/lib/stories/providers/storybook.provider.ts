import { ConfigService, EventBusService, LoggerService } from '@dcx/ui/libs';
import { EventBusServiceFake, LoggerServiceFake } from '@dcx/ui/mock-repository';

import { ConfigServiceFake } from '../mocks/config.service.fake';

export const STORYBOOK_PROVIDERS = [
  {
    provide: ConfigService,
    useClass: ConfigServiceFake,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  {
    provide: EventBusService,
    useClass: EventBusServiceFake,
  },
];
