import { inject, Injectable } from '@angular/core';

import { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';
import { ANALYTICS_EXPECTED_KEYS_MAP, AnalyticsExpectedKeysMap } from '../../tokens/analytics-expected-keys.token';

@Injectable({ providedIn: 'root' })
export class AnalyticsStrategiesService {
  private readonly expectedKeysMap: AnalyticsExpectedKeysMap = inject(ANALYTICS_EXPECTED_KEYS_MAP);

  public normalizeEvent(event: AnalyticsEvent<string>, account?: string): Record<string, any> {
    const expectedKeys = this.getExpectedKeys(event.eventName);
    const normalizedEvent: Record<string, any> = {
      ...this.getGoogleAnalyticsSendTo(event.account, account),
      ...event.data,
    };

    for (const key of expectedKeys) {
      if (!(key in normalizedEvent)) {
        normalizedEvent[key] = null;
      }
    }
    return normalizedEvent;
  }

  private getGoogleAnalyticsSendTo(eventAccount?: string, account?: string): Record<string, string> {
    if (this.isValidGoogleAnalyticsAccount(eventAccount)) {
      return { send_to: eventAccount! };
    }
    if (this.isValidGoogleAnalyticsAccount(account)) {
      return { send_to: account! };
    }
    return {};
  }

  private getExpectedKeys(eventName: string): readonly string[] {
    return this.expectedKeysMap?.[eventName] ?? [];
  }

  private isValidGoogleAnalyticsAccount(account?: string): boolean {
    const GAREGEXP: RegExp = /^(UA-\d{6,10}-\d{1,3}|G-[A-Z0-9]{7,12})$/;
    return typeof account === 'string' && GAREGEXP.test(account);
  }
}
