import { Injectable } from '@angular/core';
import { AvailableOption, AvailableOptionsState } from '@dcx/ui/business-common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvailableOptionService {
  private readonly state$ = new BehaviorSubject<AvailableOptionsState>({
    availableOptions: [],
  });

  public getAvailableOptionsState(): Observable<AvailableOptionsState> {
    return this.state$.asObservable();
  }

  public clearAvailableOptions(): void {
    this.state$.next({
      availableOptions: [],
    });
  }

  public setAvailableOptions(options: AvailableOption[]): void {
    this.state$.next({
      availableOptions: options,
    });
  }
}
