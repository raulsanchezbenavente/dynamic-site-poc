import { Observable } from 'rxjs';

import { Market } from '../../../shared';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';

export interface IRetrieveMarketsData {
  originType: ResourcesDataOrigin;
  retrieve(): Observable<Market[]>;
}
