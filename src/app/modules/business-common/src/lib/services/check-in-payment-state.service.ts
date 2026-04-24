import { inject, Injectable } from '@angular/core';
import { EnumStorageKey, StorageService } from '@dcx/ui/libs';

/**
 * Service to manage the payment state control during check-in flow.
 * Determines if the user needs to be redirected to payment based on services added.
 */
@Injectable({ providedIn: 'root' })
export class CheckInPaymentStateService {
  private readonly storageService = inject(StorageService);

  /**
   * Sets whether payment is required based on services with balance due.
   * @param isRequired - true if there are services requiring payment
   */
  public setPaymentRequired(isRequired: boolean): void {
    this.storageService.setSessionStorage(EnumStorageKey.WciPaymentWithServices, isRequired);
  }

  /**
   * Checks if payment redirection is required.
   * @returns true if user should be redirected to payment
   */
  public isPaymentRequired(): boolean {
    return this.storageService.getSessionStorage(EnumStorageKey.WciPaymentWithServices) === true;
  }

  /**
   * Clears the payment state control from session storage.
   */
  public clearPaymentState(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.WciPaymentWithServices);
  }
}
