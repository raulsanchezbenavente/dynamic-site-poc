import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ElementRef, signal } from '@angular/core';
import { of, Subject } from 'rxjs';

import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';

import { CheckInSummaryComponent } from './check-in-summary.component';
import { TranslationLoadStatusDirective, ModuleTranslationService } from '@dcx/module/translation';
import {
  CheckinService,
  PaxCheckinService,
  PaxSegmentCheckinStatus,
} from '@dcx/ui/api-layer';
import {
  BOOKING_PROXY_SERVICE,
  ButtonVisibilityService,
  CarriersRepositoryService,
  CheckedInPassengersService,
  ButtonsNavigationService,
  NavigationGuardService,
  PageBackService,
  SEGMENTS_STATUS_PROXY_SERVICE,
  SegmentsStatusByJourney,
  SharedSessionService,
  TrackAnalyticsErrorService,
  AccountStateService,
} from '@dcx/ui/business-common';
import { BookingClient } from '@dcx/module/api-clients';
import {
  ComposerService,
  ConfigService,
  DataModule,
  EnumStorageKey,
  EventBusService,
  LoggerService,
  NotificationService,
  StorageService,
  ComposerEvent,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  CultureServiceEx,
} from '@dcx/ui/libs';
import {
  DEFAULT_CONFIG_POPOVER,
  POPOVER_CONFIG,
} from '@dcx/ui/design-system';
import { CHECK_IN_SUMMARY_BUILDER } from './tokens/injection-tokens';
import { TranslationKeys } from './enums/translations-keys.enum';
import { AnalyticsService } from '@dcx/module/analytics';

// ----------------------------
// Translation Mocks (Immutable)
// ----------------------------
const onLangChangeSubject = new Subject<any>();
const onTranslationChangeSubject = new Subject<any>();
const onDefaultLangChangeSubject = new Subject<any>();
const translateServiceMock: any = {
  instant: jasmine.createSpy('instant').and.callFake((key: string, params?: any) => {
    if (key === TranslationKeys.CheckIn_JourneyRegion_AriaLabel) {
      return `Check-in ${params.origin} to ${params.dest} – ${params.checkedPart}`;
    }
    return key;
  }),
  get: jasmine.createSpy('get').and.callFake((key: any) => of(key || 'key')),
  use: jasmine.createSpy('use').and.returnValue(of(void 0)),
  stream: jasmine.createSpy('stream').and.callFake((key: any) => of(key || 'key')),
  onLangChange: onLangChangeSubject,
  onTranslationChange: onTranslationChangeSubject,
  onDefaultLangChange: onDefaultLangChangeSubject,
  currentLang: 'es-CO',
  defaultLang: 'es-CO',
  setDefaultLang: jasmine.createSpy('setDefaultLang'),
  addLangs: jasmine.createSpy('addLangs'),
  getBrowserLang: jasmine.createSpy('getBrowserLang').and.returnValue('es'),
  getTranslation: jasmine.createSpy('getTranslation').and.returnValue(of({})),
  events: new Subject<any>(),
  parser: { interpolate: (expr: any, params?: any) => expr },
};
const moduleTranslationServiceMock = {
  loadModuleTranslations: jasmine.createSpy('loadModuleTranslations').and.returnValue(of(true)),
  loadedModules$: signal({}),
};
const sharedSessionServiceMock = {
  session$: of({}),
};

