import { IRetrieveMarketsData, Market, ResourcesDataOrigin } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

export class RetrieveMarketsDataServiceFake implements IRetrieveMarketsData {
  originType!: ResourcesDataOrigin;

  retrieve(): Observable<Market[]> {
    throw new Error('Method not implemented.');
  }
}
