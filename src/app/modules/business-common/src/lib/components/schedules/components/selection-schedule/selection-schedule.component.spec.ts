import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SelectionScheduleComponent } from './selection-schedule.component';
import { JourneyVM } from '@dcx/ui/libs';
import { ScheduleService } from '../../services/schedules.service';
import { LegsDetails } from '../atoms/legs-details/models/legs-details.config';

class FakeLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

describe('SelectionScheduleComponent', () => {
  let component: SelectionScheduleComponent;
  let fixture: ComponentFixture<SelectionScheduleComponent>;
  let scheduleService: jasmine.SpyObj<ScheduleService>;

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
            std: '2026-01-15T10:00:00',
            sta: '2026-01-15T15:00:00',
          } as any,
        ],
        transport: {
          operatingCarrier: 'AV',
          marketingCarrier: 'AV',
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
          std: '2026-01-15T10:00:00',
          sta: '2026-01-15T15:00:00',
        } as any,
      ],
      stopsNumber: 0,
      duration: '5h 0m',
    },
  };

  beforeEach(async () => {
    scheduleService = jasmine.createSpyObj('ScheduleService', ['getTotalDays', 'buildLegsDetails']);

    scheduleService.getTotalDays.and.returnValue(0);
    scheduleService.buildLegsDetails.and.returnValue(mockLegsDetails);

    await TestBed.configureTestingModule({
      imports: [
        SelectionScheduleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [{ provide: ScheduleService, useValue: scheduleService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectionScheduleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should call scheduleService methods and update properties when data is provided', () => {
      scheduleService.getTotalDays.and.returnValue(2);
      scheduleService.buildLegsDetails.and.returnValue(mockLegsDetails);
      component.data = mockJourneyVM;

      component.ngOnChanges();

      expect(scheduleService.getTotalDays).toHaveBeenCalledWith(mockJourneyVM);
      expect(scheduleService.buildLegsDetails).toHaveBeenCalledWith(mockJourneyVM);
      expect(component.totalDaysOfJourney).toBe(2);
      expect(component.legsDetails).toEqual(mockLegsDetails);
    });

    it('should not call scheduleService methods when data is null', () => {
      component.data = null as any;

      component.ngOnChanges();

      expect(scheduleService.getTotalDays).not.toHaveBeenCalled();
      expect(scheduleService.buildLegsDetails).not.toHaveBeenCalled();
    });

    it('should not call scheduleService methods when data is undefined', () => {
      component.data = undefined as any;

      component.ngOnChanges();

      expect(scheduleService.getTotalDays).not.toHaveBeenCalled();
      expect(scheduleService.buildLegsDetails).not.toHaveBeenCalled();
    });

    it('should update properties when data changes', () => {
      scheduleService.getTotalDays.and.returnValues(1, 3);
      component.data = mockJourneyVM;
      component.ngOnChanges();

      expect(component.totalDaysOfJourney).toBe(1);

      const updatedJourney = { ...mockJourneyVM, id: 'journey-456' };
      component.data = updatedJourney;
      component.ngOnChanges();

      expect(component.totalDaysOfJourney).toBe(3);
      expect(scheduleService.getTotalDays).toHaveBeenCalledTimes(2);
    });
  });

  describe('Component Properties', () => {
    it('should have translate service injected', () => {
      expect(component['translate']).toBeDefined();
    });

    it('should initialize totalDaysOfJourney to 0', () => {
      expect(component.totalDaysOfJourney).toBe(0);
    });
  });
});