// ----------------------------
// Complex Mocks & Builders
// ----------------------------
function buildBooking() {
  return {
    pricing: {
      breakdown: {
        perPaxSegment: [],
      },
    },
    services: [],
    pax: [
      {
        id: 'P1',
        segmentsInfo: [
          { segmentId: 'S1', seat: '12A', status: PaxSegmentCheckinStatus.CHECKED_IN },
          { segmentId: 'S2', seat: '', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN },
        ],
      },
      {
        id: 'P2',
        segmentsInfo: [
          { segmentId: 'S1', seat: '', status: PaxSegmentCheckinStatus.NOT_CHECKED_IN },
          { segmentId: 'S2', seat: '14C', status: PaxSegmentCheckinStatus.CHECKED_IN },
        ],
      },
    ],
    journeys: [
      {
        id: 'J1',
        segments: [
          {
            id: 'S1',
            origin: { iata: 'BOG' },
            destination: { iata: 'MIA' },
            std: '2025-12-04T10:00:00Z',
            transport: { carrier: { code: 'AV' }, number: '123' },
          },
        ],
      },
      {
        id: 'J2',
        segments: [
          {
            id: 'S2',
            origin: { iata: 'MIA' },
            destination: { iata: 'BOG' },
            std: '2025-12-05T10:00:00Z',
            transport: { carrier: { code: 'AV' }, number: '124' },
          },
        ],
      },
    ],
  } as any;
}

function buildSegmentCheckIn() {
  return [
    { segmentId: 'S1', status: PaxSegmentCheckinStatus.CHECKED_IN },
    { segmentId: 'S2', status: PaxSegmentCheckinStatus.CHECKED_IN },
  ] as any;
}

const mockCheckInSummaryBuilder = {
  buildCheckInSummaryModel: jasmine.createSpy('buildCheckInSummaryModel').and.returnValue([
    {
      journeyId: 'J1',
      isCheckInAvailable: true,
      origin: { iata: 'BOG', city: 'Bogotá' },
      destination: { iata: 'MIA', city: 'Miami' },
      passengers: [
        { status: PaxSegmentCheckinStatus.CHECKED_IN },
        { status: PaxSegmentCheckinStatus.NOT_CHECKED_IN },
      ],
      segments: [
        {
          id: 'S1',
          std: '2025-12-04T10:00:00Z',
          sta: '2025-12-04T15:00:00Z',
          origin: { iata: 'BOG', city: 'Bogotá' },
          destination: { iata: 'MIA', city: 'Miami' },
          transport: { carrier: { code: 'AV', name: 'Avianca' }, number: '123' },
        }
      ]
    },
  ]),
  buildBooking: jasmine.createSpy('buildBooking').and.returnValue(buildBooking()),
};

