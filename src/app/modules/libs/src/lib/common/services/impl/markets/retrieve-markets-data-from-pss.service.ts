import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CultureServiceEx } from '../../../../core/services/culture-service-ex/culture-ex.service';
import { Market } from '../../../../shared';
import { ResourceType } from '../../../../shared/enums/enum-resource-type';
import { ResourcesDataOrigin } from '../../../enums/enum-resources-data-origin';
import { IRetrieveMarketsData } from '../../contracts';
import { ResourcesRetrieveProxyService } from '../../proxies';

@Injectable()
export class RetrieveMarketsDataFromPss implements IRetrieveMarketsData {
  public originType: ResourcesDataOrigin = ResourcesDataOrigin.PSS;

  constructor(
    protected readonly resourcesRetrieveProxyService: ResourcesRetrieveProxyService,
    protected readonly cultureServiceEx: CultureServiceEx
  ) {}

  public retrieve(): Observable<Market[]> {
    return this.resourcesRetrieveProxyService.retrieve({
      repositoryType: ResourceType.MARKETS,
      culture: this.cultureServiceEx.getCulture(),
    }) as Observable<Market[]>;
  }
}
