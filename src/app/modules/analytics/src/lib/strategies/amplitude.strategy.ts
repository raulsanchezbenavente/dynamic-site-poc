import { Injectable } from '@angular/core';

import { AnalyticsEngineStrategy } from '../interfaces/analytics-engine-strategy.interfaces';
import { AnalyticsEvent } from '../interfaces/events/analytics-event.interfaces';

declare const amplitude: any;

@Injectable({
  providedIn: 'root',
})
export class AmplitudeService implements AnalyticsEngineStrategy {
  public trackEvent(event: AnalyticsEvent): void {
    if (this.isAmplitudeAvailable()) {
      const eventToSend: Record<string, any> = {
        ...event.data,
      };
      console.debug('Amplitude', event.eventName, eventToSend);
      amplitude.track(event.eventName, eventToSend);
    } else {
      console.warn('Amplitude is not available.');
    }
  }

  private isAmplitudeAvailable(): boolean {
    return amplitude !== undefined;
  }
}
