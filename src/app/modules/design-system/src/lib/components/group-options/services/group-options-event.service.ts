import { Injectable } from '@angular/core';
import { OptionSelectedEvent } from '@dcx/ui/design-system';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GroupOptionsEventService {
  private readonly selectSubject$ = new Subject<OptionSelectedEvent>();

  public optionSelected(): Observable<OptionSelectedEvent> {
    return this.selectSubject$.asObservable();
  }

  public publishEvent(event: OptionSelectedEvent): void {
    this.selectSubject$.next(event);
  }
}
