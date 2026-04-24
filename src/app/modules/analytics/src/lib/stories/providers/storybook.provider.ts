import { ANALYTICS_DICTIONARIES, ANALYTICS_EXPECTED_EVENTS, ANALYTICS_EXPECTED_KEYS_MAP } from '@dcx/module/analytics';
import { ANALYTICS_INTERFACES_PROPERTIES, AnalyticsBusiness, AnalyticsEventType } from '@dcx/ui/business-common';
import { PointOfSaleService } from '@dcx/ui/libs';
import { PosServiceFake } from '@dcx/ui/mock-repository';

import { AnalyticsService } from '../../services/analytics.service';
import { AmplitudeService } from '../../strategies/amplitude.strategy';
import { GoogleAnalyticsService } from '../../strategies/google-analytics.strategy';
import { GTMService } from '../../strategies/gtm-analytics.strategy';
import { AnalyticsStrategiesService } from '../../strategies/services/analytics-strategies.service';
import { YandexMetricaService } from '../../strategies/yandex-analytics.strategy';
import { AnalyticsGaGtmColivingRewriteService } from '../../workdarounds/GA-GTM-coliving/analytics-ga-gtm-coliving-rewrite.service';
import { PageViewStrategyService } from '../../workdarounds/page-view-strategy/page-view-strategy.service';

export const STORYBOOK_PROVIDERS = [
  AnalyticsService,
  AnalyticsGaGtmColivingRewriteService,
  PageViewStrategyService,
  AnalyticsStrategiesService,
  AmplitudeService,
  GoogleAnalyticsService,
  GTMService,
  YandexMetricaService,
  {
    provide: PointOfSaleService,
    useClass: PosServiceFake,
  },
  {
    provide: ANALYTICS_EXPECTED_KEYS_MAP,
    useValue: ANALYTICS_INTERFACES_PROPERTIES,
  },
  {
    provide: ANALYTICS_EXPECTED_EVENTS,
    useValue: AnalyticsEventType,
  },
  {
    provide: ANALYTICS_DICTIONARIES,
    useValue: AnalyticsBusiness,
  },
];
