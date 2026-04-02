import { inject, Injectable } from '@angular/core';
import { EnumStorageKey, SessionStore, StorageService } from '@dcx/ui/libs';

import { OverbookingValidationService } from './overbooking-validation.service';

/**
 * Business rule for determining seatmap step visibility.
 *
 * The seatmap step should be hidden when all selected passengers are either
 * in StandBy or Overbooked status, as these passengers cannot select seats.
 */
@Injectable({ providedIn: 'root' })
export class SeatmapStepVisibilityRule {
  private readonly storageService = inject(StorageService);
  private readonly sessionStore = inject(SessionStore);
  private readonly overbookingValidationService = inject(OverbookingValidationService);

  /**
   * Determines if the seatmap step should be visible.
   *
   * The seatmap is shown when at least one selected passenger across all journeys
   * does NOT have STAND_BY or OVERBOOKED status.
   *
   * Uses the SessionStore to get the latest booking data, ensuring that recently
   * updated session data (e.g., after a session refresh) is used for the visibility check.
   *
   * @returns true if seatmap should be shown, false otherwise
   */
  public shouldShowSeatmapStep(): boolean {
    const selectedPassengersByJourney = this.storageService.getSessionStorage(
      EnumStorageKey.SelectedPassengersByJourney
    );

    const sessionData = this.sessionStore.getSession();
    const booking = sessionData.session.booking;

    const allPaxBlocked = this.overbookingValidationService.everySelectedPaxHasOverbookOrStandByStatus(
      booking,
      selectedPassengersByJourney
    );

    return !allPaxBlocked;
  }
}
