import { ComposerService, ConfigService, GenerateIdPipe, LoggerService } from '@dcx/ui/libs';
import { LoggerServiceFake } from '@dcx/ui/mock-repository';

import { ConfigServiceFake } from '../../stories/mocks/config.service.fake';
import { LOYALTY_PROGRESS_BUILDER_PROVIDER } from '../../tokens/injection-tokens';

export const STORYBOOK_PROVIDERS = [
  ComposerService,
  GenerateIdPipe,
  {
    provide: ConfigService,
    useClass: ConfigServiceFake,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  LOYALTY_PROGRESS_BUILDER_PROVIDER,
];
