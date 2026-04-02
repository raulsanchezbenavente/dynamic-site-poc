import { AnalyticsDataType } from './analytics-data-type.enum';
import { AnalyticsEventCategory } from './analytics-event-category.enum';
import { AnalyticsPages } from './analytics-pages.enum';
import { AnalyticsUserType } from './analytics-user-type.enum';

export const AnalyticsBusiness = {
  dataType: AnalyticsDataType,
  userType: AnalyticsUserType,
  eventCategory: AnalyticsEventCategory,
  pages: AnalyticsPages,
} as const;
