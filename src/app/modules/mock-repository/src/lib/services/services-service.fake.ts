import { QueryResponse, ServiceDto } from '@dcx/ui/api-layer';
import { Observable } from 'rxjs';

import { fakeServices } from '../models/pricing-services.fake';

export class ServicesServiceFake {
  public getServices(): Observable<QueryResponse<ServiceDto[]>> {
    return new Observable<QueryResponse<ServiceDto[]>>((subscriber) => {
      subscriber.next({
        result: {
          data: fakeServices,
        },
        success: true,
      });
      subscriber.complete();
    });
  }
}
