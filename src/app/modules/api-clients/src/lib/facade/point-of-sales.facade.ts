import { inject, Injectable } from '@angular/core';
import { PointOfSaleAdapter } from '@dcx/ui/business-common';
import { CultureServiceEx, PointOfSale } from '@dcx/ui/libs';
import { catchError, map, Observable, of } from 'rxjs';

import { CmsConfigClient } from '../cmsConfig-api';

@Injectable({
  providedIn: 'root',
})
export class PointOfSalesFacade {
  private readonly cmsConfigClient = inject(CmsConfigClient);
  private readonly cultureService = inject(CultureServiceEx);

  public getPointOfSales(): Observable<PointOfSale[]> {
    const culture = this.cultureService.getCulture();
    return this.cmsConfigClient.pointOfSales('1', culture).pipe(
      catchError((error) => {
        console.error('Failed to fetch points of sale:', error);
        return of(null);
      }),
      map((response) => PointOfSaleAdapter.adaptPointsOfSale(response?.items))
    );
  }
}
