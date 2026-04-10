import type { Provider } from '@angular/core';
import { AccountClient, AccountV2Client, CmsConfigClient } from '@dcx/module/api-clients';
import { ModalDialogService } from '@dcx/ui/design-system';
import {
  AuthService,
  BANNER_BREAKPOINT_CONFIG,
  BANNER_DEFAULT_CONFIG,
  BUSINESS_CONFIG,
  BUTTON_CONFIG,
  ComposerService,
  ConfigService,
  CookiesStore,
  CurrencyService,
  DEFAULT_CONFIG_BUTTON,
  EventBusService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  KeycloakAuthService,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  NotificationService,
  PointOfSaleService,
  RedirectService,
  SessionSettingsService,
  SessionStore,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import {
  BUSINESS_CONFIG_MOCK,
  CookieServiceFake,
  CurrencyServiceFake,
  PosServiceFake,
  RedirectServiceFake,
  SessionSettingsServiceFake,
  SessionStoreFake,
} from '@dcx/ui/mock-repository';
import { KeycloakService } from 'keycloak-angular';

import { EventBusServiceFake } from '../mocks';
import { ConfigServiceFake } from '../mocks/config.service.fake';

export const STORYBOOK_PROVIDERS: Provider[] = [
  AccountClient,
  AccountV2Client,
  AuthService,
  CmsConfigClient,
  ComposerService,
  KeycloakAuthService,
  KeycloakService,
  ModalDialogService,
  NotificationService,
  ...MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  {
    provide: BUSINESS_CONFIG,
    useValue: BUSINESS_CONFIG_MOCK,
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
    provide: ConfigService,
    useClass: ConfigServiceFake,
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
    provide: CurrencyService,
    useClass: CurrencyServiceFake,
  },
  {
    provide: RedirectService,
    useClass: RedirectServiceFake,
  },
  {
    provide: EventBusService,
    useClass: EventBusServiceFake,
  },
  {
    provide: SessionSettingsService,
    useClass: SessionSettingsServiceFake,
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
    provide: BANNER_BREAKPOINT_CONFIG,
    useValue: BANNER_DEFAULT_CONFIG,
  },
];
