import type { Provider } from '@angular/core';
import {
  CurrencySelectorComponent,
  DropdownComponent,
  DropdownListComponent,
  DsButtonComponent,
  LanguageSelectorComponent,
  OptionsListComponent,
} from '@dcx/ui/design-system';
import { BUSINESS_CONFIG, CookiesStore, EventBusService, SessionStore } from '@dcx/ui/libs';

import { BUSINESS_CONFIG_MOCK } from '../mocks/business-config';
import { CookieServiceFake } from '../mocks/cookie-service.fake';
import { EventBusServiceFake } from '../mocks/event-bus.service.fake';

export const MAIN_BANNER_PROVIDERS_MOCK: Provider[] = [
  SessionStore,
  {
    provide: BUSINESS_CONFIG,
    useValue: BUSINESS_CONFIG_MOCK,
  },
  {
    provide: CookiesStore,
    useClass: CookieServiceFake,
  },
  {
    provide: EventBusService,
    useClass: EventBusServiceFake,
  },
];

export const GENERAL_DECLARATIONS: any[] = [
  CurrencySelectorComponent,
  LanguageSelectorComponent,
  DropdownComponent,
  DropdownListComponent,
  OptionsListComponent,
  DsButtonComponent,
];
