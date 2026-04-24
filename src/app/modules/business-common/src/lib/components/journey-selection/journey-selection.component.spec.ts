import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { JourneySelectionComponent } from './journey-selection.component';
import { BUSINESS_CONFIG, Fare, JourneyVM } from '@dcx/ui/libs';
import { JourneySelection } from './models/journey-selection.model';
import { ScheduleService } from '../schedules/services/schedules.service';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

const mockBusinessConfig = {
  businessName: 'TEST_BUSINESS',
  imagePopUpFrecuencyTime: 0,
  manageCountries: [],
  passengers: {},
  phoneValidationMessage: '',
  prefixValidationMessage: '',
  roundingCurrencyFactors: [
    { code: 'USD', factor: '1.00' },
    { code: 'COP', factor: '1.00' },
  ],
};

describe('JourneySelectionComponent', () => {
  let component: JourneySelectionComponent;
  let fixture: ComponentFixture<JourneySelectionComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockScheduleService: jasmine.SpyObj<ScheduleService>;

  const mockFares: Fare[] = [
    {
      id: 'FARE1',
      referenceId: 'REF1',
      fareBasisCode: 'Y26NR',
      classOfService: 'Y',
      productClass: 'Economy',
      serviceBundleCode: 'BUNDLE1',
      availableSeats: 10,
      charges: [
        { type: 'BASE', code: 'BASE', amount: 100, currency: 'USD' },
        { type: 'TAX', code: 'TAX', amount: 20, currency: 'USD' },
      ],
    } as Fare,
    {
      id: 'FARE2',
      referenceId: 'REF2',
      fareBasisCode: 'M26NR',
      classOfService: 'M',
      productClass: 'Business',
      serviceBundleCode: 'BUNDLE2',
      availableSeats: 5,
      charges: [
        { type: 'BASE', code: 'BASE', amount: 200, currency: 'USD' },
        { type: 'TAX', code: 'TAX', amount: 30, currency: 'USD' },
      ],
    } as Fare,
  ];

  const mockJourneyData: JourneyVM = {
    id: 'JOURNEY1',
    origin: {
      code: 'SAL',
      name: 'San Salvador',
      city: 'San Salvador',
      country: 'El Salvador',
      iata: 'SAL',
    },
    destination: {
      code: 'MIA',
      name: 'Miami',
      city: 'Miami',
      country: 'United States',
      iata: 'MIA',
    },
    schedule: {
      std: new Date('2026-01-15T10:00:00Z'),
      sta: new Date('2026-01-15T14:00:00Z'),
    },
    segments: [
      {
        id: 'SEG1',
        origin: { code: 'SAL', name: 'San Salvador', city: 'San Salvador', country: 'El Salvador' },
        destination: { code: 'MIA', name: 'Miami', city: 'Miami', country: 'United States' },
        schedule: { std: new Date('2026-01-15T10:00:00Z'), sta: new Date('2026-01-15T14:00:00Z') },
        legs: [],
        transport: { flightNumber: '123', carrierCode: 'AV' } as any,
      } as any,
    ],
    duration: '4h 00m',
    fares: mockFares,
  } as JourneyVM;

  const mockJourneySelection: JourneySelection = {
    journey: mockJourneyData,
  };

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Translated Text');

    mockScheduleService = jasmine.createSpyObj('ScheduleService', ['getTotalDays']);
    mockScheduleService.getTotalDays.and.returnValue(0);

    await TestBed.configureTestingModule({
      imports: [
        JourneySelectionComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ScheduleService, useValue: mockScheduleService },
        { provide: BUSINESS_CONFIG, useValue: mockBusinessConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JourneySelectionComponent);
    component = fixture.componentInstance;
    component.data = mockJourneySelection;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with closed state and generate fareListId', () => {
      expect(component.isOpen).toBe(false);
      expect(component.fareListId).toBeDefined();
    });

    it('should initialize configurations on ngOnInit', () => {
      mockTranslateService.instant.and.callFake((key: string) => {
        const translations: { [key: string]: string } = {
          'Schedule.Compare_Fares': 'Compare Fares',
          'Schedule.Fares.Title_Vertical': 'Select Your Fare',
        };
        return translations[key] || key;
      });

      component.ngOnInit();

      expect(component.offCanvasConfig).toBeDefined();
      expect(component.offCanvasConfig.offCanvasHeaderConfig?.title).toBe('Compare Fares');
      expect(component.fareOptions).toBeDefined();
      expect(component.fareOptions.title).toBe('Select Your Fare');
      expect(component.isResponsive).toBeDefined();
    });
  });

  describe('toggleFares', () => {
    it('should toggle isOpen state', () => {
      expect(component.isOpen).toBe(false);

      component.toggleFares();
      expect(component.isOpen).toBe(true);

      component.toggleFares();
      expect(component.isOpen).toBe(false);
    });
  });

  describe('lowestFarePrice', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should calculate the lowest total price from available fares', () => {
      expect(component.lowestFarePrice).toBe(120); // 100 + 20
    });

    it('should return 0 when no fares are available', () => {
      component.fareOptions = { title: '', options: [] };

      expect(component.lowestFarePrice).toBe(0);
    });

    it('should handle fares with undefined charge amounts', () => {
      component.fareOptions = {
        title: '',
        options: [
          {
            ...mockFares[0],
            charges: [{ type: 'BASE', code: 'BASE', amount: undefined, currency: 'USD' }],
          },
        ],
      };

      expect(component.lowestFarePrice).toBe(0);
    });

    it('should sum multiple charges correctly', () => {
      component.fareOptions = {
        title: '',
        options: [
          {
            ...mockFares[0],
            charges: [
              { type: 'BASE', code: 'BASE', amount: 50, currency: 'USD' },
              { type: 'TAX', code: 'TAX', amount: 10, currency: 'USD' },
              { type: 'FEE', code: 'FEE', amount: 5, currency: 'USD' },
            ],
          },
        ],
      };

      expect(component.lowestFarePrice).toBe(65);
    });
  });

  describe('ariaLabel', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should build complete aria label with journey details', () => {
      const ariaLabel = component.ariaLabel;

      expect(ariaLabel).toContain('Origen SAL');
      expect(ariaLabel).toContain('destino MIA');
      expect(ariaLabel).toContain('Sale a las');
      expect(ariaLabel).toContain('llega a las');
      expect(ariaLabel).toContain('0 paradas');
      expect(ariaLabel).toContain('Duración total 4h 00m');
      expect(ariaLabel).toContain('Precio desde $120');
      expect(ariaLabel).toContain('Clique para seleccionar tu tarifa');
    });

    it('should handle multi-day journeys correctly', () => {
      mockScheduleService.getTotalDays.and.returnValue(2);

      expect(component.ariaLabel).toContain('(2 días)');
    });

    it('should use singular form for one day', () => {
      mockScheduleService.getTotalDays.and.returnValue(1);

      expect(component.ariaLabel).toContain('(1 día)');
    });

    it('should use singular form for one stop', () => {
      component.data = {
        ...mockJourneySelection,
        journey: {
          ...mockJourneyData,
          segments: [{}, {}] as any,
        },
      };

      expect(component.ariaLabel).toContain('1 parada.');
    });

    it('should use plural form for multiple stops', () => {
      component.data = {
        ...mockJourneySelection,
        journey: {
          ...mockJourneyData,
          segments: [{}, {}, {}] as any,
        },
      };

      expect(component.ariaLabel).toContain('2 paradas.');
    });
  });

  describe('fare options handling', () => {
    it('should handle empty fares array', () => {
      component.data = {
        journey: { ...mockJourneyData, fares: [] },
      };

      component.ngOnInit();

      expect(component.fareOptions.options.length).toBe(0);
    });

    it('should handle undefined fares', () => {
      component.data = {
        journey: { ...mockJourneyData, fares: undefined },
      };

      component.ngOnInit();

      expect(component.fareOptions.options.length).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup media query listener on destroy', () => {
      const mockDestroy = jasmine.createSpy('destroyMediaQueryListener');
      component['destroyMediaQueryListener'] = mockDestroy;

      component.ngOnDestroy();

      expect(mockDestroy).toHaveBeenCalled();
    });
  });
});
