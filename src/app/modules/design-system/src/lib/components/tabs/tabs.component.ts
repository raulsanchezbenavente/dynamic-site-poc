import {
  AfterViewInit,
  Component,
  computed,
  ContentChildren,
  effect,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  runInInjectionContext,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { AriaAttributes, generateIdWithUUID, KeyCodeEnum, ResizeSvc, SliderBreakpointsConfig } from '@dcx/ui/libs';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { IconComponent } from '../icon';

import { TabComponent } from './components/tab/tab.component';
import { TabTriggerConfig } from './models/tab-trigger.config';
import { TabConfig } from './models/tab.config';
import { TabsConfig } from './models/tabs.config';
import { TabsService } from './services/tabs.service';

const DEFAULT_TABS_BREAKPOINT_CONFIG: SliderBreakpointsConfig = {
  XS: { visibleItems: 1 },
  S: { visibleItems: 2 },
  M: { visibleItems: 2 },
  L: { visibleItems: 3 },
  XL: { visibleItems: 4 },
  XXL: { visibleItems: 4 },
};

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./styles/tabs.styles.scss'],
  imports: [TabComponent, IconComponent],
  standalone: true,
})
/**
 * TabsComponent provides a horizontally scrollable tab interface with keyboard accessibility,
 * responsive behavior, and support for both static and projected content.
 */
