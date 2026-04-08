import { DatePipe } from '@angular/common';
import { BookingSessionService, PaxCheckinService, SegmentsStatusService } from '@dcx/ui/api-layer';
import { PageBackService } from '@dcx/ui/business-common';
import {
  DEFAULT_CONFIG_POPOVER,
  POPOVER_CONFIG,
} from '@dcx/ui/design-system';
import {
  ComposerService,
  ConfigService,
  CookieService,
  EXCLUDE_SESSION_EXPIRED_URLS,
  LoggerService,
  MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
  NotificationService,
  RedirectService,
  SessionStore,
  TIMEOUT_REDIRECT,
} from '@dcx/ui/libs';
import {
  BookingSessionServiceFake,
  LoggerServiceFake,
  PaxCheckinServiceFake,
  RedirectServiceFake,
  SegmentsStatusServiceFake,
  SessionStoreFake,
} from '@dcx/ui/mock-repository';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

import { CheckInSummaryBuilderService } from '../../implementations/check-in-summary-builder.service';
import { ConfigServiceFake } from '../../stories/mocks/config.service.fake';

export const STORYBOOK_PROVIDERS = [
  ComposerService,
  DatePipe,
  NgbPopover,
  {
    provide: NotificationService,
    useValue: {
      showErrorModal: () => console.warn('[Storybook] Error caught but suppressed'),
      showNotification: () => {},
    },
  },
  PageBackService,
  CookieService,
  CheckInSummaryBuilderService,
  ...MODAL_KEY_EVENT_STRATEGIES_PROVIDERS,
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
    provide: POPOVER_CONFIG,
    useValue: DEFAULT_CONFIG_POPOVER,
  },
  {
    provide: BookingSessionService,
    useClass: BookingSessionServiceFake,
  },
  {
    provide: PaxCheckinService,
    useClass: PaxCheckinServiceFake,
  },
  {
    provide: SegmentsStatusService,
    useClass: SegmentsStatusServiceFake,
  },
];
