import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import {
  CheckinPaxCommand,
  CheckinPaxQuery,
  CheckinPaxResponseDto,
  CheckInResponse,
  SegmentCheckIn,
  SendCheckinCommand,
} from '..';
import { CommandResponse, QueryResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class PaxCheckinService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public checkinPax(command: CheckinPaxCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/pax/checkin', command);
  }

  public getCheckinStatus(): Observable<QueryResponse<SegmentCheckIn[]>> {
    return this.get(ProductApi.BOOKING, 'pax/checkin');
  }

  public getPassengerSegmentStatus(): Observable<QueryResponse<CheckInResponse>> {
    return this.get(ProductApi.BOOKING, '/pax/segmentstatus');
  }

  public getRemainingTime(): Observable<QueryResponse<CheckInResponse>> {
    return this.get(ProductApi.BOOKING, '/pax/remainingtime');
  }

  public processCheckin(query: CheckinPaxQuery): Observable<QueryResponse<CheckinPaxResponseDto[]>> {
    return this.post(ProductApi.BOOKING, '/pax/process', query);
  }

  public sendCheckin(command: SendCheckinCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/pax/send', command);
  }
}
