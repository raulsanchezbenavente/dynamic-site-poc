import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CultureServiceEx } from '../../../../core/services/culture-service-ex/culture-ex.service';
import { Alert } from '../../../../shared';
import { ResourceType } from '../../../../shared/enums/enum-resource-type';
import { ResourcesDataOrigin } from '../../../enums/enum-resources-data-origin';
import { RepositoryDataRequest } from '../../../models/repository-data-request';
import { IRetrieveAlertsData } from '../../contracts';
import { RepositoryRetrieveProxyService } from '../../proxies';

@Injectable()
export class RetrieveAlertsDataFromCms implements IRetrieveAlertsData {
  public originType: ResourcesDataOrigin = ResourcesDataOrigin.CMS;

  constructor(
    protected readonly repositoryRetrieveProxyService: RepositoryRetrieveProxyService,
    protected readonly cultureServiceEx: CultureServiceEx
  ) {}

  public retrieve(rootNodeId?: number): Observable<Alert[]> {
    const repositoryRequest: RepositoryDataRequest = {
      culture: this.cultureServiceEx.getCulture(),
      repositoryType: ResourceType.ALERTS,
      rootNodeId: rootNodeId,
    };

    return new Observable((observer) => {
      this.repositoryRetrieveProxyService.retrieve(repositoryRequest, true).subscribe({
        next: (response) => {
          if (response) {
            const alertRepositoryResponse = response as unknown as Alert[];
            observer.next(alertRepositoryResponse);
            observer.complete();
          }
        },
        error: (error) => {
          observer.error(error);
        },
        complete: () => {},
      });
    });
  }
}
