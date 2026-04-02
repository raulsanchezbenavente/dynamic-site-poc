import { InjectionToken, Provider } from '@angular/core';

import { IBookingProxyInterface } from '../interfaces/booking-proxy.interface';
import { ISessionEventProxyInterface } from '../interfaces/session-event-proxy.interface';
import { BookingProxyService } from '../services/booking-proxy.service';
import { SessionEventProxyService } from '../services/session-event-proxy.service';

export const BOOKING_PROXY_SERVICE = new InjectionToken<IBookingProxyInterface>('BOOKING_PROXY_SERVICE');

export const SESSION_EVENT_PROXY_SERVICE = new InjectionToken<ISessionEventProxyInterface>(
  'SESSION_EVENT_PROXY_SERVICE'
);

export const BOOKING_PROXY_PROVIDER: Provider = {
  provide: BOOKING_PROXY_SERVICE,
  useExisting: BookingProxyService,
};

export const SESSION_EVENT_PROXY_PROVIDER: Provider = {
  provide: SESSION_EVENT_PROXY_SERVICE,
  useExisting: SessionEventProxyService,
};
