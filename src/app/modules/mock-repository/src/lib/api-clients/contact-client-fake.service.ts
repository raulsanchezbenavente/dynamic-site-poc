import { AddContactCommand, UpdateContactCommand } from '@dcx/ui/api-layer';
import { delay, Observable, of } from 'rxjs';

export class ContactsClientServiceFake {
  public updateContact(request: UpdateContactCommand, session?: any): Observable<void> {
    console.log(session);
    console.log(request);
    return of(undefined).pipe(delay(300));
  }

  public addContact(request: AddContactCommand, session?: any): Observable<void> {
    console.log(session);
    console.log(request);
    return of(undefined).pipe(delay(300));
  }
}
