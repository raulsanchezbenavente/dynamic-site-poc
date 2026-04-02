import { Injectable } from '@angular/core';

import { AnalyticsEngine } from '../enums/analytics-engines.enum';
import { AnalyticsConfig, AnalyticsEngineConfig } from '../interfaces/analytics-config.interface';
import { AnalyticsEngineStrategy } from '../interfaces/analytics-engine-strategy.interfaces';
import { AnalyticsEvent } from '../interfaces/events/analytics-event.interfaces';
import { AmplitudeService } from '../strategies/amplitude.strategy';
import { GoogleAnalyticsService } from '../strategies/google-analytics.strategy';
import { GTMService } from '../strategies/gtm-analytics.strategy';
import { YandexMetricaService } from '../strategies/yandex-analytics.strategy';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private config?: AnalyticsConfig;
  private readonly engines = new Map<AnalyticsEngine, AnalyticsEngineStrategy>();

  constructor(
    private readonly googleAnalytics: GoogleAnalyticsService,
    private readonly gtm: GTMService,
    private readonly amplitude: AmplitudeService,
    private readonly yandex: YandexMetricaService
  ) {
    this.engines.set(AnalyticsEngine.GOOGLE_ANALYTICS, this.googleAnalytics);
    this.engines.set(AnalyticsEngine.GOOGLE_TAG_MANAGER, this.gtm);
    this.engines.set(AnalyticsEngine.AMPLITUDE, this.amplitude);
    this.engines.set(AnalyticsEngine.YANDEX_METRICA, this.yandex);
  }

  public setConfig(analyticsConfig: AnalyticsConfig): void {
    this.config = analyticsConfig;
  }

  public trackEvent(event: AnalyticsEvent): void {
    if (this.config) {
      const enginesToUse = this.getEnginesToUse(event);
      for (const engineConfig of enginesToUse) {
        const service = this.engines.get(engineConfig.engine);
        if (service) {
          service.trackEvent(event, engineConfig.accounts || undefined);
        } else {
          console.warn(`No service found for engine: ${engineConfig.engine}`);
        }
      }
    } else {
      console.warn('Analytics configuration is not set.');
    }
  }

  private getEnginesToUse(event: AnalyticsEvent): AnalyticsEngineConfig[] {
    let enginesToUse: AnalyticsEngineConfig[] = [...this.config!.analyticsEngines];
    const exception = this.config!.analyticsExceptions?.find((ex) => ex.eventName === event.eventName);

    if (exception) {
      const hasExcludeRule = !(exception.includeDefaultEngines ?? false);

      if (hasExcludeRule) {
        enginesToUse = exception.analyticsEngines.map(({ engine, accounts }) => ({ engine, accounts }));
      } else {
        const uniqueEngines = new Map(enginesToUse.map((e) => [e.engine, e]));
        for (const { engine, accounts } of exception.analyticsEngines) {
          if (!uniqueEngines.has(engine)) {
            uniqueEngines.set(engine, { engine, accounts });
          }
        }
        enginesToUse = Array.from(uniqueEngines.values());
      }
    }
    return enginesToUse;
  }
}
