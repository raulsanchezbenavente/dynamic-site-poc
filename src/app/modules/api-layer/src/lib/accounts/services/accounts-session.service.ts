import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import { AccountDto, UpdateCurrentAccountCommand } from '..';
import { CommandResponse, QueryResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class AccountsSessionService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  /**
   * Retrieves the current account.
   * @returns An observable containing the account details.
   */
  public getAccount(): Observable<QueryResponse<AccountDto>> {
    return this.get(ProductApi.ACCOUNTS, '/session');
  }

  /**
   * Updates the current account.
   * @param command The command containing the updated account details.
   * @returns An observable indicating the operation result.
   */
  public updateAccount(command: UpdateCurrentAccountCommand): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.ACCOUNTS, '/session', command);
  }
}
