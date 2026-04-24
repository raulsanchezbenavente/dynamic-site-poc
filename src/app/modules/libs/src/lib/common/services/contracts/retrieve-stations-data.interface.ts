import { Observable } from 'rxjs';

import { Station } from '../../../shared';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';

export interface IRetrieveStationsData {
  originType: ResourcesDataOrigin;
  retrieve(culture: string): Observable<Station[]>;
}
