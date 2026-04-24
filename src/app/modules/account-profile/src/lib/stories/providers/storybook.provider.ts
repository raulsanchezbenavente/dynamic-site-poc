import { LocationClient } from '@dcx/module/api-clients';
import { SessionClient } from '@dcx/module/booking-api-client';
import {
  CountryMapperService,
  DEFAULT_CONFIG_FORM_SUMMARY_BUTTONS,
  FORM_SUMMARY_CONFIG,
} from '@dcx/ui/business-common';
import { ModalDialogService } from '@dcx/ui/design-system';
import {
  BUTTON_CONFIG,
  ComposerService,
  ConfigService,
  DEFAULT_CONFIG_BUTTON,
  EventBusService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  GenerateIdPipe,
  LoggerService,
  ManageCountriesService,
  NotificationService,
  RedirectService,
  ResourcesRetrieveService,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import {
  COMMON_TRANSLATIONS,
  EventBusServiceFake,
  FakeSessionClient,
  LocationClientFakeService,
  LoggerServiceFake,
  ManageCountriesServiceFake,
  RedirectServiceFake,
} from '@dcx/ui/mock-repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfigServiceFake } from '../mocks/config.service.fake';

export const STORYBOOK_PROVIDERS = [
  ComposerService,
  GenerateIdPipe,
  CountryMapperService,
  NgbModal,
  ModalDialogService,
  NotificationService,
  ResourcesRetrieveService,
  {
    provide: TIMEOUT_REDIRECT,
    useValue: '/',
  },
  {
    provide: EXCLUDE_SESSION_EXPIRED_URLS,
    useValue: [],
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
    provide: ConfigService,
    useClass: ConfigServiceFake,
  },
  {
    provide: LoggerService,
    useClass: LoggerServiceFake,
  },
  {
    provide: ManageCountriesService,
    useClass: ManageCountriesServiceFake,
  },
  {
    provide: BUTTON_CONFIG,
    useValue: DEFAULT_CONFIG_BUTTON,
  },
  {
    provide: COMMON_TRANSLATIONS,
    useValue: COMMON_TRANSLATIONS,
  },
  {
    provide: FORM_SUMMARY_CONFIG,
    useValue: DEFAULT_CONFIG_FORM_SUMMARY_BUTTONS,
  },
  {
    provide: SessionClient,
    useClass: FakeSessionClient,
  },
  {
    provide: LocationClient,
    useClass: LocationClientFakeService,
  },
];
