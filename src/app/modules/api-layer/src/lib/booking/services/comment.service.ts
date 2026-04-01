import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AddCommentCommand } from '..';
import { CommandResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class CommentService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public addComment(command: AddCommentCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.BOOKING, '/comment', command);
  }
}
