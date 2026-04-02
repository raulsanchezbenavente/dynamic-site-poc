import { inject } from '@angular/core';
import { Booking } from '@dcx/ui/libs';

import { CheckInPendingPaymentService } from '../../check-in-pending-payment.service';
import { IPendingServicesSpecification } from '../interfaces/pending-services-specification.interface';

/**
 * Specification to detect slow payment scenario.
 * A slow payment occurs when there is a balance due and services lack associated etickets,
 * indicating the payment is being processed or has not been confirmed yet.
 */
export class SlowPaymentSpecification implements IPendingServicesSpecification {
  private readonly OWNER_SERVICE_CODE = 'OWNE';

  private readonly checkInPendingPaymentService = inject(CheckInPendingPaymentService);

  public isSatisfiedBy(sessionEventBooking: Booking | null): boolean {
    return (
      sessionEventBooking !== null &&
      sessionEventBooking.pricing.balanceDue !== 0 &&
      this.checkInPendingPaymentService.getPendingPayment() > 0 &&
      this.hasServiceWithoutEticket(sessionEventBooking)
    );
  }

  private hasServiceWithoutEticket(booking: Booking): boolean {
    if (!booking.services?.length) {
      return false;
    }

    const eticketIds = new Set(booking.etickets?.map((e) => e.referenceId) ?? []);

    return booking.services.some((service) => service.code !== this.OWNER_SERVICE_CODE && !eticketIds.has(service.id));
  }
}
