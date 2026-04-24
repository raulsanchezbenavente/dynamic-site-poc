import { HttpClient } from '@angular/common/http';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AdditionalServiceDataDto, ResourcesService } from '..';
import { QueryResponse } from '../../CQRS';

export class ServiceControllerService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  /**
   * Retrieves services.
   * @returns An observable of the list of ResourcesService objects.
   */
  public getServices(): Observable<QueryResponse<ResourcesService[]>> {
    return this.get(ProductApi.SERVICES, '/services');
  }

  /**
   * Retrieves additional data related to services.
   * @returns An observable of the list of AdditionalServiceDataDto objects.
   */
  public getAdditionalServiceData(): Observable<QueryResponse<AdditionalServiceDataDto[]>> {
    return this.get(ProductApi.SERVICES, '/services/additionaldata');
  }
}
