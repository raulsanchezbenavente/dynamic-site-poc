import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import {
  AddJourneyByPaxCommand,
  AddJourneyCommand,
  CancelJourneyByPaxQuery,
  CancelJourneyQuery,
  ChangeJourneyByPaxCommand,
  ChangeJourneyCommand,
  RefundableConcepts,
} from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class JourneyService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public addJourneys(command: AddJourneyCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/journeys', command);
  }

  public addJourneysByPax(command: AddJourneyByPaxCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/journeysbypax', command);
  }

  public updateJourneys(command: ChangeJourneyCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.BOOKING, '/journeys', command);
  }

  public updateJourneysByPax(command: ChangeJourneyByPaxCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.BOOKING, '/journeysbypax', command);
  }

  public removeJourneys(query: CancelJourneyQuery): Observable<CommandResponse<RefundableConcepts>> {
    return this.delete(ProductApi.BOOKING, '/journeys', query);
  }

  public removeJourneysByPax(query: CancelJourneyByPaxQuery): Observable<CommandResponse<RefundableConcepts>[]> {
    return this.delete(ProductApi.BOOKING, '/journeysbypax', query);
  }
}
