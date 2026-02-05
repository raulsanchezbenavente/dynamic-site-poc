import { Type } from '@angular/core';

import { DsTabsComponent } from './dynamic-composite/dynamic-tabs/tabs.component';
import { AccountProfileComponent } from './fake-blocks-components/avianca/account-profile/account-profile.component';
import { AccountSettingsComponent } from './fake-blocks-components/avianca/account-settings/account-settings.component';
import { AdsComponent } from './fake-blocks-components/avianca/ads/ads.component';
import { EliteStatusComponent } from './fake-blocks-components/avianca/elite-status/elite-status.component';
import { ExtraComponent } from './fake-blocks-components/avianca/extra/extra.component';
import { FindBookingsComponent } from './fake-blocks-components/avianca/find-bookings/find-bookings.component';
import { LoyaltyOverviewCardComponent } from './fake-blocks-components/avianca/loyalty-card/loyalty-card.component';
import { MainFooterComponent } from './fake-blocks-components/avianca/main-footer/main-footer.component';
import { MainHeaderComponent } from './fake-blocks-components/avianca/main-header/main-header.component';
import { PaymentComponent } from './fake-blocks-components/avianca/payment/payment.component';
import { PersonalDataComponent } from './fake-blocks-components/avianca/personal-data/personal-data.component';
import { ResultsComponent } from './fake-blocks-components/avianca/results/results.component';
import { SearchComponent } from './fake-blocks-components/avianca/search/search.component';
import { BaggageSelectionComponent } from './fake-blocks-components/test/baggage-selection';
import { BannerComponent } from './fake-blocks-components/test/banner.component';
import { CustomerLoginComponent } from './fake-blocks-components/test/customer-login';
import { ExplanationComponent } from './fake-blocks-components/test/explanation.component';
import { FooterComponent } from './fake-blocks-components/test/footer.component';
import { HeaderComponent } from './fake-blocks-components/test/header.component';
import { PaymentMethodsComponent } from './fake-blocks-components/test/payment-methods.component';
import { PaymentSuccessComponent } from './fake-blocks-components/test/payment-success.component';
import { ResultsComponent as ResultsComponentTest } from './fake-blocks-components/test/results.component';
import { SearchComponent as SearchComponentTest } from './fake-blocks-components/test/search.component';
import { SeatmapComponent } from './fake-blocks-components/test/seatmap.component';

export const componentMap: Record<string, Type<any>> = {
  login: CustomerLoginComponent,
  header: HeaderComponent,
  banner: BannerComponent,
  search: SearchComponentTest,
  footer: FooterComponent,
  results: ResultsComponentTest,
  'baggage-selection': BaggageSelectionComponent,
  seatmap: SeatmapComponent,
  'payment-methods': PaymentMethodsComponent,
  'payment-success': PaymentSuccessComponent,
  explanation: ExplanationComponent,
  // Avianca
  tabs: DsTabsComponent,
  loyaltyOverviewCard_uiplus: LoyaltyOverviewCardComponent,
  CorporateMainHeaderBlock_uiplus: MainHeaderComponent,
  accountProfile_uiplus: AccountProfileComponent,
  accountSettings_uiplus: AccountSettingsComponent,
  personalData_uiplus: PersonalDataComponent,
  findBookings_uiplus: FindBookingsComponent,
  eliteStatus_uiplus: EliteStatusComponent,
  CorporateMainFooterBlock_uiplus: MainFooterComponent,
  SearchComponentBlock_uiplus: SearchComponent,
  AdsComponentBlock_uiplus: AdsComponent,
  results_uiplus: ResultsComponent,
  extra_uiplus: ExtraComponent,
  payment_uiplus: PaymentComponent,
};
