import { AnalyticsEngine } from '../../../enums/analytics-engines.enum';
import type { AnalyticsConfig } from '../../../interfaces/analytics-config.interface';

export const ANALYTICS_CONFIG: AnalyticsConfig = {
  analyticsEngines: [
    { engine: AnalyticsEngine.GOOGLE_ANALYTICS, accounts: ['G-522JDQ9J50', 'G-R852K86P67'] },
    { engine: AnalyticsEngine.GOOGLE_TAG_MANAGER },
    { engine: AnalyticsEngine.AMPLITUDE },
    { engine: AnalyticsEngine.YANDEX_METRICA, accounts: ['12345678', '87654321'] },
  ],
  analyticsExceptions: [
    {
      eventName: 'purchase',
      analyticsEngines: [
        {
          engine: AnalyticsEngine.GOOGLE_ANALYTICS,
        },
      ],
    },
    {
      eventName: 'view_item',
      analyticsEngines: [
        {
          engine: AnalyticsEngine.GOOGLE_ANALYTICS,
          accounts: ['G-522JDQ9J50'],
        },
      ],
      includeDefaultEngines: false,
    },
    {
      eventName: 'select_item',
      analyticsEngines: [
        {
          engine: AnalyticsEngine.GOOGLE_TAG_MANAGER,
        },
      ],
      includeDefaultEngines: true,
    },
    {
      eventName: 'add_to_cart',
      analyticsEngines: [
        {
          engine: AnalyticsEngine.GOOGLE_TAG_MANAGER,
        },
        {
          engine: AnalyticsEngine.AMPLITUDE,
        },
      ],
      includeDefaultEngines: false,
    },
    {
      eventName: 'ibe_async',
      analyticsEngines: [
        {
          engine: AnalyticsEngine.GOOGLE_ANALYTICS,
          accounts: ['G-R852K86P67'],
        },
      ],
      includeDefaultEngines: false,
    },
  ],
};
