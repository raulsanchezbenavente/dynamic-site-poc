/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { Injectable } from '@angular/core';

import { AnalyticsEngineStrategy } from '../interfaces/analytics-engine-strategy.interfaces';
import { AnalyticsEvent } from '../interfaces/events/analytics-event.interfaces';

declare const ym: Function;

@Injectable({
  providedIn: 'root',
})
export class YandexMetricaService implements AnalyticsEngineStrategy {
  public trackEvent(event: AnalyticsEvent, accounts?: string[]): void {
    if (this.isYandexAvailable()) {
      if (accounts) {
        for (const account of accounts) {
          const eventToSend: Record<string, any> = {
            ...event.data,
          };
          console.debug('Yandex', event.eventName, eventToSend);
          ym(account, 'reachGoal', event.eventName, eventToSend);
        }
      }
    } else {
      console.warn('Yandex is not available.');
    }
  }

  private isYandexAvailable(): boolean {
    return typeof ym === 'function';
  }
}
