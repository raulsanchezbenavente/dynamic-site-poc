import { InjectionToken, Provider } from '@angular/core';

import { IFindBookingsProxyService } from '../interfaces/find-bookings-proxy.interface';
import { IPastTripsBuilder } from '../interfaces/past-trips-builder.interface';
import { IUpcomingTripsBuilder } from '../interfaces/upcoming-trips-builder.interface';
import { FindBookingsProxyService } from '../services/find-bookings-proxy.service';
import { PastTripsBuilderService } from '../services/past-trips-builder.service';
import { UpcomingTripsBuilderService } from '../services/upcoming-trips-builder.service';

export const FIND_BOOKINGS_PROXY_SERVICE = new InjectionToken<IFindBookingsProxyService>('FIND_BOOKINGS_PROXY_SERVICE');

export const UPCOMING_TRIPS_BUILDER_SERVICE = new InjectionToken<IUpcomingTripsBuilder>(
  'UPCOMING_TRIPS_BUILDER_SERVICE'
);

export const PAST_TRIPS_BUILDER_SERVICE = new InjectionToken<IPastTripsBuilder>('PAST_TRIPS_BUILDER_SERVICE');

export const FIND_BOOKINGS_PROXY_SERVICE_PROVIDER: Provider = {
  provide: FIND_BOOKINGS_PROXY_SERVICE,
  useClass: FindBookingsProxyService,
};

export const UPCOMING_TRIPS_BUILDER_PROVIDER: Provider = {
  provide: UPCOMING_TRIPS_BUILDER_SERVICE,
  useClass: UpcomingTripsBuilderService,
};

export const PAST_TRIPS_BUILDER_PROVIDER: Provider = {
  provide: PAST_TRIPS_BUILDER_SERVICE,
  useClass: PastTripsBuilderService,
};
