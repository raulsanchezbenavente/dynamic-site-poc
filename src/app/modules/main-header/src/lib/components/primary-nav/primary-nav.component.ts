import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { ClickOutsideDirective, GenerateIdPipe, KeyCodeEnum } from '@dcx/ui/libs';

import { MainHeaderBaseComponent } from '../../layouts/main-header-base/main-header-base.component';
import { MainMenuItem } from '../../models/main-menu-item.model';
import { PrimaryNavSubMenuComponent } from '../primary-nav-sub-menu/primary-nav-sub-menu.component';
import { IconComponent } from '@dcx/storybook/design-system';
import { NgClass } from '@angular/common';

/**
 * Primary navigation component for the main header.
 * - Supports desktop and mobile layouts (responsive).
 * - Implements accessible keyboard navigation (WAI-ARIA menubar pattern).
 * - Manages expanded state for a single submenu at a time.
 *
 * External link for full keyboard interaction spec and dev guidelines:
 * https://flyr.atlassian.net/wiki/spaces/DC/pages/5423825502/Main+Header+A11y+Keyboard+Navigation+for+Menus
 */
@Component({
  selector: 'primary-nav',
  templateUrl: './primary-nav.component.html',
  styleUrls: ['./styles/primary-nav.styles.scss'],
  host: { class: 'primary-nav' },
  imports: [
    ClickOutsideDirective,
    NgClass,
    PrimaryNavSubMenuComponent,
    IconComponent,
  ],
  standalone: true,
})
export class PrimaryNavComponent extends MainHeaderBaseComponent implements OnInit {
  @Input() public mainMenuList!: MainMenuItem[];

  /**
   * Disables clickOutside when submenu is open (used in mobile layout).
   * In desktop, allows closing submenu by clicking outside.
   */
  @Input() public disableClickOutside = false;

  @Output() public subMenuOpened = new EventEmitter<boolean>();
  @Output() public closedByEscEmit = new EventEmitter<boolean>();

  @ViewChildren('menuItem') public menuItemRefs!: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren(PrimaryNavSubMenuComponent) private readonly subMenusComponents!: QueryList<PrimaryNavSubMenuComponent>;

  /** Index of the active menu item based on current URL */
  public activeMenuItemIndex: number | null = null;

  public readonly focusedSubmenuIndex = signal<number | null>(null);

  public readonly subMenuOpen = computed(() => Object.keys(this.expandedIndexes()).length > 0);

  /** Whether clickOutside should be active (only in desktop when submenu is open) */
  public readonly clickOutsideIsActive = computed<boolean>(() => !this.disableClickOutside && this.subMenuOpen());

  /** Index of the currently focused top-level menu item */
  private readonly focusedMenuIndex = signal<number>(0);
  private readonly expandedIndexes = signal<Record<number, boolean>>({});

  private readonly generateId = inject(GenerateIdPipe);

  public override ngOnInit(): void {
    super.ngOnInit();
    this.setActiveMenuItemIndex(this.mainMenuList);
    this.ensureMenuItemIds();
  }

  /**
   * Returns tabindex for a top-level menu item.
   * Mobile: hide trigger from Tab flow when submenu is open.
   * Desktop: only the current focusable item gets tabindex 0.
   */
  public getTabIndex(index: number): number {
    // Hide the trigger from the Tab flow while its submenu is open (mobile & desktop).
    if (this.isExpanded(index)) return -1;
    return this.isFocusable(index) ? 0 : -1;
  }

  /**
   * Opens or closes the submenu at a given index.
   * If `afterOpenFocus` is provided, runs it after the submenu is rendered.
   */
  public toggleSubMenu(index: number, afterOpenFocus?: () => void): void {
    const current = this.expandedIndexes();
    const isAlreadyOpen = !!current[index];
    const newState = isAlreadyOpen ? {} : { [index]: true };
    this.expandedIndexes.set(newState);
    this.subMenuOpened.emit(!isAlreadyOpen);
    if (!isAlreadyOpen && afterOpenFocus) requestAnimationFrame(afterOpenFocus);
  }

  /**
   * TrackBy function for menu items to optimize rendering.
   * Uses item ID if available, otherwise falls back to index.
   */
  public trackByMenuItem(index: number, item: MainMenuItem): string {
    return item.id ?? String(index);
  }

  /**
   * Handles submenu toggle via click.
   * Stops propagation to avoid triggering clickOutside logic.
   */
  public onToggleClick(event: MouseEvent, index: number): void {
    this.toggleSubMenu(index);
  }

  /** Returns true if the submenu at `index` is currently expanded */
  public isExpanded(index: number): boolean {
    return this.expandedIndexes()[index] ?? false;
  }

  /**
   * Closes the submenu at the given index.
   * Also restores focus to the triggering menu item.
   */
  public onCloseMenu(index: number): void {
    const current = { ...this.expandedIndexes() };
    if (current[index]) {
      delete current[index];
      this.expandedIndexes.set(current);
      this.subMenuOpened.emit(false);
    }
    this.focusMenuItem(index);
    this.closedByEscEmit.emit(true);
  }

  public closeAllSubMenus(): void {
    this.expandedIndexes.set({});
    this.subMenuOpened.emit(false);
  }

