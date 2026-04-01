import { Observable } from 'rxjs';

import { Market, Station } from '../../model';

export interface IResourcesRetrieve {
  GetMarkets(): Observable<Market[]>;
  GetStations(): Observable<Station[]>;
}
