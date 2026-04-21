import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SummaryTypologyPerJourneyComponent } from './summary-typology-per-journey.component';
import { SummaryTypologyBaseService } from '../../services/summary-typology-base.service';
import {
  Booking,
  BUSINESS_CONFIG,
  EnumChargesType,
  ISummarySelectedJourneysService,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
  SummaryTypologyRecord,
  PaxTypeCode,
  SummaryTypologyTemplate,
} from '@dcx/ui/libs';
import { BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('SummaryTypologyPerJourneyComponent', () => {
  let component: SummaryTypologyPerJourneyComponent;
  let fixture: ComponentFixture<SummaryTypologyPerJourneyComponent>;
  let summaryTypologyBaseService: jasmine.SpyObj<SummaryTypologyBaseService>;
  let summarySelectedJourneysService: jasmine.SpyObj<ISummarySelectedJourneysService>;
  let translateService: TranslateService;

  const mockBooking: Booking = {
    bookingInfo: {
      recordLocator: 'ABC123',
      pointOfSale: {
        posCode: 'US',
        code: 'US',
      },
    },
    pricing: {
      currency: 'USD',
      totalPrice: 270,
    },
    journeys: [],
    pax: [
      {
        id: 'PAX1',
        referenceId: 'pax1',
        type: { code: PaxTypeCode.ADT, name: 'Adult' },
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        id: 'PAX2',
        referenceId: 'pax2',
        type: { code: PaxTypeCode.CHD, name: 'Child' },
        firstName: 'Jane',
        lastName: 'Doe',
      },
    ],
    services: [
      {
        code: 'SEAT',
        type: 'SEAT',
        status: 'CONFIRMED',
      },
      {
        code: 'BAGGAGE',
        type: 'BAGGAGE',
        status: 'CONFIRMED',
      },
    ],
    contacts: [],
  } as any;

  const mockSummaryTypologyDataVm: SummaryTypologyDataVm[] = [
    {
      label: 'Departure',
      labelText: 'MIA - BOG',
      price: '100',
      currency: 'USD',
      modelType: SummaryTypologyDataVmModelType.DEPARTURE,
      records: [
        {
          code: 'FLIGHT',
          price: 100,
          quantity: 2,
          currency: 'USD',
          chargeType: EnumChargesType.DEFAULT,
          charges: [
            {
              code: 'TAX1',
              price: 10,
              quantity: 2,
              currency: 'USD',
            },
          ],
        } as SummaryTypologyRecord,
      ],
      bundledRecords: [],
    },
    {
      label: 'Return',
      labelText: 'BOG - MIA',
      price: '120',
      currency: 'USD',
      modelType: SummaryTypologyDataVmModelType.ARRIVAL,
      records: [
        {
          code: 'FLIGHT',
          price: 120,
          quantity: 2,
          currency: 'USD',
          chargeType: EnumChargesType.DEFAULT,
          charges: [
            {
              code: 'TAX2',
              price: 15,
              quantity: 2,
              currency: 'USD',
            },
          ],
        } as SummaryTypologyRecord,
      ],
      bundledRecords: [],
    },
    {
      label: 'Services',
      price: '50',
      currency: 'USD',
      modelType: SummaryTypologyDataVmModelType.SERVICES,
      records: [
        {
          code: 'SEAT',
          price: 30,
          quantity: 2,
          currency: 'USD',
          chargeType: EnumChargesType.SERVICE,
          type: 'SEAT',
          charges: [],
          serviceType: 'SEAT',
          relatedServices: [],
        } as SummaryTypologyRecord,
        {
          code: 'BAGGAGE',
          price: 20,
          quantity: 2,
          currency: 'USD',
          chargeType: EnumChargesType.SERVICE,
          type: 'BAGGAGE',
          charges: [],
          serviceType: 'BAGGAGE',
          relatedServices: [],
        } as SummaryTypologyRecord,
      ],
      bundledRecords: [],
    },
  ];

  beforeEach(async () => {
    summaryTypologyBaseService = jasmine.createSpyObj('SummaryTypologyBaseService', [
      'buildSummaryTypologyDataVm',
      'buildSummaryTypologyDataPerRouteVm',
    ]);
    summaryTypologyBaseService.buildSummaryTypologyDataVm.and.returnValue(mockSummaryTypologyDataVm);
    summaryTypologyBaseService.buildSummaryTypologyDataPerRouteVm.and.returnValue(mockSummaryTypologyDataVm);

    summarySelectedJourneysService = jasmine.createSpyObj('ISummarySelectedJourneysService', [
      'getSelectedPassengers',
    ]);
    summarySelectedJourneysService.getSelectedPassengers.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [
        SummaryTypologyPerJourneyComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: SummaryTypologyBaseService, useValue: summaryTypologyBaseService },
        { provide: SUMMARY_SELECTED_JOURNEYS_SERVICE, useValue: summarySelectedJourneysService },
        { provide: BUSINESS_CONFIG, useValue: BUSINESS_CONFIG_MOCK },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryTypologyPerJourneyComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);

    // Set up required config
    component.summaryTypologyConfig = {
      booking: mockBooking,
      isCollapsible: true,
      showInfoForSelectedFlight: false,
      showPaxGroup: true,
      bundleCodes: [],
      scheduleSelection: undefined,
      useTypologyItem: true,
      displayPriceItemConcepts: false,
      useStaticDetails: false,
      bookingSellTypeServices: [],
      summaryScopeView: SummaryTypologyTemplate.PER_JOURNEY,
      voucherMask: '',
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call super.ngOnInit and internalInit', () => {
      spyOn<any>(component, 'internalInit');
      const superSpy = spyOn(Object.getPrototypeOf(SummaryTypologyPerJourneyComponent.prototype), 'ngOnInit');

      component.ngOnInit();

      expect(superSpy).toHaveBeenCalled();
      expect(component['internalInit']).toHaveBeenCalled();
    });

    it('should initialize passengerTypesModel', () => {
      component.ngOnInit();

      expect(component.passengerTypesModel).toBeDefined();
      expect(component.passengerTypesModel.config).toBeDefined();
    });
  });

  describe('internalInit', () => {
    it('should initialize passengerTypesModel', () => {
      component['internalInit']();

      expect(component.passengerTypesModel).toBeDefined();
      expect(component.passengerTypesModel.config.length).toBeGreaterThan(0);
    });

    it('should set correct passenger types', () => {
      component['internalInit']();

      const adultConfig = component.passengerTypesModel.config.find((c) => c.code === PaxTypeCode.ADT);
      const childConfig = component.passengerTypesModel.config.find((c) => c.code === PaxTypeCode.CHD);

      expect(adultConfig?.quantity).toBe(1);
      expect(childConfig?.quantity).toBe(1);
    });
  });

  describe('setHasServicesAndJourneys', () => {
    it('should set hasServicesAndJourneys to true when both services and journeys exist', () => {
      component['setHasServicesAndJourneys'](mockSummaryTypologyDataVm);

      expect(component.hasServicesAndJourneys).toBe(true);
    });

    it('should set hasServicesAndJourneys to false when only services exist', () => {
      const servicesOnly = [mockSummaryTypologyDataVm[2]];

      component['setHasServicesAndJourneys'](servicesOnly);

      expect(component.hasServicesAndJourneys).toBe(false);
    });

    it('should set hasServicesAndJourneys to false when only journeys exist', () => {
      const journeysOnly = [mockSummaryTypologyDataVm[0], mockSummaryTypologyDataVm[1]];

      component['setHasServicesAndJourneys'](journeysOnly);

      expect(component.hasServicesAndJourneys).toBe(false);
    });

    it('should set hasServicesAndJourneys to false when no data exists', () => {
      component['setHasServicesAndJourneys']([]);

      expect(component.hasServicesAndJourneys).toBe(false);
    });
  });

  describe('initPriceBreakdownModel', () => {
    beforeEach(() => {
      spyOn(component, 'getSummaryTypologyByRoute').and.returnValue(mockSummaryTypologyDataVm);
      spyOn<any>(component, 'getPriceBreakdown').and.callThrough();
    });

    it('should call getSummaryTypologyByRoute', () => {
      component['initPriceBreakdownModel']();

      expect(component.getSummaryTypologyByRoute).toHaveBeenCalled();
    });

    it('should return price breakdown model', () => {
      const result = component['initPriceBreakdownModel']();

      expect(result).toBeDefined();
      expect(result.config).toBeDefined();
      expect(result.config.length).toBeGreaterThan(0);
    });

    it('should filter services when showInfoForSelectedFlight is true', () => {
      component.summaryConfig.showInfoForSelectedFlight = true;

      const result = component['initPriceBreakdownModel']();

      expect(component['getPriceBreakdown']).toHaveBeenCalled();
      // Verify only service records are included
      const callArgs = (component['getPriceBreakdown'] as jasmine.Spy).calls.mostRecent().args[0];
      expect(callArgs.every((route: SummaryTypologyDataVm) =>
        route.records?.every((r) => r.chargeType === EnumChargesType.SERVICE) || !route.records?.length
      )).toBe(true);
    });

    it('should not filter when showInfoForSelectedFlight is false', () => {
      component.summaryConfig.showInfoForSelectedFlight = false;

      component['initPriceBreakdownModel']();

      const callArgs = (component['getPriceBreakdown'] as jasmine.Spy).calls.mostRecent().args[0];
      expect(callArgs).toEqual(mockSummaryTypologyDataVm);
    });
  });

  describe('getBreakdownItemsVm', () => {
    it('should transform records to PriceBreakdownItemsVM', () => {
      const result = component['getBreakdownItemsVm'](mockSummaryTypologyDataVm[0]);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].item).toBeDefined();
      expect(result[0].subitems).toBeDefined();
    });

    it('should set correct item properties', () => {
      const result = component['getBreakdownItemsVm'](mockSummaryTypologyDataVm[0]);

      expect(result[0].item.code).toBe('FLIGHT');
      expect(result[0].item.price).toBe(100);
      expect(result[0].item.quantity).toBe(2);
      expect(result[0].item.currency).toBe('USD');
    });

    it('should map charges to subitems', () => {
      const result = component['getBreakdownItemsVm'](mockSummaryTypologyDataVm[0]);

      expect(result[0].subitems.length).toBe(1);
      expect(result[0].subitems[0].code).toBe('TAX1');
      expect(result[0].subitems[0].price).toBe(10);
    });

    it('should order items by number of subitems', () => {
      spyOn<any>(component, 'priceBreakdownItemsVMOrder').and.callThrough();

      component['getBreakdownItemsVm'](mockSummaryTypologyDataVm[2]);

      expect(component['priceBreakdownItemsVMOrder']).toHaveBeenCalled();
    });

    it('should handle records with no charges', () => {
      const result = component['getBreakdownItemsVm'](mockSummaryTypologyDataVm[2]);

      expect(result).toBeDefined();
      expect(result.every((item) => item.subitems.length === 0)).toBe(true);
    });
  });

  describe('getPriceBreakdown', () => {
    it('should call setHasServicesAndJourneys', () => {
      spyOn<any>(component, 'setHasServicesAndJourneys');

      component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(component['setHasServicesAndJourneys']).toHaveBeenCalledWith(mockSummaryTypologyDataVm);
    });

    it('should return PriceBreakdownVM with correct structure', () => {
      const result = component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(result.config).toBeDefined();
      expect(result.config.length).toBe(3);
    });

    it('should set header config correctly', () => {
      const result = component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      const firstConfig = result.config[0];
      expect(firstConfig.header.config.label).toBe('Departure');
      expect(firstConfig.header.config.secondLabel).toBe('MIA - BOG');
      expect(firstConfig.header.config.price).toBe(100);
      expect(firstConfig.header.config.currency).toBe('USD');
    });

    it('should set isCollapsible from summaryConfig', () => {
      component.summaryConfig.isCollapsible = false;
      const result = component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(result.config[0].header.config.isCollapsible).toBe(false);
    });

    it('should set accessibility config with correct id', () => {
      const result = component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(result.config[0].accessibilityConfig.id).toBe('summaryTypologyPerJourneyDepartureId');
      expect(result.config[1].accessibilityConfig.id).toBe('summaryTypologyPerJourneyReturnId');
    });

    it('should set aria-controls matching accessibility id', () => {
      const result = component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(result.config[0].header.config.ariaAttributes?.ariaControls).toBe(
        'summaryTypologyPerJourneyDepartureId'
      );
    });

    it('should set header isCollapsed to true by default', () => {
      const result = component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(result.config[0].header.isCollapsed).toBe(true);
      expect(result.config[1].header.isCollapsed).toBe(true);
    });

    it('should call getBreakdownItemsVm for each route', () => {
      spyOn<any>(component, 'getBreakdownItemsVm').and.callThrough();

      component['getPriceBreakdown'](mockSummaryTypologyDataVm);

      expect(component['getBreakdownItemsVm']).toHaveBeenCalledTimes(3);
    });

    it('should handle empty summaryTypologyData', () => {
      const result = component['getPriceBreakdown']([]);

      expect(result.config.length).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should properly initialize on component creation', () => {
      fixture.detectChanges();

      expect(component.loaded).toBe(true);
      expect(component.passengerTypesModel).toBeDefined();
      expect(component.priceBreakdownModel).toBeDefined();
    });

    it('should handle config changes', () => {
      const newBooking = { ...mockBooking, pax: [...mockBooking.pax] };
      component.summaryTypologyConfig = {
        booking: newBooking,
        isCollapsible: false,
        showInfoForSelectedFlight: false,
        showPaxGroup: true,
        bundleCodes: [],
        scheduleSelection: undefined,
        useTypologyItem: true,
        displayPriceItemConcepts: false,
        useStaticDetails: false,
        bookingSellTypeServices: [],
        summaryScopeView: SummaryTypologyTemplate.PER_JOURNEY,
        voucherMask: '',
      };

      expect(component.booking).toEqual(newBooking);
      expect(component.summaryConfig.isCollapsible).toBe(false);
    });

    it('should build complete price breakdown model', () => {
      fixture.detectChanges();

      expect(component.priceBreakdownModel.config).toBeDefined();
      expect(component.priceBreakdownModel.config.length).toBeGreaterThan(0);
      expect(component.priceBreakdownModel.config[0].list).toBeDefined();
    });
  });
});
