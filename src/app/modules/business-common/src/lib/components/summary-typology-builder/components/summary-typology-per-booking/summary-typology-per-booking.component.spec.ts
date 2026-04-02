import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SummaryTypologyPerBookingComponent } from './summary-typology-per-booking.component';
import { SummaryTypologyBaseService } from '../../services/summary-typology-base.service';
import {
  Booking,
  BUSINESS_CONFIG,
  EnumChargesType,
  GroupedCharges,
  ISummarySelectedJourneysService,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
  SummaryTypologyRecord,
  PaxTypeCode,
  SummaryTypologyTemplate,
} from '@dcx/ui/libs';
import { PriceBreakdownItemsVM } from '@dcx/ui/design-system';
import { BUSINESS_CONFIG_MOCK } from '@dcx/ui/mock-repository';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('SummaryTypologyPerBookingComponent', () => {
  let component: SummaryTypologyPerBookingComponent;
  let fixture: ComponentFixture<SummaryTypologyPerBookingComponent>;
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
      totalAmount: 270,
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
    ],
    services: [],
    contacts: [],
  } as any;

  const mockDeparture: SummaryTypologyDataVm = {
    label: 'Departure',
    price: '100',
    currency: 'USD',
    modelType: SummaryTypologyDataVmModelType.DEPARTURE,
    records: [
      {
        code: 'FARE',
        price: 80,
        quantity: 1,
        currency: 'USD',
        chargeType: EnumChargesType.FARE,
        type: EnumChargesType.FARE,
        charges: [
          {
            code: 'TAX1',
            price: 10,
            quantity: 1,
            currency: 'USD',
            type: EnumChargesType.TAX,
          } as GroupedCharges,
        ],
      } as SummaryTypologyRecord,
      {
        code: 'TAX',
        price: 20,
        quantity: 1,
        currency: 'USD',
        chargeType: EnumChargesType.TAX,
        type: EnumChargesType.TAX,
        charges: [],
        serviceType: 'TAX',
        relatedServices: [],
      } as SummaryTypologyRecord,
    ],
    bundledRecords: [],
  };

  const mockArrival: SummaryTypologyDataVm = {
    label: 'Return',
    price: '120',
    currency: 'USD',
    modelType: SummaryTypologyDataVmModelType.ARRIVAL,
    records: [
      {
        code: 'FARE',
        price: 90,
        quantity: 1,
        currency: 'USD',
        chargeType: EnumChargesType.FARE,
        type: EnumChargesType.FARE,
        charges: [
          {
            code: 'TAX1',
            price: 15,
            quantity: 1,
            currency: 'USD',
            type: EnumChargesType.TAX,
          } as GroupedCharges,
        ],
      } as SummaryTypologyRecord,
      {
        code: 'TAX',
        price: 30,
        quantity: 1,
        currency: 'USD',
        chargeType: EnumChargesType.TAX,
        type: EnumChargesType.TAX,
        charges: [],
        serviceType: 'TAX',
        relatedServices: [],
      } as SummaryTypologyRecord,
    ],
    bundledRecords: [],
  };

  const mockServices: SummaryTypologyDataVm = {
    label: 'Services',
    price: '50',
    currency: 'USD',
    modelType: SummaryTypologyDataVmModelType.SERVICES,
    records: [
      {
        code: 'SEAT',
        price: 50,
        quantity: 2,
        currency: 'USD',
        chargeType: EnumChargesType.SERVICE,
        type: 'SEAT',
        charges: [],
        serviceType: 'SEAT',
        relatedServices: [],
      } as SummaryTypologyRecord,
    ],
    bundledRecords: [],
  };

  beforeEach(async () => {
    summaryTypologyBaseService = jasmine.createSpyObj('SummaryTypologyBaseService', [
      'buildSummaryTypologyDataVm',
      'buildSummaryTypologyDataPerRouteVm',
    ]);
    summaryTypologyBaseService.buildSummaryTypologyDataPerRouteVm.and.returnValue([
      mockDeparture,
      mockArrival,
      mockServices,
    ]);

    summarySelectedJourneysService = jasmine.createSpyObj('ISummarySelectedJourneysService', [
      'getSelectedPassengers',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SummaryTypologyPerBookingComponent,
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

    fixture = TestBed.createComponent(SummaryTypologyPerBookingComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);

    component.summaryTypologyConfig = {
      booking: mockBooking,
      isCollapsible: true,
      showInfoForSelectedFlight: false,
      showPaxGroup: true,
      bundleCodes: [],
      scheduleSelection: undefined,
      useTypologyItem: true,
      translations: {},
      displayPriceItemConcepts: false,
      useStaticDetails: false,
      bookingSellTypeServices: [],
      summaryScopeView: SummaryTypologyTemplate.PER_BOOKING,
      voucherMask: '',
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize passengerTypesModel', () => {
      component.ngOnInit();

      expect(component.passengerTypesModel).toBeDefined();
      expect(component.passengerTypesModel.config).toBeDefined();
    });
  });

  describe('getMergeJourneysResult', () => {
    it('should merge departure and arrival when both exist', () => {
      const result = component['getMergeJourneysResult']([mockDeparture, mockArrival, mockServices]);

      expect(result.length).toBe(2); // Merged journey + services
      expect(result[0].price).toBe('220'); // 100 + 120 
    });

    it('should handle only departure without arrival', () => {
      const result = component['getMergeJourneysResult']([mockDeparture, mockServices]);

      expect(result.length).toBe(2);
      expect(result[0]).toBe(mockDeparture);
    });

    it('should include services when present', () => {
      const result = component['getMergeJourneysResult']([mockDeparture, mockArrival, mockServices]);

      const servicesItem = result.find((item) => item.modelType === SummaryTypologyDataVmModelType.SERVICES);
      expect(servicesItem).toBeDefined();
    });

    it('should handle empty array', () => {
      const result = component['getMergeJourneysResult']([]);

      expect(result.length).toBe(0);
    });
  });

  describe('getSummaryTypologyServices', () => {
    it('should filter out departure and arrival', () => {
      const result = component['getSummaryTypologyServices']([mockDeparture, mockArrival, mockServices]);

      expect(result.length).toBe(1);
      expect(result[0].modelType).toBe(SummaryTypologyDataVmModelType.SERVICES);
    });

    it('should return empty array when no services', () => {
      const result = component['getSummaryTypologyServices']([mockDeparture, mockArrival]);

      expect(result.length).toBe(0);
    });
  });

  describe('mergeSummaryTypologyDataVm', () => {
    it('should merge departure and arrival data', () => {
      const result = component['mergeSummaryTypologyDataVm'](mockDeparture, mockArrival);

      expect(result.price).toBe('220');
      expect(result.currency).toBe('USD');
      expect(result.records).toBeDefined();
    });

    it('should call getRecords', () => {
      spyOn<any>(component, 'getRecords').and.returnValue([]);

      component['mergeSummaryTypologyDataVm'](mockDeparture, mockArrival);

      expect(component['getRecords']).toHaveBeenCalledWith(mockDeparture, mockArrival);
    });
  });

  describe('getRecords', () => {
    it('should combine departure and arrival records', () => {
      const result = component['getRecords'](mockDeparture, mockArrival);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should group records by charge type', () => {
      spyOn<any>(component, 'getSummaryTypologyRecordGroupedByChargeType').and.returnValue(undefined);

      component['getRecords'](mockDeparture, mockArrival);

      expect(component['getSummaryTypologyRecordGroupedByChargeType']).toHaveBeenCalledWith(
        EnumChargesType.TAX,
        mockDeparture,
        mockArrival
      );
    });
  });

  describe('getSummaryTypologyRecordGroupedByChargeType', () => {
    it('should group records by charge type', () => {
      const result = component['getSummaryTypologyRecordGroupedByChargeType'](
        EnumChargesType.TAX,
        mockDeparture,
        mockArrival
      );

      expect(result).toBeDefined();
      expect(result.chargeType).toBe(EnumChargesType.TAX);
    });

    it('should sum quantities correctly', () => {
      const result = component['getSummaryTypologyRecordGroupedByChargeType'](
        EnumChargesType.TAX,
        mockDeparture,
        mockArrival
      );

      expect(result.quantity).toBe(2); // 1 from departure + 1 from arrival
    });

    it('should calculate total price correctly', () => {
      const result = component['getSummaryTypologyRecordGroupedByChargeType'](
        EnumChargesType.TAX,
        mockDeparture,
        mockArrival
      );

      expect(result.price).toBe(50); // (1 * 20) + (1 * 30)
    });

    it('should return undefined when no records match', () => {
      const emptyDeparture = { ...mockDeparture, records: [] };
      const emptyArrival = { ...mockArrival, records: [] };

      const result = component['getSummaryTypologyRecordGroupedByChargeType'](
        EnumChargesType.TAX,
        emptyDeparture,
        emptyArrival
      );

      expect(result).toBeUndefined();
    });
  });

  describe('setQuantityAndPricePerChargeType', () => {
    it('should sum quantities for service charges', () => {
      const record = { type: EnumChargesType.SERVICE, code: 'SEAT' } as any;
      const departure = { quantity: 2, price: 10 } as any;
      const arrival = { quantity: 3, price: 10 } as any;

      component['setQuantityAndPricePerChargeType'](record, departure, arrival);

      expect(record.quantity).toBe(5);
      expect(record.price).toBe(50); // (2 * 10) + (3 * 10)
    });

    it('should not sum quantities for infant charges', () => {
      const record = { type: EnumChargesType.SERVICE, code: PaxTypeCode.INF } as any;
      const departure = { quantity: 2, price: 10 } as any;
      const arrival = { quantity: 3, price: 10 } as any;

      component['setQuantityAndPricePerChargeType'](record, departure, arrival);

      expect(record.quantity).toBe(2); // Only departure quantity
    });

    it('should not sum quantities for non-service charges', () => {
      const record = { type: EnumChargesType.TAX, code: 'TAX1' } as any;
      const departure = { quantity: 1, price: 20 } as any;
      const arrival = { quantity: 1, price: 30 } as any;

      component['setQuantityAndPricePerChargeType'](record, departure, arrival);

      expect(record.quantity).toBe(1);
      expect(record.price).toBe(50); // (1 * 20) + (1 * 30)
    });
  });

  describe('getPriceBreakdownVM', () => {
    it('should create price breakdown view model', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.returnValue('Booking Summary');

      const result = component['getPriceBreakdownVM']([mockDeparture]);

      expect(result.config).toBeDefined();
      expect(result.config.length).toBe(1);
    });

    it('should set header configuration correctly', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.returnValue('Booking Summary');

      const result = component['getPriceBreakdownVM']([mockDeparture]);

      expect(result.config[0].header.config.price).toBe(270);
      expect(result.config[0].header.config.currency).toBe('USD');
      expect(result.config[0].header.isCollapsed).toBe(true);
    });

    it('should set accessibility config', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.returnValue('Booking Summary');

      const result = component['getPriceBreakdownVM']([mockDeparture]);

      expect(result.config[0].accessibilityConfig.id).toBe('summaryTypologyPerBookingId');
      expect(result.config[0].header.config.ariaAttributes?.ariaControls).toBe('summaryTypologyPerBookingId');
    });
  });

  describe('getBreakdownItemsVm', () => {
    it('should transform summary typology data to breakdown items', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.returnValue('Services');

      const result = component['getBreakdownItemsVm']([mockDeparture]);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should map records to items with subitems', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.returnValue('Services');

      const result = component['getBreakdownItemsVm']([mockDeparture]);

      expect(result[0].item).toBeDefined();
      expect(result[0].subitems).toBeDefined();
    });

    it('should call sortSummaryTypologyDataAndRecords', () => {
      spyOn<any>(component, 'sortSummaryTypologyDataAndRecords');
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.returnValue('Services');

      component['getBreakdownItemsVm']([mockDeparture]);

      expect(component['sortSummaryTypologyDataAndRecords']).toHaveBeenCalled();
    });
  });

  describe('sortSummaryTypologyDataAndRecords', () => {
    it('should sort records with FARE first', () => {
      const data = [mockDeparture];
      
      component['sortSummaryTypologyDataAndRecords'](data, 'Departure');

      // FARE records should be sorted before TAX
      const fareIndex = data[0].records!.findIndex((r) => r.type === EnumChargesType.FARE);
      const taxIndex = data[0].records!.findIndex((r) => r.type === EnumChargesType.TAX);
      
      if (fareIndex !== -1 && taxIndex !== -1) {
        expect(fareIndex).toBeLessThan(taxIndex);
      }
    });

    it('should handle data without matching label', () => {
      const data = [mockServices];

      expect(() => component['sortSummaryTypologyDataAndRecords'](data, 'NonExistent')).not.toThrow();
    });
  });

  describe('initPriceBreakdownModel', () => {
    it('should initialize price breakdown model', () => {
      spyOn(component, 'getSummaryTypologyByRoute').and.returnValue([mockDeparture, mockArrival]);

      const result = component['initPriceBreakdownModel']();

      expect(result).toBeDefined();
      expect(result.config).toBeDefined();
    });

    it('should set summaryTypologyDataVm', () => {
      spyOn(component, 'getSummaryTypologyByRoute').and.returnValue([mockDeparture, mockArrival]);

      component['initPriceBreakdownModel']();

      expect(component['summaryTypologyDataVm']).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should properly initialize on component creation', () => {
      fixture.detectChanges();

      expect(component.passengerTypesModel).toBeDefined();
      expect(component.priceBreakdownModel).toBeDefined();
    });

    it('should handle complete workflow', () => {
      fixture.detectChanges();

      expect(component.loaded).toBe(true);
      expect(component.priceBreakdownModel.config).toBeDefined();
    });
  });
});
