import { inject, Injectable } from '@angular/core';

import { EnumStorageKey, StorageService } from '../../shared';

/**
 * Session ID Service handle session id
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class SessionIdService {
  private readonly storageService = inject(StorageService);
  private _sessionId: string = '';

  constructor() {
    this.createSessionId();
  }

  public regenerateSessionId(): void {
    const sessionId = Date.now().toString();
    this.storageService.setSessionStorage(EnumStorageKey.TabSessionId, { tabSessionId: sessionId });
    this._sessionId = sessionId;
  }

  private createSessionId(): void {
    const existingSessionId = this.storageService.getSessionStorage(EnumStorageKey.TabSessionId);
    if (existingSessionId?.tabSessionId) {
      this._sessionId = existingSessionId.tabSessionId;
      return;
    }
    this.regenerateSessionId();
  }

  get sessionId(): string {
    return this._sessionId;
  }

  get sessionref(): string {
    return this.storageService.getSessionStorage(EnumStorageKey.SessionRef) || '';
  }
}
