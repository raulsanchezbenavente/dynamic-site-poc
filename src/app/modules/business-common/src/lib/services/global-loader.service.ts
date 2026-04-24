import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';

/**
 * Service responsible for controlling the global page loader.
 * Encapsulates DOM manipulation for the native loader element.
 *
 * @example
 * ```typescript
 * constructor(private loaderService: GlobalLoaderService) {}
 *
 * async loadData() {
 *   this.loaderService.show();
 *   await this.fetchData();
 *   await this.loaderService.hide();
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class GlobalLoaderService {
  private readonly LOADER_ID = 'nativeLoader';
  private readonly LOADING_CLASS = 'page--loading';
  /**
   * Internally loading but without visual block
   */
  private readonly INTERACTIVE_CLASS = 'page--interactive';
  private readonly OVERLAY_BLOCKER_CLASS = 'page-overlay-blocker';
  private readonly ANTI_FLICKER_DELAY_MS = 120;
  private readonly MIN_TIME_VISIBLE = 1000;

  /**
   * Shows the global page loader.
   * Adds the loading class to the document element and displays the loader.
   *
   * @param blockInteractionOnly - If true, only blocks interactions without showing the visual loader.
   */
  public show(blockInteractionOnly: boolean = false): void {
    const loader = this.getLoaderElement();
    if (!loader) {
      return;
    }

    const isInteractive = document.documentElement.classList.contains(this.INTERACTIVE_CLASS);

    // Display the loader element
    loader.style.display = 'flex';

    // Apply overlay blocker for interaction-only blocking
    if (blockInteractionOnly) {
      loader.classList.add(this.OVERLAY_BLOCKER_CLASS);
      return;
    }

    // Don't add loading class if page is already in interactive mode
    if (isInteractive) {
      return;
    }

    // Add loading class for full visual loader
    document.documentElement.classList.add(this.LOADING_CLASS);
  }

  /**
   * Hides the global page loader.
   *
   * @param withDelay - If true, applies anti-flicker delay before hiding. Default is true.
   * @returns Promise that resolves when the loader is hidden.
   */
  public hide(withDelay: boolean = true, customDelay?: number): Promise<void> {
    return new Promise((resolve) => {
      const hideLoader = (): void => {
        const loader = this.getLoaderElement();
        if (loader) {
          of(null)
            .pipe(delay(this.MIN_TIME_VISIBLE))
            .subscribe(() => {
              loader.style.display = 'none';
              loader.classList.remove(this.OVERLAY_BLOCKER_CLASS);
              document.documentElement.classList.remove(this.LOADING_CLASS, this.INTERACTIVE_CLASS);
            });
        }
        resolve();
      };

      if (withDelay) {
        setTimeout(hideLoader, customDelay ?? this.ANTI_FLICKER_DELAY_MS);
      } else {
        hideLoader();
      }
    });
  }

  /**
   * Gets the native loader DOM element.
   *
   * @returns The loader HTMLElement or null if not found.
   */
  private getLoaderElement(): HTMLElement | null {
    return document.getElementById(this.LOADER_ID);
  }
}
