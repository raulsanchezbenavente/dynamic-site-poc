import { HttpClient } from '@angular/common/http';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { GenerateEticketsCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

export class EticketService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public generateEtickets(request: GenerateEticketsCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/etickets', request);
  }
}
