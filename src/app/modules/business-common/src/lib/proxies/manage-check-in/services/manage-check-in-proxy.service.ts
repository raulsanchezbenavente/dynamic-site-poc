import { inject, Injectable } from '@angular/core';
import { ManageCheckInService } from '@dcx/ui/api-layer';
import { catchError, map, Observable, of } from 'rxjs';

import { IManageCheckInProxyInterface } from '../interfaces/manage-check-in-proxy.interface';

@Injectable({ providedIn: 'root' })
export class ManageCheckInProxyService implements IManageCheckInProxyInterface {
  private readonly manageCheckInService = inject(ManageCheckInService);

  public getServiceOptions(): Observable<{ option: string }[]> {
    return this.manageCheckInService.getServiceOptionManage().pipe(
      map((response) => response.result.data),
      catchError(() => of([]))
    );
  }
}
