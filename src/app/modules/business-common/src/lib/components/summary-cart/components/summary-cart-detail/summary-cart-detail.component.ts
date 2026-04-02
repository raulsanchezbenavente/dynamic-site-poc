import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output } from '@angular/core';
import { DsButtonComponent, TagConfig } from '@dcx/ui/design-system';
import { ButtonConfig, ButtonStyles, JourneyVM, SummaryTotalConfig, SummaryTotalData } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { SummaryTotalComponent } from '../../../summary-total/summary-total.component';
import { SummaryTypologyBuilderComponent } from '../../../summary-typology-builder/summary-typology-builder.component';
import { SummaryCartItineraryConfig } from '../summary-cart-itinerary/models/summary-car-itinerary.config';
import { SummaryCartItineraryComponent } from '../summary-cart-itinerary/summary-cart-itinerary.component';

import { SummaryCartCurrencyConverterConfig } from './components/summary-cart-currency-converter/models/summary-cart-currency-converter.config';
import { getFareVisualInfo } from './mappers/mapper-total-amount';
import { SummaryCartDetailConfig } from './models/summary-cart-detail.config';

@Component({
  selector: 'summary-cart-detail',
  templateUrl: './summary-cart-detail.component.html',
  styleUrls: ['./styles/summary-cart-detail.styles.scss'],
  host: {
    class: 'summary-cart-detail',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SummaryCartItineraryComponent, SummaryTotalComponent, SummaryTypologyBuilderComponent, DsButtonComponent],
  standalone: true,
})
export class SummaryCartDetailComponent implements OnInit {
  public readonly translate = inject(TranslateService);
  public readonly config = input.required<SummaryCartDetailConfig>();
  public readonly closeButtonClicked = output<void>();

  public journeys = computed<{
    outbound?: SummaryCartItineraryConfig;
    inbound?: SummaryCartItineraryConfig;
  }>(() => {
    return {
      outbound: {
        journey: this.config().journeys.outbound!.journey,
        fareTagConfig: this.buildFareTagConfig(this.config().summaryTypologyConfig.booking.journeys[0]),
      },
      inbound: {
        journey: this.config().journeys.inbound!.journey,
        fareTagConfig: this.buildFareTagConfig(this.config().summaryTypologyConfig.booking.journeys[1]),
      },
    };
  });

  public currencyCoverterConfig: SummaryCartCurrencyConverterConfig = {
    culture: 'es-CO',
    currency: 'COP',
    isConversionSuccessful: true,
    price: 100,
    targetCurrency: 'CAD',
    convertedPrice: 90,
  };
  public closeButtonConfig!: ButtonConfig;
  public summaryTotalConfig!: SummaryTotalConfig;
  public summaryTotalData = computed<SummaryTotalData>(() => {
    const pricing = this.config().summaryTypologyConfig.booking.pricing;

    if (!pricing) {
      return { amount: 0, currency: '' };
    }

    return {
      amount: pricing.totalAmount,
      currency: pricing.currency,
    };
  });

  // --- Translation-driven setters (idempotent) ---
  protected setCloseButtonConfig(): void {
    this.closeButtonConfig = {
      label: this.translate.instant('Common.Close'),
      layout: { style: ButtonStyles.LINK },
    };
  }

  protected setSummaryTotalConfig(): void {
    this.summaryTotalConfig = {
      label: this.translate.instant('Common.Total'),
    } as SummaryTotalConfig;
  }

  // --- Lifecycle ---
  public ngOnInit(): void {
    // Initial computation
    this.setCloseButtonConfig();
    this.setSummaryTotalConfig();
  }

  public onCloseButtonClicked(): void {
    this.closeButtonClicked.emit();
  }

  private buildFareTagConfig(journey: JourneyVM): TagConfig {
    const { fareName, fareClass } = getFareVisualInfo(journey);
    return {
      text: fareName.toLowerCase(),
      cssClass: 'fare' + fareClass,
    };
  }
}
