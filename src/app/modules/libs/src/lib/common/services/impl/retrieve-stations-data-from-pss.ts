import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CultureServiceEx } from '../../../core/services/culture-service-ex/culture-ex.service';
import { Station } from '../../../shared';
import { ResourceType } from '../../../shared/enums/enum-resource-type';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';
import { IRetrieveStationsData } from '../contracts/retrieve-stations-data.interface';
import { ResourcesRetrieveProxyService } from '../proxies';

@Injectable()
export class RetrieveStationsDataFromPss implements IRetrieveStationsData {
  public originType: ResourcesDataOrigin = ResourcesDataOrigin.PSS;

  constructor(
    protected readonly resourcesRetrieveProxyService: ResourcesRetrieveProxyService,
    protected readonly cultureServiceEx: CultureServiceEx
  ) {}

  public retrieve(): Observable<Station[]> {
    return this.resourcesRetrieveProxyService.retrieve({
      repositoryType: ResourceType.STATIONS,
      culture: this.cultureServiceEx.getCulture(),
    }) as Observable<Station[]>;
  }
}
