import { TestBed } from '@angular/core/testing';

import { LayoutStateService } from './layout-state.service';

describe('LayoutStateService', () => {
  let service: LayoutStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LayoutStateService],
    });
    service = TestBed.inject(LayoutStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isHeaderFlowMobileLayout', () => {
    it('should initialize with false value', () => {
      expect(service.isHeaderFlowMobileLayout()).toBe(false);
    });

    it('should be a readonly signal', () => {
      // Readonly signals don't have set/update methods
      expect(typeof service.isHeaderFlowMobileLayout).toBe('function');
      expect((service.isHeaderFlowMobileLayout as any).set).toBeUndefined();
      expect((service.isHeaderFlowMobileLayout as any).update).toBeUndefined();
    });

    it('should reflect the value set by setHeaderFlowMobileLayout', () => {
      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);

      service.setHeaderFlowMobileLayout(false);
      expect(service.isHeaderFlowMobileLayout()).toBe(false);
    });
  });

  describe('setHeaderFlowMobileLayout', () => {
    it('should update the mobile layout state to true', () => {
      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);
    });

    it('should update the mobile layout state to false', () => {
      service.setHeaderFlowMobileLayout(false);
      expect(service.isHeaderFlowMobileLayout()).toBe(false);
    });

    it('should handle multiple state changes', () => {
      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);

      service.setHeaderFlowMobileLayout(false);
      expect(service.isHeaderFlowMobileLayout()).toBe(false);

      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);
    });

    it('should allow setting the same value multiple times', () => {
      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);

      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should allow header-flow to publish its mobile state', () => {
      // Simulate header-flow crossing into mobile breakpoint
      service.setHeaderFlowMobileLayout(true);

      // Verify state is published
      expect(service.isHeaderFlowMobileLayout()).toBe(true);
    });

    it('should allow other components to read the published state', () => {
      // Header-flow sets mobile layout
      service.setHeaderFlowMobileLayout(true);

      // Seatmap (or other component) reads the state
      const isMobileLayout = service.isHeaderFlowMobileLayout();
      expect(isMobileLayout).toBe(true);
    });

    it('should maintain state consistency across multiple reads', () => {
      service.setHeaderFlowMobileLayout(true);

      // Multiple components reading the same state
      const read1 = service.isHeaderFlowMobileLayout();
      const read2 = service.isHeaderFlowMobileLayout();
      const read3 = service.isHeaderFlowMobileLayout();

      expect(read1).toBe(true);
      expect(read2).toBe(true);
      expect(read3).toBe(true);
    });

    it('should support reactive patterns with signal reads', () => {
      // Initial state
      expect(service.isHeaderFlowMobileLayout()).toBe(false);

      // Simulate viewport change - header-flow crosses mobile breakpoint
      service.setHeaderFlowMobileLayout(true);
      expect(service.isHeaderFlowMobileLayout()).toBe(true);

      // Simulate viewport change back to desktop
      service.setHeaderFlowMobileLayout(false);
      expect(service.isHeaderFlowMobileLayout()).toBe(false);
    });
  });

  describe('service singleton behavior', () => {
    it('should provide the same instance across multiple injections', () => {
      const instance1 = TestBed.inject(LayoutStateService);
      const instance2 = TestBed.inject(LayoutStateService);

      expect(instance1).toBe(instance2);
    });

    it('should maintain state across multiple injections', () => {
      const instance1 = TestBed.inject(LayoutStateService);
      instance1.setHeaderFlowMobileLayout(true);

      const instance2 = TestBed.inject(LayoutStateService);
      expect(instance2.isHeaderFlowMobileLayout()).toBe(true);
    });
  });
});
