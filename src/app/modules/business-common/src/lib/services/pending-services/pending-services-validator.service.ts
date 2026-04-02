import { Injectable } from '@angular/core';
import { Booking } from '@dcx/ui/libs';

import { CompositePendingServicesSpecification } from './specifications/composite-pending-services-specification';
import { SlowPaymentSpecification } from './specifications/slow-payment-specification';

@Injectable({
  providedIn: 'root',
})
export class PendingServicesValidatorService {
  private readonly specification = new CompositePendingServicesSpecification([new SlowPaymentSpecification()]);

  public hasPendingServices(sessionEventBooking: Booking | null): boolean {
    return this.specification.isSatisfiedBy(sessionEventBooking);
  }
}
