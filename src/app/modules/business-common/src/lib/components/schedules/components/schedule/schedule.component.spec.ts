import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ScheduleComponent } from './schedule.component';
import { JourneyVM, JourneyStatus } from '@dcx/ui/libs';
import { ScheduleService, ScheduleTimeComparison } from '../../services/schedules.service';
import { ScheduleConfig } from './models/schedule.config';
import { CarriersDisplayMode } from './enums/carriers-display-mode.enum';
import { LegsDetails } from '../atoms/legs-details/models/legs-details.config';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;
  let scheduleService: jasmine.SpyObj<ScheduleService>;

  const mockScheduleConfig: ScheduleConfig = {
    carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
  };

  const mockJourneyVM: JourneyVM = {
    id: 'journey-123',
    origin: {
      city: 'Miami',
      iata: 'MIA',
      airportName: 'Miami International Airport',
    },
    destination: {
      city: 'Bogota',
      iata: 'BOG',
      airportName: 'El Dorado International Airport',
    },
    schedule: {
      std: new Date('2026-01-15T10:00:00'),
      sta: new Date('2026-01-15T15:00:00'),
    },
    segments: [
      {
        id: 'seg-1',
        origin: {
          city: 'Miami',
          iata: 'MIA',
          airportName: 'Miami International Airport',
        },
        destination: {
          city: 'Bogota',
          iata: 'BOG',
          airportName: 'El Dorado International Airport',
        },
        schedule: {
          std: new Date('2026-01-15T10:00:00'),
          sta: new Date('2026-01-15T15:00:00'),
        },
        legs: [
          {
            flightNumber: 'AV123',
            origin: { stationCode: 'MIA' },
            destination: { stationCode: 'BOG' },
            std: new Date('2026-01-15T10:00:00'),
            sta: new Date('2026-01-15T15:00:00'),
          } as any,
        ],
        transport: {
          operatingCarrier: 'AV',
          marketingCarrier: 'AV',
          carrier: {
            code: 'AV',
            name: 'Avianca',
            operatingAirlineCode: 'AV',
          },
          number: '123',
        } as any,
      } as any,
    ],
    duration: '5h 0m',
  };

  const mockLegsDetails: LegsDetails = {
    model: {
      legs: [
        {
          flightNumber: 'AV123',
          origin: { stationCode: 'MIA' },
          destination: { stationCode: 'BOG' },
          std: new Date('2026-01-15T10:00:00'),
          sta: new Date('2026-01-15T15:00:00'),
        } as any,
      ],
      stopsNumber: 0,
      duration: '5h 0m',
    },
  };

  const mockDepartureTimes: ScheduleTimeComparison = {
    scheduled: '10:00',
    estimated: '10:00',
    actual: '00:00',
    hasChanged: false,
  };

  const mockArrivalTimes: ScheduleTimeComparison = {
    scheduled: '15:00',
    estimated: '15:00',
    actual: '00:00',
    hasChanged: false,
  };

  beforeEach(async () => {
    scheduleService = jasmine.createSpyObj('ScheduleService', [
      'getTotalDays',
      'buildLegsDetails',
      'getDepartureTimeComparison',
      'getArrivalTimeComparison',
    ]);

    scheduleService.getTotalDays.and.returnValue(0);
    scheduleService.buildLegsDetails.and.returnValue(mockLegsDetails);
    scheduleService.getDepartureTimeComparison.and.returnValue(mockDepartureTimes);
    scheduleService.getArrivalTimeComparison.and.returnValue(mockArrivalTimes);

    await TestBed.configureTestingModule({
      imports: [
        ScheduleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [{ provide: ScheduleService, useValue: scheduleService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    component.data = mockJourneyVM;
    component.config = mockScheduleConfig;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('carriersDisplayModeResolved', () => {
    it('should return OPERATED_BY as default when config is missing', () => {
      component.config = {} as any;
      expect(component.carriersDisplayModeResolved).toBe(CarriersDisplayMode.OPERATED_BY);
    });

    it('should return config carriersDisplayMode when specified', () => {
      component.config = { carriersDisplayMode: CarriersDisplayMode.CARRIER_NUMBERS };
      expect(component.carriersDisplayModeResolved).toBe(CarriersDisplayMode.CARRIER_NUMBERS);
    });
  });

  describe('ngOnChanges', () => {
    it('should not process when data is null or undefined', () => {
      component.data = null as any;
      component.ngOnChanges();

      expect(scheduleService.getTotalDays).not.toHaveBeenCalled();
    });

    it('should call all service methods with journey data', () => {
      component.ngOnChanges();

      expect(scheduleService.getTotalDays).toHaveBeenCalledWith(mockJourneyVM);
      expect(scheduleService.buildLegsDetails).toHaveBeenCalledWith(mockJourneyVM);
      expect(scheduleService.getDepartureTimeComparison).toHaveBeenCalledWith(mockJourneyVM);
      expect(scheduleService.getArrivalTimeComparison).toHaveBeenCalledWith(mockJourneyVM);
    });

    it('should set component properties from service results', () => {
      scheduleService.getTotalDays.and.returnValue(2);

      component.ngOnChanges();

      expect(component.totalDaysOfJourney).toBe(2);
      expect(component.legsDetails).toEqual(mockLegsDetails);
      expect(component.departureTimes).toEqual(mockDepartureTimes);
      expect(component.arrivalTimes).toEqual(mockArrivalTimes);
    });

    it('should build carrierNumbers from segments', () => {
      component.ngOnChanges();

      expect(component.carrierNumbers).toEqual([{ code: 'AV', number: '123' }]);
    });

    it('should build carrierNumbers for multiple segments', () => {
      component.data = {
        ...mockJourneyVM,
        segments: [
          mockJourneyVM.segments[0],
          {
            ...mockJourneyVM.segments[0],
            transport: {
              carrier: { code: 'CO', name: 'Copa Airlines', operatingAirlineCode: 'CO' },
              number: '456',
            } as any,
          },
        ],
      };

      component.ngOnChanges();

      expect(component.carrierNumbers).toEqual([
        { code: 'AV', number: '123' },
        { code: 'CO', number: '456' },
      ]);
    });

    it('should set operating carriers from segments removing duplicates', () => {
      component.data = {
        ...mockJourneyVM,
        segments: [
          mockJourneyVM.segments[0],
          mockJourneyVM.segments[0], // Duplicate - should be removed
          {
            ...mockJourneyVM.segments[0],
            transport: {
              carrier: { code: 'CO', name: 'Copa Airlines', operatingAirlineCode: 'CO' },
            } as any,
          },
        ],
      };

      component.ngOnChanges();

      // Now expects unique carriers only (duplicates removed via CarrierMapperService)
      expect(component.operatingCarriers).toEqual([
        { name: 'Avianca' }, // From enum Carriers.AV (duplicate removed)
        { name: 'Copa Airlines' }, // Fallback to carrier.name
      ]);
      expect(component.operatingCarriers.length).toBe(2); // Not 3
    });

    it('should handle empty segments array', () => {
      component.data = { ...mockJourneyVM, segments: [] };

      component.ngOnChanges();

      expect(component.carrierNumbers).toEqual([]);
      expect(component.operatingCarriers).toEqual([]);
    });

    it('should handle time changes from service', () => {
      const changedTimes: ScheduleTimeComparison = {
        scheduled: '10:00',
        estimated: '10:15',
        actual: '10:15',
        hasChanged: true,
      };
      scheduleService.getDepartureTimeComparison.and.returnValue(changedTimes);

      component.ngOnChanges();

      expect(component.departureTimes.hasChanged).toBe(true);
      expect(component.departureTimes.estimated).toBe('10:15');
    });
  });

  describe('setOperatingCarriers', () => {
    it('should use carrier name from segment data', () => {
      component.data = {
        ...mockJourneyVM,
        segments: [
          {
            ...mockJourneyVM.segments[0],
            transport: {
              carrier: { code: 'AV', name: 'Avianca', operatingAirlineCode: 'AV' },
            } as any,
          },
        ],
      };

      component.ngOnChanges();

      // Should use carrier name from segment data
      expect(component.operatingCarriers).toEqual([{ name: 'Avianca' }]);
    });

    it('should use carrier name for any carrier code', () => {
      component.data = {
        ...mockJourneyVM,
        segments: [
          {
            ...mockJourneyVM.segments[0],
            transport: {
              carrier: { code: 'LA', name: 'LATAM Airlines', operatingAirlineCode: 'LA' },
            } as any,
          },
        ],
      };

      component.ngOnChanges();

      // Should use carrier name from segment data
      expect(component.operatingCarriers).toEqual([{ name: 'LATAM Airlines' }]);
    });

    it('should fallback to carrier.name when operatingAirlineCode is undefined', () => {
      component.data = {
        ...mockJourneyVM,
        segments: [
          {
            ...mockJourneyVM.segments[0],
            transport: {
              carrier: { code: 'CO', name: 'Copa Airlines', operatingAirlineCode: undefined },
            } as any,
          },
        ],
      };

      component.ngOnChanges();

      expect(component.operatingCarriers).toEqual([{ name: 'Copa Airlines' }]);
    });

    it('should use carrier name from segment for VE code', () => {
      component.data = {
        ...mockJourneyVM,
        segments: [
          {
            ...mockJourneyVM.segments[0],
            transport: {
              carrier: { code: 'VE', name: 'Viva Air', operatingAirlineCode: 'VE' },
            } as any,
          },
        ],
      };

      component.ngOnChanges();

      // Should use carrier name from segment data
      expect(component.operatingCarriers).toEqual([{ name: 'Viva Air' }]);
    });
  });
});

