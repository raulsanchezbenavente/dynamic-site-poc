import { Booking } from '@dcx/ui/libs';

import { IPendingServicesSpecification } from '../interfaces/pending-services-specification.interface';

export class CompositePendingServicesSpecification implements IPendingServicesSpecification {
  constructor(private readonly specifications: IPendingServicesSpecification[]) {}

  public isSatisfiedBy(sessionEventBooking: Booking | null): boolean {
    return this.specifications.some((spec) => {
      return spec.isSatisfiedBy(sessionEventBooking);
    });
  }
}
