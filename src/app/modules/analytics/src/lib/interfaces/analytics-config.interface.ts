import { AnalyticsEngine } from '../enums/analytics-engines.enum';

export interface AnalyticsEngineConfig {
  engine: AnalyticsEngine;
  accounts?: string[]; // Only accounts that require accounts
}

export interface AnalyticsExceptionConfig<TEventName extends string = string> {
  eventName: TEventName;
  analyticsEngines: AnalyticsEngineConfig[];
  includeDefaultEngines?: boolean;
}

export interface AnalyticsConfig<TEventName extends string = string> {
  analyticsEngines: AnalyticsEngineConfig[];
  analyticsExceptions?: AnalyticsExceptionConfig<TEventName>[];
}

export interface AnalyticsSettings<TEventName extends string = string> {
  enabledEngines: AnalyticsEngineConfig[];
  exceptions?: AnalyticsExceptionConfig<TEventName>[];
  enableCustomPageView: boolean;
}