  /**
   * Handles the case when focus moves out of an open submenu via the Tab key.
   *
   * Desktop:
   *   - Runs after the browser has moved focus (setTimeout(0) ensures this).
   *   - Checks if the newly focused element is still inside any open submenu.
   *   - If not, closes all submenus.
   *
   * Mobile:
   *   - No action. In responsive (drawer) mode, focus is trapped inside the menu
   *     and submenus are closed only via the close/back controls.
   */
  public onSubmenuTabOut(): void {
    if (this.isMobile) return;
    requestAnimationFrame(() => {
      const active = document.activeElement as HTMLElement | null;
      const isInsideAnySubmenu = this.subMenusComponents.some((subMenuCmp) =>
        subMenuCmp.hostEl.nativeElement.contains(active)
      );

      if (!isInsideAnySubmenu) {
        this.closeAllSubMenus();
      }
    });
  }

  private get isMobile(): boolean {
    return this.isResponsive();
  }

  /**
   * Determines the active menu item index based on the current URL path.
   * Checks both top-level items and nested submenu links.
   */
  private setActiveMenuItemIndex(list: MainMenuItem[], currentPath?: string): void {
    const path = currentPath ?? new URL(globalThis.location.href).pathname;

    const activeIndex = list.findIndex((item) => {
      const itemPath = item.link ? new URL(item.link.url, globalThis.location.origin).pathname : '';
      if (itemPath === path) return true;

      return item.columns.some((column) =>
        column.sections.some((section) => {
          const sectionPath = new URL(section.link.url, globalThis.location.origin).pathname;
          return sectionPath === path;
        })
      );
    });

    this.activeMenuItemIndex = activeIndex;
  }

  /**
   * Ensures that each menu item has a unique ID.
   * Needed for accessibility (aria-controls) and for `trackBy`.
   */
  private ensureMenuItemIds(): void {
    for (const item of this.mainMenuList) {
      if (!item.id) {
        item.id = this.generateId.transformWithUUID('primaryNavItemId');
      }
    }
  }

  // -------------------
  // Keyboard Navigation
  // -------------------
  /**
   * Handles keyboard interactions for top-level menu items.
   * Behavior changes depending on layout:
   * - Desktop:
   *   ArrowLeft/ArrowRight: Navigate between items
   *   ArrowDown/Enter/Space: Open submenu
   * - Mobile:
   *   ArrowUp/ArrowDown: Navigate between items
   *   ArrowRight/Enter/Space: Open submenu
   * ESC always closes the submenu and restores focus to the parent.
   */
  public onKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;
    const total = this.mainMenuList.length;
    const hasSubmenu = !this.mainMenuList[index]?.link?.url;
    const mobile = this.isMobile;

    const moveNextKey = this.isResponsive() ? KeyCodeEnum.ARROW_DOWN : KeyCodeEnum.ARROW_RIGHT;
    const movePrevKey = this.isResponsive() ? KeyCodeEnum.ARROW_UP : KeyCodeEnum.ARROW_LEFT;

    switch (key) {
      case moveNextKey:
        event.preventDefault();
        this.focusedMenuIndex.set((index + 1) % total);
        this.focusMenuItem(this.focusedMenuIndex());
        this.closeAllSubMenus();
        break;

      case movePrevKey:
        event.preventDefault();
        this.focusedMenuIndex.set((index - 1 + total) % total);
        this.focusMenuItem(this.focusedMenuIndex());
        this.closeAllSubMenus();
        break;

      case KeyCodeEnum.ENTER:
      case KeyCodeEnum.SPACE:
        if (!hasSubmenu) return;
        event.preventDefault();
        this.openSubMenuAndFocus(index);
        break;

      case KeyCodeEnum.ARROW_DOWN:
        if (mobile || !hasSubmenu) return;
        event.preventDefault();
        this.openSubMenuAndFocus(index);
        break;

      case KeyCodeEnum.ARROW_RIGHT:
        if (!mobile || !hasSubmenu) return;
        event.preventDefault();
        this.openSubMenuAndFocus(index);
        break;

      case KeyCodeEnum.ESCAPE:
        event.preventDefault();
        this.closeAllSubMenus();
        this.focusMenuItem(index);
        break;

      default:
        break;
    }
  }

  /**
   * Focuses the top-level menu item at the given index.
   * Called after arrow navigation or closing submenu with ESC.
   */
  private focusMenuItem(index: number): void {
    const item = this.menuItemRefs.get(index);
    item?.nativeElement.focus();
  }

  /** True if the menu item at `index` is the current keyboard focus target */
  public isFocusable(index: number): boolean {
    return this.focusedMenuIndex() === index;
  }

  /** Moves focus to the first menu item (used when menu is opened) */
  public focusFirstItem(): void {
    this.menuItemRefs.first?.nativeElement.focus();
  }

  /**
   * Opens submenu at `index` (if not already open) and focuses the first item inside it.
   */
  private openSubMenuAndFocus(index: number): void {
    if (!this.isExpanded(index)) {
      this.toggleSubMenu(index, () => {
        this.focusedSubmenuIndex.set(0);
        this.subMenusComponents.first?.focusFirstItem();
      });
    }
  }
}
