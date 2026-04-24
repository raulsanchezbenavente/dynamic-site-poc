import { Injectable } from '@angular/core';

import { AnalyticsEngineStrategy } from '../interfaces/analytics-engine-strategy.interfaces';
import { AnalyticsEvent } from '../interfaces/events/analytics-event.interfaces';

import { AnalyticsStrategiesService } from './services/analytics-strategies.service';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
@Injectable({
  providedIn: 'root',
})
export class GTMService implements AnalyticsEngineStrategy {
  constructor(private readonly analyticsStrategiesService: AnalyticsStrategiesService) {}

  public trackEvent(event: AnalyticsEvent): void {
    if (this.isGoogleTagManagerAvailable()) {
      const eventToSend = this.analyticsStrategiesService.normalizeEvent(event);

      console.debug('GTM', event.eventName, eventToSend);

      window.dataLayer.push({
        event: event.eventName,
        ...eventToSend,
      });
    } else {
      console.warn('Google Tag Manager is not available.');
    }
  }

  private isGoogleTagManagerAvailable(): boolean {
    return typeof window !== 'undefined' && Array.isArray(window.dataLayer);
  }
}
