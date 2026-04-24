import {
  AnalyticsConfig,
  AnalyticsEngine,
  AnalyticsEngineConfig,
  AnalyticsExceptionConfig,
} from '@dcx/module/analytics';
import { CmsConfigModels } from '@dcx/module/api-clients';
import { AnalyticsEventType } from '@dcx/ui/business-common';

const EVENT_TYPE_MAP: Record<CmsConfigModels.AnalyticsEventType, AnalyticsEventType> = {
  [CmsConfigModels.AnalyticsEventType.Page_view]: AnalyticsEventType.PAGE_VIEW,
  [CmsConfigModels.AnalyticsEventType.Checkout]: AnalyticsEventType.CHECKOUT,
  [CmsConfigModels.AnalyticsEventType.Purchase]: AnalyticsEventType.PURCHASE,
  [CmsConfigModels.AnalyticsEventType.Add_to_cart]: AnalyticsEventType.ADD_TO_CART,
  [CmsConfigModels.AnalyticsEventType.Remove_from_cart]: AnalyticsEventType.REMOVE_FROM_CART,
  [CmsConfigModels.AnalyticsEventType.View_item_list]: AnalyticsEventType.VIEW_ITEM_LIST,
  [CmsConfigModels.AnalyticsEventType.Add_payment_info]: AnalyticsEventType.ADD_PAYMENT_INFO,
  [CmsConfigModels.AnalyticsEventType.View_item]: AnalyticsEventType.VIEW_ITEM,
  [CmsConfigModels.AnalyticsEventType.Select_item]: AnalyticsEventType.SELECT_ITEM,
  [CmsConfigModels.AnalyticsEventType.Select_promotion]: AnalyticsEventType.SELECT_PROMOTION,
  [CmsConfigModels.AnalyticsEventType.Ibe_async]: AnalyticsEventType.IBE_ASYNC,
  [CmsConfigModels.AnalyticsEventType.Ibe_error]: AnalyticsEventType.IBE_ERROR,
  [CmsConfigModels.AnalyticsEventType.Error_popup]: AnalyticsEventType.ERROR_POPUP,
};

export class AnalyticsSettingsAdapter {
  public static adaptAnalyticsConfig(
    apiConfig: CmsConfigModels.AnalyticsConfig | undefined
  ): AnalyticsConfig | undefined {
    if (!apiConfig) {
      return undefined;
    }

    return {
      analyticsEngines: apiConfig.analyticsEngines?.map((engine) => this.mapEngineConfig(engine)) || [],
      analyticsExceptions: apiConfig.analyticsExceptions?.map((exception) => this.mapExceptionConfig(exception)),
    };
  }

  private static mapEngineConfig(apiEngine: CmsConfigModels.AnalyticsEngineConfig): AnalyticsEngineConfig {
    return {
      engine: apiEngine.engine as unknown as AnalyticsEngine,
      accounts: apiEngine.accounts,
    };
  }

  private static mapExceptionConfig(apiException: CmsConfigModels.AnalyticsExceptionConfig): AnalyticsExceptionConfig {
    return {
      eventName: this.mapEventType(apiException.eventName!),
      analyticsEngines: apiException.analyticsEngines?.map((engine) => this.mapEngineConfig(engine)) || [],
      includeDefaultEngines: apiException.includeDefaultEngines,
    };
  }

  private static mapEventType(apiEventType: CmsConfigModels.AnalyticsEventType): AnalyticsEventType {
    return EVENT_TYPE_MAP[apiEventType];
  }
}
