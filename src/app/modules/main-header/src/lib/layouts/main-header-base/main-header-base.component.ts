import { Component, input, Input, OnInit, Renderer2, signal } from '@angular/core';
import { AuthButtonConfig } from '@dcx/ui/business-common';

import { SecondaryNavComponents } from '../../components/secondary-nav/enums/secondary-nav-components.enum';
import { SecondaryNav } from '../../components/secondary-nav/models/secondary-nav.model';
import { MainHeaderConfig } from '../../models/main-header-config.interface';

@Component({
  template: '',
  standalone: true,
})
export abstract class MainHeaderBaseComponent implements OnInit {
  @Input() public config!: MainHeaderConfig;
  public readonly isResponsive = input<boolean>(false);

  public secondaryNavOptions!: SecondaryNav;
  public secondaryNavOptionsMobile!: SecondaryNav;
  public authButtonConfig!: AuthButtonConfig;
  public readonly isHeaderFixed = signal(false);

  constructor() {}

  public ngOnInit(): void {
    this.internalInit();
  }

  protected internalInit(): void {
    if (this.config) {
      this.secondaryNavOptions = this.buildSecondaryNav(this.config.secondaryNavAvailableOptions);
      this.secondaryNavOptionsMobile = this.buildSecondaryNav(this.config.secondaryNavOptionsMobile);
      this.setAuthButtonConfig();
    }
  }

  protected setAuthButtonConfig(): void {
    this.authButtonConfig = {
      culture: this.config.culture,
    };
  }

  protected buildSecondaryNav(availableComponents: SecondaryNavComponents[]): SecondaryNav {
    return {
      availableComponents: availableComponents,
      config: {
        languageSelectorListConfig: this.config.languageSelectorListConfig,
        culture: this.config.culture,
      },
    };
  }

  /**
   * Toggles the `body--is-header-fixed` class on the document body
   * based on the current scroll position.
   * Called on scroll events and during initialization.
   * @param renderer - Angular Renderer2 used to safely manipulate the DOM.
   * @param scrollThreshold - Scroll offset in pixels that must be exceeded
   *   before the header is considered fixed.
   *   Large screens passes the secondary nav height; medium/small screens passes 0.
   */
  protected setFixedHeader(renderer: Renderer2, scrollThreshold: number): void {
    const isScrolledPast = globalThis.scrollY > scrollThreshold;

    if (this.isHeaderFixed() === isScrolledPast) {
      return;
    }

    this.isHeaderFixed.set(isScrolledPast);

    if (isScrolledPast) {
      renderer.addClass(document.body, 'body--is-header-fixed');
    } else {
      renderer.removeClass(document.body, 'body--is-header-fixed');
    }
  }

  /**
   * Applies the `body--header-fixed-on-scroll` class to the document body
   * when the corresponding config flag is enabled.
   * Called once during initialization.
   * Large screens passes `config.enableFixedHeaderOnScroll`;
   * Medium/small screens passes `config.enableFixedHeaderOnScrollMobile`.
   * @param renderer - Angular Renderer2 used to safely manipulate the DOM.
   * @param enabled - Resolved boolean value from the current device-specific config.
   */
  protected applyFixedOnScrollConfig(renderer: Renderer2, enabled: boolean | undefined): void {
    if (enabled) {
      renderer.addClass(document.body, 'body--header-fixed-on-scroll');
    }
  }
}
