import { Injectable } from '@angular/core';
import { IRetrieveStationsData, ResourcesDataOrigin, Station } from '@dcx/ui/libs';
import { Observable } from 'rxjs';

@Injectable()
export class RetrieveStationsDataFake implements IRetrieveStationsData {
  originType!: ResourcesDataOrigin;

  retrieve(): Observable<Station[]> {
    throw new Error('Method not implemented.');
  }
}
