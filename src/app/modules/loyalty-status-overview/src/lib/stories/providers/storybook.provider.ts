import { DEFAULT_CONFIG_PANEL, PANEL_CONFIG } from '@dcx/ui/design-system';
import { ComposerService, ConfigService, LoggerService, SessionStore } from '@dcx/ui/libs';
import { LoggerServiceFake, SessionStoreFake } from '@dcx/ui/mock-repository';

import { ConfigServiceFake } from '../../stories/mocks/config.service.fake';
import { LOYALTY_STATUS_OVERVIEW_BUILDER_PROVIDER } from '../../tokens/injection-tokens';

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
  {
    provide: SessionStore,
    useClass: SessionStoreFake,
  },
  LOYALTY_STATUS_OVERVIEW_BUILDER_PROVIDER,
  {
    provide: PANEL_CONFIG,
    useValue: DEFAULT_CONFIG_PANEL,
  },
];
