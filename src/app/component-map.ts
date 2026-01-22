import { CustomerLoginComponent } from './fake-blocks-components/test/customer-login';
import { HeaderComponent } from './fake-blocks-components/test/header.component';
import { BannerComponent } from './fake-blocks-components/test/banner.component';
import { SearchComponent } from './fake-blocks-components/test/search.component';
import { FooterComponent } from './fake-blocks-components/test/footer.component';
import { ResultsComponent } from './fake-blocks-components/test/results.component';
import { BaggageSelectionComponent } from './fake-blocks-components/test/baggage-selection';
import { SeatmapComponent } from './fake-blocks-components/test/seatmap.component';
import { PaymentMethodsComponent } from './fake-blocks-components/test/payment-methods.component';
import { PaymentSuccessComponent } from './fake-blocks-components/test/payment-success.component';
import { Type } from '@angular/core';
import { ExplanationComponent } from './fake-blocks-components/test/explanation.component';
import { DsTabsComponent } from './dynamic-composite/dynamic-tabs/tabs.component';
import { LoyaltyOverviewCardComponent } from './fake-blocks-components/avianca/loyalty-card.component';
import { MainHeaderComponent } from './fake-blocks-components/avianca/main-banner.component';
import { AccountProfileComponent } from './fake-blocks-components/avianca/account-profile.component';
import { FindBookingsComponent } from './fake-blocks-components/avianca/find-bookings.component';
import { MainFooterComponent } from './fake-blocks-components/avianca/main-footer.component';

export const componentMap: Record<string, Type<any>> = {
  login: CustomerLoginComponent,
  header: HeaderComponent,
  banner: BannerComponent,
  search: SearchComponent,
  footer: FooterComponent,
  results: ResultsComponent,
  'baggage-selection': BaggageSelectionComponent,
  seatmap: SeatmapComponent,
  'payment-methods': PaymentMethodsComponent,
  'payment-success': PaymentSuccessComponent,
  'explanation': ExplanationComponent,
  tabs: DsTabsComponent,
  loyaltyOverviewCard_uiplus: LoyaltyOverviewCardComponent,
  CorporateMainHeaderBlock_uiplus: MainHeaderComponent,
  accountProfile_uiplus:AccountProfileComponent,
  findBookings_uiplus: FindBookingsComponent,
  CorporateMainFooterBlock_uiplus: MainFooterComponent,
};

