import { AnalyticsEvent } from './events/analytics-event.interfaces';

export interface AnalyticsEngineStrategy {
  trackEvent(event: AnalyticsEvent, accounts?: string[]): void;
}
