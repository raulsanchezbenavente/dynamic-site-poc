import { CommandResponseOfVoidCommandResponse, IPaxClient, UpdatePaxCommand } from '@dcx/module/booking-api-client';
import { Observable, of } from 'rxjs';

export class PaxClientFakeService implements IPaxClient {
  public patch(command: UpdatePaxCommand, version: string): Observable<CommandResponseOfVoidCommandResponse> {
    console.log('Patching Pax with version:', version, 'and command:', command);
    return of({} as CommandResponseOfVoidCommandResponse);
  }
}
