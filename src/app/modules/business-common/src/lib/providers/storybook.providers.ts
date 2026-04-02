import { DatePipe, Location, TitleCasePipe } from '@angular/common';
import { Provider } from '@angular/core';
import { AccountFacade } from '@dcx/module/api-clients';
import { ModalDialogService } from '@dcx/ui/design-system';
import {
  BANNER_BREAKPOINT_CONFIG,
  BANNER_DEFAULT_CONFIG,
  BUSINESS_CONFIG,
  ComposerService,
  ConfigService,
  CookiesStore,
  CurrencyService,
  EventBusService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  I18n,
  LoggerService,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  NotificationService,
  PointOfSaleService,
  RedirectService,
  ResourcesRetrieveService,
  SessionSettingsService,
  SessionStore,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummarySelectedJourneysService,
  TIME_ALERT_EXPIRED_SESSION,
  TIME_EXPIRED_SESSION,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import {
  BUSINESS_CONFIG_MOCK,
  CookieServiceFake,
  CurrencyServiceFake,
  EventBusServiceFake,
  LoggerServiceFake,
  NotificationServiceFake,
  PosServiceFake,
  RedirectServiceFake,
  SessionSettingsServiceFake,
  SessionStoreFake,
} from '@dcx/ui/mock-repository';

import { STORYBOOK_DEFAULT_CONFIG_PROVIDERS } from '../../../../design-system/src/stories/providers/storybook-default-config.providers';
import { SummaryTypologyBaseService } from '../components';

export const STORYBOOK_PROVIDERS: Provider[] = [
  AccountFacade,
  ComposerService,
  ConfigService,
  CurrencyService,
  DatePipe,
  I18n,
  ModalDialogService,
  NotificationService,
  ResourcesRetrieveService,
  SessionSettingsService,
  SummaryTypologyBaseService,
  TitleCasePipe,
  ...STORYBOOK_DEFAULT_CONFIG_PROVIDERS,
  ...MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  {
    provide: BANNER_BREAKPOINT_CONFIG,
    useValue: BANNER_DEFAULT_CONFIG,
  },
  {
    provide: EventBusService,
    useClass: EventBusServiceFake,
  },
  {
    provide: BUSINESS_CONFIG,
    useValue: BUSINESS_CONFIG_MOCK,
  },
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
    useValue: 3480000,
  },
  {
    provide: TIME_EXPIRED_SESSION,
    useValue: 3600000,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  {
    provide: RedirectService,
    useClass: RedirectServiceFake,
  },
  {
    provide: CookiesStore,
    useClass: CookieServiceFake,
  },
  {
    provide: SessionStore,
    useClass: SessionStoreFake,
  },
  {
    provide: CurrencyService,
    useClass: CurrencyServiceFake,
  },
  {
    provide: Location,
    useClass: Location,
  },
  {
    provide: DatePipe,
    useClass: DatePipe,
  },
  {
    provide: PointOfSaleService,
    useClass: PosServiceFake,
  },
  {
    provide: SessionSettingsService,
    useClass: SessionSettingsServiceFake,
  },
  {
    provide: SUMMARY_SELECTED_JOURNEYS_SERVICE,
    useClass: SummarySelectedJourneysService,
  },
  {
    provide: NotificationService,
    useClass: NotificationServiceFake,
  },
];
