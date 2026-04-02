import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FareOptionsItemComponent } from './fare-options-item.component';
import { BUSINESS_CONFIG, DictionaryType, Fare, FareItemApplicability, GenerateIdPipe } from '@dcx/ui/libs';
import { BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('FareOptionsItemComponent', () => {
  let component: FareOptionsItemComponent;
  let fixture: ComponentFixture<FareOptionsItemComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockGenerateIdPipe: jasmine.SpyObj<GenerateIdPipe>;

  const mockTranslations: DictionaryType = {
    key1: 'Translation 1',
    key2: 'Translation 2',
  };

  const mockFareData: Fare = {
    id: 'FARE1',
    referenceId: 'REF1',
    fareBasisCode: 'Y26NR',
    classOfService: 'Y',
    productClass: 'Economy',
    serviceBundleCode: 'BUNDLE1',
    availableSeats: 10,
    charges: [
      {
        type: 'BASE',
        code: 'BASE',
        amount: 100,
        currency: 'USD',
      },
      {
        type: 'TAX',
        code: 'TAX',
        amount: 20,
        currency: 'USD',
      },
    ],
    isRecommended: true,
    benefitsList: {
      items: [
        {
          content: 'Carry-on bag',
          icon: { name: 'check' },
          applicability: FareItemApplicability.INCLUDED,
        },
        {
          content: 'Checked bag',
          icon: { name: 'check' },
          applicability: FareItemApplicability.CHARGEABLE,
        },
        {
          content: 'Seat selection',
          icon: { name: 'check' },
          applicability: FareItemApplicability.NOT_INCLUDED,
        },
      ],
    },
  } as Fare;

  const mockFareDataSoldOut: Fare = {
    ...mockFareData,
    id: 'FARE2',
    availableSeats: 0,
    isRecommended: false,
  } as Fare;

  const mockFareDataNoCharges: Fare = {
    ...mockFareData,
    id: 'FARE3',
    charges: [],
    isRecommended: false,
  } as Fare;

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Translated Text');

    mockGenerateIdPipe = jasmine.createSpyObj('GenerateIdPipe', ['transformWithUUID']);
    mockGenerateIdPipe.transformWithUUID.and.returnValues(
      'fareHeader-id',
      'farePrice-id',
      'fareBenefits-id',
      'fareFooter-id'
    );

    await TestBed.configureTestingModule({
      imports: [
        FareOptionsItemComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: GenerateIdPipe, useValue: mockGenerateIdPipe },
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FareOptionsItemComponent);
    component = fixture.componentInstance;
    component.data = mockFareData;
    component.translations = mockTranslations;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should generate unique IDs for accessibility', () => {
      expect(component.headerId).toBe('fareHeader-id');
      expect(component.priceId).toBe('farePrice-id');
      expect(component.benefitsId).toBe('fareBenefits-id');
      expect(component.footerId).toBe('fareFooter-id');
      expect(mockGenerateIdPipe.transformWithUUID).toHaveBeenCalledWith('fareHeader');
      expect(mockGenerateIdPipe.transformWithUUID).toHaveBeenCalledWith('farePrice');
      expect(mockGenerateIdPipe.transformWithUUID).toHaveBeenCalledWith('fareBenefits');
      expect(mockGenerateIdPipe.transformWithUUID).toHaveBeenCalledWith('fareFooter');
    });

    it('should initialize with complete fare data', () => {
      component.ngOnInit();

      expect(component.isSoldOut).toBe(false);
      expect(component.price).toBe(120);
      expect(component.currency).toBe('USD');
      expect(component.recommendBadgeConfig).toBeDefined();
      expect(component.recommendBadgeConfig.text).toBe('Translated Text');
      expect(component.benefitsListConfig).toBeDefined();
      expect(component.benefitsListConfig.items.length).toBe(3);
    });

    it('should handle sold out fare', () => {
      component.data = mockFareDataSoldOut;

      component.ngOnInit();

      expect(component.isSoldOut).toBe(true);
      expect(component.recommendBadgeConfig).toBeUndefined();
    });

    it('should handle missing charges gracefully', () => {
      component.data = mockFareDataNoCharges;

      component.ngOnInit();

      expect(component.price).toBe(0);
      expect(component.currency).toBe('COP');
    });

    it('should handle undefined charges array', () => {
      component.data = { ...mockFareData, charges: undefined as any };

      component.ngOnInit();

      expect(component.price).toBe(0);
      expect(component.currency).toBe('COP');
    });

    it('should handle charges with undefined amounts', () => {
      component.data = {
        ...mockFareData,
        charges: [
          { type: 'BASE', code: 'BASE', amount: undefined, currency: 'USD' },
          { type: 'TAX', code: 'TAX', amount: 20, currency: 'USD' },
        ],
      };

      component.ngOnInit();

      expect(component.price).toBe(20);
    });

    it('should handle missing benefitsList', () => {
      component.data = { ...mockFareData, benefitsList: undefined };

      component.ngOnInit();

      expect(component.benefitsListConfig.items).toEqual([]);
    });
  });

  describe('Benefits Configuration', () => {
    it('should map all benefit applicabilities correctly', () => {
      component.ngOnInit();

      const items = component.benefitsListConfig.items;
      
      // INCLUDED
      expect(items[0].icon?.name).toBe('check');
      expect((items[0] as any).cssClass).toBe('benefit--included');
      expect(items[0].content).toBe('Carry-on bag');
      
      // CHARGEABLE
      expect(items[1].icon?.name).toBe('currency');
      expect((items[1] as any).cssClass).toBe('benefit--chargeable');
      expect(items[1].content).toBe('Checked bag');
      
      // NOT_INCLUDED
      expect(items[2].icon?.name).toBe('cross');
      expect((items[2] as any).cssClass).toBe('benefit--not-offered');
      expect(items[2].content).toBe('Seat selection');
    });

    it('should generate proper aria-label for benefits list', () => {
      mockTranslateService.instant.and.returnValues('Included', 'Chargeable', 'Not Included');

      component.ngOnInit();

      expect(component.benefitsListConfig.ariaAttributes).toBeDefined();
      expect(component.benefitsListConfig.ariaAttributes?.ariaLabel).toBeTruthy();
    });
  });

  describe('Translation Integration', () => {
    it('should translate recommended badge', () => {
      mockTranslateService.instant.and.returnValue('Recomendado');

      component.ngOnInit();

      expect(component.recommendBadgeConfig.text).toBe('Recomendado');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Common.Select_RecommendedBadge_Text');
    });

    it('should translate benefit icon labels', () => {
      mockTranslateService.instant.and.returnValues('Incluido', 'Con cargo', 'No incluido');

      component.ngOnInit();

      expect(mockTranslateService.instant).toHaveBeenCalledWith('Fare.Included_IconLabel');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Fare.Chargeable_IconLabel');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('Fare.NotIncluded_IconLabel');
    });
  });
});
