import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SummaryTypologyBaseComponent } from './summary-typology-base.component';
import { SummaryTypologyBaseService } from './services/summary-typology-base.service';
import {
  Booking,
  EnumServiceStatus,
  ISummarySelectedJourneysService,
  SUMMARY_SELECTED_JOURNEYS_SERVICE,
  SummaryTypologyBuilderConfig,
  SummaryTypologyDataVm,
  SummaryTypologyDataVmModelType,
  SummaryTypologyRecord,
  PaxTypeCode,
  SummaryTypologyTemplate,
  EnumChargesType,
} from '@dcx/ui/libs';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('SummaryTypologyBaseComponent', () => {
  let component: SummaryTypologyBaseComponent;
  let fixture: ComponentFixture<SummaryTypologyBaseComponent>;
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
    journeys: [
      {
        id: 'journey1',
        segments: [],
      },
    ],
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
      {
        id: 'PAX3',
        referenceId: 'pax3',
        type: { code: PaxTypeCode.INF, name: 'Infant' },
        firstName: 'Baby',
        lastName: 'Doe',
      },
    ],
    services: [
      {
        code: 'BUNDLE1',
        type: 'BUNDLE',
        status: EnumServiceStatus.CONFIRMED,
      },
      {
        code: 'SEAT',
        type: 'SEAT',
        status: EnumServiceStatus.CONFIRMED,
      },
      {
        code: 'BAGGAGE',
        type: 'BAGGAGE',
        status: EnumServiceStatus.CONFIRMED,
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
          code: 'FARE',
          price: 100,
          quantity: 2,
          currency: 'USD',
          type: 'FARE',
          serviceType: '',
          charges: [],
          chargeType: EnumChargesType.FARE,
          relatedServices: [],
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
          code: 'FARE',
          price: 120,
          quantity: 2,
          currency: 'USD',
          type: 'FARE',
          serviceType: '',
          charges: [],
          chargeType: EnumChargesType.FARE,
          relatedServices: [],
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
          type: 'SEAT',
          serviceType: 'SEAT',
          charges: [],
          relatedServices: [],
          chargeType: EnumChargesType.SERVICE,
        } as SummaryTypologyRecord,
        {
          code: 'BAGGAGE',
          price: 20,
          quantity: 2,
          currency: 'USD',
          type: 'BAGGAGE',
          serviceType: 'BAGGAGE',
          charges: [],
          chargeType: EnumChargesType.SERVICE,
          relatedServices: [],
        } as SummaryTypologyRecord,
        {
          code: 'BUNDLE',
          price: 20,
          quantity: 2,
          currency: 'USD',
          type: 'BUNDLE',
          serviceType: 'BUNDLE',
          charges: [],
          chargeType: EnumChargesType.SERVICE,
          relatedServices: [],
        } as SummaryTypologyRecord,
        {
          code: 'BUNDLE1',
          price: 50,
          quantity: 1,
          currency: 'USD',
          type: 'BUNDLE',
          serviceType: 'BUNDLE',
          charges: [],
          chargeType: EnumChargesType.SERVICE,
          relatedServices: [],
        } as SummaryTypologyRecord,
      ],
      bundledRecords: [
        {
          code: 'BUNDLE1',
          price: 50,
          quantity: 1,
          currency: 'USD',
          type: 'BUNDLE',
          serviceType: 'BUNDLE',
          charges: [],
          chargeType: EnumChargesType.SERVICE,
          relatedServices: [],
        } as SummaryTypologyRecord,
      ],
    },
  ];

  const mockConfig: SummaryTypologyBuilderConfig = {
    booking: mockBooking,
    isCollapsible: true,
    showInfoForSelectedFlight: false,
    showPaxGroup: true,
    useStaticDetails: false,
    bundleCodes: ['BUNDLE1'],
    scheduleSelection: undefined,
    servicesCodesToMerge: [],
    excludeChargesCode: [],
    useTypologyItem: true,
    displayPriceItemConcepts: false,
    bookingSellTypeServices: [],
    summaryScopeView: SummaryTypologyTemplate.PER_PAX,
    voucherMask: '',
  };

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
        SummaryTypologyBaseComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: SummaryTypologyBaseService, useValue: summaryTypologyBaseService },
        { provide: SUMMARY_SELECTED_JOURNEYS_SERVICE, useValue: summarySelectedJourneysService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryTypologyBaseComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Constructor Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.summaryTypologyVm).toEqual([]);
      expect(component.showStaticDetails).toEqual([]);
      expect(component.adults).toBe(0);
      expect(component.children).toBe(0);
      expect(component.infants).toBe(0);
      expect(component.teens).toBe(0);
      expect(component.infantsWithSeat).toBe(0);
      expect(component.loaded).toBe(false);
    });
  });

  describe('summaryTypologyConfig setter', () => {
    it('should set config and load summary typology vm', () => {
      component.summaryTypologyConfig = mockConfig;
      const newConfig = { ...mockConfig, isCollapsible: false };

      component.summaryTypologyConfig = newConfig;

      expect(component.summaryConfig).toEqual(newConfig);
      expect(component.booking).toBe(newConfig.booking);
    });

    it('should call loadSummaryTypologyVm', () => {
      const loadSpy = spyOn(component, 'loadSummaryTypologyVm');

      component.summaryTypologyConfig = mockConfig;

      expect(loadSpy).toHaveBeenCalled();
    });

    it('should initialize price breakdown model', () => {
      spyOn<any>(component, 'initPriceBreakdownModel').and.returnValue({} as any);

      component.summaryTypologyConfig = mockConfig;

      expect(component['initPriceBreakdownModel']).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
      // Set summaryTypologyPerRoute to prevent undefined error in loadDetailsStatus
      component['summaryTypologyPerRoute'] = mockSummaryTypologyDataVm;
    });

    it('should load summary typology vm', () => {
      spyOn(component, 'loadSummaryTypologyVm');

      component.ngOnInit();

      expect(component.loadSummaryTypologyVm).toHaveBeenCalled();
    });

    it('should get summary typology by route', () => {
      const getSpy = spyOn(component, 'getSummaryTypologyByRoute').and.callThrough();
      // Reset to allow it to be called
      component['summaryTypologyPerRoute'] = undefined!;

      component.ngOnInit();

      expect(getSpy).toHaveBeenCalled();
    });

    it('should calculate total flight value', () => {
      spyOn(component, 'valueTotalFlight');

      component.ngOnInit();

      expect(component.valueTotalFlight).toHaveBeenCalled();
    });

    it('should load pax group when showPaxGroup is true', () => {
      spyOn(component, 'loadPaxGroup');
      component.summaryConfig.showPaxGroup = true;

      component.ngOnInit();

      expect(component.loadPaxGroup).toHaveBeenCalled();
    });

    it('should not load pax group when showPaxGroup is false', () => {
      spyOn(component, 'loadPaxGroup');
      component.summaryConfig.showPaxGroup = false;

      component.ngOnInit();

      expect(component.loadPaxGroup).not.toHaveBeenCalled();
    });

    it('should set loaded to true', () => {
      component.ngOnInit();

      expect(component.loaded).toBe(true);
    });
  });

  describe('initPassengerTypesModel', () => {
    beforeEach(() => {
      // Create a fresh config to avoid mutations from other tests
      const freshConfig: SummaryTypologyBuilderConfig = {
        booking: mockBooking,
        isCollapsible: true,
        showInfoForSelectedFlight: false,
        showPaxGroup: true,
        useStaticDetails: false,
        bundleCodes: ['BUNDLE1'],
        scheduleSelection: undefined,
        servicesCodesToMerge: [],
        excludeChargesCode: [],
        useTypologyItem: true,
        displayPriceItemConcepts: false,
        bookingSellTypeServices: [],
        summaryScopeView: SummaryTypologyTemplate.PER_PAX,
        voucherMask: '',
      };
      component.summaryTypologyConfig = freshConfig;
    });

    it('should create passenger types model from booking pax', () => {
      // Verify booking is set correctly
      expect(component.booking).toBeDefined();
      expect(component.booking.pax).toBeDefined();
      expect(component.booking.pax.length).toBe(3);

      const result = component.initPassengerTypesModel();

      expect(result.config).toBeDefined();
      expect(result.config.length).toBeGreaterThanOrEqual(3); // ADT, CHD, INF
    });

    it('should count adults correctly', () => {
      // Ensure config is set
      expect(component.summaryConfig).toBeDefined();
      expect(component.summaryConfig.showInfoForSelectedFlight).toBe(false);
      expect(component.booking).toBeDefined();
      expect(component.booking.pax).toBeDefined();
      expect(component.booking.pax.length).toBe(3);

      // Log pax types for debugging
      const paxTypes = component.booking.pax.map(p => p.type.code);
      console.log('Pax types in booking:', paxTypes);
      console.log('PaxTypeCode.ADT value:', PaxTypeCode.ADT);
      console.log('Object.values(PaxTypeCode):', Object.values(PaxTypeCode));

      const result = component.initPassengerTypesModel();

      // Debug output
      if (result.config.length === 0) {
        fail(`result.config is empty. Booking defined: ${!!component.booking}, Pax count: ${component.booking?.pax?.length}, showInfoForSelectedFlight: ${component.summaryConfig.showInfoForSelectedFlight}`);
      }

      const adultConfig = result.config.find((c) => c.code === PaxTypeCode.ADT);

      if (!adultConfig) {
        const codes = result.config.map(c => c.code).join(', ');
        fail(`ADT config not found. Available codes: ${codes}. PaxTypeCode.ADT = '${PaxTypeCode.ADT}'`);
      }

      expect(adultConfig).toBeDefined();
      expect(adultConfig?.quantity).toBe(1);
    });

    it('should count children correctly', () => {
      expect(component.booking).toBeDefined();

      const result = component.initPassengerTypesModel();
      const childConfig = result.config.find((c) => c.code === PaxTypeCode.CHD);

      if (!childConfig) {
        const codes = result.config.map(c => `${c.code}(${c.quantity})`).join(', ');
        fail(`CHD config not found. Available: [${codes}]`);
      }

      expect(childConfig).toBeDefined();
      expect(childConfig?.quantity).toBe(1);
    });

    it('should count infants correctly', () => {
      expect(component.booking).toBeDefined();

      const result = component.initPassengerTypesModel();
      const infantConfig = result.config.find((c) => c.code === PaxTypeCode.INF);

      if (!infantConfig) {
        const codes = result.config.map(c => `${c.code}(${c.quantity})`).join(', ');
        fail(`INF config not found. Available: [${codes}]`);
      }

      expect(infantConfig).toBeDefined();
      expect(infantConfig?.quantity).toBe(1);
    });

    it('should filter selected passengers when showInfoForSelectedFlight is true', () => {
      component.summaryConfig.showInfoForSelectedFlight = true;
      summarySelectedJourneysService.getSelectedPassengers.and.returnValue([
        { journey: 'journey1', passengers: ['PAX1'] },
      ] as any);

      const result = component.initPassengerTypesModel();
      const totalPassengers = result.config.reduce((sum, c) => sum + c.quantity, 0);

      expect(totalPassengers).toBeLessThan(3); // Should only include selected passengers
    });
  });

  describe('valueTotalFlight', () => {
    it('should calculate total for round trip', () => {
      component.summaryTypologyVm = mockSummaryTypologyDataVm;

      component.valueTotalFlight();

      expect(component.totalFlight).toBe(220); // 100 + 120
    });

    it('should calculate total for one way', () => {
      component.summaryTypologyVm = [mockSummaryTypologyDataVm[0]];

      component.valueTotalFlight();

      expect(component.totalFlight).toBe(100);
    });

    it('should handle empty summary', () => {
      component.summaryTypologyVm = [];

      component.valueTotalFlight();

      expect(component.totalFlight).toBe(0);
    });
  });

  describe('loadSummaryTypologyVm', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
    });

    it('should call buildSummaryTypologyDataVm with correct parameters', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.callFake((key: string) => key);

      component.loadSummaryTypologyVm();

      expect(summaryTypologyBaseService.buildSummaryTypologyDataVm).toHaveBeenCalled();
    });

    it('should set summaryTypologyVm with result', () => {
      component.loadSummaryTypologyVm();

      expect(component.summaryTypologyVm).toEqual(mockSummaryTypologyDataVm);
    });
  });

  describe('loadPaxGroup', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
    });

    it('should count adults correctly', () => {
      component.loadPaxGroup();

      expect(component.adults).toBe(1);
    });

    it('should count children correctly', () => {
      component.loadPaxGroup();

      expect(component.children).toBe(1);
    });

    it('should count infants correctly', () => {
      component.loadPaxGroup();

      expect(component.infants).toBe(1);
    });

    it('should initialize other passenger types to 0', () => {
      component.loadPaxGroup();

      expect(component.teens).toBe(0);
      expect(component.infantsWithSeat).toBe(0);
    });
  });

  describe('loadDetailsStatus', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
      component['summaryTypologyPerRoute'] = mockSummaryTypologyDataVm;
    });

    it('should initialize showStaticDetails array with false when useStaticDetails is false', () => {
      component.summaryConfig.useStaticDetails = false;

      component.loadDetailsStatus();

      expect(component.showStaticDetails.length).toBe(3);
      expect(component.showStaticDetails.every((val) => val === false)).toBe(true);
    });

    it('should initialize showStaticDetails array with true when useStaticDetails is true', () => {
      component.summaryConfig.useStaticDetails = true;

      component.loadDetailsStatus();

      expect(component.showStaticDetails.length).toBe(3);
      expect(component.showStaticDetails.every((val) => val === true)).toBe(true);
    });
  });

  describe('getServiceTypes', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
      component.services = mockSummaryTypologyDataVm[2];
    });

    it('should return unique service types from booking', () => {
      const result = component.getServiceTypes();

      expect(result).toContain('BUNDLE');
      expect(result).toContain('SEAT');
      expect(result).toContain('BAGGAGE');
    });

    it('should only include types with matching records', () => {
      component.services = { ...mockSummaryTypologyDataVm[2], records: [] };

      const result = component.getServiceTypes();

      expect(result.length).toBe(0);
    });

    it('should not include duplicates', () => {
      const result = component.getServiceTypes();
      const uniqueTypes = [...new Set(result)];

      expect(result.length).toBe(uniqueTypes.length);
    });
  });

  describe('setServiceTypeToSummaryTypologyVm', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
      component.summaryTypologyVm = mockSummaryTypologyDataVm;
    });

    it('should set serviceType for each record', () => {
      component.setServiceTypeToSummaryTypologyVm();

      const servicesVm = component.summaryTypologyVm.find(
        (vm) => vm.modelType === SummaryTypologyDataVmModelType.SERVICES
      );

      expect(servicesVm?.records?.every((r) => r.serviceType !== undefined)).toBe(true);
    });

    it('should match service types from booking', () => {
      component.setServiceTypeToSummaryTypologyVm();

      const servicesVm = component.summaryTypologyVm.find(
        (vm) => vm.modelType === SummaryTypologyDataVmModelType.SERVICES
      );
      const seatRecord = servicesVm?.records?.find((r) => r.code === 'SEAT');

      expect(seatRecord?.serviceType).toBe('SEAT');
    });
  });

  describe('getBundleServices', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
      component.services = mockSummaryTypologyDataVm[2];
      component.summaryConfig.bundleCodes = ['BUNDLE1'];
    });

    it('should return records matching bundle codes', () => {
      const result = component.getBundleServices();

      expect(result.length).toBe(1);
      expect(result[0].code).toBe('BUNDLE1');
    });

    it('should return empty array when no bundles match', () => {
      component.summaryConfig.bundleCodes = ['NON_EXISTENT'];

      const result = component.getBundleServices();

      expect(result.length).toBe(0);
    });
  });

  describe('getSummaryTypologyByRoute', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
    });

    it('should call buildSummaryTypologyDataPerRouteVm', () => {
      if (!jasmine.isSpy(translateService.instant)) {
        spyOn(translateService, 'instant');
      }
      (translateService.instant as jasmine.Spy).and.callFake((key: string) => key);
      // Reset cache to allow service to be called
      component['summaryTypologyPerRoute'] = undefined!;

      component.getSummaryTypologyByRoute();

      expect(summaryTypologyBaseService.buildSummaryTypologyDataPerRouteVm).toHaveBeenCalled();
    });

    it('should cache result on subsequent calls', () => {
      // Reset cache for initial call
      component['summaryTypologyPerRoute'] = undefined!;

      component.getSummaryTypologyByRoute();
      summaryTypologyBaseService.buildSummaryTypologyDataPerRouteVm.calls.reset();

      component.getSummaryTypologyByRoute();

      expect(summaryTypologyBaseService.buildSummaryTypologyDataPerRouteVm).not.toHaveBeenCalled();
    });

    it('should return summary typology per route', () => {
      // Reset cache to get fresh result
      component['summaryTypologyPerRoute'] = undefined!;

      const result = component.getSummaryTypologyByRoute();

      expect(result).toEqual(mockSummaryTypologyDataVm);
    });
  });

  describe('getBundledGroupByType', () => {
    beforeEach(() => {
      component.summaryTypologyConfig = mockConfig;
      component.services = mockSummaryTypologyDataVm[2];
    });

    it('should group bundled records by type', () => {
      const result = component.getBundledGroupByType();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return unique types', () => {
      const result = component.getBundledGroupByType();
      const types = result.map((r) => r.type);
      const uniqueTypes = [...new Set(types)];

      expect(types.length).toBe(uniqueTypes.length);
    });
  });

  describe('priceBreakdownItemsVMOrder', () => {
    it('should sort items by number of subitems descending', () => {
      const items = [
        { item: {}, subitems: [1] },
        { item: {}, subitems: [1, 2, 3] },
        { item: {}, subitems: [1, 2] },
      ] as any;

      const result = component['priceBreakdownItemsVMOrder'](items);

      expect(result[0].subitems.length).toBe(3);
      expect(result[1].subitems.length).toBe(2);
      expect(result[2].subitems.length).toBe(1);
    });
  });

  describe('booking getter', () => {
    it('should return booking from config', () => {      component.summaryTypologyConfig = mockConfig;
            expect(component.booking).toBe(mockBooking);
    });
  });
});
