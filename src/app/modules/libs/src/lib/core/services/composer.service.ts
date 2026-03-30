import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComposerService {
  private readonly notifier = new Subject<unknown>();
  public notifier$: Observable<unknown> = this.notifier.asObservable();

  public submitEvent(_submitIdList: string[]): void {}

  public notifyComposerEvent(event: unknown): void {
    this.notifier.next(event);
  }
}
