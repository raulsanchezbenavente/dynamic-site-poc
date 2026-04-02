import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { BoardingPassOffCanvasComponent } from './boarding-pass-off-canvas.component';
import { BoardingPassOffCanvasData } from './models/boarding-pass-off-canvas-data.model';
import { BoardingPassVM } from '../boarding-pass-preview';
import { BookingClient } from '@dcx/module/api-clients';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CookieService } from 'ngx-cookie';
import { EXCLUDE_SESSION_EXPIRED_URLS, TIMEOUT_REDIRECT } from '@dcx/ui/libs';
import { SessionService, TrackAnalyticsErrorService } from '@dcx/ui/business-common';
import { AnalyticsService } from '@dcx/module/analytics';

/**
 * Fake loader: avoids external HTTP for translations.
 */
class FakeLoader implements TranslateLoader {
  getTranslation(_lang: string) {
    return of({});
  }
}

describe('BoardingPassOffCanvasComponent', () => {
  let component: BoardingPassOffCanvasComponent;
  let fixture: ComponentFixture<BoardingPassOffCanvasComponent>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockAnalyticsService: jasmine.SpyObj<AnalyticsService>;
  let mockTrackAnalyticsErrorService: jasmine.SpyObj<TrackAnalyticsErrorService>;

  const mockBoardingPassData: BoardingPassOffCanvasData = {
    boardingPassVM: {
      passengerName: 'John Doe',
      paxId: 'PAX123',
      segments: [
        {
          id: 'seg1',
          journeyId: 'journey1',
          origin: 'Bogotá',
          destination: 'Miami',
          originCode: 'BOG',
          destinationCode: 'MIA',
          departureTime: '10:30',
          departureDate: {
            date: new Date('2025-12-15'),
            format: 'dd/MM/yyyy',
          },
          gate: 'A12',
          seat: '12A',
          flightNumber: 'AV123',
        },
      ],
    } as BoardingPassVM,
  };

  beforeEach(async () => {
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockTranslateService.instant.and.returnValue('Boarding Pass');
    mockSessionService = jasmine.createSpyObj('SessionService', ['getBookingFromStorage']);
    mockAnalyticsService = jasmine.createSpyObj('AnalyticsService', ['trackEvent', 'trackPageView']);
    mockTrackAnalyticsErrorService = jasmine.createSpyObj('TrackAnalyticsErrorService', ['trackAnalyticsError']);

    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, BoardingPassOffCanvasComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        }),
      ],
      providers: [
        { provide: TranslateService, useValue: mockTranslateService },
        {
          provide: BookingClient,
          useValue: jasmine.createSpyObj('BookingClient', ['generate'])
        },
        {
          provide: CookieService,
          useValue: jasmine.createSpyObj('CookieService', ['get', 'put', 'remove'])
        },
        { provide: SessionService, useValue: mockSessionService },
        { provide: EXCLUDE_SESSION_EXPIRED_URLS, useValue: [] },
        { provide: TIMEOUT_REDIRECT, useValue: '/timeout' },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: TrackAnalyticsErrorService, useValue: mockTrackAnalyticsErrorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardingPassOffCanvasComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockBoardingPassData);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call internalInit on initialization', () => {
      spyOn<any>(component, 'internalInit');

      component.ngOnInit();

      expect(component['internalInit']).toHaveBeenCalled();
    });

    it('should initialize offCanvasConfig during ngOnInit', () => {
      component.ngOnInit();

      expect(component.offCanvasConfig).toBeDefined();
      expect(component.offCanvasConfig.offCanvasHeaderConfig).toBeDefined();
      expect(component.offCanvasConfig.panelClass).toBe('boarding-pass-off-canvas');
    });

    it('should set offCanvasConfig with translated title', () => {
      mockTranslateService.instant.and.returnValue('Pase de Abordar');

      component.ngOnInit();

      expect(mockTranslateService.instant).toHaveBeenCalledWith('BoardingPass.Title');
      expect(component.offCanvasConfig.offCanvasHeaderConfig?.title).toBe('Pase de Abordar');
    });
  });

  describe('setOffCanvasConfig', () => {
    beforeEach(() => {
      mockTranslateService.instant.calls.reset();
    });

    it('should configure offCanvasConfig with correct panel class', () => {
      component['setOffCanvasConfig']();

      expect(component.offCanvasConfig).toBeDefined();
      expect(component.offCanvasConfig.panelClass).toBe('boarding-pass-off-canvas');
    });

    it('should configure offCanvasConfig with header title from translation', () => {
      mockTranslateService.instant.and.returnValue('Boarding Pass Title');

      component['setOffCanvasConfig']();

      expect(mockTranslateService.instant).toHaveBeenCalledWith('BoardingPass.Title');
      expect(component.offCanvasConfig.offCanvasHeaderConfig?.title).toBe('Boarding Pass Title');
    });

    it('should set offCanvasHeaderConfig with title property', () => {
      component['setOffCanvasConfig']();

      expect(component.offCanvasConfig.offCanvasHeaderConfig).toBeDefined();
      expect(component.offCanvasConfig.offCanvasHeaderConfig?.title).toBeDefined();
    });

    it('should call translate.instant with correct key', () => {
      component['setOffCanvasConfig']();

      expect(mockTranslateService.instant).toHaveBeenCalledTimes(1);
      expect(mockTranslateService.instant).toHaveBeenCalledWith('BoardingPass.Title');
    });
  });

  describe('onCloseOffCanvas', () => {
    it('should emit closeOffCanvas event when called', () => {
      spyOn(component.closeOffCanvas, 'emit');

      component.onCloseOffCanvas();

      expect(component.closeOffCanvas.emit).toHaveBeenCalledWith();
    });

    it('should emit closeOffCanvas event only once', () => {
      spyOn(component.closeOffCanvas, 'emit');

      component.onCloseOffCanvas();

      expect(component.closeOffCanvas.emit).toHaveBeenCalledTimes(1);
    });
  });
});
