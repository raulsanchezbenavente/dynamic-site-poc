import { Alert, IRetrieveAlertsData, ResourcesDataOrigin } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

export class RetrieveAlertsDataServiceFake implements IRetrieveAlertsData {
  originType!: ResourcesDataOrigin;

  retrieve(rootNodeId?: number | undefined): Observable<Alert[]> {
    throw new Error('Method not implemented.');
  }
}
