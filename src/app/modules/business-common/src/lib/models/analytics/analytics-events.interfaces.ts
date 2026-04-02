import { AnalyticsEvent } from '@dcx/module/analytics';

import { AnalyticsEventType } from '../../enums/analytics/analytics-events.enum';
import { AnalyticsEventCategory } from '../../enums/analytics/business/analytics-event-category.enum';
import { AnalyticsUserType } from '../../enums/analytics/business/analytics-user-type.enum';

export type AppAnalyticsEvent = AnalyticsEvent<AnalyticsEventType>;

export interface PageViewAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.PAGE_VIEW;
  data: {
    country_pos: string;
    language: string;
    language_nav: string;
    time_zone: string;
    user_hour: string;
    user_type: AnalyticsUserType;
    user_id: string;
    ga_session_id: number;
    page_location: string;
    page_referrer: string;
    page_title: string;
    page_name?: string;
    payment_provider?: string;
    screen_resolution: string;
  };
}

export interface PurchaseAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.PURCHASE;
  data: {
    currency?: string;
    value?: number;
    flow?: string;
    items?: any[];
  };
}

export interface ViewItemAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.VIEW_ITEM;
  data: {
    item_list_id?: string;
    item_list_name?: string;
    coupon?: string;
    value?: number;
    currency?: string;
    items?: any[];
  };
}

export interface SelectItemAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.SELECT_ITEM;
  data: {
    item_list_id?: string;
    item_list_name?: string;
    coupon?: string;
    currency?: string;
    items?: any[];
  };
}

export interface AddToCartAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.ADD_TO_CART;
  data: {
    currency?: string;
    flow?: string;
    value?: number;
    paxADTLength?: number;
    paxCHDLength?: number;
    paxINFLength?: number;
    tripType?: string;
    items?: any[];
  };
}

export interface IbeAsyncAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.IBE_ASYNC;
  data: {
    element_id?: string;
    action?: string;
    business_process?: string;
  };
}

export interface IbeErrorAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.IBE_ERROR;
  data: {
    error_type?: string;
    error_code?: string;
    error_url?: string;
  };
}

export interface PageErrorAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.PAGE_ERROR;
  data: {
    error_desc: string;
    error_id: string;
    error_pnr: string;
    language: string;
    page_location: string;
    page_referrer: string;
    page_title: string;
    page_name: string;
    screen_resolution: string;
    user_id: string;
    user_type: AnalyticsUserType;
    event_category: string;
  };
}

export interface ErrorEventAnalyticsEvent extends AnalyticsEvent {
  eventName: AnalyticsEventType.ERROR_POPUP;
  data: {
    event_category: AnalyticsEventCategory;
    page_location: string;
    page_referrer: string;
    page_title: string;
    language: string;
    screen_resolution: string;
    user_type: AnalyticsUserType;
    user_id: string;
    page_name: string;
    error_pnr: string;
    error_desc: string;
    error_id: string;
  };
}

// Remember to update this in any interface change!
export const ANALYTICS_INTERFACES_PROPERTIES: Record<AnalyticsEventType, string[]> = {
  [AnalyticsEventType.PAGE_VIEW]: [
    'country_pos',
    'language',
    'language_nav',
    'time_zone',
    'user_hour',
    'user_type',
    'user_id',
    'ga_session_id',
    'page_location',
    'page_referrer',
    'page_title',
    'screen_resolution',
  ],
  [AnalyticsEventType.CHECKOUT]: [],
  [AnalyticsEventType.PURCHASE]: ['currency', 'value', 'items'],
  [AnalyticsEventType.ADD_TO_CART]: [
    'currency',
    'flow',
    'value',
    'paxADTLength',
    'paxCHDLength',
    'paxINFLength',
    'tripType',
    'items',
  ],
  [AnalyticsEventType.REMOVE_FROM_CART]: [],
  [AnalyticsEventType.VIEW_ITEM_LIST]: [],
  [AnalyticsEventType.ADD_PAYMENT_INFO]: [],
  [AnalyticsEventType.VIEW_ITEM]: ['item_list_id', 'item_list_name', 'coupon', 'value', 'currency', 'items'],
  [AnalyticsEventType.SELECT_ITEM]: ['item_list_id', 'item_list_name', 'coupon', 'currency', 'items'],
  [AnalyticsEventType.SELECT_PROMOTION]: [],
  [AnalyticsEventType.IBE_ASYNC]: ['element_id', 'action', 'business_process'],
  [AnalyticsEventType.IBE_ERROR]: ['error_type', 'error_code', 'error_url'],
  [AnalyticsEventType.PAGE_ERROR]: [
    'error_desc',
    'error_id',
    'error_pnr',
    'language',
    'page_location',
    'page_referrer',
    'page_title',
    'page_name',
    'screen_resolution',
    'user_id',
    'user_type',
    'event_category',
  ],
  [AnalyticsEventType.ERROR_POPUP]: [
    'event_category',
    'page_location',
    'page_referrer',
    'page_title',
    'language',
    'screen_resolution',
    'user_type',
    'user_id',
    'page_name',
    'error_pnr',
    'error_desc',
    'error_id',
  ],
};
