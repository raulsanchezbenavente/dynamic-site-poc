import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { CarriersDisplayMode } from '@dcx/ui/business-common';
import { TitleCasePipe } from '@angular/common';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { UpcomingTripsComponent } from './upcoming-trips.component';
import { ManageBookingCardVM } from '../manage-booking-card/models/manage-booking-card-vm.model';
import { JourneyStatus } from '@dcx/ui/libs';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('UpcomingTripsComponent', () => {
  let component: UpcomingTripsComponent;
  let fixture: ComponentFixture<UpcomingTripsComponent>;
  let translate: TranslateService;
  let streamSpy: jasmine.Spy;

  const baseJourneyVM = {
    id: '1',
    bookingRef: 'ABC123',
    status: JourneyStatus.CONFIRMED,
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
      std: new Date('2025-10-15T10:00:00'),
      stdutc: new Date('2025-10-15T10:00:00'),
      sta: new Date('2025-10-15T14:00:00'),
      stautc: new Date('2025-10-15T14:00:00'),
      etd: new Date('2025-10-15T10:00:00'),
      etdutc: new Date('2025-10-15T10:00:00'),
      eta: new Date('2025-10-15T14:00:00'),
      etautc: new Date('2025-10-15T14:00:00'),
    },
    segments: [],
    duration: '04:00',
  } as any;

  const mockBookingData: ManageBookingCardVM[] = [
    {
      journeyVM: { ...baseJourneyVM },
      checkInDeepLinkUrl: 'https://example.com/checkin',
      isCheckInAvailable: true,
      mmbDeepLinkUrl: 'https://example.com/mmb',
      isMmbAvailable: true,
      pageNumber: 1,
      totalRecords: 1,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        UpcomingTripsComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TitleCasePipe,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);

    translate.setTranslation(
      'en',
      {
        FindBookings: { NoUpcomingTrips: 'No upcoming trips' },
        City: { BOG: 'Bogotá', MIA: 'Miami' },
        Common: { To: 'to', Rerouted_Label: 'Rerouted' },
        ManageBookingCard: {
          CheckInButtonLabel: 'Check-in',
          ManageButtonLabel: 'Manage',
        },
      },
      true
    );
    translate.use('en');

    spyOn(translate, 'get').and.callThrough();
    spyOn(translate, 'instant').and.callThrough();
    streamSpy = spyOn(translate, 'stream').and.callFake((key: string) => {
      if (key === 'FindBookings.NoUpcomingTrips') {
        return of('No upcoming trips');
      }
      return of(key);
    });

    fixture = TestBed.createComponent(UpcomingTripsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', []);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept data input', () => {
      fixture.componentRef.setInput('data', mockBookingData);
      fixture.detectChanges();
      expect(component.data()).toEqual(mockBookingData);
    });
  });

  describe('hasData computed property', () => {
    it('should return false when data is empty', () => {
      fixture.componentRef.setInput('data', []);
      fixture.detectChanges();
      expect(component.hasData()).toBe(false);
    });

    it('should return true when data has items', () => {
      fixture.componentRef.setInput('data', mockBookingData);
      fixture.detectChanges();
      expect(component.hasData()).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should call internalInit when ngOnInit is called', () => {
      spyOn(component as any, 'internalInit');
      component.ngOnInit();
      expect((component as any).internalInit).toHaveBeenCalled();
    });

    it('should initialize manageBookingCardConfig and dataNotFoundConfig', () => {
      fixture.detectChanges();
      expect(component.manageBookingCardConfig).toBeDefined();
      expect(component.dataNotFoundConfig).toBeDefined();
    });
  });

  describe('manageBookingCardConfig', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set journey schedule config with correct carrier display mode', () => {
      expect(component.manageBookingCardConfig.journeyScheduleConfig).toEqual({
        scheduleConfig: {
          carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
          showTotalDuration: false,
          legsDetailsPopoverConfig: {
            placement: 'end',
            offset: [0, 16],
          },
        },
      });
    });

    it('should include legsDetailsPopoverConfig in schedule config', () => {
      expect(
        component.manageBookingCardConfig.journeyScheduleConfig.scheduleConfig.legsDetailsPopoverConfig
      ).toBeDefined();
    });

    it('should set placement to end in legsDetailsPopoverConfig', () => {
      expect(
        component.manageBookingCardConfig.journeyScheduleConfig.scheduleConfig.legsDetailsPopoverConfig?.placement
      ).toBe('end');
    });
  });

  describe('dataNotFoundConfig', () => {
    it('should initialize with empty text initially (before detectChanges)', () => {
      expect(component.dataNotFoundConfig).toBeUndefined();
    });

    it('should set up dataNotFoundConfig after ngOnInit', () => {
      fixture.detectChanges();
      expect(component.dataNotFoundConfig).toBeDefined();
      expect(component.dataNotFoundConfig.text).toBe('No upcoming trips');
    });

    it('should update text when translation stream emits different value', () => {
      const translatedText = 'No hay viajes próximos';
      streamSpy.and.returnValue(of(translatedText));
      component.ngOnInit();
      expect(component.dataNotFoundConfig.text).toBe(translatedText);
    });

    it('should call TranslateService.stream with correct key', () => {
      fixture.detectChanges();
      expect(streamSpy).toHaveBeenCalledWith('FindBookings.NoUpcomingTrips');
    });
  });

  describe('Component lifecycle', () => {
    it('should handle destroy properly', () => {
      fixture.detectChanges();
      expect(() => fixture.destroy()).not.toThrow();
    });
  });

  describe('Component host class', () => {
    it('should have upcoming-trips host class', () => {
      fixture.detectChanges();
      const hostElement = fixture.debugElement.nativeElement;
      expect(hostElement.classList.contains('upcoming-trips')).toBe(true);
    });
  });
});
