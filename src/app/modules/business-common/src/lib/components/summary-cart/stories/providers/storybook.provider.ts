import { DatePipe } from '@angular/common';
import {
  BUSINESS_CONFIG,
  BUTTON_CONFIG,
  CookiesStore,
  DEFAULT_CONFIG_BUTTON,
  LoggerService,
  SessionStore,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummarySelectedJourneysService,
} from '@dcx/ui/libs';
import { BUSINESS_CONFIG_MOCK, CookieServiceFake, LoggerServiceFake } from '@dcx/ui/mock-repository';

import { SUMMARY_CART_BUILDER_SERVICE, SummaryCartBuilderService } from '../..';
import { STORYBOOK_PROVIDERS } from '../../../../providers/storybook.providers';
import { SummaryTypologyBaseService } from '../../../summary-typology-builder/services/summary-typology-base.service';
import { SharedSessionService } from '../../services/shared-session.service';
import { SessionStoreFake } from '../mocks/session-store.fake';

export const SUMMARY_STORYBOOK_PROVIDERS = [
  ...STORYBOOK_PROVIDERS,
  DatePipe,
  SummaryTypologyBaseService,
  SharedSessionService,
  {
    provide: SUMMARY_SELECTED_JOURNEYS_SERVICE,
    useClass: SummarySelectedJourneysService,
  },
  {
    provide: BUSINESS_CONFIG,
    useValue: BUSINESS_CONFIG_MOCK,
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
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  {
    provide: BUTTON_CONFIG,
    useValue: DEFAULT_CONFIG_BUTTON,
  },
  {
    provide: SUMMARY_CART_BUILDER_SERVICE,
    useClass: SummaryCartBuilderService,
  },
];
