import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import { of } from 'rxjs';
import { JourneyScheduleComponent } from './journey-schedule.component';
import { CultureServiceEx, JourneyStatus, JourneyVM } from '@dcx/ui/libs';
import { JourneyScheduleConfig } from './models/journey-schedule.config';
import { CarriersDisplayMode } from '../schedules/components/schedule/enums/carriers-display-mode.enum';
import dayjs from 'dayjs';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('JourneyScheduleComponent', () => {
  let component: JourneyScheduleComponent;
  let fixture: ComponentFixture<JourneyScheduleComponent>;
  let mockCultureServiceEx: jasmine.SpyObj<CultureServiceEx>;

  const mockDate = new Date('2026-01-15T10:00:00Z');

  const mockJourneyData: JourneyVM = {
    id: 'JOURNEY1',
    origin: {
      code: 'SAL',
      name: 'San Salvador',
      city: 'San Salvador',
      country: 'El Salvador',
    },
    destination: {
      code: 'MIA',
      name: 'Miami',
      city: 'Miami',
      country: 'United States',
    },
    schedule: {
      std: mockDate,
      sta: new Date('2026-01-15T14:00:00Z'),
    },
    segments: [],
    duration: '4h 00m',
    journeyType: 'outbound',
    status: JourneyStatus.ON_TIME,
  } as JourneyVM;

  const mockReturnJourneyData: JourneyVM = {
    ...mockJourneyData,
    id: 'JOURNEY2',
    journeyType: 'return',
  } as JourneyVM;

  const mockConfig: JourneyScheduleConfig = {
    scheduleConfig: {
      carriersDisplayMode: CarriersDisplayMode.CARRIER_NUMBERS,
    },
  };

  const mockUserCulture = {
    language: 'en-US',
    longDateFormat: 'MMMM D, YYYY',
    shortDateFormat: 'M/D/YYYY',
  };

  beforeEach(async () => {
    mockCultureServiceEx = jasmine.createSpyObj('CultureServiceEx', ['getUserCulture']);
    mockCultureServiceEx.getUserCulture.and.returnValue(mockUserCulture);

    await TestBed.configureTestingModule({
      imports: [
        JourneyScheduleComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
      providers: [
        { provide: CultureServiceEx, useValue: mockCultureServiceEx },
        TitleCasePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JourneyScheduleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockJourneyData);
    fixture.componentRef.setInput('config', mockConfig);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize journeyDateConfig with correct date and format on ngOnInit', () => {
      component.ngOnInit();

      expect(component.journeyDateConfig).toBeDefined();
      expect(component.journeyDateConfig.format).toBe('dddd, MMMM D, YYYY');
      const expectedDate = dayjs(mockDate);
      const actualDate = component.journeyDateConfig.date as dayjs.Dayjs;
      expect(actualDate.isSame(expectedDate)).toBe(true);
    });

    it('should use culture longDateFormat for date formatting', () => {
      const customCulture = {
        language: 'es-ES',
        longDateFormat: 'D [de] MMMM [de] YYYY',
        shortDateFormat: 'D/M/YYYY',
      };
      mockCultureServiceEx.getUserCulture.and.returnValue(customCulture);

      component.ngOnInit();

      expect(component.journeyDateConfig.format).toBe('dddd, D [de] MMMM [de] YYYY');
    });

    it('should use ETD if available for journeyDateConfig', () => {
      const mockEtd = new Date('2026-01-16T10:00:00Z');
      const mockJourneyWithEtd: JourneyVM = {
        ...mockJourneyData,
        schedule: {
          ...mockJourneyData.schedule,
          etd: mockEtd,
        },
      } as JourneyVM;

      fixture.componentRef.setInput('data', mockJourneyWithEtd);
      component.ngOnInit();

      const expectedDate = dayjs(mockEtd);
      const actualDate = component.journeyDateConfig.date as dayjs.Dayjs;
      expect(actualDate.isSame(expectedDate)).toBe(true);
    });
  });

  describe('isReturnType computed signal', () => {
    it('should return false for outbound journey', () => {
      fixture.componentRef.setInput('data', mockJourneyData);
      fixture.detectChanges();
      const hostElement = fixture.nativeElement;

      expect(hostElement.classList.contains('journey-schedule--type-return')).toBe(false);
    });

    it('should return true for return journey', () => {
      fixture.componentRef.setInput('data', mockReturnJourneyData);
      fixture.detectChanges();
      const hostElement = fixture.nativeElement;

      expect(hostElement.classList.contains('journey-schedule--type-return')).toBe(true);
    });
  });

  describe('host class bindings', () => {
    it('should have base class "journey-schedule"', () => {
      fixture.detectChanges();
      const hostElement = fixture.nativeElement;

      expect(hostElement.classList.contains('journey-schedule')).toBe(true);
    });

    it('should add "journey-schedule--type-return" class for return journey', () => {
      fixture.componentRef.setInput('data', mockReturnJourneyData);
      fixture.detectChanges();
      const hostElement = fixture.nativeElement;

      expect(hostElement.classList.contains('journey-schedule--type-return')).toBe(true);
    });

    it('should not add "journey-schedule--type-return" class for outbound journey', () => {
      fixture.componentRef.setInput('data', mockJourneyData);
      fixture.detectChanges();
      const hostElement = fixture.nativeElement;

      expect(hostElement.classList.contains('journey-schedule--type-return')).toBe(false);
    });
  });
});
