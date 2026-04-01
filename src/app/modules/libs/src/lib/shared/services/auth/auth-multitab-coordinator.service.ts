import { inject, Injectable } from '@angular/core';
import { KEYCLOAK_CONSTANTS, StorageService } from '@dcx/ui/libs';
import { KeycloakEventType } from 'keycloak-angular';
import { BehaviorSubject } from 'rxjs';

import { AuthMultitabConstants } from '../../enums';
import { MultitabAuthMessage } from '../../model/auth/auth-multitab.model';
import { KeycloakAuthEvent } from '../../model/keycloak/keycloak-auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthMultitabCoordinatorService {
  private static readonly ORIGINAL_TAB_ID_KEY = 'tabSessionId';
  private static readonly GENERATED_TAB_ID_KEY = 'generatedTabId';

  private broadcastChannel!: BroadcastChannel;
  private tabId!: string;
  private cleanupInterval = null;

  private readonly keycloakEventSubject = new BehaviorSubject<KeycloakAuthEvent | null>(null);
  public readonly keycloakEvent$ = this.keycloakEventSubject.asObservable();

  private readonly storageService = inject(StorageService);

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.tabId = this.getOrCreateTabId();
    this.setupBroadcastChannel();
  }

  private getOrCreateTabId(): string {
    const existingId =
      this.storageService.getSessionStorage(AuthMultitabCoordinatorService.GENERATED_TAB_ID_KEY) ||
      this.storageService.getSessionStorage(AuthMultitabCoordinatorService.ORIGINAL_TAB_ID_KEY);

    if (existingId) return existingId;

    return this.generateAndSaveNewTabId();
  }

  private generateAndSaveNewTabId(): string {
    const newTabId = `${Date.now()}_${crypto.randomUUID()}`;
    this.storageService.setSessionStorage(AuthMultitabCoordinatorService.GENERATED_TAB_ID_KEY, newTabId);
    return newTabId;
  }

  private setupBroadcastChannel(): void {
    this.broadcastChannel = new BroadcastChannel(AuthMultitabConstants.BROADCAST_CHANNEL_NAME);
    this.broadcastChannel.onmessage = (event: MessageEvent): void => this.processKeycloakEvent(event.data);
  }

  private processKeycloakEvent(eventData: MultitabAuthMessage): void {
    if (!eventData?.type) {
      return;
    }

    if (eventData.preLogout && (!this.isEventNotificationRequired(eventData) || eventData.tabId !== this.tabId)) {
      return;
    }

    this.keycloakEventSubject.next({ type: eventData.type, isActionTab: false, preLogout: eventData.preLogout });
  }

  public sendKeycloakEvent(
    eventType: KeycloakEventType,
    shouldRedirect: boolean,
    emitToCurrentTab: boolean = true,
    preLogout: boolean = false
  ): void {
    const eventData: MultitabAuthMessage = {
      type: eventType,
      shouldRedirect,
      timestamp: Date.now(),
      tabId: this.tabId,
      preLogout,
    };

    if (!this.isEventNotificationRequired(eventData)) {
      return;
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(eventData);
    }

    if (emitToCurrentTab || preLogout) {
      this.keycloakEventSubject.next({ type: eventType, isActionTab: true, preLogout });
    }
  }

  private isEventNotificationRequired(event: MultitabAuthMessage): boolean {
    if (!event.preLogout) {
      return true;
    }

    const keyEventNotification = this.storageService.getLocalStorage(KEYCLOAK_CONSTANTS.EVENT_NOTIFICATION);

    if (JSON.parse(keyEventNotification || 'null')) {
      return false;
    }

    this.storageService.setLocalStorage(KEYCLOAK_CONSTANTS.EVENT_NOTIFICATION, JSON.stringify(event));

    return true;
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.broadcastChannel) this.broadcastChannel.close();
    this.keycloakEventSubject.complete();
  }
}
