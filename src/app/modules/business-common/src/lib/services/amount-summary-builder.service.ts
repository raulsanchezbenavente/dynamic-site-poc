import { inject, Injectable } from '@angular/core';
import { PricedItem } from '@dcx/ui/api-layer';
import { Booking, ButtonStyles, EnumServiceStatus, LayoutSize } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';

import { TranslationKeys } from '../components/amount-summary/enums/translation-keys.enum';
import { AmountSummaryVM } from '../components/amount-summary/models/amount-summary-vm.model';

/**
 * Service responsible for constructing AmountSummary view model data.
 *
 * This service encapsulates all logic related to building the AmountSummaryVM,
 * including calculating pending services totals and formatting display data.
 *
 * Responsibilities:
 * - Calculate pending services total amount
 * - Filter services by transaction status
 * - Build AmountSummaryVM with pricing and button configuration
 */
@Injectable({
  providedIn: 'root',
})
export class AmountSummaryBuilderService {
  private readonly translate = inject(TranslateService);

  /**
   * Builds the complete AmountSummaryVM with all necessary data for display.
   *
   * This method:
   * 1. Calculates the total of pending services
   * 2. Collects currency information from booking
   * 3. Prepares button configuration
   * 4. Formats price display data
   *
   * @param booking - The current booking with pricing and services data
   * @returns AmountSummaryVM ready for template binding
   */
  public buildAmountSummaryVM(booking: Booking | null): AmountSummaryVM {
    const pendingServicesTotal = this.calculatePendingServicesTotal(booking);
    const currency = booking?.pricing?.currency ?? 'COP';

    const vm: AmountSummaryVM = {
      primaryButton: {
        label: this.translate.instant(TranslationKeys.AmountSummary_Button_GoToPay),
        layout: {
          size: LayoutSize.MEDIUM,
          style: ButtonStyles.ACTION,
        },
      },
      secondaryButton: {
        isDisabled: true,
        label: ' ',
      },
      priceDisplay: {
        currency: currency,
        prefixText: this.translate.instant(TranslationKeys.AmountSummary_TotalAmountLabel),
        price: pendingServicesTotal,
      },
    };

    return vm;
  }

  /**
   * Calculates the total amount of pending services from the booking.
   *
   * This method:
   * 1. Filters services with PENDING or CONFIRMED (unpaid) transaction status
   * 2. Iterates through pricing breakdown categories
   * 3. Sums totalAmount for items matching pending services
   *
   * @param booking - The booking containing services and pricing breakdown
   * @returns The total amount of pending services, or 0 if none found
   */
  private calculatePendingServicesTotal(booking: Booking | null): number {
    const breakdown = booking?.pricing?.breakdown;
    if (!breakdown) {
      return 0;
    }

    const unpaidServiceIds = this.getUnpaidServiceIds(booking);

    const total = Object.values(breakdown).reduce((total: number, items: PricedItem[] | undefined) => {
      const itemsTotal =
        items?.reduce(
          (sum: number, item: PricedItem) => sum + (unpaidServiceIds.has(item.referenceId) ? item.totalAmount : 0),
          0
        ) ?? 0;
      return total + itemsTotal;
    }, 0);

    return total;
  }

  /**
   * Gets all service IDs that are unpaid (PENDING or CONFIRMED with pending payment).
   *
   * These are the services that the user needs to pay for:
   * - PENDING: Services added but not yet confirmed in PSS
   * - CONFIRMED: Services confirmed in PSS but payment not completed
   *
   * @param booking - The booking containing services
   * @returns Set of unpaid service IDs for efficient O(1) lookups
   */
  private getUnpaidServiceIds(booking: Booking | null): Set<string> {
    const unpaidServices =
      booking?.services.filter(
        (s) => s.status === EnumServiceStatus.PENDING || s.status === EnumServiceStatus.CONFIRMED
      ) ?? [];
    return new Set(unpaidServices.map((s) => s.id));
  }
}
