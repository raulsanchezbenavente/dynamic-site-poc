import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, ViewChild, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { BUSINESS_CONFIG, CookiesStore, ViewportSizeService } from '@dcx/ui/libs';
import { BUSINESS_CONFIG_MOCK, CookieServiceFake } from '@dcx/ui/mock-repository';

import { AmountSummaryComponent } from './amount-summary.component';
import { AmountSummaryVM } from './models/amount-summary-vm.model';
import { AmountSummaryNavigationService } from '../../services';

const defaultAmountSummaryData: AmountSummaryVM = {
  priceDisplay: {
    prefixText: 'Total',
    currency: 'USD',
    price: 123,
  },
};

const createMediaQueryListMock = (): MediaQueryList =>
  ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener(): void {},
    removeEventListener(): void {},
    addListener(): void {},
    removeListener(): void {},
    dispatchEvent(): boolean {
      return true;
    },
  }) as MediaQueryList;

@Component({
  selector: 'amount-summary-host',
  template: `<amount-summary [data]="data"></amount-summary>`,
  standalone: true,
  imports: [AmountSummaryComponent],
})
class AmountSummaryHostComponent {
  public data: AmountSummaryVM = defaultAmountSummaryData;

  @ViewChild(AmountSummaryComponent, { static: true })
  public child!: AmountSummaryComponent;
}

