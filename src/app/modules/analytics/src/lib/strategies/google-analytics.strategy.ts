/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Injectable } from '@angular/core';

import { AnalyticsEngineStrategy } from '../interfaces/analytics-engine-strategy.interfaces';
import { AnalyticsEvent } from '../interfaces/events/analytics-event.interfaces';
import { AnalyticsGaGtmColivingRewriteService } from '../workdarounds/GA-GTM-coliving/analytics-ga-gtm-coliving-rewrite.service';

import { AnalyticsStrategiesService } from './services/analytics-strategies.service';

declare const gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService implements AnalyticsEngineStrategy {
  constructor(
    private readonly analyticsStrategiesService: AnalyticsStrategiesService,
    private readonly analyticsGaGtmColivingRewriteService: AnalyticsGaGtmColivingRewriteService
  ) {}

  public trackEvent(event: AnalyticsEvent, accounts?: string[]): void {
    if (this.isGoogleAnalyticsAvailable()) {
      if (accounts?.length) {
        for (const account of accounts) {
          this.sendEvent(event, account);
        }
      } else {
        this.sendEvent(event);
      }
    } else {
      console.warn('Google Analytics is not available.');
    }
  }

  public sendEvent(event: AnalyticsEvent, account?: string): void {
    const eventToSend = this.analyticsStrategiesService.normalizeEvent(event, account);
    console.debug('GA', event.eventName, eventToSend);
    this.analyticsGaGtmColivingRewriteService.gtagWithSuffix('event', event.eventName, eventToSend);
  }

  private isGoogleAnalyticsAvailable(): boolean {
    return typeof gtag === 'function';
  }
}
