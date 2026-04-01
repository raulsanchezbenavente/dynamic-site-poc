import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

import {
  AccountDto,
  ActivateAccountRequest,
  DeactivateAccountRequest,
  GetAccountQuery,
  UpdateAccountRequest,
  UpdateTravelDocumentsRequest,
} from '..';
import { CommandResponse, QueryResponse, VoidCommandResponse } from '../../CQRS';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  /**
   * Retrieves a specific account by its ID.
   * @param request The ID of the account to retrieve.
   * @returns An observable containing the account details.
   */
  public getAccount(request: GetAccountQuery): Observable<QueryResponse<AccountDto>> {
    return this.get(ProductApi.ACCOUNTS, '/account', request);
  }

  /**
   * Updates an account with the given request details.
   * @param request The object containing the updated account details.
   * @returns An observable indicating the operation result.
   */
  public updateAccount(request: UpdateAccountRequest): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.ACCOUNTS, '/account', request);
  }

  /**
   * Activates an account with the given request details.
   * @param request The request object containing the account ID to activate.
   * @returns An observable indicating the operation result.
   */
  public activateAccount(request: ActivateAccountRequest): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.ACCOUNTS, '/account/activate', request);
  }

  /**
   * Deactivates an account with the given request details.
   * @param request The request object containing the account ID to deactivate.
   * @returns An observable indicating the operation result.
   */
  public deactivateAccount(request: DeactivateAccountRequest): Observable<CommandResponse<VoidCommandResponse>> {
    return this.post(ProductApi.ACCOUNTS, '/account/deactivate', request);
  }

  /**
   * Updates travel documents for a frequent traveler.
   * @param request The request object containing the updated travel documents.
   * @returns An observable indicating the operation result.
   */
  public updateFrequentTravelerDocuments(
    request: UpdateTravelDocumentsRequest
  ): Observable<CommandResponse<VoidCommandResponse>> {
    return this.patch(ProductApi.ACCOUNTS, '/account/travelDocuments', request);
  }
}
