import { inject, Injectable } from '@angular/core';
import { EnumStorageKey, StorageService } from '@dcx/ui/libs';

/**
 * Service to manage the email sending state during check-in flow.
 * Controls whether a confirmation email should be sent after check-in modifications.
 */
@Injectable({ providedIn: 'root' })
export class CheckInEmailStateService {
  private readonly storageService = inject(StorageService);

  /**
   * Marks that a confirmation email should be sent.
   */
  public setEmailPending(): void {
    this.storageService.setSessionStorage(EnumStorageKey.WciEmailPending, true);
  }

  /**
   * Checks if confirmation email should be sent.
   */
  public isEmailPending(): boolean {
    return this.storageService.getSessionStorage(EnumStorageKey.WciEmailPending) === true;
  }

  /**
   * Clears the email pending flag.
   */
  public clearEmailPending(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.WciEmailPending);
  }
}
