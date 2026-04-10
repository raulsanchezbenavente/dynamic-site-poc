import { CdkTrapFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AuthButtonComponent, AuthButtonLayout } from '@dcx/ui/business-common';
import { ViewportSizeService } from '@dcx/ui/libs';
import { TranslatePipe } from '@ngx-translate/core';

import { PrimaryNavComponent } from '../../components/primary-nav/primary-nav.component';
import { SecondaryNavComponents } from '../../components/secondary-nav/enums/secondary-nav-components.enum';
import { SecondaryNavComponent } from '../../components/secondary-nav/secondary-nav.component';
import { MainHeaderBaseComponent } from '../main-header-base/main-header-base.component';

/**
 * Builds the Main Header toggle menu on small screens.
 * Print a 'hamburguer' menu at the top left side of page where users can see all menu
 */
@Component({
  selector: 'main-header-layout-toggle',
  templateUrl: './main-header-layout-toggle.component.html',
  styleUrls: ['./styles/main-header-layout-toggle.styles.scss'],
  host: { class: 'main-header-layout-toggle' },
  imports: [
    CdkTrapFocus,
    TranslatePipe,
    NgTemplateOutlet,
    AuthButtonComponent,
    PrimaryNavComponent,
    SecondaryNavComponent,
  ],
  standalone: true,
})
export class MainHeaderLayoutToggleComponent extends MainHeaderBaseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bottomMenuRef', { static: false }) public secondaryMenuRef!: ElementRef;
  @ViewChild('toggleMenuButton', { static: false }) public toggleMenuBtnRef!: ElementRef<HTMLButtonElement>;
  @ViewChild(PrimaryNavComponent) private readonly primaryNavRef!: PrimaryNavComponent;

  public readonly authButtonLayout = AuthButtonLayout.COMPACT;

  public toggleMenuOpen: boolean;
  public subMenuOpen: boolean;
  public secondaryNavComponents = SecondaryNavComponents;
  private resizeObserver!: ResizeObserver;

  // providers
  private readonly viewportSizeService = inject(ViewportSizeService);

  constructor(protected renderer: Renderer2) {
    super();
    this.toggleMenuOpen = false;
    this.subMenuOpen = false;
  }

  public ngAfterViewInit(): void {
    // Delay initial height measurement to ensure full rendering
    requestAnimationFrame(() => {
      this.observeSecondaryMenuHeight();
    });
    this.applyFixedOnScrollConfig(this.renderer, this.config?.enableFixedHeaderOnScrollMobile);
    this.setFixedHeader(this.renderer, 0);
  }

  @HostListener('window:scroll')
  public onWindowScroll(): void {
    this.setFixedHeader(this.renderer, 0);
  }

  /**
   * Toggles the visibility of the primary menu.
   */
  public toggleMenu(): void {
    const isOpening = !this.toggleMenuOpen;
    this.toggleMenuOpen = isOpening;

    if (isOpening) {
      this.renderer.addClass(document.body, 'body--is-toggle-menu-opened');
      // Force blur to ensure click is interpreted as a new interaction
      this.toggleMenuBtnRef?.nativeElement.blur();

      requestAnimationFrame(() => {
        this.primaryNavRef?.focusFirstItem();
      });
    } else {
      this.renderer.removeClass(document.body, 'body--is-toggle-menu-opened');
      requestAnimationFrame(() => {
        this.toggleMenuBtnRef?.nativeElement.focus();
      });
    }
  }

  /**
   * Navigates back from submenu, closing it.
   */
  public goBackSubMenu(): void {
    this.primaryNavRef?.closeAllSubMenus();
    this.subMenuOpen = false;

    // Wait for the next frame to ensure the submenu has been closed and menu items are fully re-rendered,
    // then restore focus to the active menu item for proper keyboard navigation support.
    requestAnimationFrame(() => {
      const element = this.primaryNavRef.menuItemRefs.find((el) => el.nativeElement.tabIndex === 0)?.nativeElement;
      if (element) {
        element.focus();
      }
    });
  }

  public subMenuOpened(isOpen: boolean): void {
    this.subMenuOpen = isOpen;
  }

  /**
   * Cleanup observer and remove CSS custom property on component destroy.
   */
  public ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    document.documentElement.style.removeProperty('--bottom-menu-height');
    this.renderer.removeClass(document.body, 'body--header-fixed-on-scroll');
    this.renderer.removeClass(document.body, 'body--is-header-fixed');
    this.renderer.removeClass(document.body, 'body--is-toggle-menu-opened');
  }

  /**
   * Sets up a ResizeObserver to dynamically handle height changes of the secondary menu.
   */
  private observeSecondaryMenuHeight(): void {
    if (this.secondaryMenuRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = `${entry.contentRect.height}px`;
          document.documentElement.style.setProperty('--bottom-menu-height', height);
        }
      });

      this.resizeObserver.observe(this.secondaryMenuRef.nativeElement);
    }
  }
}
