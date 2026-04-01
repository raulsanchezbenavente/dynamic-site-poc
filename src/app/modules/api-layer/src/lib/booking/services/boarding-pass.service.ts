import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { BoardingPassResponseDto, GenerateBoardingPassQuery, GetBoardingPassQuery } from '..';
import { QueryResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class BoardingPassService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public getBoardingPass(query: GetBoardingPassQuery): Observable<QueryResponse<BoardingPassResponseDto>> {
    return this.post(ProductApi.BOOKING, '/boardingpass/generate', query);
  }

  public generateBoardingPass(query: GenerateBoardingPassQuery): Observable<QueryResponse<BoardingPassResponseDto>> {
    return this.post(ProductApi.BOOKING, '/boardingpass/process', query);
  }
}