export class TabsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Public readonly inputs via signal
  public readonly config = input.required<TabsConfig>();
  public readonly selectedTabId = input<string | null>(null);
  public readonly group = input<string>('default');
  public ariaLiveMessage = signal<string>('');

  // Signals
  public currentIndex = signal(0);
  public readonly selectedTabIndex = signal<number>(-1); // Start with -1 to indicate no tab selected initially
  public focusedTabIndex = signal(0);
  public isKeyboardNavigation = signal(false);
  public tabItems = signal<TabConfig[]>([]);
  private readonly totalItems = signal(0);

  @Output() public selectedTab = new EventEmitter<TabConfig>();

  @ViewChild('tablistContent', { static: true }) public trackRef!: ElementRef<HTMLDivElement>;
  @ContentChildren(TabComponent) public projectedTabPanels!: QueryList<TabComponent>;
  @ViewChildren(TabComponent) public tabPanels!: QueryList<TabComponent>;

  // Computed state
  public hasPrev = computed(() => this.currentIndex() > 0);
  public hasNext = computed(() => {
    return this.currentIndex() < this.totalItems() - this.visibleItems;
  });
  public hasProjectedTabs = computed(() => this.projectedTabPanels?.length > 0);
  public hasNavigation = computed(() => this.totalItems() > this.visibleItems);
  public transformStyle = computed(() => {
    const index = this.currentIndex();
    const widthPerItem = 100 / this.visibleItems;
    return `translateX(-${index * widthPerItem}%)`;
  });

  // Select Tab Indicator
  // Delayed index used only for animating the selected tab indicator
  private readonly delayedIndex = signal(0);
  // Indicator position (translateX), based on the delayed index
  public indicatorTranslateX = computed(() => {
    return this.delayedIndex() * (100 / this.visibleItems);
  });
  // Indicator width as a percentage of visible items
  public indicatorWidth = computed(() => {
    return 100 / this.visibleItems;
  });

  public ids: AriaAttributes[] = [];

  private resizeSubscription: Subscription | null = null;
  private readonly ACTIVE_TAB_PARAM = 'activeTab';

  private readonly _visibleItems = signal(3);
  private readonly _itemsToScroll = signal(1);
  private readonly translateService = inject(TranslateService);
  private readonly injector = inject(EnvironmentInjector);
  private readonly resizeService = inject(ResizeSvc);
  private readonly tabsService = inject(TabsService);

  public get visibleItems(): number {
    return this._visibleItems();
  }
  public get itemsToScroll(): number {
    return this._itemsToScroll();
  }

  public ngOnInit(): void {
    this.internalInit();
  }

  public ngAfterViewInit(): void {
    this.setVisibleItemsProperty();
    this.subscribeToResize();

    runInInjectionContext(this.injector, () => {
      // Effect to sync config changes to tabItems
      effect(() => {
        const config = this.config();
        const currentItems = this.tabItems();

        const updatedItems = config.items.map((configTab, index) => {
          const existingTab = currentItems[index];
          return {
            ...configTab,
            id: existingTab?.id ?? configTab.id ?? generateIdWithUUID('tabId_'),
          };
        });

        if (this.hasTabItemsChanges(updatedItems, currentItems)) {
          this.tabItems.set(updatedItems);

          if (updatedItems.length !== this.totalItems()) {
            this.totalItems.set(updatedItems.length);
            this.ids = updatedItems.map((_, i) => this.ids[i] ?? { ariaControls: generateIdWithUUID('panelId_') });
          }
        }
      });

      effect(() => {
        const tabs = this.tabItems();
        const selectedId = this.selectedTabId();
        let matchedIndex = -1;

        if (selectedId) {
          matchedIndex = tabs.findIndex((tab) => tab.id === selectedId);
        }

        // Only set default tab if no selectedId and no URL parameter
        if (matchedIndex < 0 && !this.hasActiveTabParam()) {
          matchedIndex = tabs.length > 0 ? 0 : -1;
        }

        const currentSelected = this.selectedTabIndex();

        if (matchedIndex >= 0 && matchedIndex !== currentSelected) {
          this.selectedTabIndex.set(matchedIndex);
          this.focusedTabIndex.set(matchedIndex);
          this.ensureTabVisible(matchedIndex);
          this.updateDelayedIndex(matchedIndex);
        }
      });

      effect(() => {
        const index = this.selectedTabIndex();
        const tabPanels = this.hasProjectedTabs() ? this.projectedTabPanels.toArray() : this.tabPanels.toArray();

        if (!tabPanels?.length) return;

        for (const [i, tabPanel] of tabPanels.entries()) {
          tabPanel.setIds({
            ariaControls: this.ids[i].ariaControls,
          });

          if (tabPanel.isSelected() !== (i === index)) {
            tabPanel.setSelected(i === index);
          }
        }
      });

      effect(() => {
        const idx = this.selectedTabIndex();
        const items = this.tabItems();
        if (idx >= 0 && idx < items.length) {
          this.tabsService.select(items[idx], this.group());
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
  }

  /**
   * Selects a tab by index. Updates selected and focused indexes and emits selection event.
   * Also updates the visual indicator with a slight delay to trigger animation.
   *
   * @param index - The index of the tab to select.
   */
  public selectTab(index: number): void {
    const tab = this.tabItems()[index];
    this.focusedTabIndex.set(index);
    if (tab.isDisabled) return;
    if (this.selectedTabIndex() !== index) {
      this.selectedTabIndex.set(index);
      this.selectedTab.emit(tab);

      // Update URL parameter to reflect current tab selection
      this.updateUrlActiveTabParam(index, tab);

      // Announce the selected tab label to screen readers
      const label = tab.tabTrigger.text;
      this.announceAriaLiveMessage(`${label} ${this.translateService.instant('Common.A11y.IsSelected')}`);

      this.tabsService.select(tab, this.group());
    }

    // Slight delay to trigger indicator animation separately from state change
    this.updateDelayedIndex(index);
  }

  /**
   * Handles keyboard navigation using arrow keys to move between tabs.
   * Supports optional auto-activation (select on focus).
   *
   * @param event - The keyboard event from the tab button.
   */
  /**
   * Handles keyboard navigation for tabs using Arrow keys, Home, and End.
   * Arrow keys cycle focus (and selection if auto-activation is enabled).
   * Home focuses the first tab, End focuses the last tab.
   *
   * @param event - The keyboard event triggered by a tab button.
   */
  public onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case KeyCodeEnum.ARROW_RIGHT:
      case KeyCodeEnum.ARROW_LEFT:
        event.preventDefault();
        this.handleArrowNavigation(event.key);
        break;

      case KeyCodeEnum.HOME:
        event.preventDefault();
        this.focusFirstTab();
        break;

      case KeyCodeEnum.END:
        event.preventDefault();
        this.focusLastTab();
        break;

      case KeyCodeEnum.TAB:
      case 'Shift':
        this.isKeyboardNavigation.set(false);
        break;
    }
  }

  /**
   * Handles focus events on tab buttons.
   * Ensures that the focused tab is visible within the current scroll range.
   *
   * @param index - The index of the tab that received focus.
   */
  public onTabFocus(index: number): void {
    const visibleStart = this.currentIndex();
    const visibleEnd = visibleStart + this.visibleItems - 1;

    if (index < visibleStart) {
      this.currentIndex.set(index);
    } else if (index > visibleEnd) {
      this.currentIndex.set(index - this.visibleItems + 1);
    }
  }

  /**
   * Scrolls to the next tab group, if available.
   */
  public next(): void {
    const maxIndex = this.totalItems() - this.visibleItems;
    const nextIndex = this.currentIndex() + this.itemsToScroll;

    if (nextIndex <= maxIndex) {
      this.currentIndex.set(nextIndex);

      const { liveKey, count } = this.getDirKeys('Right');
      const scrolled = this.translateService.instant(liveKey, { count });

      if (nextIndex === maxIndex) {
        const endMsg = this.translateService.instant(this.getNoMoreKey('Right'));
        this.announceAriaLiveMessage(`${scrolled}. ${endMsg}`);
      } else {
        this.announceAriaLiveMessage(scrolled);
      }
    } else {
      const endMsg = this.translateService.instant(this.getNoMoreKey('Right'));
      this.announceAriaLiveMessage(endMsg);
    }
  }

  /**
   * Scrolls to the previous tab group, if available.
   */
  public prev(): void {
    const current = this.currentIndex();
    if (current <= 0) {
      this.announceAriaLiveMessage(this.translateService.instant(this.getNoMoreKey('Left')));
      return;
    }

    const moved = Math.min(this.itemsToScroll, current);
    const newIndex = current - moved;
    this.currentIndex.set(newIndex);

    const suffix = moved === 1 ? '1' : 'N';
    const scrolled = this.translateService.instant(`Common.Tabs.Scrolled_Left_${suffix}`, { count: moved });

    if (newIndex === 0) {
      const endMsg = this.translateService.instant(this.getNoMoreKey('Left'));
      this.announceAriaLiveMessage(`${scrolled}. ${endMsg}`);
    } else {
      this.announceAriaLiveMessage(scrolled);
    }
  }

  public scrollLeftAriaLabel = computed(() => {
    const { btnKey, count } = this.getDirKeys('Left');
    return this.translateService.instant(btnKey, { count });
  });

  public scrollRightAriaLabel = computed(() => {
    const { btnKey, count } = this.getDirKeys('Right');
    return this.translateService.instant(btnKey, { count });
  });

  // Screen reader support: aria label and announcements
  private getDirKeys(dir: 'Left' | 'Right'): { btnKey: string; liveKey: string; count: number } {
    const count = Math.max(1, this.itemsToScroll);
    const suffix = count === 1 ? '1' : 'N';
    return {
      btnKey: `Common.Tabs.Scroll_${dir}_${suffix}`, // prev/next buttons
      liveKey: `Common.Tabs.Scrolled_${dir}_${suffix}`, // live region announcement
      count,
    };
  }

  private getNoMoreKey(dir: 'Left' | 'Right'): string {
    return dir === 'Left' ? 'Common.Tabs.NoMore_Left' : 'Common.Tabs.NoMore_Right';
  }

  private announceAriaLiveMessage(message: string): void {
    this.ariaLiveMessage.set('');

    requestAnimationFrame(() => {
      this.ariaLiveMessage.set(message);
      setTimeout(() => {
        this.ariaLiveMessage.set('');
      }, 2400);
    });
  }

  /**
   * Initializes the tab component by subscribing to services and generating IDs.
   */
  private internalInit(): void {
    this.setTotalItems();
    this.generateIds();
    // Check URL params early to determine if we should skip default tab selection
    this.checkUrlParams();
  }

  /**
   * Generates unique IDs for each tab and associated panel for accessibility.
   */
  private generateIds(): void {
    const resolvedTabs: TabConfig[] = this.config().items.map((tab) => {
      return {
        ...tab,
        id: tab.id ?? generateIdWithUUID('tabId_'),
      };
    });

    this.tabItems.set(resolvedTabs);

    this.ids = resolvedTabs.map(() => ({
      ariaControls: generateIdWithUUID('panelId_'),
    }));
  }

  /**
   * Sets the CSS custom property to reflect the number of visible tab items.
   */
  private setVisibleItemsProperty(): void {
    this.trackRef.nativeElement.style.setProperty('--tabs-visible-items', this.visibleItems.toString());
  }

  /**
   * Subscribes to screen size changes and updates the number of visible tabs
   * based on the responsive breakpoint configuration provided in `config`.
   */
  private subscribeToResize(): void {
    this.resizeSubscription = this.resizeService.layout$.subscribe((size) => {
      const config = this.config();
      if (!config) return;

      const breakPoints: SliderBreakpointsConfig = {
        ...DEFAULT_TABS_BREAKPOINT_CONFIG,
        ...config.breakPointConfig,
      };

      const breakPoint =
        breakPoints[size?.toLowerCase() as keyof SliderBreakpointsConfig] ??
        breakPoints[size?.toUpperCase() as keyof SliderBreakpointsConfig];

      if (breakPoint) {
        const visible = Math.min(breakPoint.visibleItems, this.totalItems());
        this._visibleItems.set(visible);

        const scrollItems = breakPoint.itemsToScroll ?? 1;
        this._itemsToScroll.set(scrollItems);

        this.setVisibleItemsProperty();
        this.currentIndex.set(0);
      }
    });
  }

  /**
   * Sets the total number of tabs based on configuration.
   */
  private setTotalItems(): void {
    const length = this.config().items.length;
    this.totalItems.set(length);
  }

  /**
   * Handles navigation between tabs using arrow keys.
   * Calculates the new index based on the direction (left or right),
   * updates the focused and optionally selected tab, and ensures proper scroll position.
   *
   * @param key - The arrow key pressed ('ArrowRight' or 'ArrowLeft').
   */
  private handleArrowNavigation(key: string): void {
    const total = this.totalItems();
    const visible = this.visibleItems;
    const current = this.focusedTabIndex();
    let newIndex = current;

    this.isKeyboardNavigation.set(true);

    if (key === KeyCodeEnum.ARROW_RIGHT) {
      newIndex = current + 1 >= total ? 0 : current + 1;
    } else if (key === KeyCodeEnum.ARROW_LEFT) {
      newIndex = current - 1 < 0 ? total - 1 : current - 1;
    }

    this.focusedTabIndex.set(newIndex);
    this.focusTabButton(newIndex);

    const nextTab = this.config().items[newIndex];
    const autoActivate = this.config().autoSelectOnFocus ?? true;
    if (!nextTab.isDisabled && autoActivate && this.selectedTabIndex() !== newIndex) {
      this.selectedTabIndex.set(newIndex);
      this.selectedTab.emit(nextTab);

      // Update URL parameter to reflect current tab selection
      this.updateUrlActiveTabParam(newIndex, nextTab);

      this.tabsService.select(nextTab, this.group());

      this.updateDelayedIndex(newIndex);
    }

    // Scroll logic
    if (key === KeyCodeEnum.ARROW_RIGHT && newIndex >= this.currentIndex() + visible) {
      this.next();
    } else if (key === KeyCodeEnum.ARROW_LEFT && newIndex < this.currentIndex()) {
      this.prev();
    }
  }

  /**
   * Focuses and optionally selects the first tab in the tab list.
   * Also resets the scroll position to the beginning.
   */
  private focusFirstTab(): void {
    const firstIndex = 0;
    this.isKeyboardNavigation.set(true);
    this.focusedTabIndex.set(firstIndex);
    this.focusTabButton(firstIndex);

    const firstTab = this.config().items[firstIndex];
    const autoActivate = this.config().autoSelectOnFocus ?? true;
    if (!firstTab.isDisabled && autoActivate) {
      this.selectedTabIndex.set(firstIndex);
      this.selectedTab.emit(firstTab);

      this.tabsService.select(firstTab, this.group());
    }

    this.currentIndex.set(0);
  }

  /**
   * Focuses and optionally selects the last tab in the tab list.
   * Also adjusts the scroll position so the last tab is visible.
   */
  private focusLastTab(): void {
    const lastIndex = this.totalItems() - 1;
    this.isKeyboardNavigation.set(true);
    this.focusedTabIndex.set(lastIndex);
    this.focusTabButton(lastIndex);

    const lastTab = this.config().items[lastIndex];
    const autoActivate = this.config().autoSelectOnFocus ?? true;
    if (!lastTab.isDisabled && autoActivate) {
      this.selectedTabIndex.set(lastIndex);
      this.selectedTab.emit(lastTab);

      this.tabsService.select(lastTab, this.group());
    }

    this.currentIndex.set(Math.max(lastIndex - this.visibleItems + 1, 0));
  }

  /**
   * Sets focus on the tab button at the given index.
   * This is executed asynchronously using `queueMicrotask` to ensure DOM readiness.
   *
   * @param index - The index of the tab button to focus.
   */
  private focusTabButton(index: number): void {
    queueMicrotask(() => {
      const tabButtons = this.trackRef.nativeElement.querySelectorAll('button[role="tab"]');
      const button = tabButtons[index] as HTMLButtonElement;
      button?.focus();
    });
  }

  /**
   * Checks if there's an 'activeTab' parameter in the current URL.
   *
   * @returns True if the activeTab parameter exists, false otherwise
   */
  private hasActiveTabParam(): boolean {
    const urlParams = new URLSearchParams(globalThis.location.search);
    return urlParams.has(this.ACTIVE_TAB_PARAM);
  }

  /**
   * Checks URL parameters and activates the tab based on the 'activeTab' parameter.
   * Supports both numeric index and text-based search.
   */
  private checkUrlParams(): void {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const activeTabParam = urlParams.get(this.ACTIVE_TAB_PARAM);

    if (activeTabParam !== null) {
      let tabIndex = -1;

      // First try to parse as numeric index
      const numericIndex = Number.parseInt(activeTabParam, 10);
      if (!Number.isNaN(numericIndex) && numericIndex >= 1 && numericIndex <= this.totalItems()) {
        // Convert from 1-based to 0-based index
        tabIndex = numericIndex - 1;
      } else {
        // If not a valid numeric index, search by text
        tabIndex = this.findTabIndexByText(activeTabParam);
      }

      // Use selectTab for all cases - it handles disabled tabs and fallbacks automatically
      // If tabIndex is -1 (not found), fallback to first tab (index 0)
      const targetIndex = Math.max(tabIndex, 0);
      this.selectTab(targetIndex);
      requestAnimationFrame(() => {
        // Ensure the tab is visible by adjusting scroll position
        this.ensureTabVisible(targetIndex);
      });
    }
  }

  /**
   * Finds the tab index by searching for text in the tab trigger.
   * Supports exact match and case-insensitive partial match.
   *
   * @param searchText - The text to search for in tab triggers
   * @returns The index of the matching tab, or -1 if not found
   */
  private findTabIndexByText(searchText: string): number {
    const tabs = this.tabItems();
    const normalizedSearch = searchText.toLowerCase().trim();

    // First try exact match (case-insensitive)
    let foundIndex = tabs.findIndex((tab) => tab.tabTrigger.text.toLowerCase() === normalizedSearch);

    // If no exact match, try partial match
    if (foundIndex === -1) {
      foundIndex = tabs.findIndex((tab) => tab.tabTrigger.text.toLowerCase().includes(normalizedSearch));
    }

    // Also check secondary text if available
    if (foundIndex === -1) {
      foundIndex = tabs.findIndex((tab) => tab.tabTrigger.secondaryText?.toLowerCase().includes(normalizedSearch));
    }

    return foundIndex;
  }

  /**
   * Ensures that the specified tab index is visible within the current scroll range.
   * Adjusts the currentIndex if necessary to make the tab visible.
   *
   * @param tabIndex - The index of the tab that should be visible.
   */
  private ensureTabVisible(tabIndex: number): void {
    const visibleStart = this.currentIndex();
    const visibleEnd = visibleStart + this.visibleItems - 1;

    if (tabIndex < visibleStart) {
      // Tab is to the left of visible area, scroll left to show it
      this.currentIndex.set(tabIndex);
    } else if (tabIndex > visibleEnd) {
      // Tab is to the right of visible area, scroll right to show it
      const newCurrentIndex = Math.max(0, tabIndex - this.visibleItems + 1);
      this.currentIndex.set(newCurrentIndex);
    }
  }

  /**
   * Updates the URL parameter 'activeTab' to reflect the current tab selection.
   * Preserves the original format used (numeric index or text).
   *
   * @param index - The index of the selected tab
   * @param tab - The selected tab configuration
   */
  private updateUrlActiveTabParam(index: number, tab: TabConfig): void {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const currentActiveTab = urlParams.get(this.ACTIVE_TAB_PARAM);

    if (currentActiveTab !== null) {
      let newActiveTabValue: string;

      // Check if the original parameter was numeric
      const originalNumeric = Number.parseInt(currentActiveTab, 10);
      if (Number.isNaN(originalNumeric)) {
        // Original was text-based, use the tab's text
        newActiveTabValue = tab.tabTrigger.text;
      } else {
        // Original was numeric, use index + 1 (1-based indexing for user-friendly URLs)
        newActiveTabValue = (index + 1).toString();
      }

      // Update the URL parameter
      urlParams.set(this.ACTIVE_TAB_PARAM, newActiveTabValue);

      // Update the browser URL without reloading the page
      const newUrl = `${globalThis.location.pathname}?${urlParams.toString()}${globalThis.location.hash}`;
      globalThis.history.replaceState({}, '', newUrl);
    }
  }

  private updateDelayedIndex(index: number): void {
    setTimeout(() => {
      this.delayedIndex.set(index);
    }, 60);
  }

  /**
   * Checks if there are any changes between updated and current tab items.
   * Compares array length and tab trigger properties to detect modifications.
   *
   * @param updatedItems - The new array of tab items
   * @param currentItems - The current array of tab items
   * @returns True if there are changes, false otherwise
   */
  private hasTabItemsChanges(updatedItems: TabConfig[], currentItems: TabConfig[]): boolean {
    if (updatedItems.length !== currentItems.length) {
      return true;
    }

    return updatedItems.some(
      (item, i) => !currentItems[i] || !this.areTabTriggersEqual(item.tabTrigger, currentItems[i].tabTrigger)
    );
  }

  /**
   * Compares two TabTriggerConfig objects for equality by checking their properties.
   * More efficient than JSON.stringify as it only compares relevant fields.
   *
   * @param a - First TabTriggerConfig to compare
   * @param b - Second TabTriggerConfig to compare
   * @returns True if both objects have the same property values
   */
  private areTabTriggersEqual(a: TabTriggerConfig, b: TabTriggerConfig): boolean {
    if (a.text !== b.text) return false;
    if (a.secondaryText !== b.secondaryText) return false;

    // Compare icon objects
    if (a.icon !== b.icon) {
      // If one is undefined/null and the other isn't, they're different
      if (!a.icon || !b.icon) return false;

      // Compare icon properties
      if (a.icon.name !== b.icon.name) return false;
    }

    return true;
  }
}
