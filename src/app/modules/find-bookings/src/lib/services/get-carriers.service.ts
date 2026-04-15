import { Injectable } from '@angular/core';

import { FindBookingsConfig } from '../models/find-bookings.config';

@Injectable({
  providedIn: 'root',
})
export class GetCarrierService {
  public getCarrierName(findBookingsConfig: FindBookingsConfig | null, carrierCode: string): string {
    if (!findBookingsConfig) {
      return carrierCode;
    }

    const carriersList = findBookingsConfig.carriersList;
    const carrier = carriersList.find((c) => {
      return c.code.toUpperCase() === carrierCode.toUpperCase() || c.name.toUpperCase() === carrierCode.toUpperCase();
    });
    return carrier ? carrier.name : carrierCode;
  }
}
