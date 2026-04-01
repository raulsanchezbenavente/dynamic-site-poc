import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';

/**
 * Service to manage sticky behavior for toast components.
 * Handles scroll-based position changes from absolute to fixed.
 */
@Injectable({ providedIn: 'root' })
export class ToastStickyBehaviorService {
  private readonly STICKY_CLASS = 'toast--sticky-active';
  private readonly DEFAULT_VIEWPORT_OFFSET = 32;
  private readonly HEADER_HEIGHT_VAR = '--header-height';

  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly stickyItems = new Map<HTMLElement, StickyToastItem>();

  private rafId: number | null = null;
  private listenersAttached = false;
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private headerHeightPx = 0;
  private headerHeightRaw = '';

  private readonly onScroll = (): void => {
    this.scheduleUpdate();
  };

  private readonly onResize = (): void => {
    this.refreshHeaderHeightIfChanged();
    this.recaptureOffsetsOnResize();
    this.scheduleUpdate();
  };

  /**
   * Attaches sticky scroll behavior to a toast element.
   * Expects the toast to be absolutely positioned relative to its container in normal mode.
   * @param toastElement The toast DOM element
   * @param containerElement The container element that holds the toast
   * @param viewportOffset Distance in pixels from header/viewport when sticky activates
   * @returns Cleanup function to disconnect observers/listeners for this toast
   */
  public attachStickyBehavior(
    toastElement: HTMLElement,
    containerElement: HTMLElement,
    viewportOffset: number = this.DEFAULT_VIEWPORT_OFFSET
  ): () => void {
    if (!this.isBrowser) {
      return () => undefined;
    }

    const originalInlineTop = toastElement.style.top;
    const originalInlineRight = toastElement.style.right;
    const originalInlineLeft = toastElement.style.left;

    const originalTopOffset = this.resolveOriginalTopOffset(toastElement, containerElement);
    const originalRightOffset = this.resolveOriginalRightOffset(toastElement, containerElement);

    this.stickyItems.set(toastElement, {
      toastElement,
      containerElement,
      originalInlineTop,
      originalInlineRight,
      originalInlineLeft,
      originalTopOffset,
      originalRightOffset,
      viewportOffset,
      hasBeenEvaluated: false,
      isSticky: false,
      appliedRightPx: null,
    });

    this.attachGlobalListeners();
    this.scheduleUpdate();

    const cleanup = (): void => {
      const item = this.stickyItems.get(toastElement);
      this.stickyItems.delete(toastElement);

      if (item) {
        this.deactivateStickyMode(
          toastElement,
          item.originalInlineTop,
          item.originalInlineRight,
          item.originalInlineLeft
        );
      } else {
        this.deactivateStickyMode(toastElement, originalInlineTop, originalInlineRight, originalInlineLeft);
      }

      this.detachGlobalListenersIfNeeded();
    };

    return cleanup;
  }

  /** Detaches sticky behavior and restores original styles for a toast. */
  public detach(toastElement: HTMLElement): void {
    const item = this.stickyItems.get(toastElement);
    if (item) {
      this.stickyItems.delete(toastElement);
      this.deactivateStickyMode(
        toastElement,
        item.originalInlineTop,
        item.originalInlineRight,
        item.originalInlineLeft
      );
    }
    this.detachGlobalListenersIfNeeded();
  }

  private calculateStickyThreshold(viewportOffset: number): number {
    return this.headerHeightPx + viewportOffset;
  }

  /** Reads `--header-height` from `:root` and caches the parsed pixel value. */
  private refreshHeaderHeightIfChanged(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const rootElement = this.document.documentElement;
    if (!rootElement) {
      return false;
    }

    const rawHeaderHeightValue = getComputedStyle(rootElement).getPropertyValue(this.HEADER_HEIGHT_VAR).trim();

    if (rawHeaderHeightValue === this.headerHeightRaw) {
      return false;
    }

    this.headerHeightRaw = rawHeaderHeightValue;

    if (!rawHeaderHeightValue) {
      this.headerHeightPx = 0;
      return true;
    }

    const parsed = Number.parseFloat(rawHeaderHeightValue);
    this.headerHeightPx = Number.isNaN(parsed) ? 0 : parsed;
    return true;
  }

