import { InjectionToken } from '@angular/core';

export type AnalyticsEventNames = Readonly<Record<string, string>>;
export const ANALYTICS_EXPECTED_EVENTS = new InjectionToken<AnalyticsEventNames>('ANALYTICS_EXPECTED_EVENTS');

export type AnalyticsExpectedKeysMap<TEventName extends string = string> = Partial<
  Record<TEventName, readonly string[]>
>;
export const ANALYTICS_EXPECTED_KEYS_MAP = new InjectionToken<AnalyticsExpectedKeysMap>('ANALYTICS_EXPECTED_KEYS_MAP');

export type AnalyticsDictionaries = Readonly<Record<string, Record<string, string>>>;
export const ANALYTICS_DICTIONARIES = new InjectionToken<AnalyticsDictionaries>('ANALYTICS_DICTIONARIES');
