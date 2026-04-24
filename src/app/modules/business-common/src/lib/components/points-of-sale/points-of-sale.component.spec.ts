import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { PointsOfSaleComponent } from './points-of-sale.component';
import {
  BUSINESS_CONFIG,
  BusinessConfig,
  GenerateIdPipe,
  IbeEventRedirectType,
  PointOfSale,
  PointOfSaleService,
  PointOfSaleVm,
  RedirectionService,
  ViewportSizeService,
  WindowHelper,
} from '@dcx/ui/libs';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('PointsOfSaleComponent', () => {
  let component: PointsOfSaleComponent;
  let fixture: ComponentFixture<PointsOfSaleComponent>;
  let translateService: TranslateService;
  let translateInstantSpy: jasmine.Spy;
  let pointOfSaleService: jasmine.SpyObj<PointOfSaleService>;
  let redirectionService: jasmine.SpyObj<RedirectionService>;
  let viewportSizeService: jasmine.SpyObj<ViewportSizeService>;
  let generateIdPipe: jasmine.SpyObj<GenerateIdPipe>;

  const mockPointsOfSale: PointOfSale[] = [
    {
      name: 'United States',
      stationCode: 'MIA',
      code: 'US',
      default: true,
      flagImageCode: 'US',
      currency: { symbol: '$', code: 'USD', name: 'US Dollar' },
      countryCode: 'US',
      isForRestOfCountries: false,
    },
    {
      name: 'Colombia',
      stationCode: 'BOG',
      code: 'CO',
      default: false,
      flagImageCode: 'CO',
      currency: { symbol: '$', code: 'COP', name: 'Colombian Peso' },
      countryCode: 'CO',
      isForRestOfCountries: false,
    },
    {
      name: 'Other Countries',
      stationCode: 'MIA',
      code: 'OTHER',
      default: false,
      flagImageCode: 'OTHER',
      currency: { symbol: '$', code: 'USD', name: 'US Dollar' },
      isForRestOfCountries: true,
    },
  ];

  let pointsOfSaleAvailableSubject: Subject<boolean>;
  let pointOfSaleSubject: Subject<PointOfSale | null>;

  beforeEach(async () => {
    pointsOfSaleAvailableSubject = new Subject<boolean>();
    pointOfSaleSubject = new Subject<PointOfSale | null>();

    pointOfSaleService = jasmine.createSpyObj('PointOfSaleService', [
      'getCurrentPointOfSale',
      'changePointOfSale',
    ], {
      pointsOfSaleAvailable$: pointsOfSaleAvailableSubject.asObservable(),
      pointOfSale$: pointOfSaleSubject.asObservable(),
      pointsOfSaleList: mockPointsOfSale
    });
    pointOfSaleService.getCurrentPointOfSale.and.returnValue(mockPointsOfSale[0]);

    redirectionService = jasmine.createSpyObj('RedirectionService', ['redirect']);
    viewportSizeService = jasmine.createSpyObj('ViewportSizeService', ['getComponentLayoutBreakpoint']);
    viewportSizeService.getComponentLayoutBreakpoint.and.returnValue(768);

    generateIdPipe = jasmine.createSpyObj('GenerateIdPipe', ['transform']);
    generateIdPipe.transform.and.returnValue('generated-id-123');

    spyOn(WindowHelper, 'getLocation').and.returnValue({
      href: 'https://test.com',
      pathname: '/test',
    } as any);

    await TestBed.configureTestingModule({
      imports: [
        PointsOfSaleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: PointOfSaleService, useValue: pointOfSaleService },
        { provide: RedirectionService, useValue: redirectionService },
        { provide: ViewportSizeService, useValue: viewportSizeService },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back', 'forward']) },
        { provide: GenerateIdPipe, useValue: generateIdPipe },
        { provide: BUSINESS_CONFIG, useValue: {} as BusinessConfig },
      ],
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateInstantSpy = spyOn(translateService, 'instant').and.returnValue('Translated Text');
    spyOn(translateService, 'get').and.returnValue(of('Translated Text'));
    spyOn(translateService, 'stream').and.returnValue(of('Translated Text'));

    fixture = TestBed.createComponent(PointsOfSaleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      expect(component.data()).toEqual({ items: [] });
      expect(component.displayPopup()).toBe(false);
      expect(component.triggerId).toBe('generated-id-123');
      expect(component.triggerIconConfig.name).toBe('currency-circle');
    });

    it('should initialize when pointsOfSaleAvailable$ emits', (done) => {
      pointsOfSaleAvailableSubject.next(true);

      setTimeout(() => {
        expect(component.data().items).toEqual(mockPointsOfSale);
        expect(component.pointsOfSaleVm).toBeDefined();
        expect(component.selectedPointOfSale.code).toBe('US');
        done();
      }, 50);
    });

    it('should not initialize if pointsOfSaleList is empty', (done) => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(pointOfSaleService, 'pointsOfSaleList');
      Object.defineProperty(pointOfSaleService, 'pointsOfSaleList', {
        configurable: true,
        get: () => [],
      });

      const newComponent = TestBed.createComponent(PointsOfSaleComponent).componentInstance;

      pointsOfSaleAvailableSubject.next(true);

      setTimeout(() => {
        try {
          expect(newComponent.pointsOfSaleVm).toBeUndefined();
        } catch (error) {
          done.fail(error as Error);
          return;
        } finally {
          if (originalDescriptor) {
            Object.defineProperty(pointOfSaleService, 'pointsOfSaleList', originalDescriptor);
          } else {
            Object.defineProperty(pointOfSaleService, 'pointsOfSaleList', {
              configurable: true,
              value: mockPointsOfSale,
              writable: true,
            });
          }
        }
        done();
      }, 50);
    });
  });

  describe('Popup Management', () => {
    it('should toggle displayPopup', () => {
      component.displayPopup.set(false);
      component.togglePopup();
      expect(component.displayPopup()).toBe(true);

      component.togglePopup();
      expect(component.displayPopup()).toBe(false);
    });

    it('should add/remove keyboard listener when popup opens/closes', () => {
      // Initialize component data first to avoid template errors
      component.data.set({ items: mockPointsOfSale });
      component['internalInit']();
      
      spyOn(document, 'addEventListener');
      spyOn(document, 'removeEventListener');

      component.displayPopup.set(true);
      fixture.detectChanges();
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function), true);

      component.displayPopup.set(false);
      fixture.detectChanges();
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function), true);
    });

    it('should prevent arrow key defaults when popup is open', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');

      component['keydownListener'](event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Selection Management', () => {
    beforeEach(() => {
      component.pointsOfSaleVm = mockPointsOfSale as PointOfSaleVm[];
      component.selectedPointOfSale = mockPointsOfSale[0] as PointOfSaleVm;
    });

    it('should update selection when code is found', () => {
      component.updateSelection('CO');
      expect(component['pointOfSaleToUpdate']).toEqual(mockPointsOfSale[1] as any);
    });

    it('should not update selection when code is not found', () => {
      const initialValue = mockPointsOfSale[0] as PointOfSaleVm;
      component['pointOfSaleToUpdate'] = initialValue;

      component.updateSelection('INVALID');

      expect(component['pointOfSaleToUpdate']).toBe(initialValue);
    });

    it('should confirm selection and trigger redirect when changed', () => {
      component['pointOfSaleToUpdate'] = mockPointsOfSale[1] as PointOfSaleVm;
      (component as any).offCanvasRef = jasmine.createSpyObj('OffCanvasComponent', ['dismiss']);

      component.confirmSelection();

      expect(component.selectedPointOfSale.code).toBe('CO');
      expect(pointOfSaleService.changePointOfSale).toHaveBeenCalledWith(mockPointsOfSale[1], true);
      expect(redirectionService.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.externalRedirect,
        'https://test.com'
      );
    });

    it('should not redirect when selection is unchanged', () => {
      component['pointOfSaleToUpdate'] = mockPointsOfSale[0] as PointOfSaleVm;
      (component as any).offCanvasRef = jasmine.createSpyObj('OffCanvasComponent', ['dismiss']);

      component.confirmSelection();

      expect(redirectionService.redirect).not.toHaveBeenCalled();
    });
  });

  describe('ViewModel Building', () => {
    beforeEach(() => {
      component.data.set({ items: mockPointsOfSale });
      translateInstantSpy.and.callFake((key: string) => {
        if (key.startsWith('Country.')) return key.replace('Country.', '');
        if (key === 'PointsOfSale.Other_Country_Text') return 'Other Countries';
        return key;
      });
    });

    afterEach(() => {
      translateInstantSpy.and.returnValue('Translated Text');
    });

    it('should build view model with correct properties', () => {
      const result = component['buildViewModel']();

      expect(result.length).toBe(3);
      expect(result[0].imgSrc).toBeDefined();
      expect(result[0].name).toBeDefined();
    });

    it('should set correct image paths', () => {
      const result = component['buildViewModel']();
      const usPos = result.find((pos) => pos.code === 'US');
      const otherPos = result.find((pos) => pos.code === 'OTHER');

      expect(usPos?.imgSrc).toBe('/assets/ui_plus/imgs/countries-flags/us.svg');
      expect(otherPos?.imgSrc).toBe('/assets/ui_plus/imgs/countries-flags/other.svg');
    });

    it('should sort view model alphabetically', () => {
      const result = component['buildViewModel']();

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].name.localeCompare(result[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('Helper Methods', () => {
    it('should identify single country correctly', () => {
      expect(component['isSingleCountry'](mockPointsOfSale[0])).toBe(true);
      expect(component['isSingleCountry'](mockPointsOfSale[2])).toBe(false);
      
      const posWithOtherCodes = { ...mockPointsOfSale[0], otherCountryCodes: ['BR'] };
      expect(component['isSingleCountry'](posWithOtherCodes)).toBe(false);
    });

    it('should return correct flag image path', () => {
      expect(component['getFlagImg']('US')).toBe('/assets/ui_plus/imgs/countries-flags/us.svg');
      expect(component['getFlagImg']('co')).toBe('/assets/ui_plus/imgs/countries-flags/co.svg');
    });

    it('should get correct name for point of sale', () => {
      expect(component['getName'](mockPointsOfSale[0])).toBe('United States');
      
      translateInstantSpy.and.returnValue('Other Countries');
      expect(component['getName'](mockPointsOfSale[2])).toBe('Other Countries');
    });

    afterEach(() => {
      translateInstantSpy.and.returnValue('Translated Text');
    });
  });

  describe('Service Integration', () => {
    beforeEach(() => {
      component.data.set({ items: mockPointsOfSale });
      component['internalInit']();
    });

    it('should update when service emits new point of sale', () => {
      pointOfSaleSubject.next(mockPointsOfSale[1]);
      expect(component.selectedPointOfSale.code).toBe('CO');
    });

    it('should not update when service emits null', () => {
      component.selectedPointOfSale = mockPointsOfSale[0] as PointOfSaleVm;
      pointOfSaleSubject.next(null);
      expect(component.selectedPointOfSale.code).toBe('US');
    });

    it('should complete full selection workflow', () => {
      (component as any).offCanvasRef = jasmine.createSpyObj('OffCanvasComponent', ['dismiss']);

      expect(component.selectedPointOfSale.code).toBe('US');

      component.updateSelection('CO');
      component.confirmSelection();

      expect(component.selectedPointOfSale.code).toBe('CO');
      expect(pointOfSaleService.changePointOfSale).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    beforeEach(() => {
      component.isMainHeaderToggleLayout = signal(false);
    });

    it('should set offCanvas config based on layout', () => {
      component['setOffCanvasConfig']();

      expect(component.offCanvasConfig.animation).toBe(true);
      expect(component.offCanvasConfig.position).toBe('top');

      component.isMainHeaderToggleLayout = signal(true);
      component['setOffCanvasConfig']();

      expect(component.offCanvasConfig.position).toBe('bottom');
    });

    it('should set action button config', () => {
      translateInstantSpy.and.returnValue('Apply');
      component['setActionButtonConfig']();

      expect(component.actionButtonConfig.label).toBe('Apply');
      translateInstantSpy.and.returnValue('Translated Text');
    });
  });

  describe('Lifecycle', () => {
    it('should cleanup on destroy', () => {
      const destroyListenerSpy = jasmine.createSpy('destroyListener');
      component['destroyMediaQueryListener'] = destroyListenerSpy;

      component.ngOnDestroy();

      expect(destroyListenerSpy).toHaveBeenCalled();
    });
  });
});
