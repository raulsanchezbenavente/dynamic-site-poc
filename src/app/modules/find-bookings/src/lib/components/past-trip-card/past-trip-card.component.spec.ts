import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PastTripCardComponent } from './past-trip-card.component';
import { CultureServiceEx, TransportType } from '@dcx/ui/libs';
import { PastTripCardVM } from './models/past-trip-card-vm.model';

describe('PastTripCardComponent', () => {
  let component: PastTripCardComponent;
  let fixture: ComponentFixture<PastTripCardComponent>;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mockPastTripData: PastTripCardVM = {
    origin: {
      city: 'BOG',
      iata: 'BOG',
      country: 'CO',
      terminal: '1',
    },
    destination: {
      city: 'MIA',
      iata: 'MIA',
      country: 'US',
      terminal: '2',
    },
    schedule: {
      std: new Date('2025-10-01T10:00:00'),
      stdutc: new Date('2025-10-01T10:00:00'),
      sta: new Date('2025-10-01T14:00:00'),
      stautc: new Date('2025-10-01T14:00:00'),
      etd: new Date('2025-10-01T10:00:00'),
      etdutc: new Date('2025-10-01T10:00:00'),
      eta: new Date('2025-10-01T14:00:00'),
      etautc: new Date('2025-10-01T14:00:00'),
    },
    segments: [
      {
        id: 'seg1',
        referenceId: 'ST1',
        origin: {
          city: 'BOG',
          iata: 'BOG',
          country: 'CO',
          terminal: '1',
        },
        destination: {
          city: 'MIA',
          iata: 'MIA',
          country: 'US',
          terminal: '2',
        },
        schedule: {
          std: new Date('2025-10-01T10:00:00'),
          stdutc: new Date('2025-10-01T10:00:00'),
          sta: new Date('2025-10-01T14:00:00'),
          stautc: new Date('2025-10-01T14:00:00'),
          etd: new Date('2025-10-01T10:00:00'),
          etdutc: new Date('2025-10-01T10:00:00'),
          eta: new Date('2025-10-01T14:00:00'),
          etautc: new Date('2025-10-01T14:00:00'),
        },
        legs: [],
        duration: '04:00',
        transport: {
          type: TransportType.PLANE,
          carrier: {
            code: 'AV',
            name: 'Avianca',
          },
          number: '123',
          model: 'Boeing 737',
        },
      },
      {
        id: 'seg2',
        referenceId: 'ST2',
        origin: {
          city: 'MIA',
          iata: 'MIA',
          country: 'US',
          terminal: '2',
        },
        destination: {
          city: 'NYC',
          iata: 'JFK',
          country: 'US',
          terminal: '1',
        },
        schedule: {
          std: new Date('2025-10-01T16:00:00'),
          stdutc: new Date('2025-10-01T16:00:00'),
          sta: new Date('2025-10-01T20:00:00'),
          stautc: new Date('2025-10-01T20:00:00'),
          etd: new Date('2025-10-01T16:00:00'),
          etdutc: new Date('2025-10-01T16:00:00'),
          eta: new Date('2025-10-01T20:00:00'),
          etautc: new Date('2025-10-01T20:00:00'),
        },
        legs: [],
        duration: '04:00',
        transport: {
          type: TransportType.PLANE,
          carrier: {
            code: 'DL',
            name: 'Delta Airlines',
          },
          number: '456',
          model: 'Airbus A320',
        },
      },
    ],
  };

  beforeEach(async () => {
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getUserCulture']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);

    mockCultureServiceEx.getUserCulture.and.returnValue({
      longDateFormat: 'DD/MM/YYYY',
      shortDateFormat: 'DD/MM/YY',
    } as any);

    await TestBed.configureTestingModule({
      imports: [PastTripCardComponent],
      declarations: [],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PastTripCardComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('data', mockPastTripData);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize correctly on ngOnInit', () => {
    component.ngOnInit();

    expect(component.journeyDateConfig.date.toISOString()).toBe(mockPastTripData.schedule.std.toISOString());
    expect(component.journeyDateConfig.format).toBe('dddd, DD/MM/YYYY');

    expect(component.operatingCarriers).toEqual([
      { name: 'Avianca' },
      { name: 'Delta Airlines' },
    ]);

    expect(mockCultureServiceEx.getUserCulture).toHaveBeenCalled();
  });

  it('should handle duplicate carrier names', () => {
    const dataWithDuplicates: PastTripCardVM = {
      ...mockPastTripData,
      segments: [
        mockPastTripData.segments[0],
        {
          ...mockPastTripData.segments[0],
          id: 'seg3',
          transport: {
            ...mockPastTripData.segments[0].transport,
            number: '789',
          },
        },
      ],
    };

    fixture.componentRef.setInput('data', dataWithDuplicates);
    component.ngOnInit();

    expect(component.operatingCarriers).toEqual([{ name: 'Avianca' }]);
  });

  it('should handle empty segments array', () => {
    const dataWithEmptySegments: PastTripCardVM = {
      ...mockPastTripData,
      segments: [],
    };

    fixture.componentRef.setInput('data', dataWithEmptySegments);
    component.ngOnInit();

    expect(component.operatingCarriers).toEqual([]);
  });

  it('should handle different date formats from culture service', () => {
    mockCultureServiceEx.getUserCulture.and.returnValue({
      longDateFormat: 'MM/DD/YYYY',
      shortDateFormat: 'MM/DD/YY',
    } as any);

    component.ngOnInit();

    expect(component.journeyDateConfig.format).toBe('dddd, MM/DD/YYYY');
  });
});
