import { Observable } from 'rxjs';

import { Alert } from '../../../shared';
import { ResourcesDataOrigin } from '../../enums/enum-resources-data-origin';

export interface IRetrieveAlertsData {
  originType: ResourcesDataOrigin;
  retrieve(rootNodeId?: number): Observable<Alert[]>;
}
