import { Injectable, signal } from '@angular/core';

/**
 * Manages shared layout states across components.
 * This service provides a centralized place for components to coordinate their responsive behavior.
 *
 * Example use case:
 * - HeaderFlowComponent updates its mobile layout state when crossing its breakpoint
 * - SeatmapComponent reads this state to adapt its own layout accordingly
 *
 * This pattern allows components to react to each other's responsive states without direct coupling.
 */
@Injectable({ providedIn: 'root' })
export class LayoutStateService {
  /**
   * Private signal to track if header-flow component is in mobile layout mode.
   * Updated by header-flow component when viewport crosses the --header-flow-layout-breakpoint threshold.
   */
  private readonly _isHeaderFlowMobileLayout = signal(false);

  /**
   * Read-only signal indicating if header-flow is in mobile layout mode.
   * Other components (e.g., seatmap) can use this to coordinate their responsive behavior with header-flow.
   *
   * @example
   * ```typescript
   * export class SeatmapComponent {
   *   private readonly layoutState = inject(LayoutStateService);
   *
   *   public readonly shouldAdjustForMobileHeader = computed(() =>
   *     this.layoutState.isHeaderFlowMobileLayout() && this.someOtherCondition()
   *   );
   * }
   * ```
   */
  public readonly isHeaderFlowMobileLayout = this._isHeaderFlowMobileLayout.asReadonly();

  /**
   * Updates the header-flow mobile layout state.
   * Should be called by header-flow component when its responsive breakpoint changes.
   *
   * @param isMobile - true if header-flow is in mobile layout, false otherwise
   * @internal This method is intended to be called only by HeaderFlowComponent
   */
  public setHeaderFlowMobileLayout(isMobile: boolean): void {
    this._isHeaderFlowMobileLayout.set(isMobile);
  }
}
