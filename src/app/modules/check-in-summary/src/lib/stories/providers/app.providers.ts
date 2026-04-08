import type { Provider } from '@angular/core';
import { BookingSessionService, PaxCheckinService, SegmentsStatusService } from '@dcx/ui/api-layer';
import { SessionService } from '@dcx/ui/business-common';
import { DEFAULT_CONFIG_POPOVER, POPOVER_CONFIG } from '@dcx/ui/design-system';

export const CHECK_IN_SUMMARY_APP_PROVIDERS: Provider[] = [
  BookingSessionService,
  SessionService,
  PaxCheckinService,
  SegmentsStatusService,
  {
    provide: POPOVER_CONFIG,
    useValue: DEFAULT_CONFIG_POPOVER,
  },
];
