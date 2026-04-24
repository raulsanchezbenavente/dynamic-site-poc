import { inject, InjectionToken } from '@angular/core';
import { TrackAnalyticsErrorService } from '../track-analytics-error';

export const TRACK_ANALYTICS_ERROR_SERVICE_TOKEN = new InjectionToken('TRACK_ANALYTICS_ERROR_SERVICE_TOKEN', {
  providedIn: 'root',
  factory: () => inject(TrackAnalyticsErrorService),
});
