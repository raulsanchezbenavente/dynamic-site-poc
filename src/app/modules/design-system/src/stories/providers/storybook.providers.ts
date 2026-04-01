import { DatePipe, TitleCasePipe } from '@angular/common';
import type { Provider } from '@angular/core';
import {
  BUSINESS_CONFIG,
  ComposerService,
  ConfigService,
  CookiesStore,
  CurrencyService,
  EventBusService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  I18N_VALUES,
  LoggerService,
  ManageCountriesService,
  MaskPipe,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  NotificationService,
  RedirectService,
  ResizeSvc,
  ResourcesRetrieveService,
  SessionHttpService,
  SessionStore,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import {
  BUSINESS_CONFIG_MOCK,
  CookieServiceFake,
  CurrencyServiceFake,
  EventBusServiceFake,
  LoggerServiceFake,
  ManageCountriesServiceFake,
  MOCK_I18N_VALUES,
  RedirectServiceFake,
  SessionHttpServiceFake,
  SessionStoreFake,
} from '@dcx/ui/mock-repository';

import { ModalDialogService } from '../../lib/components';

import { STORYBOOK_DEFAULT_CONFIG_PROVIDERS } from './storybook-default-config.providers';

export const STORYBOOK_PROVIDERS: Provider[] = [
  ComposerService,
  ConfigService,
  DatePipe,
  LoggerService,
  ModalDialogService,
  NotificationService,
  ResizeSvc,
  ResourcesRetrieveService,
  TitleCasePipe,
  MaskPipe,
  ...MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  ...STORYBOOK_DEFAULT_CONFIG_PROVIDERS,
  {
    provide: BUSINESS_CONFIG,
    useValue: BUSINESS_CONFIG_MOCK,
  },
  {
    provide: SessionHttpService,
    useClass: SessionHttpServiceFake,
  },
  {
    provide: SessionStore,
    useClass: SessionStoreFake,
  },
  {
    provide: CookiesStore,
    useClass: CookieServiceFake,
  },
  {
    provide: EventBusService,
    useClass: EventBusServiceFake,
  },
  {
    provide: CurrencyService,
    useClass: CurrencyServiceFake,
  },
  {
    provide: RedirectService,
    useClass: RedirectServiceFake,
  },
  {
    provide: ManageCountriesService,
    useClass: ManageCountriesServiceFake,
  },
  {
    provide: TIMEOUT_REDIRECT,
    useValue: '/',
  },
  {
    provide: EXCLUDE_SESSION_EXPIRED_URLS,
    useValue: [],
  },
  {
    provide: I18N_VALUES,
    useValue: MOCK_I18N_VALUES,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
];
