import { TestBed } from '@angular/core/testing';

import { AmountSummaryNavigationService } from './amount-summary-navigation.service';

describe('AmountSummaryNavigationService', () => {
  let service: AmountSummaryNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmountSummaryNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeNavigation', () => {
    it('should initialize navigation with item IDs and enable navigation for multiple items', () => {
      // Arrange
      const itemIds = ['item1', 'item2', 'item3'];
      const initialItemId = 'item2';

      // Act
      service.initializeNavigation(itemIds, initialItemId);

      // Assert
      expect(service.itemIds()).toEqual(itemIds);
      expect(service.currentItemIndex()).toBe(1);
      expect(service.isNavigationEnabled()).toBe(true);
      expect(service.currentItemId()).toBe('item2');
    });

    it('should initialize with first item when no initial item ID is provided', () => {
      // Arrange
      const itemIds = ['item1', 'item2', 'item3'];

      // Act
      service.initializeNavigation(itemIds);

      // Assert
      expect(service.currentItemIndex()).toBe(0);
      expect(service.currentItemId()).toBe('item1');
    });

    it('should disable navigation for single item', () => {
      // Arrange
      const itemIds = ['item1'];

      // Act
      service.initializeNavigation(itemIds);

      // Assert
      expect(service.isNavigationEnabled()).toBe(false);
      expect(service.hasMultipleItems()).toBe(false);
    });

    it('should handle invalid initial item ID by defaulting to first item', () => {
      // Arrange
      const itemIds = ['item1', 'item2', 'item3'];
      const invalidItemId = 'nonexistent';

      // Act
      service.initializeNavigation(itemIds, invalidItemId);

      // Assert
      expect(service.currentItemIndex()).toBe(0);
      expect(service.currentItemId()).toBe('item1');
    });

    it('should handle empty item IDs array', () => {
      // Arrange
      const itemIds: string[] = [];

      // Act
      service.initializeNavigation(itemIds);

      // Assert
      expect(service.itemIds()).toEqual([]);
      expect(service.currentItemIndex()).toBe(0);
      expect(service.isNavigationEnabled()).toBe(false);
      expect(service.currentItemId()).toBeNull();
    });
  });

  describe('setCurrentItem', () => {
    beforeEach(() => {
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds);
    });

    it('should update current item index when valid item ID is provided', () => {
      // Arrange
      const targetItemId = 'item3';

      // Act
      service.setCurrentItem(targetItemId);

      // Assert
      expect(service.currentItemIndex()).toBe(2);
      expect(service.currentItemId()).toBe('item3');
    });

    it('should not update index when invalid item ID is provided', () => {
      // Arrange
      const invalidItemId = 'nonexistent';
      const originalIndex = service.currentItemIndex();

      // Act
      service.setCurrentItem(invalidItemId);

      // Assert
      expect(service.currentItemIndex()).toBe(originalIndex);
    });

    it('should handle empty string item ID', () => {
      // Arrange
      const emptyItemId = '';
      const originalIndex = service.currentItemIndex();

      // Act
      service.setCurrentItem(emptyItemId);

      // Assert
      expect(service.currentItemIndex()).toBe(originalIndex);
    });
  });

  describe('getNextItem', () => {
    beforeEach(() => {
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds);
    });

    it('should return next item ID when navigation is possible', () => {
      // Arrange
      service.setCurrentItem('item1');

      // Act
      const nextItem = service.getNextItem();

      // Assert
      expect(nextItem).toBe('item2');
      expect(service.currentItemIndex()).toBe(0); // Should not change current index
    });

    it('should return null when at last item', () => {
      // Arrange
      service.setCurrentItem('item3');

      // Act
      const nextItem = service.getNextItem();

      // Assert
      expect(nextItem).toBeNull();
    });

    it('should return null when navigation is disabled', () => {
      // Arrange
      service.initializeNavigation(['item1']); // Single item disables navigation

      // Act
      const nextItem = service.getNextItem();

      // Assert
      expect(nextItem).toBeNull();
    });

    it('should return null when no items are available', () => {
      // Arrange
      service.initializeNavigation([]);

      // Act
      const nextItem = service.getNextItem();

      // Assert
      expect(nextItem).toBeNull();
    });
  });

  describe('getPreviousItem', () => {
    beforeEach(() => {
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds);
    });

    it('should return previous item ID when navigation is possible', () => {
      // Arrange
      service.setCurrentItem('item2');

      // Act
      const previousItem = service.getPreviousItem();

      // Assert
      expect(previousItem).toBe('item1');
      expect(service.currentItemIndex()).toBe(1); // Should not change current index
    });

    it('should return null when at first item', () => {
      // Arrange
      service.setCurrentItem('item1');

      // Act
      const previousItem = service.getPreviousItem();

      // Assert
      expect(previousItem).toBeNull();
    });

    it('should return null when navigation is disabled', () => {
      // Arrange
      service.initializeNavigation(['item1']); // Single item disables navigation

      // Act
      const previousItem = service.getPreviousItem();

      // Assert
      expect(previousItem).toBeNull();
    });

    it('should return null when no items are available', () => {
      // Arrange
      service.initializeNavigation([]);

      // Act
      const previousItem = service.getPreviousItem();

      // Assert
      expect(previousItem).toBeNull();
    });
  });

  describe('navigateNext', () => {
    beforeEach(() => {
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds);
    });

    it('should navigate to next item and update index', () => {
      // Arrange
      service.setCurrentItem('item1');

      // Act
      const nextItem = service.navigateNext();

      // Assert
      expect(nextItem).toBe('item2');
      expect(service.currentItemIndex()).toBe(1);
      expect(service.currentItemId()).toBe('item2');
    });

    it('should return null and not update index when at last item', () => {
      // Arrange
      service.setCurrentItem('item3');
      const originalIndex = service.currentItemIndex();

      // Act
      const nextItem = service.navigateNext();

      // Assert
      expect(nextItem).toBeNull();
      expect(service.currentItemIndex()).toBe(originalIndex);
    });

    it('should return null when navigation is disabled', () => {
      // Arrange
      service.initializeNavigation(['item1']);

      // Act
      const nextItem = service.navigateNext();

      // Assert
      expect(nextItem).toBeNull();
      expect(service.currentItemIndex()).toBe(0);
    });
  });

  describe('navigatePrevious', () => {
    beforeEach(() => {
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds);
    });

    it('should navigate to previous item and update index', () => {
      // Arrange
      service.setCurrentItem('item2');

      // Act
      const previousItem = service.navigatePrevious();

      // Assert
      expect(previousItem).toBe('item1');
      expect(service.currentItemIndex()).toBe(0);
      expect(service.currentItemId()).toBe('item1');
    });

    it('should return null and not update index when at first item', () => {
      // Arrange
      service.setCurrentItem('item1');
      const originalIndex = service.currentItemIndex();

      // Act
      const previousItem = service.navigatePrevious();

      // Assert
      expect(previousItem).toBeNull();
      expect(service.currentItemIndex()).toBe(originalIndex);
    });

    it('should return null when navigation is disabled', () => {
      // Arrange
      service.initializeNavigation(['item1']);

      // Act
      const previousItem = service.navigatePrevious();

      // Assert
      expect(previousItem).toBeNull();
      expect(service.currentItemIndex()).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset all navigation state to default values', () => {
      // Arrange
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds, 'item2');

      // Act
      service.reset();

      // Assert
      expect(service.itemIds()).toEqual([]);
      expect(service.currentItemIndex()).toBe(0);
      expect(service.isNavigationEnabled()).toBe(false);
      expect(service.currentItemId()).toBeNull();
      expect(service.hasMultipleItems()).toBe(false);
    });

    it('should reset from empty state without errors', () => {
      // Arrange
      // Service starts in empty state

      // Act & Assert
      expect(() => service.reset()).not.toThrow();
      expect(service.itemIds()).toEqual([]);
      expect(service.currentItemIndex()).toBe(0);
      expect(service.isNavigationEnabled()).toBe(false);
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      const itemIds = ['item1', 'item2', 'item3'];
      service.initializeNavigation(itemIds);
    });

    describe('isFirstItem', () => {
      it('should return true when at first item', () => {
        // Arrange
        service.setCurrentItem('item1');

        // Act
        const isFirst = service.isFirstItem();

        // Assert
        expect(isFirst).toBe(true);
      });

      it('should return false when not at first item', () => {
        // Arrange
        service.setCurrentItem('item2');

        // Act
        const isFirst = service.isFirstItem();

        // Assert
        expect(isFirst).toBe(false);
      });
    });

    describe('isLastItem', () => {
      it('should return true when at last item', () => {
        // Arrange
        service.setCurrentItem('item3');

        // Act
        const isLast = service.isLastItem();

        // Assert
        expect(isLast).toBe(true);
      });

      it('should return false when not at last item', () => {
        // Arrange
        service.setCurrentItem('item1');

        // Act
        const isLast = service.isLastItem();

        // Assert
        expect(isLast).toBe(false);
      });

      it('should return false when no items are available', () => {
        // Arrange
        service.initializeNavigation([]);

        // Act
        const isLast = service.isLastItem();

        // Assert
        expect(isLast).toBe(false);
      });
    });

    describe('canNavigatePrevious', () => {
      it('should return true when not at first item and navigation enabled', () => {
        // Arrange
        service.setCurrentItem('item2');

        // Act
        const canNavigate = service.canNavigatePrevious();

        // Assert
        expect(canNavigate).toBe(true);
      });

      it('should return false when at first item', () => {
        // Arrange
        service.setCurrentItem('item1');

        // Act
        const canNavigate = service.canNavigatePrevious();

        // Assert
        expect(canNavigate).toBe(false);
      });

      it('should return false when navigation is disabled', () => {
        // Arrange
        service.initializeNavigation(['item1']);

        // Act
        const canNavigate = service.canNavigatePrevious();

        // Assert
        expect(canNavigate).toBe(false);
      });
    });

    describe('canNavigateNext', () => {
      it('should return true when not at last item and navigation enabled', () => {
        // Arrange
        service.setCurrentItem('item1');

        // Act
        const canNavigate = service.canNavigateNext();

        // Assert
        expect(canNavigate).toBe(true);
      });

      it('should return false when at last item', () => {
        // Arrange
        service.setCurrentItem('item3');

        // Act
        const canNavigate = service.canNavigateNext();

        // Assert
        expect(canNavigate).toBe(false);
      });

      it('should return false when navigation is disabled', () => {
        // Arrange
        service.initializeNavigation(['item1']);

        // Act
        const canNavigate = service.canNavigateNext();

        // Assert
        expect(canNavigate).toBe(false);
      });
    });
  });

  describe('deprecated methods - backward compatibility', () => {
    describe('initializeNavigation', () => {
      it('should work as alias for initializeNavigation', () => {
        // Arrange
        const itemsIds = ['seg1', 'seg2', 'seg3'];
        const initialItemId = 'seg2';

        // Act
        service.initializeNavigation(itemsIds, initialItemId);

        // Assert
        expect(service.itemIds()).toEqual(itemsIds);
        expect(service.currentItemIndex()).toBe(1);
        expect(service.currentItemId()).toBe('seg2');
      });
    });

    describe('setCurrentSegment', () => {
      it('should work as alias for setCurrentItem', () => {
        // Arrange
        const itemIds = ['seg1', 'seg2', 'seg3'];
        service.initializeNavigation(itemIds);

        // Act
        service.setCurrentItem('seg3');

        // Assert
        expect(service.currentItemIndex()).toBe(2);
        expect(service.currentItemId()).toBe('seg3');
      });
    });
  });
});
