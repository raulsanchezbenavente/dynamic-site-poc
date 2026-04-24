import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServicesConfirmationNotifierService {
  private readonly servicesConfirmed$ = new Subject<void>();

  public getServicesConfirmed$(): Observable<void> {
    return this.servicesConfirmed$.asObservable();
  }

  public notifyServicesConfirmed(): void {
    this.servicesConfirmed$.next();
  }
}
