import { DatePipe, TitleCasePipe } from '@angular/common';
import { ANALYTICS_DICTIONARIES, ANALYTICS_EXPECTED_EVENTS, ANALYTICS_EXPECTED_KEYS_MAP } from '@dcx/module/analytics';
import { ANALYTICS_INTERFACES_PROPERTIES, AnalyticsBusiness, AnalyticsEventType } from '@dcx/ui/business-common';
import {
  DEFAULT_CONFIG_POPOVER,
  POPOVER_CONFIG,
} from '@dcx/ui/design-system';
import {
  BUTTON_CONFIG,
  ComposerService,
  ConfigService,
  DEFAULT_CONFIG_BUTTON,
  EXCLUDE_SESSION_EXPIRED_URLS,
  LoggerService,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  PointOfSaleService,
  SessionStore,
  TIME_ALERT_EXPIRED_SESSION,
  TIME_EXPIRED_SESSION,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import { LoggerServiceFake, PosServiceFake, SessionStoreFake } from '@dcx/ui/mock-repository';

import { ConfigServiceFake } from '../../stories/mocks/config.service.fake';
import {
  FIND_BOOKINGS_PROXY_SERVICE_PROVIDER,
  PAST_TRIPS_BUILDER_PROVIDER,
  UPCOMING_TRIPS_BUILDER_PROVIDER,
} from '../../tokens/injection-tokens';

export const STORYBOOK_PROVIDERS = [
  ComposerService,
  DatePipe,
  TitleCasePipe,
  FIND_BOOKINGS_PROXY_SERVICE_PROVIDER,
  UPCOMING_TRIPS_BUILDER_PROVIDER,
  PAST_TRIPS_BUILDER_PROVIDER,
  ...MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  {
    provide: EXCLUDE_SESSION_EXPIRED_URLS,
    useValue: [],
  },
  {
    provide: TIMEOUT_REDIRECT,
    useValue: '/',
  },
  {
    provide: TIME_ALERT_EXPIRED_SESSION,
    useValue: 60000,
  },
  {
    provide: TIME_EXPIRED_SESSION,
    useValue: 120000,
  },
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
  {
    provide: PointOfSaleService,
    useClass: PosServiceFake,
  },
  {
    provide: BUTTON_CONFIG,
    useValue: DEFAULT_CONFIG_BUTTON,
  },
  {
    provide: POPOVER_CONFIG,
    useValue: DEFAULT_CONFIG_POPOVER,
  },
  {
    provide: ANALYTICS_EXPECTED_KEYS_MAP,
    useValue: ANALYTICS_INTERFACES_PROPERTIES,
  },
  {
    provide: ANALYTICS_EXPECTED_EVENTS,
    useValue: AnalyticsEventType,
  },
  {
    provide: ANALYTICS_DICTIONARIES,
    useValue: AnalyticsBusiness,
  },
];
