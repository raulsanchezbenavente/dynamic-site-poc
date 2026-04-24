import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { BannerComponent } from './banner.component';
import {
  BANNER_BREAKPOINT_CONFIG,
  BUSINESS_CONFIG,
  CurrencyService,
  EventBusService,
  GenerateIdPipe,
  HorizontalAlign,
  LayoutSize,
  PointOfSale,
  PointOfSaleService,
} from '@dcx/ui/libs';
import { BANNER_DEFAULT_CONFIG, BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';
import { BannerAnimationEffect, BannerItemStyle, BannerType } from './enums';
import { BannerConfigParams, BannerItemConfig } from './models';
import { ElementRef, QueryList } from '@angular/core';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('BannerComponent', () => {
  let component: BannerComponent;
  let fixture: ComponentFixture<BannerComponent>;
  let mockEventBusService: jasmine.SpyObj<EventBusService>;
  let mockPointOfSaleService: jasmine.SpyObj<PointOfSaleService>;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockGenerateIdPipe: jasmine.SpyObj<GenerateIdPipe>;
  let pointOfSaleSubject: BehaviorSubject<PointOfSale | null>;
  let currencySubject: BehaviorSubject<string | null>;

  const mockPointOfSale: PointOfSale = {
    code: 'US',
    currency: {
      code: 'USD',
      symbol: '$',
    },
  } as PointOfSale;

  const mockBannerItems: BannerItemConfig[] = [
    {
      configuration: {
        enableLowestPrice: false,
        isFullAreaClickable: false,
        showButton: false,
      },
      content: {
        title: 'Test Banner 1',
        bannerType: BannerType.GENERIC,
      },
      media: {
        imageMedia: {
          bg: { title: 'Test Banner 1', url: 'test-image.jpg' },
        },
      },
      layout: {
        bannerStyle: BannerItemStyle.DEFAULT,
        horizontalAlign: HorizontalAlign.CENTER,
        fontSize: LayoutSize.MEDIUM,
      },
      tags: ['US'],
    } as BannerItemConfig,
    {
      configuration: {
        enableLowestPrice: false,
        isFullAreaClickable: false,
        showButton: false,
      },
      content: {
        title: 'Test Banner 2',
        bannerType: BannerType.GENERIC,
      },
      media: {
        imageMedia: {
          bg: { title: 'Test Banner 2', url: 'test-image-2.jpg' },
        },
      },
      layout: {
        bannerStyle: BannerItemStyle.DEFAULT,
        horizontalAlign: HorizontalAlign.CENTER,
        fontSize: LayoutSize.MEDIUM,
      },
      tags: ['US'],
    } as BannerItemConfig,
  ];

  const mockConfig: BannerConfigParams = {
    bannerTitle: 'Test Banner',
    bannerItems: mockBannerItems,
    animationCycleTime: 5000,
    animationEffect: BannerAnimationEffect.FADING,
    showControls: true,
    showPagination: true,
    isFullWidth: false,
  } as BannerConfigParams;

  const createMockConfig = (): BannerConfigParams => JSON.parse(JSON.stringify(mockConfig)) as BannerConfigParams;

  beforeEach(async () => {
    pointOfSaleSubject = new BehaviorSubject<PointOfSale | null>(mockPointOfSale);
    currencySubject = new BehaviorSubject<string | null>('USD');

    mockEventBusService = jasmine.createSpyObj('EventBusService', ['emit', 'on']);
    mockPointOfSaleService = jasmine.createSpyObj('PointOfSaleService', ['getCurrentPointOfSale'], {
      pointOfSale$: pointOfSaleSubject.asObservable()
    });
    mockCurrencyService = jasmine.createSpyObj('CurrencyService', ['getCurrency'], {
      currency$: currencySubject.asObservable()
    });
    mockGenerateIdPipe = jasmine.createSpyObj('GenerateIdPipe', ['transform']);
    mockGenerateIdPipe.transform.and.returnValue('test-banner-id');

    await TestBed.configureTestingModule({
      imports: [
        BannerComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: EventBusService, useValue: mockEventBusService },
        { provide: PointOfSaleService, useValue: mockPointOfSaleService },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: GenerateIdPipe, useValue: mockGenerateIdPipe },
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
        { provide: BANNER_BREAKPOINT_CONFIG, useValue: BANNER_DEFAULT_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    mockPointOfSaleService.getCurrentPointOfSale.and.returnValue(mockPointOfSale);
    fixture.componentRef.setInput('config', createMockConfig());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component with config values', () => {
      component.ngOnInit();

      expect(component.animation.cycleTime).toBe(5000);
      expect(component.animation.effect).toBe(BannerAnimationEffect.FADING);
      expect(component.config.accessibilityConfig.id).toBe('test-banner-id');
      expect(component.config.ariaAttributes.ariaLabel).toBe('Test Banner');
      expect(component.pointOfSale).toEqual(mockPointOfSale);
      expect(component.currency).toBe('USD');
      expect(component.filteredItems.length).toBeGreaterThan(0);
      expect(component.isCarousel).toBe(true);
    });

    it('should use default values when animation config is not provided', () => {
      const configWithoutDefaults = createMockConfig();
      const configWithoutDefaultsRecord = configWithoutDefaults as unknown as Record<string, unknown>;
      delete configWithoutDefaultsRecord['animationCycleTime'];
      delete configWithoutDefaultsRecord['animationEffect'];
      fixture.componentRef.setInput('config', configWithoutDefaults);

      component.ngOnInit();

      expect(component.config.animationCycleTime).toBe(4000);
      expect(component.config.animationEffect).toBe(BannerAnimationEffect.FADING);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should initialize view and set selectedSlideIndex to 0', () => {
      component.ngAfterViewInit();

      expect(component.selectedSlideIndex).toBe(0);
    });
  });

  describe('user interactions', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.ngAfterViewInit();
    });

    it('should change slide when changeSlide is called', () => {
      component.changeSlide(1);
      expect(component.selectedSlideIndex).toBe(1);
    });

    it('should pause/resume animation when changePaused is called', () => {
      component.changePaused(true);
      expect(component.pausedAnimation).toBe(true);

      component.changePaused(false);
      expect(component.pausedAnimation).toBe(false);
    });

    it('should track focus state on banner elements', () => {
      component.onFocusIn();
      expect(component.areBannerElementsFocused).toBe(true);

      component.onFocusOut();
      expect(component.areBannerElementsFocused).toBe(false);
    });

    it('should track focus state on full click area', () => {
      component.onFullClickFocus();
      expect(component.isFocused).toBe(true);

      component.onFullClickBlur();
      expect(component.isFocused).toBe(false);
    });
  });

  describe('filtering and configuration', () => {
    beforeEach(() => {
      component.config = createMockConfig();
    });

    it('should filter items by point of sale code and exclude IMAGE_POPUP type', () => {
      component.ngOnInit();

      expect(component.filteredItems.length).toBeGreaterThan(0);
      expect(component.filteredItems.every((item) => item.content.bannerType !== BannerType.IMAGE_POPUP)).toBe(true);
      expect(component.bannerControlsConfig.items).toEqual(component.filteredItems);
    });

    it('should include items with empty tags for any point of sale', () => {
      const itemWithEmptyTags: BannerItemConfig = {
        configuration: {
          enableLowestPrice: false,
          isFullAreaClickable: false,
          showButton: false,
        },
        content: {
          title: 'Universal Banner',
          bannerType: BannerType.GENERIC,
        },
        media: { imageMedia: { bg: { title: 'Universal Banner', url: 'universal.jpg' } } },
        layout: {
          bannerStyle: BannerItemStyle.DEFAULT,
          horizontalAlign: HorizontalAlign.CENTER,
          fontSize: LayoutSize.MEDIUM,
        },
        tags: [],
      } as BannerItemConfig;
      
      component.config.bannerItems = [itemWithEmptyTags];
      pointOfSaleSubject.next({ ...mockPointOfSale, code: 'UK' } as PointOfSale);
      component.ngOnInit();

      expect(component.filteredItems.length).toBe(1);
      expect(component.filteredItems[0].tags).toEqual([]);
    });

    it('should set isCarousel to true when multiple items exist', () => {
      component.ngOnInit();
      expect(component.isCarousel).toBe(true);
    });

    it('should set isCarousel to false when single item exists', () => {
      component.config.bannerItems = [mockBannerItems[0]];
      component.ngOnInit();
      expect(component.isCarousel).toBe(false);
    });

    it('should configure banner controls with correct properties', () => {
      component.ngOnInit();

      expect(component.bannerControlsConfig.items).toEqual(component.filteredItems);
      expect(component.bannerControlsConfig.showControls).toBe(true);
      expect(component.bannerControlsConfig.showPagination).toBe(true);
    });
  });

  describe('reactive updates', () => {
    it('should update when pointOfSale changes', (done) => {
      component.ngOnInit();
      const newPointOfSale = {
        code: 'UK',
        currency: { code: 'GBP', symbol: '£' },
      } as PointOfSale;

      pointOfSaleSubject.next(newPointOfSale);

      setTimeout(() => {
        expect(component.pointOfSale).toEqual(newPointOfSale);
        expect(component.currency).toBe('GBP');
        done();
      }, 0);
    });

    it('should update currency when currency$ emits', (done) => {
      component.ngOnInit();

      currencySubject.next('EUR');

      setTimeout(() => {
        expect(component.currency).toBe('EUR');
        done();
      }, 0);
    });

    it('should ignore null pointOfSale updates', (done) => {
      component.ngOnInit();
      const initialPointOfSale = component.pointOfSale;

      pointOfSaleSubject.next(null);

      setTimeout(() => {
        expect(component.pointOfSale).toEqual(initialPointOfSale);
        done();
      }, 0);
    });
  });

  describe('responsive behavior', () => {
    it('should set and get isResponsive value', () => {
      component.isResponsive = true;
      expect(component.isResponsive).toBe(true);

      component.isResponsive = false;
      expect(component.isResponsive).toBe(false);
    });
  });

  describe('helper methods', () => {
    it('should detect images in popup when bg url exists', () => {
      const bannerWithBg = {
        media: { imageMedia: { bg: { title: 'Test', url: 'test.jpg' } } },
      } as BannerItemConfig;
      expect(component['popupContainsImages'](bannerWithBg)).toBe(true);
    });

    it('should detect images in popup when bgM or bgL url exists', () => {
      const bannerWithBgM = {
        media: { imageMedia: { bg: { title: 'Test', url: '' }, bgM: { title: 'Test M', url: 'test-m.jpg' } } },
      } as BannerItemConfig;
      expect(component['popupContainsImages'](bannerWithBgM)).toBe(true);

      const bannerWithBgL = {
        media: { imageMedia: { bg: { title: 'Test', url: '' }, bgL: { title: 'Test L', url: 'test-l.jpg' } } },
      } as BannerItemConfig;
      expect(component['popupContainsImages'](bannerWithBgL)).toBe(true);
    });

    it('should return false when no image urls exist', () => {
      const bannerConfig = {
        media: { imageMedia: { bg: { title: 'Test', url: '' } } },
      } as BannerItemConfig;

      expect(component['popupContainsImages'](bannerConfig)).toBe(false);
    });
  });
});
