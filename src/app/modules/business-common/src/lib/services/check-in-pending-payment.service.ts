import { inject, Injectable } from '@angular/core';
import { EnumStorageKey, StorageService } from '@dcx/ui/libs';

/**
 * Service to manage the pending payment amount during the check-in process.
 */
@Injectable({ providedIn: 'root' })
export class CheckInPendingPaymentService {
  private readonly storageService = inject(StorageService);

  public setPendingPayment(totalAmount: number): void {
    this.storageService.setSessionStorage(EnumStorageKey.WciPendingPaymentAmount, totalAmount);
  }

  public getPendingPayment(): number {
    return this.storageService.getSessionStorage(EnumStorageKey.WciPendingPaymentAmount);
  }

  public clearPendingPayment(): void {
    this.storageService.removeSessionStorage(EnumStorageKey.WciPendingPaymentAmount);
  }
}
