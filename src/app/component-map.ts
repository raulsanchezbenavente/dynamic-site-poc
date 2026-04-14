import { Type } from '@angular/core';

export type BlockComponentLoader = () => Promise<Type<unknown>>;

export const componentMap: Record<string, BlockComponentLoader> = {
  // CORE
  multiTabBlock_uiplus: () => import('@dynamic-composite').then((m) => m.DsTabsComponent),
  rteBlock_uiplus: () =>
    import('./modules/dynamic-composite/core-blocks/rte-injector/rte-injector.component').then(
      (m) => m.RteInjectorComponent
    ),

  //Avianca
  CorporateMainHeaderBlock_uiplus: () =>
    import('./modules/main-header/src/lib/main-header.component').then((m) => m.CorporateMainHeaderComponent),
  CorporateMainFooterBlock_uiplus: () =>
    import('./modules/footer-main/src/lib/footer-main.component').then((m) => m.CorporateFooterMainComponent),
  BreadcrumbBlock_uiplus: () =>
    import('./modules/breadcrumb/src/lib/breadcrumb.component').then((m) => m.BreadcrumbComponent),
  accountProfile_uiplus: () =>
    import('./modules/account-profile/src/lib/account-profile.component').then((m) => m.AccountProfileComponent),
  // Avianca Fake
  loyaltyOverviewCard_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/loyalty-card/loyalty-card.component').then(
      (m) => m.LoyaltyOverviewCardComponent
    ),
  CorporateMainHeaderBlock_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/main-header/main-header.component').then((m) => m.MainHeaderComponent),
  accountProfile_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/account-profile/account-profile.component').then(
      (m) => m.AccountProfileComponent
    ),
  accountSettings_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/account-settings/account-settings.component').then(
      (m) => m.AccountSettingsComponent
    ),
  personalData_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/personal-data/personal-data.component').then((m) => m.PersonalDataComponent),
  findBookings_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/find-bookings/find-bookings.component').then((m) => m.FindBookingsComponent),
  eliteStatus_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/elite-status/elite-status.component').then((m) => m.EliteStatusComponent),
  CorporateMainFooterBlock_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/main-footer/main-footer.component').then((m) => m.MainFooterComponent),
  SearchComponentBlock_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/search/search.component').then((m) => m.SearchComponent),
  AdsComponentBlock_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/ads/ads.component').then((m) => m.AdsComponent),
  bookingHeaderComponent_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/booking-header/booking-header.component').then(
      (m) => m.BookingHeaderComponent
    ),
  bookingFooterComponent_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/booking-footer/booking-footer.component').then(
      (m) => m.BookingFooterComponent
    ),
  results_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/results/results.component').then((m) => m.ResultsComponent),
  extra_uiplus_EX: () => import('./modules/fake-blocks-avianca/extra/extra.component').then((m) => m.ExtraComponent),
  payment_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/payment/payment.component').then((m) => m.PaymentComponent),
  thankYou_uiplus_EX: () =>
    import('./modules/fake-blocks-avianca/thank-you/thank-you.component').then((m) => m.ThankYouComponent),

  // Test examples
  login: () => import('./modules/fake-blocks-test/customer-login').then((m) => m.CustomerLoginComponent),
  header: () => import('./modules/fake-blocks-test/header.component').then((m) => m.HeaderComponent),
  banner: () => import('./modules/fake-blocks-test/banner.component').then((m) => m.BannerComponent),
  search: () => import('./modules/fake-blocks-test/search.component').then((m) => m.SearchComponent),
  footer: () => import('./modules/fake-blocks-test/footer.component').then((m) => m.FooterComponent),
  results: () => import('./modules/fake-blocks-test/results.component').then((m) => m.ResultsComponent),
  'baggage-selection': () =>
    import('./modules/fake-blocks-test/baggage-selection').then((m) => m.BaggageSelectionComponent),
  seatmap: () => import('./modules/fake-blocks-test/seatmap.component').then((m) => m.SeatmapComponent),
  'payment-methods': () =>
    import('./modules/fake-blocks-test/payment-methods.component').then((m) => m.PaymentMethodsComponent),
  'payment-success': () =>
    import('./modules/fake-blocks-test/payment-success.component').then((m) => m.PaymentSuccessComponent),
  explanation: () => import('./modules/fake-blocks-test/explanation.component').then((m) => m.ExplanationComponent),

  // Games
  'icon-hunter_uiplus_EX': () =>
    import('./modules/games/icon-hunter/icon-hunter.component').then((m) => m.IconHunterUiplusComponent),
  tetris_uiplus_EX: () => import('./modules/games/tetris/tetris.component').then((m) => m.TetrisUiplusComponent),
};

export const configInputAliases: Record<string, string> = {
  loyaltyOverviewCard_uiplus_EX: 'colorConfig',
  CorporateMainHeaderBlock_uiplus_EX: 'colorConfig',
  CorporateMainHeaderBlock_uiplus: 'baseConfig',
  CorporateMainFooterBlock_uiplus: 'baseConfig',
  BreadcrumbBlock_uiplus: 'baseConfig',
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

export const blockComponentRegistry = {
  componentMap,
  loadBlockComponent,
  getConfigInputName: (key: string): string | undefined => configInputAliases[key],
} as const;

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