describe('CheckInSummaryComponent', () => {
  let component: CheckInSummaryComponent;
  let composerService: ComposerService;
  let loggerService: LoggerService;
  let storageService: StorageService;
  let paxCheckinService: PaxCheckinService;
  let eventBusService: EventBusService;
  let notificationService: NotificationService;
  let pageBackService: PageBackService;
  let bookingProxyService: any;
  let segmentsStatusProxyService: any;
  let accountStateService: jasmine.SpyObj<AccountStateService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let cultureServiceEx: jasmine.SpyObj<CultureServiceEx>;
  let navigationGuardService: jasmine.SpyObj<NavigationGuardService>;
  let trackAnalyticsErrorService: jasmine.SpyObj<TrackAnalyticsErrorService>;
  let checkedInPassengersService: jasmine.SpyObj<CheckedInPassengersService>;
  let buttonVisibilityService: jasmine.SpyObj<ButtonVisibilityService>;
  let carriersRepositoryService: jasmine.SpyObj<CarriersRepositoryService>;

  const composerNotifierSubject = new Subject<ComposerEvent>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule, TranslationLoadStatusDirective, CheckInSummaryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BookingClient, useValue: {} },
        {
          provide: ElementRef,
          useValue: {
            nativeElement: {
              getBoundingClientRect: () => ({ top: 0, left: 0, width: 100 }),
              contains: () => true,
              localName: 'check-in-summary',
            },
          },
        },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ModuleTranslationService, useValue: moduleTranslationServiceMock as any },
        {
          provide: ConfigService,
          useValue: {
            getDataModuleId: () => ({ id: 'cmp', config: 'mod' }) as DataModule,
            getBusinessModuleConfig: () => of({}),
            getMainConfig: jasmine
              .createSpy('getMainConfig')
              .and.returnValue({ translations: { baseUrl: 'http://localhost' } }),
          },
        },
        { provide: SharedSessionService, useValue: sharedSessionServiceMock },
        { provide: CheckinService, useValue: {} },
        {
          provide: ButtonsNavigationService,
          useValue: { clearNavigationHistory: jasmine.createSpy('clearNavigationHistory') },
        },
        {
          provide: ButtonVisibilityService,
          useValue: jasmine.createSpyObj('ButtonVisibilityService', ['setPageActionButtonsVisible']),
        },
        {
          provide: CheckedInPassengersService,
          useValue: jasmine.createSpyObj('CheckedInPassengersService', [
            'getCheckInStatusByJourney',
            'areAllPassengersChecked',
          ]),
        },
        {
          provide: ComposerService,
          useValue: {
            updateComposerRegisterStatus: jasmine.createSpy('update'),
            notifier$: of(),
            notifyComposerEvent: jasmine.createSpy('notify'),
          },
        },
        { provide: LoggerService, useValue: { info: jasmine.createSpy('info'), error: jasmine.createSpy('error') } },
        {
          provide: StorageService,
          useValue: {
            setSessionStorage: jasmine.createSpy('setSessionStorage'),
            getSessionStorage: jasmine.createSpy('getSessionStorage').and.returnValue(null),
            removeSessionStorage: jasmine.createSpy('removeSessionStorage'),
          },
        },
        {
          provide: PaxCheckinService,
          useValue: {
            getCheckinStatus: jasmine
              .createSpy('getCheckinStatus')
              .and.returnValue(of({ result: { data: buildSegmentCheckIn() } })),
          },
        },
        { provide: PageBackService, useValue: { clearSavedUrl: jasmine.createSpy('clearSavedUrl') } },
        { provide: EventBusService, useValue: { notifyEvent: jasmine.createSpy('notifyEvent') } },
        {
          provide: NotificationService,
          useValue: {
            showNotification: jasmine.createSpy('showNotification'),
            showErrorModal: jasmine.createSpy('showErrorModal'),
          },
        },
        { provide: CHECK_IN_SUMMARY_BUILDER, useValue: mockCheckInSummaryBuilder },
        {
          provide: BOOKING_PROXY_SERVICE,
          useValue: {
            reloadBooking: jasmine.createSpy('reloadBooking').and.returnValue(of(void 0)),
            getBooking: jasmine.createSpy('getBooking').and.returnValue(of(buildBooking())),
          },
        },
        {
          provide: SEGMENTS_STATUS_PROXY_SERVICE,
          useValue: {
            getSegmentsStatus: jasmine
              .createSpy('getSegmentsStatus')
              .and.returnValue(of([{ journeyId: 'J1', segmentsStatus: [] }] as SegmentsStatusByJourney[])),
          },
        },
        {
          provide: AccountStateService,
          useValue: jasmine.createSpyObj('AccountStateService', ['getAccountData']),
        },
        {
          provide: AnalyticsService,
          useValue: jasmine.createSpyObj('AnalyticsService', ['trackEvent']),
        },
        {
          provide: CultureServiceEx,
          useValue: jasmine.createSpyObj('CultureServiceEx', ['getUserCulture', 'getCulture']),
        },
        {
          provide: CarriersRepositoryService,
          useValue: jasmine.createSpyObj('CarriersRepositoryService', [
            'ensureCarriersAreLoaded',
            'getCarriers',
          ]),
        },
        {
          provide: NavigationGuardService,
          useValue: jasmine.createSpyObj('NavigationGuardService', [
            'setConfirmationPageAllowed',
            'isConfirmationPageAllowed',
            'denyAccessAndRedirect'
          ]),
        },
        {
          provide: TrackAnalyticsErrorService,
          useValue: jasmine.createSpyObj('TrackAnalyticsErrorService', ['trackAnalyticsError']),
        },
        TranslateStore,
      ],
    });

    TestBed.overrideComponent(CheckInSummaryComponent, {
      set: {
        providers: [
          { provide: POPOVER_CONFIG, useValue: DEFAULT_CONFIG_POPOVER },
          { provide: CHECK_IN_SUMMARY_BUILDER, useValue: mockCheckInSummaryBuilder },
        ],
      },
    });

    await TestBed.compileComponents();

    // Override getter for composer.notifier$
    composerService = TestBed.inject(ComposerService);
    Object.defineProperty(composerService, 'notifier$', {
      get: () => composerNotifierSubject.asObservable(),
      configurable: true,
    });

    loggerService = TestBed.inject(LoggerService);
    storageService = TestBed.inject(StorageService);
    paxCheckinService = TestBed.inject(PaxCheckinService);
    eventBusService = TestBed.inject(EventBusService);
    notificationService = TestBed.inject(NotificationService);
    pageBackService = TestBed.inject(PageBackService);
    bookingProxyService = TestBed.inject(BOOKING_PROXY_SERVICE);
    segmentsStatusProxyService = TestBed.inject(SEGMENTS_STATUS_PROXY_SERVICE);
    accountStateService = TestBed.inject(AccountStateService) as jasmine.SpyObj<AccountStateService>;
    analyticsService = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
    cultureServiceEx = TestBed.inject(CultureServiceEx) as jasmine.SpyObj<CultureServiceEx>;
    navigationGuardService = TestBed.inject(NavigationGuardService) as jasmine.SpyObj<NavigationGuardService>;
    trackAnalyticsErrorService = TestBed.inject(
      TrackAnalyticsErrorService
    ) as jasmine.SpyObj<TrackAnalyticsErrorService>;
    checkedInPassengersService = TestBed.inject(
      CheckedInPassengersService
    ) as jasmine.SpyObj<CheckedInPassengersService>;
    buttonVisibilityService = TestBed.inject(
      ButtonVisibilityService
    ) as jasmine.SpyObj<ButtonVisibilityService>;
    carriersRepositoryService = TestBed.inject(
      CarriersRepositoryService
    ) as jasmine.SpyObj<CarriersRepositoryService>;

    // Configure default return values for new mocks
    accountStateService.getAccountData.and.returnValue(null);
    cultureServiceEx.getUserCulture.and.returnValue({ locale: 'es-CO' } as any);
    cultureServiceEx.getCulture.and.returnValue('es-CO');
    carriersRepositoryService.ensureCarriersAreLoaded.and.returnValue(of(void 0));
    carriersRepositoryService.getCarriers.and.returnValue(of([]));
    navigationGuardService.isConfirmationPageAllowed.and.returnValue(false);
    checkedInPassengersService.getCheckInStatusByJourney.and.returnValue({ J1: ['P1'] });
    checkedInPassengersService.areAllPassengersChecked.and.returnValue(false);
    (storageService.getSessionStorage as jasmine.Spy) = jasmine.createSpy('getSessionStorage').and.returnValue({
      bookingInfo: { recordLocator: 'ABC123' },
    });

    component = TestBed.createComponent(CheckInSummaryComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear saved url on init', () => {
    component.ngOnInit();
    expect(pageBackService.clearSavedUrl).toHaveBeenCalled();
  });

  it('should load data on translationsLoaded', () => {
    component.translationsLoaded();

    expect(bookingProxyService.reloadBooking).toHaveBeenCalled();
    expect(bookingProxyService.getBooking).toHaveBeenCalled();
    expect(segmentsStatusProxyService.getSegmentsStatus).toHaveBeenCalled();
    expect(paxCheckinService.getCheckinStatus).toHaveBeenCalled();
    expect(storageService.setSessionStorage).toHaveBeenCalledWith(
      EnumStorageKey.PaxSegmentCheckInStatus,
      jasmine.any(Array)
    );
    expect(storageService.setSessionStorage).toHaveBeenCalledWith(
      EnumStorageKey.SegmentsStatusByJourney,
      jasmine.any(Array)
    );
    expect(component.isLoaded()).toBeTrue();
    expect(mockCheckInSummaryBuilder.buildCheckInSummaryModel).toHaveBeenCalled();
  });

  it('should set summary item config', () => {
    component['setCheckInSummaryItemConfig']();
    expect(component.summaryItemConfig().showRemainingTime).toBeTrue();
  });

  it('should build seat assigned context correctly', () => {
    // Setup booking with segments and pax with seats
    const booking = buildBooking();
    (component as any).booking = booking;

    const context = component['buildSeatAssignedContext']();

    expect(context['S1']).toBeDefined();
    expect(context['S1']['P1'].seat).toBe('12A');
    expect(context['S2']['P2'].seat).toBe('14C');
  });

  describe('shouldHideContinueButton', () => {
    it('should return true if all pax checked in or OCA service returns true', () => {
      const booking = buildBooking();
      (component as any).booking = booking;
      checkedInPassengersService.areAllPassengersChecked.and.returnValue(true);

      expect(component['shouldHideContinueButton']()).toBeTrue();
    });

    it('should return true if no journeys', () => {
      const booking = buildBooking();
      // Reset pax status
      booking.pax[0].segmentsInfo[1].status = PaxSegmentCheckinStatus.NOT_CHECKED_IN;
      (component as any).booking = booking;
      component.summaryVM.update((s) => ({ ...s, journeys: [] }));

      expect(component['shouldHideContinueButton']()).toBeTrue();
    });

    it('should return true if all journeys unavailable or completed', () => {
      const booking = buildBooking();
      booking.pax[0].segmentsInfo[1].status = PaxSegmentCheckinStatus.NOT_CHECKED_IN;
      (component as any).booking = booking;

      component.summaryVM.update((s) => ({
        ...s,
        journeys: [
          { isCheckInAvailable: false, passengers: [] } as any,
          { isCheckInAvailable: true, passengers: [{ status: PaxSegmentCheckinStatus.CHECKED_IN }] } as any,
        ],
      }));

      expect(component['shouldHideContinueButton']()).toBeTrue();
    });

    it('should return false if there is an available journey with unchecked pax', () => {
      const booking = buildBooking();
      booking.pax[0].segmentsInfo[1].status = PaxSegmentCheckinStatus.NOT_CHECKED_IN;
      (component as any).booking = booking;

      component.summaryVM.update((s) => ({
        ...s,
        journeys: [
          {
            isCheckInAvailable: true,
            passengers: [{ status: PaxSegmentCheckinStatus.NOT_CHECKED_IN }],
          } as any,
        ],
      }));

      expect(component['shouldHideContinueButton']()).toBeFalse();
    });
  });

  describe('button visibility updates', () => {
    it('should set page action buttons visible when continue button is not hidden', () => {
      (component as any).booking = buildBooking();
      checkedInPassengersService.areAllPassengersChecked.and.returnValue(false);
      component.summaryVM.set({
        journeys: [
          {
            isCheckInAvailable: true,
            passengers: [{ status: PaxSegmentCheckinStatus.NOT_CHECKED_IN }],
          } as any,
        ],
      });

      (component as any).updateButtonVisibility({ session: { booking: buildBooking() } } as any);

      expect(buttonVisibilityService.setPageActionButtonsVisible).toHaveBeenCalledWith(true);
    });

    it('should set page action buttons hidden when continue button is hidden', () => {
      (component as any).booking = buildBooking();
      checkedInPassengersService.areAllPassengersChecked.and.returnValue(true);

      (component as any).updateButtonVisibility({ session: { booking: buildBooking() } } as any);

      expect(buttonVisibilityService.setPageActionButtonsVisible).toHaveBeenCalledWith(false);
    });
  });

  describe('Composer Integration', () => {
    it('should show notification on submit error', () => {
      component['subscribeComposerNotifier']();
      spyOn<any>(component, 'trackAnalyticsError');

      const event: ComposerEvent = {
        type: ComposerEventTypeEnum.SubmitRequested,
        componentId: 'cmp',
        status: ComposerEventStatusEnum.ERROR,
      };

      composerNotifierSubject.next(event);

      expect(notificationService.showNotification).toHaveBeenCalled();
      expect(component['trackAnalyticsError']).toHaveBeenCalled();
    });

    it('should not show notification if has selected passengers', () => {
      component['subscribeComposerNotifier']();
      (component as any).hasSelectedPassengers = true;

      const event: ComposerEvent = {
        type: ComposerEventTypeEnum.SubmitRequested,
        componentId: 'cmp',
        status: ComposerEventStatusEnum.ERROR,
      };

      composerNotifierSubject.next(event);

      expect(notificationService.showNotification).not.toHaveBeenCalled();
    });
  });

  describe('ARIA Labels', () => {
    it('should build correct aria label for available journey', () => {
      const journeyVm = {
        isCheckInAvailable: true,
        origin: { iata: 'BOG' },
        destination: { iata: 'MIA' },
        passengers: [
          { status: PaxSegmentCheckinStatus.CHECKED_IN },
          { status: PaxSegmentCheckinStatus.NOT_CHECKED_IN },
        ],
      } as any;

      const label = component.buildJourneyAriaLabel(journeyVm);
      expect(label).toContain('Check-in BOG to MIA');
      expect(label).toContain('Checked_Some');
    });

    it('should build correct aria label for unavailable journey', () => {
      const journeyVm = {
        isCheckInAvailable: false,
        origin: { iata: 'BOG' },
        destination: { iata: 'MIA' },
        passengers: [],
      } as any;

      const label = component.buildJourneyAriaLabel(journeyVm);
      expect(label).toContain(TranslationKeys.CheckIn_CheckInNotAvailable);
    });
  });

  describe('storeOcaEnabledInSession', () => {
    it('should store isOcaEnabled value in session storage', () => {
      component.config.set({ culture: 'es-CO', isOcaEnabled: true });
      component['storeOcaEnabledInSession']();
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.IsOcaEnabled, true);
    });

    it('should store isOcaEnabled value in session storage when config is null', () => {
      component.config.set(null);
      component['storeOcaEnabledInSession']();
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.IsOcaEnabled, false);
    });

    it('should be called during translationsLoaded flow', () => {
      spyOn<any>(component, 'storeOcaEnabledInSession').and.callThrough();
      component.translationsLoaded();
      expect(component['storeOcaEnabledInSession']).toHaveBeenCalled();
    });
  });

  describe('storeOcaEnabledInSession', () => {
    it('should store isOcaEnabled value in session storage', () => {
      component.config.set({ culture: 'es-CO', isOcaEnabled: true });
      component['storeOcaEnabledInSession']();
      expect(storageService.setSessionStorage).toHaveBeenCalledWith(EnumStorageKey.IsOcaEnabled, true);
    });

    it('should be called during translationsLoaded flow', () => {
      spyOn<any>(component, 'storeOcaEnabledInSession').and.callThrough();
      component.translationsLoaded();
      expect(component['storeOcaEnabledInSession']).toHaveBeenCalled();
    });
  });

  describe('trackAnalyticsError', () => {
    beforeEach(() => {
      // Reset spies
      trackAnalyticsErrorService.trackAnalyticsError.calls.reset();
    });

    it('should call trackAnalyticsErrorService with error message', fakeAsync(() => {
      // Arrange
      const mockError = 'Service confirmation failed';

      // Act
      component['trackAnalyticsError'](mockError);
      tick();

      // Assert
      expect(trackAnalyticsErrorService.trackAnalyticsError).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'Service confirmation failed',
        })
      );
    }));

    it('should handle error with undefined message', fakeAsync(() => {
      // Arrange
      const mockError = undefined;

      // Act
      component['trackAnalyticsError'](mockError);
      tick();

      // Assert
      expect(trackAnalyticsErrorService.trackAnalyticsError).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: undefined,
        })
      );
    }));

    it('should handle null or undefined error object', fakeAsync(() => {
      // Arrange
      const mockError = null;

      // Act
      component['trackAnalyticsError'](mockError);
      tick();

      // Assert
      expect(trackAnalyticsErrorService.trackAnalyticsError).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: null,
        })
      );
    }));
  });
});
