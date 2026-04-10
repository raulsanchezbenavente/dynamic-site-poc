import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { AuthButtonComponent, AuthButtonLayout } from '@dcx/ui/business-common';
import { ViewportSizeService } from '@dcx/ui/libs';
import { TranslatePipe } from '@ngx-translate/core';

import { PrimaryNavComponent } from '../../components/primary-nav/primary-nav.component';
import { SecondaryNavComponent } from '../../components/secondary-nav/secondary-nav.component';
import { MainHeaderBaseComponent } from '../main-header-base/main-header-base.component';

/**
 * Header layout component for large screens (desktop).
 * Manages sticky behavior, dynamic header height and auth button layout
 * based on viewport size and scroll position.
 */
@Component({
  selector: 'main-header-layout',
  templateUrl: './main-header-layout.component.html',
  styleUrls: ['./styles/main-header-layout.styles.scss'],
  host: {
    class: 'main-header-layout-default',
  },
  imports: [TranslatePipe, PrimaryNavComponent, SecondaryNavComponent, AuthButtonComponent],
  standalone: true,
})
export class MainHeaderLayoutComponent extends MainHeaderBaseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mainHeader', { static: true }) public mainHeaderRef!: ElementRef<HTMLDivElement>;
  @ViewChild('secondaryNav', { static: false }) private readonly secondaryNavRef?: ElementRef<HTMLDivElement>;

  /**
   * True if the viewport is in the "medium" (compact desktop) range:
   * min-width: --main-header-layout-breakpoint, max-width: 1248px.
   * Used to show the compact auth button layout and other responsive adjustments.
   */
  public readonly isMediumViewport = signal(false);
  public readonly subMenuOpened = signal(false);

  public readonly authButtonLayout = computed(() => {
    if (this.isMediumViewport()) {
      return AuthButtonLayout.COMPACT;
    }
    return this.isHeaderFixed() ? AuthButtonLayout.CONDENSED : AuthButtonLayout.DEFAULT;
  });

  private resizeObserver?: ResizeObserver;
  private lastHeight = 0;
  private secondaryNavHeight = 0;
  private destroyMediumViewportListener?: () => void;
  private isMediaQueryInitialized = false;

  private readonly renderer = inject(Renderer2);
  private readonly viewportSizeService = inject(ViewportSizeService);

  public ngAfterViewInit(): void {
    // Keep header height CSS variable in sync with the actual element height
    this.resizeObserver = new ResizeObserver(() => this.updateHeaderHeight());
    this.resizeObserver.observe(this.mainHeaderRef.nativeElement);

    this.setHeaderOffsetHeight();
    this.updateHeaderHeight();
    this.applyFixedOnScrollConfig(this.renderer, this.config?.enableFixedHeaderOnScroll);
    this.setFixedHeader(this.renderer, this.secondaryNavHeight);
    this.setupMediumViewportDetection();
  }

  @HostListener('window:scroll')
  public onWindowScroll(): void {
    this.setFixedHeader(this.renderer, this.secondaryNavHeight);
  }

  // No manual resize logic needed; media query listener handles viewport changes.

  public ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.destroyMediumViewportListener?.();

    document.documentElement.style.removeProperty('--header-height');
    document.documentElement.style.removeProperty('--main-header-offset-height');
    this.renderer.removeClass(document.body, 'body--header-fixed-on-scroll');
  }

  /**
   * Captures the header height once on initialization.
   * This value is used as padding-top on the page content when the header becomes fixed,
   * preventing layout shift when the header transitions from relative to fixed position.
   */
  private setHeaderOffsetHeight(): void {
    const headerHeight = this.mainHeaderRef.nativeElement.getBoundingClientRect().height;
    this.secondaryNavHeight = this.secondaryNavRef?.nativeElement.getBoundingClientRect().height || 0;

    document.documentElement.style.setProperty('--main-header-offset-height', `${headerHeight}px`);
  }

  private updateHeaderHeight(): void {
    const newHeight = this.mainHeaderRef.nativeElement.getBoundingClientRect().height;
    if (this.lastHeight !== newHeight) {
      this.lastHeight = newHeight;
      document.documentElement.style.setProperty('--header-height', `${newHeight}px`);
    }
  }

  private setupMediumViewportDetection(): void {
    if (this.isMediaQueryInitialized) {
      return;
    }

    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--main-header-layout-breakpoint');
    const mediaQuery = `(width > ${breakpoint}px) and (width < 1248px)`;
    const mql = globalThis.matchMedia(mediaQuery);

    this.isMediumViewport.set(mql.matches);

    const listener = (event: MediaQueryListEvent): void => {
      this.isMediumViewport.set(event.matches);
    };

    mql.addEventListener('change', listener);
    this.isMediaQueryInitialized = true;

    this.destroyMediumViewportListener = (): void => {
      mql.removeEventListener('change', listener);
      this.isMediaQueryInitialized = false;
    };
  }
}