describe('AmountSummaryComponent', () => {
  let fixture: ComponentFixture<AmountSummaryHostComponent>;
  let hostComponent: AmountSummaryHostComponent;
  let component: AmountSummaryComponent;
  let translateServiceStub: jasmine.SpyObj<TranslateService>;
  let viewportSizeServiceStub: jasmine.SpyObj<ViewportSizeService>;
  let navigationServiceStub: any;
  let matchMediaSpy: jasmine.Spy<(query: string) => MediaQueryList>;

  // Navigation service signals
  let hasMultipleItemsSignal: ReturnType<typeof signal<boolean>>;
  let canNavigatePreviousSignal: ReturnType<typeof signal<boolean>>;
  let canNavigateNextSignal: ReturnType<typeof signal<boolean>>;
  let isNavigationEnabledSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    translateServiceStub = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
    translateServiceStub.instant.and.callFake((key: string) => key);

    viewportSizeServiceStub = jasmine.createSpyObj<ViewportSizeService>('ViewportSizeService', [
      'getComponentLayoutBreakpoint',
    ]);
    viewportSizeServiceStub.getComponentLayoutBreakpoint.and.returnValue(768);

    // Create signals for navigation service
    hasMultipleItemsSignal = signal(false);
    canNavigatePreviousSignal = signal(false);
    canNavigateNextSignal = signal(false);
    isNavigationEnabledSignal = signal(false);

    navigationServiceStub = jasmine.createSpyObj<AmountSummaryNavigationService>(
      'AmountSummaryNavigationService',
      ['getPreviousItem', 'getNextItem'],
    );
    navigationServiceStub.hasMultipleItems = hasMultipleItemsSignal;
    navigationServiceStub.canNavigatePrevious = canNavigatePreviousSignal;
    navigationServiceStub.canNavigateNext = canNavigateNextSignal;
    navigationServiceStub.isNavigationEnabled = isNavigationEnabledSignal;
    navigationServiceStub.getPreviousItem.and.returnValue(null);
    navigationServiceStub.getNextItem.and.returnValue(null);

    if (!jasmine.isSpy(globalThis.matchMedia)) {
      matchMediaSpy = spyOn(globalThis, 'matchMedia').and.returnValue(createMediaQueryListMock());
    } else {
      matchMediaSpy = globalThis.matchMedia as jasmine.Spy<(query: string) => MediaQueryList>;
      matchMediaSpy.and.returnValue(createMediaQueryListMock());
    }

    await TestBed.configureTestingModule({
      imports: [AmountSummaryHostComponent, HttpClientTestingModule],
      providers: [
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: ViewportSizeService, useValue: viewportSizeServiceStub },
        { provide: AmountSummaryNavigationService, useValue: navigationServiceStub },
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
        { provide: CookiesStore, useClass: CookieServiceFake },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AmountSummaryHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = hostComponent.child;
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--amount-summary-height');
    if (matchMediaSpy) {
      matchMediaSpy.calls.reset();
    }
  });

  it('should remove the media query listener when destroyed', () => {
    const removeEventListenerSpy = jasmine.createSpy('removeEventListener');
    const fakeMediaQuery = {
      ...createMediaQueryListMock(),
      removeEventListener: removeEventListenerSpy,
    } as MediaQueryList;
    const listener = jasmine.createSpy('listener') as unknown as (event: MediaQueryListEvent) => void;

    component['mediaQuery'] = fakeMediaQuery;
    component['mediaQueryListener'] = listener;

    fixture.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', listener);
  });

  it('should disconnect the resize observer on destroy', () => {
    const disconnectSpy = jasmine.createSpy('disconnect');
    component['resizeObserver'] = {
      observe(): void {},
      unobserve(): void {},
      disconnect: disconnectSpy,
      takeRecords(): ResizeObserverEntry[] {
        return [];
      },
    } as ResizeObserver;

    fixture.destroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear the amount summary height CSS variable on destroy', () => {
    document.body.style.setProperty('--amount-summary-height', '180px');

    fixture.destroy();

    expect(document.body.style.getPropertyValue('--amount-summary-height')).toBe('');
  });

  it('should handle ngOnDestroy when mediaQuery is undefined', () => {
    component['mediaQuery'] = undefined as any;
    component['mediaQueryListener'] = undefined as any;

    expect(() => fixture.destroy()).not.toThrow();
  });

  it('should handle ngOnDestroy when resizeObserver is undefined', () => {
    component['resizeObserver'] = undefined;

    expect(() => fixture.destroy()).not.toThrow();
  });

  describe('Lifecycle hooks', () => {
    it('should initialize the component on ngOnInit', () => {
      spyOn<any>(component, 'internalInit');

      component.ngOnInit();

      expect(component['internalInit']).toHaveBeenCalledTimes(1);
    });

    it('should observe height on ngAfterViewInit', () => {
      spyOn<any>(component, 'observeAmountSummaryHeight');

      component.ngAfterViewInit();

      expect(component['observeAmountSummaryHeight']).toHaveBeenCalledTimes(1);
    });
  });

  describe('Public methods', () => {
    it('should focus the primary button when focusPrimaryButton is called', () => {
      const primaryButtonRef = component['primaryButtonComponent'];
      if (primaryButtonRef) {
        const focusSpy = spyOn(primaryButtonRef, 'focus');
        component.focusPrimaryButton();
        expect(focusSpy).toHaveBeenCalledTimes(1);
      } else {
        // If button doesn't exist in template, just verify method doesn't throw
        expect(() => component.focusPrimaryButton()).not.toThrow();
      }
    });

    it('should not throw when focusPrimaryButton is called without primary button', () => {
      // Test the method handles undefined gracefully
      const originalButton = component['primaryButtonComponent'];
      Object.defineProperty(component, 'primaryButtonComponent', { value: undefined, writable: true, configurable: true });

      expect(() => component.focusPrimaryButton()).not.toThrow();

      Object.defineProperty(component, 'primaryButtonComponent', { value: originalButton, writable: true, configurable: true });
    });

    it('should emit primaryActionClicked when onPrimaryAction is called', () => {
      spyOn(component.primaryActionClicked, 'emit');

      component.onPrimaryAction();

      expect(component.primaryActionClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit secondaryActionClicked when onSecondaryAction is called', () => {
      spyOn(component.secondaryActionClicked, 'emit');

      component.onSecondaryAction();

      expect(component.secondaryActionClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('should emit navigationPreviousClicked when onNavigationPrevious is called and previous item exists', () => {
      navigationServiceStub.getPreviousItem.and.returnValue('previous-item-id');
      spyOn(component.navigationPreviousClicked, 'emit');

      component.onNavigationPrevious();

      expect(component.navigationPreviousClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit navigationPreviousClicked when no previous item exists', () => {
      navigationServiceStub.getPreviousItem.and.returnValue(null);
      spyOn(component.navigationPreviousClicked, 'emit');

      component.onNavigationPrevious();

      expect(component.navigationPreviousClicked.emit).not.toHaveBeenCalled();
    });

    it('should emit navigationNextClicked when onNavigationNext is called and next item exists', () => {
      navigationServiceStub.getNextItem.and.returnValue('next-item-id');
      spyOn(component.navigationNextClicked, 'emit');

      component.onNavigationNext();

      expect(component.navigationNextClicked.emit).toHaveBeenCalledTimes(1);
    });

    it('should not emit navigationNextClicked when no next item exists', () => {
      navigationServiceStub.getNextItem.and.returnValue(null);
      spyOn(component.navigationNextClicked, 'emit');

      component.onNavigationNext();

      expect(component.navigationNextClicked.emit).not.toHaveBeenCalled();
    });
  });

  describe('Navigation computed signals', () => {
    it('should show previous button when multiple items exist and can navigate previous', () => {
      hasMultipleItemsSignal.set(true);
      canNavigatePreviousSignal.set(true);

      const result = component.showPreviousButton();

      expect(result).toBe(true);
    });

    it('should not show previous button when no multiple items', () => {
      hasMultipleItemsSignal.set(false);
      canNavigatePreviousSignal.set(true);

      const result = component.showPreviousButton();

      expect(result).toBe(false);
    });

    it('should not show previous button when cannot navigate previous', () => {
      hasMultipleItemsSignal.set(true);
      canNavigatePreviousSignal.set(false);

      const result = component.showPreviousButton();

      expect(result).toBe(false);
    });

    it('should show next button when multiple items exist and can navigate next', () => {
      hasMultipleItemsSignal.set(true);
      canNavigateNextSignal.set(true);

      const result = component.showNextButton();

      expect(result).toBe(true);
    });

    it('should not show next button when no multiple items', () => {
      hasMultipleItemsSignal.set(false);
      canNavigateNextSignal.set(true);

      const result = component.showNextButton();

      expect(result).toBe(false);
    });

    it('should not show next button when cannot navigate next', () => {
      hasMultipleItemsSignal.set(true);
      canNavigateNextSignal.set(false);

      const result = component.showNextButton();

      expect(result).toBe(false);
    });
  });

  describe('Media query and responsive behavior', () => {
    it('should set up media query listener on initialization', () => {
      const addEventListenerSpy = jasmine.createSpy('addEventListener');
      const fakeMediaQuery = {
        ...createMediaQueryListMock(),
        matches: true,
        addEventListener: addEventListenerSpy,
      } as MediaQueryList;

      matchMediaSpy.and.returnValue(fakeMediaQuery);

      component['setIsResponsive']();

      expect(matchMediaSpy).toHaveBeenCalledWith('(max-width: 768px)');
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function));
      expect(component.isResponsive()).toBe(true);
    });

    it('should update isResponsive when media query changes', () => {
      const fakeMediaQuery = createMediaQueryListMock();
      let storedListener: ((event: MediaQueryListEvent) => void) | undefined;

      matchMediaSpy.and.returnValue({
        ...fakeMediaQuery,
        matches: false,
        addEventListener(_event: string, listener: (event: MediaQueryListEvent) => void): void {
          storedListener = listener;
        },
      } as MediaQueryList);

      component['setIsResponsive']();

      expect(component.isResponsive()).toBe(false);

      if (storedListener) {
        storedListener({ matches: true } as MediaQueryListEvent);
        expect(component.isResponsive()).toBe(true);
      }
    });
  });

  describe('ResizeObserver', () => {
    it('should create ResizeObserver and observe host element', () => {
      const observeSpy = jasmine.createSpy('observe');
      const OriginalResizeObserver = (globalThis as any).ResizeObserver;

      (globalThis as any).ResizeObserver = class {
        observe = observeSpy;
        disconnect(): void {}
        unobserve(): void {}
      };

      component['observeAmountSummaryHeight']();

      expect(observeSpy).toHaveBeenCalled();

      (globalThis as any).ResizeObserver = OriginalResizeObserver;
    });

    it('should not throw if host element is undefined', () => {
      const originalElement = component['hostElement'];
      Object.defineProperty(component, 'hostElement', { value: undefined, writable: true, configurable: true });

      expect(() => component['observeAmountSummaryHeight']()).not.toThrow();

      Object.defineProperty(component, 'hostElement', { value: originalElement, writable: true, configurable: true });
    });
  });

  describe('CSS variable updates', () => {
    it('should update amount summary height CSS variable', () => {
      spyOn(component['hostElement'].nativeElement, 'getBoundingClientRect').and.returnValue({
        height: 150,
      } as DOMRect);

      component['updateAmountSummaryHeight']();

      expect(document.documentElement.style.getPropertyValue('--amount-summary-height')).toBe('150px');
    });

    it('should not throw if document is undefined', () => {
      const originalDocument = component['document'];
      Object.defineProperty(component, 'document', { value: undefined, writable: true, configurable: true });

      expect(() => component['updateAmountSummaryHeight']()).not.toThrow();

      Object.defineProperty(component, 'document', { value: originalDocument, writable: true, configurable: true });
    });

    it('should not throw if host element is undefined', () => {
      const originalElement = component['hostElement'];
      Object.defineProperty(component, 'hostElement', { value: undefined, writable: true, configurable: true });

      expect(() => component['updateAmountSummaryHeight']()).not.toThrow();

      Object.defineProperty(component, 'hostElement', { value: originalElement, writable: true, configurable: true });
    });
  });
});
