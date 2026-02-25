import { Type } from '@angular/core';

export type ComponentLoader = () => Promise<Type<any>>;

export const componentMap: Record<string, ComponentLoader> = {
  login: () => import('./fake-blocks-components/test/customer-login').then((m) => m.CustomerLoginComponent),
  header: () => import('./fake-blocks-components/test/header.component').then((m) => m.HeaderComponent),
  banner: () => import('./fake-blocks-components/test/banner.component').then((m) => m.BannerComponent),
  search: () => import('./fake-blocks-components/test/search.component').then((m) => m.SearchComponent),
  footer: () => import('./fake-blocks-components/test/footer.component').then((m) => m.FooterComponent),
  results: () => import('./fake-blocks-components/test/results.component').then((m) => m.ResultsComponent),
  'baggage-selection': () =>
    import('./fake-blocks-components/test/baggage-selection').then((m) => m.BaggageSelectionComponent),
  seatmap: () => import('./fake-blocks-components/test/seatmap.component').then((m) => m.SeatmapComponent),
  'payment-methods': () =>
    import('./fake-blocks-components/test/payment-methods.component').then((m) => m.PaymentMethodsComponent),
  'payment-success': () =>
    import('./fake-blocks-components/test/payment-success.component').then((m) => m.PaymentSuccessComponent),
  explanation: () => import('./fake-blocks-components/test/explanation.component').then((m) => m.ExplanationComponent),
  // Avianca
  tabs: () => import('./dynamic-composite/dynamic-tabs/tabs.component').then((m) => m.DsTabsComponent),
  loyaltyOverviewCard_uiplus: () =>
    import('./fake-blocks-components/avianca/loyalty-card/loyalty-card.component').then(
      (m) => m.LoyaltyOverviewCardComponent
    ),
  CorporateMainHeaderBlock_uiplus: () =>
    import('./fake-blocks-components/avianca/main-header/main-header.component').then((m) => m.MainHeaderComponent),
  accountProfile_uiplus: () =>
    import('./fake-blocks-components/avianca/account-profile/account-profile.component').then(
      (m) => m.AccountProfileComponent
    ),
  accountSettings_uiplus: () =>
    import('./fake-blocks-components/avianca/account-settings/account-settings.component').then(
      (m) => m.AccountSettingsComponent
    ),
  personalData_uiplus: () =>
    import('./fake-blocks-components/avianca/personal-data/personal-data.component').then(
      (m) => m.PersonalDataComponent
    ),
  findBookings_uiplus: () =>
    import('./fake-blocks-components/avianca/find-bookings/find-bookings.component').then(
      (m) => m.FindBookingsComponent
    ),
  eliteStatus_uiplus: () =>
    import('./fake-blocks-components/avianca/elite-status/elite-status.component').then((m) => m.EliteStatusComponent),
  CorporateMainFooterBlock_uiplus: () =>
    import('./fake-blocks-components/avianca/main-footer/main-footer.component').then((m) => m.MainFooterComponent),
  SearchComponentBlock_uiplus: () =>
    import('./fake-blocks-components/avianca/search/search.component').then((m) => m.SearchComponent),
  AdsComponentBlock_uiplus: () =>
    import('./fake-blocks-components/avianca/ads/ads.component').then((m) => m.AdsComponent),
  bookingHeaderComponent_uiplus: () =>
    import('./fake-blocks-components/avianca/booking-header/booking-header.component').then(
      (m) => m.BookingHeaderComponent
    ),
  bookingFooterComponent_uiplus: () =>
    import('./fake-blocks-components/avianca/booking-footer/booking-footer.component').then(
      (m) => m.BookingFooterComponent
    ),
  results_uiplus: () =>
    import('./fake-blocks-components/avianca/results/results.component').then((m) => m.ResultsComponent),
  extra_uiplus: () => import('./fake-blocks-components/avianca/extra/extra.component').then((m) => m.ExtraComponent),
  payment_uiplus: () =>
    import('./fake-blocks-components/avianca/payment/payment.component').then((m) => m.PaymentComponent),
  thankYou_uiplus: () =>
    import('./fake-blocks-components/avianca/thank-you/thank-you.component').then((m) => m.ThankYouComponent),
};
