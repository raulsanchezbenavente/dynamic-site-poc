import { inject, Injectable } from '@angular/core';
import { Booking, CultureServiceEx, EnumStorageKey, IbeFlow, LoggerService, StorageService } from '@dcx/ui/libs';

import { PaymentUrlParams } from './models/payment-url-params.model';
import { SubmitRedirectionService } from './submit-redirection.service';

/**
 * Service responsible for constructing and formatting payment redirect URLs.
 *
 * This service encapsulates all logic related to building payment URL parameters
 * and replacing placeholders with actual booking/session data.
 *
 * Responsibilities:
 * - Collect booking and session data for URL parameters
 * - Replace URL template placeholders with actual values
 * - Provide formatted payment URLs ready for redirection
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentUrlBuilderService {
  private readonly logger = inject(LoggerService);
  private readonly storageService = inject(StorageService);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly submitRedirection = inject(SubmitRedirectionService);

  /**
   * Creates a payment URL by replacing placeholders with actual booking data.
   *
   * This method:
   * 1. Collects all necessary booking and session data via buildPaymentUrlReplacements()
   * 2. Delegates to SubmitRedirectionService to replace URL template placeholders
   * 3. Returns the final URL ready for redirection
   *
   * Example:
   * Input: "/{culture}/payment?pnr={PNR}&currency={currency}&sessionRef={sessionRef}"
   * Output: "/en-us/payment?pnr=ABC123&currency=COP&sessionRef=xyz789"
   *
   * @param urlTemplate - The URL template with placeholders (from CMS config)
   * @returns The URL with all placeholders replaced with actual values
   */
  public createPaymentUrl(urlTemplate: string): string {
    const replacements = this.buildPaymentUrlReplacements();
    const finalUrl = this.submitRedirection.createPaymentUrl(urlTemplate, replacements);
    this.logger.info('PaymentUrlBuilderService', 'Final URL after replacements:', finalUrl);

    return finalUrl;
  }

  /**
   * Builds the replacement map for payment URL placeholders.
   *
   * Collects all necessary booking and session data from storage to replace
   * URL template placeholders. If booking data is not available, returns
   * empty strings as fallbacks.
   *
   * Parameters collected:
   * - tabSessionId: Current tab session identifier
   * - sessionRef: Session reference token
   * - culture: User's culture/language preference
   * - pnr: Passenger Name Record (booking reference)
   * - posCode: Point of Sale code
   * - prefix: Country/prefix code (derived from posCode)
   * - currency: Currency code from booking
   * - flow: Current booking flow (WCI for check-in)
   * - source: Application source identifier
   *
   * @returns PaymentUrlParams with all placeholder values
   */
  private buildPaymentUrlReplacements(): PaymentUrlParams {
    const booking = this.storageService.getSessionStorage(EnumStorageKey.SessionBooking) as Booking;
    const tabSessionId = this.storageService.getSessionStorage(EnumStorageKey.TabSessionId)?.tabSessionId;
    const sessionRef = this.storageService.getSessionStorage(EnumStorageKey.SessionRef);
    const culture = this.cultureServiceEx.getCulture();
    const bookingInfo = booking?.bookingInfo;
    const currency = booking?.pricing?.currency;
    const posCode = bookingInfo?.pointOfSale?.posCode;
    const source = 'CheckInPlus';

    const res: PaymentUrlParams = {
      tabSessionId: tabSessionId ?? '',
      sessionRef: sessionRef ?? '',
      culture: culture ?? '',
      pnr: bookingInfo?.recordLocator ?? '',
      posCode: posCode ?? '',
      prefix: posCode ?? '',
      currency: currency ?? '',
      flow: IbeFlow.WCI,
      source: source ?? '',
    };

    return res;
  }
}
