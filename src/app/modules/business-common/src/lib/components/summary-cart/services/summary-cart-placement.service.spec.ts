import { DestroyRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ViewportSizeService } from "@dcx/ui/libs";
import { SummaryCartPlacementService } from "./summary-cart-placement.service";

describe('SummaryCartPlacementService', () => {
  let service: SummaryCartPlacementService;
  let viewportSizeServiceMock: jasmine.SpyObj<ViewportSizeService>;
  let destroyRef: DestroyRef;
  let mediaQueryMap: Record<string, { matches: boolean; addEventListener: jasmine.Spy; removeEventListener: jasmine.Spy }>;

  beforeEach(() => {
    viewportSizeServiceMock = jasmine.createSpyObj('ViewportSizeService', ['getComponentLayoutBreakpoint']);

    mediaQueryMap = {};
    Object.defineProperty(globalThis, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jasmine.createSpy('matchMedia').and.callFake((query: string) => {
        if (!mediaQueryMap[query]) {
          mediaQueryMap[query] = {
            matches: false,
            addEventListener: jasmine.createSpy('addEventListener'),
            removeEventListener: jasmine.createSpy('removeEventListener'),
          };
        }
        return mediaQueryMap[query] as any;
      }),
    });

    TestBed.configureTestingModule({
      providers: [
        SummaryCartPlacementService,
        { provide: ViewportSizeService, useValue: viewportSizeServiceMock },
      ],
    });

    service = TestBed.inject(SummaryCartPlacementService);
    destroyRef = TestBed.inject(DestroyRef);
  });

  afterEach(() => {
    mediaQueryMap = {};
  });

  describe('creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have default state as "none" placement', () => {
      expect(service.placement()).toBe('none');
      expect(service.showInHeader()).toBeFalse();
      expect(service.showInPageActions()).toBeFalse();
    });
  });

  describe('placement computed signal', () => {
    it('should return "none" when headerFlowHasSummaryCart is false', () => {
      expect(service.placement()).toBe('none');
    });

    it('should return "header" when hasSummaryCart is true and viewport is above breakpoint', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.placement()).toBe('header');
    });

    it('should return "page-actions" when hasSummaryCart is true and viewport is below breakpoint', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.placement()).toBe('page-actions');
    });
  });

  describe('showInHeader computed signal', () => {
    it('should return true when placement is "header"', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.showInHeader()).toBeTrue();
    });

    it('should return false when placement is "page-actions"', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.showInHeader()).toBeFalse();
    });

    it('should return false when placement is "none"', () => {
      expect(service.showInHeader()).toBeFalse();
    });
  });

  describe('showInPageActions computed signal', () => {
    it('should return true when placement is "page-actions"', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.showInPageActions()).toBeTrue();
    });

    it('should return false when placement is "header"', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.showInPageActions()).toBeFalse();
    });

    it('should return false when placement is "none"', () => {
      expect(service.showInPageActions()).toBeFalse();
    });
  });

  describe('initializeFromHeaderFlow', () => {
    it('should set headerFlowHasSummaryCart to false and not watch breakpoint when hasSummaryCart is false', () => {
      service.initializeFromHeaderFlow(false, destroyRef);

      expect(service.placement()).toBe('none');
      expect(viewportSizeServiceMock.getComponentLayoutBreakpoint).not.toHaveBeenCalled();
      expect(globalThis.matchMedia).not.toHaveBeenCalled();
    });

    it('should set headerFlowHasSummaryCart to true and watch breakpoint when hasSummaryCart is true', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(viewportSizeServiceMock.getComponentLayoutBreakpoint).toHaveBeenCalledWith('--header-flow-summary-cart-breakpoint');
      expect(globalThis.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
    });

    it('should set initial state based on media query matches', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(service.placement()).toBe('page-actions');
    });

    it('should register change listener on media query', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);

      expect(mediaQueryMap[query].addEventListener).toHaveBeenCalledWith('change', jasmine.any(Function));
    });

    it('should update placement when media query changes', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);
      expect(service.placement()).toBe('header');

      const handler = mediaQueryMap[query].addEventListener.calls.first().args[1] as (e: MediaQueryListEvent) => void;
      handler({ matches: true } as MediaQueryListEvent);

      expect(service.placement()).toBe('page-actions');
    });

    it('should do nothing when matchMedia returns null/undefined', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);
      (globalThis.matchMedia as jasmine.Spy).and.returnValue(null);

      expect(() => service.initializeFromHeaderFlow(true, destroyRef)).not.toThrow();
    });
  });

  describe('cleanup on destroy', () => {
    it('should remove event listener on destroy', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);
      expect(service.placement()).toBe('page-actions');

      const handler = mediaQueryMap[query].addEventListener.calls.first().args[1];

      TestBed.resetTestingModule();

      expect(mediaQueryMap[query].removeEventListener).toHaveBeenCalledWith('change', handler);
    });

    it('should reset signals to default state on destroy', () => {
      const testService = TestBed.inject(SummaryCartPlacementService);

      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      const destroyCallbacks: Array<() => void> = [];
      const mockDestroyRef = {
        onDestroy: (callback: () => void) => {
          destroyCallbacks.push(callback);
          return () => {};
        },
      } as DestroyRef;

      testService.initializeFromHeaderFlow(true, mockDestroyRef);
      expect(testService.placement()).toBe('page-actions');
      expect(testService.showInPageActions()).toBeTrue();

      destroyCallbacks.forEach(cb => cb());

      expect(testService.placement()).toBe('none');
      expect(testService.showInHeader()).toBeFalse();
      expect(testService.showInPageActions()).toBeFalse();
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple viewport changes correctly', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(true, destroyRef);
      expect(service.placement()).toBe('header');

      const handler = mediaQueryMap[query].addEventListener.calls.first().args[1] as (e: MediaQueryListEvent) => void;

      handler({ matches: true } as MediaQueryListEvent);
      expect(service.placement()).toBe('page-actions');
      expect(service.showInPageActions()).toBeTrue();
      expect(service.showInHeader()).toBeFalse();

      handler({ matches: false } as MediaQueryListEvent);
      expect(service.placement()).toBe('header');
      expect(service.showInHeader()).toBeTrue();
      expect(service.showInPageActions()).toBeFalse();
    });

    it('should maintain "none" state when hasSummaryCart is false regardless of viewport', () => {
      viewportSizeServiceMock.getComponentLayoutBreakpoint.and.returnValue(768);

      const query = '(max-width: 768px)';
      mediaQueryMap[query] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };

      service.initializeFromHeaderFlow(false, destroyRef);

      expect(service.placement()).toBe('none');
      expect(service.showInHeader()).toBeFalse();
      expect(service.showInPageActions()).toBeFalse();
    });
  });
});
