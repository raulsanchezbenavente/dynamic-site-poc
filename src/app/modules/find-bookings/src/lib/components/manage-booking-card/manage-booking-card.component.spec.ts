import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';

import { ManageBookingCardComponent } from './manage-booking-card.component';
import {
  RedirectionService,
  JourneyStatus,
  IbeEventRedirectType,
  ButtonStyles,
} from '@dcx/ui/libs';
import { CarriersDisplayMode } from '@dcx/ui/business-common';
import { ManageBookingCardVM } from './models/manage-booking-card-vm.model';
import { ManageBookingCardConfig } from './models/manage-booking-card.config';

/**
 * Minimal fake loader so TranslateModule.forRoot() works without external files.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('ManageBookingCardComponent', () => {
  let component: ManageBookingCardComponent;
  let fixture: ComponentFixture<ManageBookingCardComponent>;
  let mockRedirectionService: jasmine.SpyObj<RedirectionService>;
  let translate: TranslateService;

  const mockConfig: ManageBookingCardConfig = {
    journeyScheduleConfig: {
      scheduleConfig: {
        carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
      },
    },
  };

  const mockData: ManageBookingCardVM = {
    journeyVM: {
      id: 'ABC123',
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
      status: JourneyStatus.CONFIRMED,
    },
    checkInDeepLinkUrl: 'https://checkin.example.com',
    isCheckInAvailable: true,
    isMmbAvailable: false,
    mmbDeepLinkUrl: 'https://mmb.example.com',
    pageNumber: 1,
    totalRecords: 1,
  };

  beforeEach(async () => {
    mockRedirectionService = jasmine.createSpyObj('RedirectionService', ['redirect']);

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
        ManageBookingCardComponent,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RedirectionService, useValue: mockRedirectionService },
        TitleCasePipe,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        ManageBookingCard: {
          CheckInButtonLabel: 'Button Label',
          ManageButtonLabel: 'Button Label',
        },
      },
      true
    );
    translate.use('en');

    spyOn(translate, 'instant').and.callThrough();
    spyOn(translate, 'get').and.callFake((key: string) => of(key));

    fixture = TestBed.createComponent(ManageBookingCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('data', mockData);
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the component and set button configurations', () => {
      fixture.detectChanges();
      expect(component.checkInButtonConfig).toBeDefined();
      expect(component.manageButtonConfig).toBeDefined();
      expect(translate.instant).toHaveBeenCalledWith('ManageBookingCard.CheckInButtonLabel');
      expect(translate.instant).toHaveBeenCalledWith('ManageBookingCard.ManageButtonLabel');
    });

    it('should set check-in button config with correct properties', () => {
      fixture.detectChanges();
      expect(component.checkInButtonConfig.label).toBe('Button Label');
      expect(component.checkInButtonConfig.link?.url).toBe('https://checkin.example.com');
      expect(component.checkInButtonConfig.layout?.style).toBe(ButtonStyles.PRIMARY);
    });

    it('should set manage button config with correct properties', () => {
      fixture.detectChanges();
      expect(component.manageButtonConfig.label).toBe('Button Label');
      expect(component.manageButtonConfig.link?.url).toBe('https://mmb.example.com');
      expect(component.manageButtonConfig.layout?.style).toBe(ButtonStyles.SECONDARY);
    });
  });

  describe('reactivity', () => {
    it('should recompute button configs when both URLs change', () => {
      fixture.detectChanges();
      const newData: ManageBookingCardVM = {
        ...mockData,
        checkInDeepLinkUrl: 'https://new-checkin.example.com',
        mmbDeepLinkUrl: 'https://new-mmb.example.com',
      };
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      expect(component.checkInButtonConfig.link?.url).toBe('https://new-checkin.example.com');
      expect(component.manageButtonConfig.link?.url).toBe('https://new-mmb.example.com');
    });

    it('should recompute when only one URL changes', () => {
      fixture.detectChanges();
      const newData: ManageBookingCardVM = {
        ...mockData,
        checkInDeepLinkUrl: 'https://another-checkin.example.com',
      };
      fixture.componentRef.setInput('data', newData);
      fixture.detectChanges();
      expect(component.checkInButtonConfig.link?.url).toBe('https://another-checkin.example.com');
      expect(component.manageButtonConfig.link?.url).toBe('https://mmb.example.com');
    });
  });

  describe('redirects', () => {
    it('should redirect MMB when URL present', () => {
      fixture.detectChanges();
      component.redirectMmb();
      expect(mockRedirectionService.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.externalRedirect,
        'https://mmb.example.com'
      );
    });

    it('should redirect Check-in when URL present', () => {
      fixture.detectChanges();
      component.redirectCheckin();
      expect(mockRedirectionService.redirect).toHaveBeenCalledWith(
        IbeEventRedirectType.externalRedirect,
        'https://checkin.example.com'
      );
    });

    it('should NOT redirect when check-in URL empty', () => {
      fixture.detectChanges();
      const emptyData: ManageBookingCardVM = { ...mockData, checkInDeepLinkUrl: '' };
      fixture.componentRef.setInput('data', emptyData);
      fixture.detectChanges();
      mockRedirectionService.redirect.calls.reset();
      component.redirectCheckin();
      expect(mockRedirectionService.redirect).not.toHaveBeenCalled();
    });

    it('should NOT redirect when MMB URL empty', () => {
      fixture.detectChanges();
      const emptyData: ManageBookingCardVM = { ...mockData, mmbDeepLinkUrl: '' };
      fixture.componentRef.setInput('data', emptyData);
      fixture.detectChanges();
      mockRedirectionService.redirect.calls.reset();
      component.redirectMmb();
      expect(mockRedirectionService.redirect).not.toHaveBeenCalled();
    });
  });

  describe('inputs', () => {
    it('should have config input defined', () => {
      fixture.detectChanges();
      expect(component.config()).toEqual(mockConfig);
    });

    it('should have data input defined', () => {
      fixture.detectChanges();
      expect(component.data()).toEqual(mockData);
    });

    it('should reflect empty URLs in button configs (reactive)', () => {
      fixture.detectChanges();
      const emptyData: ManageBookingCardVM = {
        ...mockData,
        checkInDeepLinkUrl: '',
        mmbDeepLinkUrl: '',
      };
      fixture.componentRef.setInput('data', emptyData);
      fixture.detectChanges();
      expect(component.checkInButtonConfig.link?.url).toBe('');
      expect(component.manageButtonConfig.link?.url).toBe('');
    });
  });

  describe('journeyStatus', () => {
    it('should have journeyStatus property defined', () => {
      fixture.detectChanges();
      expect(component.journeyStatus).toBeDefined();
      expect(component.journeyStatus).toBe(JourneyStatus);
    });
  });

  describe('edge cases / robustness', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should expose journeyStatus enum even when data.status undefined', () => {
      const undefinedStatusData: ManageBookingCardVM = {
        ...mockData,
        journeyVM: { ...mockData.journeyVM, status: undefined },
      };
      fixture.componentRef.setInput('data', undefinedStatusData);
      fixture.detectChanges();
      expect(component.journeyStatus.CONFIRMED).toBeDefined();
    });

    it('should build button configs with expected structure', () => {
      const checkConfig = component.checkInButtonConfig;
      const manageConfig = component.manageButtonConfig;
      expect(checkConfig.label).toBe('Button Label');
      expect(checkConfig.layout?.style).toBe(ButtonStyles.PRIMARY);
      expect(manageConfig.layout?.style).toBe(ButtonStyles.SECONDARY);
    });

    it('should not render action buttons when status is CANCELLED', () => {
      const cancelledData: ManageBookingCardVM = {
        ...mockData,
        journeyVM: { ...mockData.journeyVM, status: JourneyStatus.CANCELLED },
        isCheckInAvailable: true,
        isMmbAvailable: true,
      };
      fixture.componentRef.setInput('data', cancelledData);
      fixture.detectChanges();
      const actionContainer = fixture.nativeElement.querySelector('.manage-booking-card_action');
      expect(actionContainer).toBeNull();
    });
  });
});