  /** Returns toast top offset relative to its container via `getBoundingClientRect`. */
  private resolveOriginalTopOffset(toastElement: HTMLElement, containerElement: HTMLElement): number {
    const toastRect = toastElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    return toastRect.top - containerRect.top;
  }

  /** Returns distance from toast right edge to container right edge via `getBoundingClientRect`. */
  private resolveOriginalRightOffset(toastElement: HTMLElement, containerElement: HTMLElement): number {
    const toastRect = toastElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    return containerRect.right - toastRect.right;
  }

  /** Reverts sticky items to absolute, forces reflow, and re-captures offsets from fresh geometry. */
  private recaptureOffsetsOnResize(): void {
    this.stickyItems.forEach((item) => {
      if (item.isSticky) {
        this.deactivateStickyMode(
          item.toastElement,
          item.originalInlineTop,
          item.originalInlineRight,
          item.originalInlineLeft
        );
        item.isSticky = false;
        item.appliedRightPx = null;
      }
    });

    // getBoundingClientRect() forces synchronous reflow after the style changes above.
    this.stickyItems.forEach((item) => {
      if (!item.toastElement.isConnected || !item.containerElement.isConnected) {
        return;
      }

      item.originalTopOffset = this.resolveOriginalTopOffset(item.toastElement, item.containerElement);
      item.originalRightOffset = this.resolveOriginalRightOffset(item.toastElement, item.containerElement);
    });
  }

  private attachGlobalListeners(): void {
    if (this.listenersAttached || !this.isBrowser || !this.document.defaultView) {
      return;
    }

    const windowRef = this.document.defaultView;

    this.refreshHeaderHeightIfChanged();

    this.ngZone.runOutsideAngular(() => {
      windowRef.addEventListener('scroll', this.onScroll, { passive: true });
      windowRef.addEventListener('resize', this.onResize, { passive: true });
    });

    this.listenersAttached = true;
  }

