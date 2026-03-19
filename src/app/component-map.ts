import { Type } from '@angular/core';

export type BlockComponentLoader = () => Promise<Type<unknown>>;

export const componentMap: Record<string, BlockComponentLoader> = {
  login: () => import('@fake-blocks-test').then((m) => m.CustomerLoginComponent),
  header: () => import('@fake-blocks-test').then((m) => m.HeaderComponent),
  banner: () => import('@fake-blocks-test').then((m) => m.BannerComponent),
  search: () => import('@fake-blocks-test').then((m) => m.SearchComponent),
  footer: () => import('@fake-blocks-test').then((m) => m.FooterComponent),
  results: () => import('@fake-blocks-test').then((m) => m.ResultsComponent),
  'baggage-selection': () => import('@fake-blocks-test').then((m) => m.BaggageSelectionComponent),
  seatmap: () => import('@fake-blocks-test').then((m) => m.SeatmapComponent),
  'payment-methods': () => import('@fake-blocks-test').then((m) => m.PaymentMethodsComponent),
  'payment-success': () => import('@fake-blocks-test').then((m) => m.PaymentSuccessComponent),
  explanation: () => import('@fake-blocks-test').then((m) => m.ExplanationComponent),
  // Avianca
  tabs: () => import('@dynamic-composite').then((m) => m.DsTabsComponent),
  loyaltyOverviewCard_uiplus: () => import('@fake-blocks-avianca').then((m) => m.LoyaltyOverviewCardComponent),
  CorporateMainHeaderBlock_uiplus: () => import('@fake-blocks-avianca').then((m) => m.MainHeaderComponent),
  accountProfile_uiplus: () => import('@fake-blocks-avianca').then((m) => m.AccountProfileComponent),
  accountSettings_uiplus: () => import('@fake-blocks-avianca').then((m) => m.AccountSettingsComponent),
  personalData_uiplus: () => import('@fake-blocks-avianca').then((m) => m.PersonalDataComponent),
  findBookings_uiplus: () => import('@fake-blocks-avianca').then((m) => m.FindBookingsComponent),
  eliteStatus_uiplus: () => import('@fake-blocks-avianca').then((m) => m.EliteStatusComponent),
  CorporateMainFooterBlock_uiplus: () => import('@fake-blocks-avianca').then((m) => m.MainFooterComponent),
  SearchComponentBlock_uiplus: () => import('@fake-blocks-avianca').then((m) => m.SearchComponent),
  AdsComponentBlock_uiplus: () => import('@fake-blocks-avianca').then((m) => m.AdsComponent),
  bookingHeaderComponent_uiplus: () => import('@fake-blocks-avianca').then((m) => m.BookingHeaderComponent),
  bookingFooterComponent_uiplus: () => import('@fake-blocks-avianca').then((m) => m.BookingFooterComponent),
  results_uiplus: () => import('@fake-blocks-avianca').then((m) => m.ResultsComponent),
  extra_uiplus: () => import('@fake-blocks-avianca').then((m) => m.ExtraComponent),
  payment_uiplus: () => import('@fake-blocks-avianca').then((m) => m.PaymentComponent),
  thankYou_uiplus: () => import('@fake-blocks-avianca').then((m) => m.ThankYouComponent),
};

const resolvedComponentCache = new Map<string, Type<unknown>>();
const pendingComponentCache = new Map<string, Promise<Type<unknown> | null>>();

export const loadBlockComponent = (key: string): Promise<Type<unknown> | null> => {
  const cached = resolvedComponentCache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = pendingComponentCache.get(key);
  if (pending) return pending;

  const loader = componentMap[key];
  if (!loader) return Promise.resolve(null);

  const loadPromise = loader()
    .then((component) => {
      resolvedComponentCache.set(key, component);
      return component;
    })
    .catch(() => null)
    .finally(() => {
      pendingComponentCache.delete(key);
    });

  pendingComponentCache.set(key, loadPromise);
  return loadPromise;
};

const collectComponentKeys = (value: unknown, result: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectComponentKeys(item, result);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const component = record['component'];
  if (typeof component === 'string' && component.trim()) {
    result.add(component);
  }

  collectComponentKeys(record['rows'], result);
  collectComponentKeys(record['cols'], result);
  collectComponentKeys(record['tabs'], result);
  collectComponentKeys(record['components'], result);
};

export const preloadLayoutComponents = async (layout: unknown): Promise<void> => {
  const keys = new Set<string>();
  collectComponentKeys(layout, keys);
  await Promise.allSettled(Array.from(keys, (key) => loadBlockComponent(key)));
};
