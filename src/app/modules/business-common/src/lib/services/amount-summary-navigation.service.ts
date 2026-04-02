import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AmountSummaryNavigationService {
  private readonly _itemIds = signal<string[]>([]);
  private readonly _currentItemIndex = signal<number>(0);
  private readonly _isNavigationEnabled = signal<boolean>(false);

  // Public readonly signals
  public readonly itemIds = this._itemIds.asReadonly();
  public readonly currentItemIndex = this._currentItemIndex.asReadonly();
  public readonly isNavigationEnabled = this._isNavigationEnabled.asReadonly();

  // Computed signals for navigation state
  public readonly isFirstItem = computed(() => this._currentItemIndex() === 0);
  public readonly isLastItem = computed(
    () => this._itemIds().length > 0 && this._currentItemIndex() === this._itemIds().length - 1
  );
  public readonly hasMultipleItems = computed(() => this._itemIds().length > 1);
  public readonly canNavigatePrevious = computed(() => this._isNavigationEnabled() && this._currentItemIndex() > 0);
  public readonly canNavigateNext = computed(
    () => this._isNavigationEnabled() && this._currentItemIndex() < this._itemIds().length - 1
  );
  public readonly currentItemId = computed(() => {
    const items = this._itemIds();
    const index = this._currentItemIndex();
    return items[index] || null;
  });

  /**
   * Initializes the navigation with item IDs
   */
  public initializeNavigation(itemIds: string[], initialItemId?: string): void {
    this._itemIds.set(itemIds);
    this._isNavigationEnabled.set(itemIds.length > 1);

    // Set initial index based on initialItemId or default to 0
    let initialIndex = 0;
    if (initialItemId) {
      const foundIndex = itemIds.indexOf(initialItemId);
      if (foundIndex >= 0) {
        initialIndex = foundIndex;
      }
    }
    this._currentItemIndex.set(initialIndex);
  }

  /**
   * Updates the current item by ID
   */
  public setCurrentItem(itemId: string): void {
    const items = this._itemIds();
    const index = items.indexOf(itemId);

    if (index >= 0) {
      this._currentItemIndex.set(index);
    }
  }

  /**
   * Gets the next item ID without changing the current index
   */
  public getNextItem(): string | null {
    if (!this.canNavigateNext()) {
      return null;
    }

    const nextIndex = this._currentItemIndex() + 1;
    const items = this._itemIds();
    const nextItemId = items[nextIndex];

    return nextItemId || null;
  }

  /**
   * Gets the previous item ID without changing the current index
   */
  public getPreviousItem(): string | null {
    if (!this.canNavigatePrevious()) return null;

    const previousIndex = this._currentItemIndex() - 1;
    const items = this._itemIds();
    return items[previousIndex] || null;
  }

  /**
   * Navigates to the next item (updates the index)
   */
  public navigateNext(): string | null {
    const nextItemId = this.getNextItem();
    if (nextItemId) {
      const newIndex = this._currentItemIndex() + 1;
      this._currentItemIndex.set(newIndex);
    }
    return nextItemId;
  }

  /**
   * Navigates to the previous item (updates the index)
   */
  public navigatePrevious(): string | null {
    const previousItemId = this.getPreviousItem();
    if (previousItemId) {
      const newIndex = this._currentItemIndex() - 1;
      this._currentItemIndex.set(newIndex);
    }
    return previousItemId;
  }

  /**
   * Resets the navigation state
   */
  public reset(): void {
    this._itemIds.set([]);
    this._currentItemIndex.set(0);
    this._isNavigationEnabled.set(false);
  }
}