  /** Removes global listeners when no sticky toasts remain. */
  private detachGlobalListenersIfNeeded(): void {
    if (this.stickyItems.size > 0 || !this.listenersAttached || !this.isBrowser || !this.document.defaultView) {
      return;
    }

    const windowRef = this.document.defaultView;

    windowRef.removeEventListener('scroll', this.onScroll);
    windowRef.removeEventListener('resize', this.onResize);

    this.listenersAttached = false;

    if (this.rafId !== null) {
      windowRef.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Batches updates via `requestAnimationFrame` to coalesce rapid scroll/resize events. */
  private scheduleUpdate(): void {
    if (this.rafId !== null || !this.isBrowser || !this.document.defaultView) {
      return;
    }

    const windowRef = this.document.defaultView;

    this.ngZone.runOutsideAngular(() => {
      this.rafId = windowRef.requestAnimationFrame(() => {
        this.rafId = null;
        this.updateStickyItems();
      });
    });
  }

  /** Viewport width excluding scrollbar — matches `position: fixed` coordinate system. */
  private getViewportWidth(): number {
    return this.document.documentElement?.clientWidth ?? this.document.defaultView?.innerWidth ?? 0;
  }

  private computeRightOffsetPx(containerRect: DOMRect, originalRightOffset: number): number | null {
    const viewportWidth = this.getViewportWidth();
    if (viewportWidth === 0) {
      return null;
    }

    const rightPx = viewportWidth - containerRect.right + originalRightOffset;

    if (!Number.isFinite(rightPx) || rightPx < 0 || rightPx > viewportWidth) {
      return null;
    }

    return Math.max(0, Math.round(rightPx));
  }

  private updateStickyItems(): void {
    if (this.stickyItems.size === 0) {
      return;
    }

    this.refreshHeaderHeightIfChanged();

    const windowRef = this.document.defaultView;
    const currentScrollY = windowRef ? windowRef.scrollY : 0;
    const toDetach: HTMLElement[] = [];

    this.stickyItems.forEach((item) => {
      if (!item.toastElement.isConnected || !item.containerElement.isConnected) {
        toDetach.push(item.toastElement);
        return;
      }

      // Skip sticky on initial load at scrollY === 0; allow activation if page restores with scroll.
      if (!item.hasBeenEvaluated && currentScrollY === 0) {
        item.hasBeenEvaluated = true;
        this.deactivateStickyMode(
          item.toastElement,
          item.originalInlineTop,
          item.originalInlineRight,
          item.originalInlineLeft
        );
        item.isSticky = false;
        item.appliedRightPx = null;
        return;
      }

      item.hasBeenEvaluated = true;

      const containerRect = item.containerElement.getBoundingClientRect();
      const stickyThreshold = this.calculateStickyThreshold(item.viewportOffset);

      const toastAbsoluteTop = containerRect.top + item.originalTopOffset;
      const shouldBeSticky = toastAbsoluteTop <= stickyThreshold;

      if (shouldBeSticky) {
        const computedRight = this.computeRightOffsetPx(containerRect, item.originalRightOffset);
        item.appliedRightPx = computedRight;

        this.activateStickyMode(item.toastElement, stickyThreshold, computedRight);
        item.isSticky = true;
        return;
      }

      if (item.isSticky) {
        this.deactivateStickyMode(
          item.toastElement,
          item.originalInlineTop,
          item.originalInlineRight,
          item.originalInlineLeft
        );
      }
      item.isSticky = false;
      item.appliedRightPx = null;
    });

    for (const toastElement of toDetach) {
      this.detach(toastElement);
    }
  }

  private activateStickyMode(toastElement: HTMLElement, stickyTop: number, rightPx: number | null): void {
    const stickyTopValue = `${stickyTop}px`;

    if (!toastElement.classList.contains(this.STICKY_CLASS)) {
      toastElement.classList.add(this.STICKY_CLASS);
    }

    if (toastElement.style.top !== stickyTopValue) {
      toastElement.style.top = stickyTopValue;
    }

    // `left` is controlled by CSS; only `right` is set inline.
    if (rightPx !== null) {
      const rightValue = `${rightPx}px`;
      if (toastElement.style.right !== rightValue) {
        toastElement.style.right = rightValue;
      }
    }
  }

  private deactivateStickyMode(
    toastElement: HTMLElement,
    originalInlineTop: string,
    originalInlineRight: string,
    originalInlineLeft: string
  ): void {
    if (toastElement.classList.contains(this.STICKY_CLASS)) {
      toastElement.classList.remove(this.STICKY_CLASS);
    }

    if (toastElement.style.top !== originalInlineTop) {
      toastElement.style.top = originalInlineTop;
    }

    if (toastElement.style.right !== originalInlineRight) {
      toastElement.style.right = originalInlineRight;
    }

    if (toastElement.style.left !== originalInlineLeft) {
      toastElement.style.left = originalInlineLeft;
    }
  }

  /** Restores all toasts to their original state and removes global listeners. */
  public cleanupAll(): void {
    for (const item of this.stickyItems.values()) {
      this.deactivateStickyMode(
        item.toastElement,
        item.originalInlineTop,
        item.originalInlineRight,
        item.originalInlineLeft
      );
    }

    this.stickyItems.clear();
    this.detachGlobalListenersIfNeeded();
  }
}

interface StickyToastItem {
  toastElement: HTMLElement;
  containerElement: HTMLElement;
  originalInlineTop: string;
  originalInlineRight: string;
  originalInlineLeft: string;
  originalTopOffset: number;
  originalRightOffset: number;
  viewportOffset: number;
  hasBeenEvaluated: boolean;
  isSticky: boolean;
  appliedRightPx: number | null;
}
