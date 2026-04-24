import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService, HttpClientService, IdleTimeoutService, ProductApi } from '@dcx/ui/libs';

import { AddContactCommand, UpdateContactCommand } from '..';

@Injectable({
  providedIn: 'root',
})
export class ContactsService extends HttpClientService {
  constructor(httpClient: HttpClient, idleTimeoutService: IdleTimeoutService, configService: ConfigService) {
    super(httpClient, idleTimeoutService, configService);
  }

  public addContact(request: AddContactCommand, session?: any): any {
    return this.post(ProductApi.CONTACTS, '/contacts', request);
  }

  public updateContact(request: UpdateContactCommand, session?: any): any {
    return this.patch(ProductApi.CONTACTS, '/contacts', request);
  }
}
