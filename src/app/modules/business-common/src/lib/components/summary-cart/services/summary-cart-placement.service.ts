import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ViewportSizeService } from '@dcx/ui/libs';

/**
 * Service to coordinate the placement of SummaryCart between HeaderFlow and PageActionButtons.
 * Ensures only one instance is rendered at a time based on viewport breakpoint.
 */
@Injectable({ providedIn: 'root' })
export class SummaryCartPlacementService {
  private readonly viewportSizeService = inject(ViewportSizeService);

  // True when viewport is below the breakpoint (mobile view)
  private readonly isBelowBreakpoint = signal<boolean>(false);

  // True if HeaderFlow has SummaryCart enabled in CMS config
  private readonly headerFlowHasSummaryCart = signal<boolean>(false);

  /**
   * Where should SummaryCart be rendered?
   * - 'header': Render in HeaderFlow (desktop, above breakpoint)
   * - 'page-actions': Render in PageActionButtons (mobile, below breakpoint)
   * - 'none': Don't render (HeaderFlow doesn't have it configured)
   */
  public readonly placement = computed<'header' | 'page-actions' | 'none'>(() => {
    if (!this.headerFlowHasSummaryCart()) {
      return 'none';
    }

    return this.isBelowBreakpoint() ? 'page-actions' : 'header';
  });

  /**
   * Computed signals for each component to check if they should render SummaryCart
   */
  public readonly showInHeader = computed(() => this.placement() === 'header');
  public readonly showInPageActions = computed(() => this.placement() === 'page-actions');

  /**
   * Initialize breakpoint watching. Call once from HeaderFlow when it determines
   * it has SummaryCart enabled in config.
   */
  public initializeFromHeaderFlow(hasSummaryCart: boolean, destroyRef: DestroyRef): void {
    this.headerFlowHasSummaryCart.set(hasSummaryCart);

    if (!hasSummaryCart) return;

    // Watch the CSS breakpoint
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--header-flow-summary-cart-breakpoint');
    const mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);

    if (!mediaQuery) return;

    const handler = (e: MediaQueryListEvent | MediaQueryList): void => {
      this.isBelowBreakpoint.set(e.matches);
    };

    // Set initial state
    handler(mediaQuery);

    // Listen to changes
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', handler);
      this.headerFlowHasSummaryCart.set(false);
      this.isBelowBreakpoint.set(false);
    });
  }
}
