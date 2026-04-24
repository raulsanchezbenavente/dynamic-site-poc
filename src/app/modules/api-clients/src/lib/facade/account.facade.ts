import { inject, Injectable } from '@angular/core';
import { AccountAdapter, CustomerAccount } from '@dcx/ui/business-common';
import { map, Observable } from 'rxjs';

import { AccountV2Client } from '../accountV2-api';

/**
 * Facade for account-related operations.
 * Provides a simplified interface to account API clients,
 * abstracting away API details and response transformation.
 */
@Injectable({
  providedIn: 'root',
})
export class AccountFacade {
  private readonly accountV2Client = inject(AccountV2Client);

  /**
   * Retrieves current user session as domain model.
   * @returns Observable of CustomerAccount or null if no session
   */
  public getSession(): Observable<CustomerAccount | null> {
    return this.accountV2Client
      .sessionGET()
      .pipe(
        map((response) => (response.result?.data ? AccountAdapter.adaptSessionResponse(response.result.data) : null))
      );
  }
}
