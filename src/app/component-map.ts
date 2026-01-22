import { CustomerLoginComponent } from './fake-blocks-components/customer-login';
import { HeaderComponent } from './fake-blocks-components/header.component';
import { BannerComponent } from './fake-blocks-components/banner.component';
import { SearchComponent } from './fake-blocks-components/search.component';
import { FooterComponent } from './fake-blocks-components/footer.component';
import { ResultsComponent } from './fake-blocks-components/results.component';
import { BaggageSelectionComponent } from './fake-blocks-components/baggage-selection';
import { SeatmapComponent } from './fake-blocks-components/seatmap.component';
import { PaymentMethodsComponent } from './fake-blocks-components/payment-methods.component';
import { PaymentSuccessComponent } from './fake-blocks-components/payment-success.component';
import { Type } from '@angular/core';
import { ExplanationComponent } from './fake-blocks-components/explanation.component';
import { DsTabsComponent } from './dynamic-composite/dynamic-tabs/tabs.component';

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
};

