import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CultureServiceEx } from '../../../core/services/culture-service-ex/culture-ex.service';
import { Station } from '../../../shared';
import { ResourceType } from '../../../shared/enums/enum-resource-type';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';
import { RepositoryDataRequest } from '../../models/repository-data-request';
import { IRetrieveStationsData } from '../contracts/retrieve-stations-data.interface';
import { RepositoryRetrieveProxyService } from '../proxies/repository-retrieve-proxy.service';

@Injectable()
export class RetrieveStationsDataFromCms implements IRetrieveStationsData {
  public originType: ResourcesDataOrigin = ResourcesDataOrigin.CMS;

  constructor(
    protected readonly repositoryRetrieveProxyService: RepositoryRetrieveProxyService,
    protected readonly cultureServiceEx: CultureServiceEx
  ) {}

  public retrieve(): Observable<Station[]> {
    const repositoryRequest: RepositoryDataRequest = {
      culture: this.cultureServiceEx.getCulture(),
      repositoryType: ResourceType.STATIONS,
    };
    return this.repositoryRetrieveProxyService.retrieve(repositoryRequest) as Observable<Station[]>;
  }
}
