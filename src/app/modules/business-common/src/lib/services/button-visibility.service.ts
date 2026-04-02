import { computed, Injectable, signal } from '@angular/core';

/**
 * Communication bridge service for coordinating button visibility across the application.
 *
 * Default States:
 * - PageActionButtons: ON by default (visible unless explicitly hidden)
 * - AmountSummaryButton: OFF by default (hidden unless explicitly shown)
 *
 * Master Override Rule:
 * - When AmountSummaryButton is ON, it blocks PageActionButtons (forces it OFF)
 * - When AmountSummaryButton goes OFF, PageActionButtons returns to its last requested state
 */
@Injectable({
  providedIn: 'root',
})
export class ButtonVisibilityService {
  private readonly _amountSummaryButtonVisible = signal<boolean>(false);
  private readonly _pageActionButtonsRequested = signal<boolean>(true);

  /**
   * Computed signal for PageActionButtons actual visibility.
   * Takes into account both the requested state and the AmountSummaryButton override.
   */
  public readonly shouldShowPageActionButtons = computed(
    () => this._pageActionButtonsRequested() && !this._amountSummaryButtonVisible()
  );

  /**
   * Computed signal for AmountSummaryButton visibility.
   * Direct reflection of its internal state.
   */
  public readonly shouldShowAmountSummary = computed(() => this._amountSummaryButtonVisible());

  /**
   * Sets the visibility state for AmountSummaryButton.
   * When set to true, it automatically blocks PageActionButtons (master override).
   * When set to false, PageActionButtons returns to its last requested state.
   */
  public setAmountSummaryButtonVisible(isVisible: boolean): void {
    this._amountSummaryButtonVisible.set(isVisible);
  }

  /**
   * Sets the requested visibility state for PageActionButtons.
   * The actual visibility will depend on whether AmountSummaryButton is blocking it.
   */
  public setPageActionButtonsVisible(isVisible: boolean): void {
    this._pageActionButtonsRequested.set(isVisible);
  }
}
