import { inject, Injectable } from '@angular/core';
import { LoyaltyPrograms, LoyaltyProgramsAdapter } from '@dcx/ui/business-common';
import { catchError, map, Observable, of } from 'rxjs';

import { CmsConfigClient } from '../cmsConfig-api';

@Injectable({
  providedIn: 'root',
})
export class LoyaltyProgramsFacade {
  private readonly cmsConfigClient = inject(CmsConfigClient);

  public getLoyaltyPrograms(): Observable<LoyaltyPrograms> {
    return this.cmsConfigClient.loyaltyPrograms().pipe(
      catchError((error) => {
        console.error('Failed to fetch loyalty programs:', error);
        return of(null);
      }),
      map((response) => LoyaltyProgramsAdapter.adaptLoyaltyPrograms(response))
    );
  }
}
