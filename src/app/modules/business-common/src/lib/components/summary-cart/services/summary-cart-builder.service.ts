import { inject, Injectable } from '@angular/core';
import {
  ButtonConfig,
  ButtonStyles,
  JourneyType,
  SessionData,
  SummaryTypologyBuilderConfig,
  SummaryTypologyTemplate,
} from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { SummaryCardBuilderInterface } from '../interfaces/summary-cart-builder.interface';
import { SummaryCartConfig } from '../models/summary-cart.config';

@Injectable()
export class SummaryCartBuilderService implements SummaryCardBuilderInterface {
  private readonly translate = inject(TranslateService);

  public getData(session: SessionData): SummaryCartConfig {
    const inbound = session.session.booking.journeys[1]
      ? { journey: { ...session.session.booking.journeys[1], journeyType: JourneyType.INBOUND } }
      : { journey: undefined };

    return {
      toggleButton: this.getButtonConfig(),
      details: {
        summaryTypologyConfig: this.getSummaryTypologyConfig(session),
        journeys: {
          outbound: { journey: { ...session.session.booking.journeys[0], journeyType: JourneyType.OUTBOUND } },
          inbound: inbound,
        },
      },
    } as SummaryCartConfig;
  }

  private getButtonConfig(): ButtonConfig {
    return {
      label: '',
      icon: {
        name: 'cart',
      },
      layout: {
        style: ButtonStyles.SECONDARY,
      },
      ariaAttributes: {
        ariaLabel: this.translate.instant('Basket.Book_Summary_Title'),
      },
    };
  }

  private getSummaryTypologyConfig(session: SessionData): SummaryTypologyBuilderConfig {
    return {
      showInfoForSelectedFlight: false,
      voucherMask: 'Voucher',
      useTypologyItem: true,
      showPaxGroup: true,
      useStaticDetails: true,
      isCollapsible: true,
      bookingSellTypeServices: [],
      displayPriceItemConcepts: true,
      summaryScopeView: SummaryTypologyTemplate.PER_BOOKING,
      booking: session.session.booking,
      translations: {},
    };
  }
}
