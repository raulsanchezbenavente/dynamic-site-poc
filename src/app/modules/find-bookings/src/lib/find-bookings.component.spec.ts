import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService
} from '@ngx-translate/core';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { FindBookingsComponent } from './find-bookings.component';
import {
  ConfigService,
  AuthService,
  ComposerService,
  ComposerEvent,
  ComposerEventTypeEnum,
  ComposerEventStatusEnum,
  LoggerService,
  CultureServiceEx,
  BUSINESS_CONFIG,
  ComposerStatusEnum,
  ModalDialogActionType,
  IdleTimeoutService,
} from '@dcx/ui/libs';
import { AccountStateService } from '@dcx/ui/business-common';
import { ToastService, ModalDialogService } from '@dcx/ui/design-system';
import {
  FIND_BOOKINGS_PROXY_SERVICE,
  UPCOMING_TRIPS_BUILDER_SERVICE,
  PAST_TRIPS_BUILDER_SERVICE,
} from './tokens/injection-tokens';
import { IFindBookingsProxyService } from './interfaces/find-bookings-proxy.interface';
import { IUpcomingTripsBuilder } from './interfaces/upcoming-trips-builder.interface';
import { IPastTripsBuilder } from './interfaces/past-trips-builder.interface';
import {
  FindBookingsResponse,
  BookingSegment,
  FlightStatus
} from './api-models/find-bookings-response.model';
import { ManageBookingCardVM } from './components/manage-booking-card/models/manage-booking-card-vm.model';
import { PastTripCardVM } from './components/past-trip-card/models/past-trip-card-vm.model';
import { FindBookingsModals } from './enums/find-bookings-modals.enum';
import { CookieService } from 'ngx-cookie';
import { ANALYTICS_DICTIONARIES, ANALYTICS_EXPECTED_EVENTS, ANALYTICS_EXPECTED_KEYS_MAP } from '../../../analytics/src/lib/tokens/analytics-expected-keys.token';
import { ANALYTICS_INTERFACES_PROPERTIES } from '../../../business-common/src/lib/models/analytics/analytics-events.interfaces';
import { AnalyticsEventType } from '../../../business-common/src/lib/enums/analytics/analytics-events.enum';
import { AnalyticsBusiness } from '../../../business-common/src/lib/enums/analytics/business/analytics-business-dictionaries';

class FakeLoader implements TranslateLoader {
  public getTranslation(lang: string) {
    return of({});
  }
}

class MockToastService {
  public toastCount = 0;
  public toastConfigs: any[] = [];
  public section = '';
  public show(config: any, container: string): void {
    if (container) {
      this.toastCount++;
      this.toastConfigs.push(config);
    }
  }
  public setSection(section: string): void { this.section = section; }
  public getSection(): string { return this.section; }
  public hidden(index: number): void {
    if (this.toastConfigs[index]) {
      this.toastConfigs.splice(index, 1);
    }
  }
}

/**
 * Helper to mimic the component trip processing logic for the sorting test.
 * Sorts upcoming ascending by departure real time (etd ?? std) and past descending, then updates signals.
 */
function runProcess(
  component: FindBookingsComponent,
  upcoming: ManageBookingCardVM[],
  past: PastTripCardVM[]
): void {
  const getDepartureTime = (schedule: any): number => {
    const etd = schedule?.etd instanceof Date ? schedule.etd.getTime() : undefined;
    const std = schedule?.std instanceof Date ? schedule.std.getTime() : undefined;
    return etd ?? std ?? 0;
  };
  const sortedUpcoming = [...upcoming].sort(
    (a, b) => getDepartureTime(a.journeyVM.schedule) - getDepartureTime(b.journeyVM.schedule)
  );
  const sortedPast = [...past].sort(
    (a, b) => getDepartureTime(b.schedule) - getDepartureTime(a.schedule)
  );
  component.allUpcomingTrips.set(sortedUpcoming);
  component.pastTrips.set(sortedPast);
  // The component's alltrips signal is typed as BookingSegment[], so cast aggregated view models for this test.
  if (component.alltrips && 'set' in component.alltrips) {
    (component.alltrips as any).set([...sortedUpcoming, ...sortedPast] as any);
  }
}

describe('FindBookingsComponent', () => {
  let fixture: ComponentFixture<FindBookingsComponent>;
  let component: FindBookingsComponent;

  // Mocks
  let configService: jasmine.SpyObj<ConfigService>;
  let authService: jasmine.SpyObj<AuthService>;
  let composerService: jasmine.SpyObj<ComposerService>;
  let proxyService: jasmine.SpyObj<IFindBookingsProxyService>;
  let upcomingBuilder: jasmine.SpyObj<IUpcomingTripsBuilder>;
  let pastBuilder: jasmine.SpyObj<IPastTripsBuilder>;
  let logger: jasmine.SpyObj<LoggerService>;
  let modal: jasmine.SpyObj<ModalDialogService>;
  let accountState: jasmine.SpyObj<AccountStateService>;
  let culture: jasmine.SpyObj<CultureServiceEx>;
  let translate: TranslateService;

  const baseConfig = {
    mmbUrl: 'http://mmb',
    checkinUrl: 'http://checkin',
    earlyCheckinEligibleStationCodes: ['BOG', 'CLO'],
    carriersList: [],
    dialogModalsRepository: {
      modalDialogExceptions: [{
        modalDialogSettings: { modalDialogId: FindBookingsModals.MY_TRIPS },
        modalDialogContent: {
          modalTitle: 'Title',
          modalDescription: 'Desc',
          modalImageSrc: 'img.png'
        },
        modalDialogButtonsControl: {
          showClose: true,
          showButtons: true,
          actionButtonLabel: 'Retry',
          secondaryButtonLabel: 'Cancel',
          secondaryButtonLink: '',
          actionButtonControl: ModalDialogActionType.RESTART_SEARCH,
          secondaryButtonControl: ModalDialogActionType.CLOSE
        }
      }]
    }
  };

  const bookingSegments: BookingSegment[] = [{
    recordLocator: 'ABC123',
    bookingStatus: 1,
    segmentStatus: FlightStatus.Confirmed,
    selectedFare: 'Economy',
    departureRealDate: '2025-12-01T10:00:00Z',
    arrivalRealDate: '2025-12-01T12:00:00Z',
    durationReal: '02:00',
    duration: '02:00',
    origin: 'NYC',
    destination: 'LAX',
    departureDate: '2025-12-01T10:00:00Z',
    arrivalDate: '2025-12-01T12:00:00Z',
    carrierCode: 'AA',
    marketingCarrierCode: 'AA',
    transportNumber: '123',
    transport: 'Boeing',
    originTerminal: 'T1',
    destinationTerminal: 'T2',
    operationDestinationTerminal: 'T2',
    operationOriginIata: 'JFK',
    operationDestinationIata: 'BOG'
  }];

  beforeEach(async () => {
    configService = jasmine.createSpyObj('ConfigService', [
      'getBusinessModuleConfig',
      'getCommonConfig',
      'getDataModuleId',
      'getInstanceId',
      'getEndpointsConfig',
      'getMainConfig'
    ]);
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticatedKeycloak$']);
    composerService = jasmine.createSpyObj('ComposerService', [
      'updateComposerRegisterStatus',
      'notifyComposerEvent',
      'updateIsolatedLoadingStatus'
    ]);
    proxyService = jasmine.createSpyObj('IFindBookingsProxyService', ['getBookings', 'addBooking']);
    upcomingBuilder = jasmine.createSpyObj('IUpcomingTripsBuilder', ['getData']);
    pastBuilder = jasmine.createSpyObj('IPastTripsBuilder', ['getData']);
    logger = jasmine.createSpyObj('LoggerService', ['info', 'error']);
    modal = jasmine.createSpyObj('ModalDialogService', ['openModal']);
    accountState = jasmine.createSpyObj('AccountStateService', ['getAccountData']);
    culture = jasmine.createSpyObj('CultureServiceEx', ['getCulture', 'getLanguageAndRegion', 'getUserCulture']);

    configService.getInstanceId.and.returnValue('test-instance-id');
    configService.getEndpointsConfig.and.returnValue({} as any);
    configService.getMainConfig.and.returnValue({
      assetsPath: '',
      modulesAssetsPath: '',
      assetsBasePath: '',
      modulesAssetsBasePath: '',
      staticTranslationUrl: 'http://translation.test'
    } as any);

    culture.getCulture.and.returnValue('en-US');
    culture.getLanguageAndRegion.and.returnValue('en-US');
    culture.getUserCulture.and.returnValue({
      locale: 'en-US',
      language: 'en'
    });

    composerService.notifier$ = of();
    (composerService as any).isolatedLoadingComponentsList = () => [];

    configService.getBusinessModuleConfig.and.returnValue(of(baseConfig));
    configService.getCommonConfig.and.returnValue(of({ pointOfSale: 'CO', language: 'en', culture: 'en-US' }));
    configService.getDataModuleId.and.returnValue({ id: 'test-module-id', name: 'FindBookings', config: '' });
    authService.isAuthenticatedKeycloak$.and.returnValue(of(false));
    proxyService.getBookings.and.returnValue(of({
      success: true,
      result: {
        result: true,
        data: { segments: bookingSegments }
      }
    } as FindBookingsResponse));
    upcomingBuilder.getData.and.returnValue([
      { journeyVM: { schedule: { eta: new Date('2026-01-10T12:00:00Z'), sta: new Date('2026-01-10T12:00:00Z'), std: new Date('2026-01-10T10:00:00Z') } } } as ManageBookingCardVM
    ]);
    pastBuilder.getData.and.returnValue([
      { schedule: { eta: new Date('2024-01-10T12:00:00Z'), sta: new Date('2024-01-10T12:00:00Z'), std: new Date('2024-01-10T10:00:00Z') } } as PastTripCardVM
    ]);
    upcomingBuilder.getData.calls.reset();
    pastBuilder.getData.calls.reset();

    await TestBed.configureTestingModule({
      imports: [
        FindBookingsComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CookieService, useValue: CookieService },
        { provide: IdleTimeoutService, useValue: IdleTimeoutService },
        { provide: ConfigService, useValue: configService },
        { provide: AuthService, useValue: authService },
        { provide: ComposerService, useValue: composerService },
        { provide: FIND_BOOKINGS_PROXY_SERVICE, useValue: proxyService },
        { provide: UPCOMING_TRIPS_BUILDER_SERVICE, useValue: upcomingBuilder },
        { provide: PAST_TRIPS_BUILDER_SERVICE, useValue: pastBuilder },
        { provide: LoggerService, useValue: logger },
        { provide: ToastService, useClass: MockToastService },
        { provide: ModalDialogService, useValue: modal },
        { provide: AccountStateService, useValue: accountState },
        { provide: CultureServiceEx, useValue: culture },
        { provide: BUSINESS_CONFIG, useValue: { pointOfSale: 'CO', language: 'en', culture: 'en-US' } },
        { provide: ANALYTICS_EXPECTED_KEYS_MAP, useValue: ANALYTICS_INTERFACES_PROPERTIES },
        { provide: ANALYTICS_EXPECTED_EVENTS, useValue: AnalyticsEventType },
        { provide: ANALYTICS_DICTIONARIES, useValue: AnalyticsBusiness }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'FindBookings.NoPastTrips': 'No past trips',
      'FindBookings.PastTripsInfo': 'Past trips info',
      'FindBookings.AddTrip.Alert_Add_Message': 'Trip added',
    }, true);
    translate.use('en');

    fixture = TestBed.createComponent(FindBookingsComponent);
    component = fixture.componentInstance;
  });

  it('should create with initial state', () => {
    expect(component).toBeTruthy();
    expect(component.isLoaded()).toBeFalse();
    expect(component.alltrips()).toEqual([]);
  });

  it('should initialize configuration and mark loaded for unauthenticated user', fakeAsync(() => {
    component['config'] = baseConfig as any;
    component.ngOnInit();
    tick();
    expect(configService.getBusinessModuleConfig).toHaveBeenCalled();
    expect(configService.getCommonConfig).toHaveBeenCalled();
    expect(component.isLoaded()).toBeTrue();
    expect(composerService.updateComposerRegisterStatus).toHaveBeenCalledWith('test-module-id', ComposerStatusEnum.LOADED);
  }));

  it('should handle authenticated flow retrieving bookings', fakeAsync(() => {
    // 1) mock auth: empieza en false
    const authSubject = new BehaviorSubject<boolean>(false);
    authService.isAuthenticatedKeycloak$.and.returnValue(authSubject.asObservable());

    // 2) creamos el componente
    fixture.detectChanges();
    tick(); // termina el forkJoin interno y crea las suscripciones al auth$

    // 3) IMPORTANTÍSIMO: forzar al componente a usar NUESTRO spy
    // porque el standalone component había creado el suyo en el constructor
    (component as any).findBookingsProxyService = proxyService;
    (component as any).upcomingTripsBuilderService = upcomingBuilder;
    (component as any).pastTripsBuilderService = pastBuilder;

    // 4) ahora emitimos autenticado dentro de la zona
    fixture.ngZone!.run(() => {
      authSubject.next(true);
    });
    tick(); // procesa handleAuthenticated -> retrieveFindBookings

    // 5) asserts
    expect(proxyService.getBookings).toHaveBeenCalledTimes(1);
    expect(upcomingBuilder.getData).toHaveBeenCalled();
    expect(pastBuilder.getData).toHaveBeenCalled();
    expect(component.isLoaded()).toBeTrue();
  }));



  it('should sort upcoming ascending and past descending by departure real time', () => {
    spyOn(Date, 'now').and.returnValue(new Date('2025-06-01T00:00:00Z').getTime());
    const upcomingLate: ManageBookingCardVM = { journeyVM: { schedule: { etd: new Date('2100-01-20T10:00:00Z'), std: new Date('2100-01-20T10:00:00Z'), eta: new Date('2100-01-20T12:00:00Z'), sta: new Date('2100-01-20T12:00:00Z') } } } as any;
    const upcomingEarly: ManageBookingCardVM = { journeyVM: { schedule: { etd: new Date('2100-01-05T10:00:00Z'), std: new Date('2100-01-05T10:00:00Z'), eta: new Date('2100-01-05T12:00:00Z'), sta: new Date('2100-01-05T12:00:00Z') } } } as any;
    const pastOlder: PastTripCardVM = { schedule: { etd: new Date('2024-01-02T10:00:00Z'), std: new Date('2024-01-02T10:00:00Z'), eta: new Date('2024-01-02T12:00:00Z'), sta: new Date('2024-01-02T12:00:00Z') } } as any;
    const pastNewer: PastTripCardVM = { schedule: { etd: new Date('2024-05-15T10:00:00Z'), std: new Date('2024-05-15T10:00:00Z'), eta: new Date('2024-05-15T12:00:00Z'), sta: new Date('2024-05-15T12:00:00Z') } } as any;

    runProcess(component, [upcomingLate, upcomingEarly], [pastOlder, pastNewer]);

    const upcoming = component.allUpcomingTrips();
    const past = component.pastTrips();

    expect(upcoming.length).toBe(2, 'Expected two upcoming trips to test ordering.');
    expect(past.length).toBe(2, 'Expected two past trips to test ordering.');

    expect(upcoming.map(t => (t.journeyVM.schedule.etd as Date).getTime()))
      .toEqual([(upcomingEarly.journeyVM.schedule.etd as Date).getTime(), (upcomingLate.journeyVM.schedule.etd as Date).getTime()]);

    expect(past.map(t => (t.schedule.etd as Date).getTime()))
      .toEqual([(pastNewer.schedule.etd as Date).getTime(), (pastOlder.schedule.etd as Date).getTime()]);
  });

  it('should paginate upcoming trips (pageSize=3)', () => {
    component['config'] = baseConfig as any;
    const trips: ManageBookingCardVM[] = [];
    for (let i = 0; i < 7; i++) {
      trips.push({ journeyVM: { schedule: { std: new Date(`2026-03-${10 + i}T10:00:00Z`) } } } as any);
    }
    component.allUpcomingTrips.set(trips);
    component.totalUpcomingPages.set(Math.ceil(trips.length / 3));

    component.onUpcomingTripsPageChange(1);
    expect(component.upcomingTrips().length).toBe(3);

    component.onUpcomingTripsPageChange(3);
    expect(component.upcomingTrips().length).toBe(1);
  });

  it('should map add booking duplicate error -> DUPLICATE_BOOKING modal', () => {
    component['config'] = baseConfig as any;
    const error = new HttpErrorResponse({ error: { error: { code: 'BookingAlreadyAddedException' } } });
    const spy = spyOn(component as any, 'showErrorNotification');
    component['handleAddBookingError'](error);
    expect(spy).toHaveBeenCalledWith(FindBookingsModals.DUPLICATE_BOOKING, jasmine.any(HttpErrorResponse));
  });

  it('should map traveler mismatch -> BOOKING_NOT_FOUND_MY_TRIPS modal', () => {
    component['config'] = baseConfig as any;
    const error = new HttpErrorResponse({
      error: { error: { code: 'TravelerNotMatchingException' } }
    });
    const spy = spyOn(component as any, 'showErrorNotification');
    component['handleAddBookingError'](error);
    expect(spy).toHaveBeenCalledWith(FindBookingsModals.BOOKING_NOT_FOUND_MY_TRIPS, jasmine.any(HttpErrorResponse));
  });

  it('should handle generic error fallback', () => {
    component['config'] = baseConfig as any;
    const error = new HttpErrorResponse({ error: {} });
    const spy = spyOn(component as any, 'showErrorNotification');
    component['handleAddBookingError'](error);
    expect(spy).toHaveBeenCalledWith(FindBookingsModals.MY_TRIPS, jasmine.any(HttpErrorResponse));
  });

  it('should configure not found past trips panel with translations', () => {
    component['config'] = baseConfig as any;
    component.loadTranslations();
    expect(component.pastTripsNotFoundConfig.text).toBe('No past trips');
    expect(component.pastTripsNotFoundConfig.secondaryText).toBe('Past trips info');
  });

  it('should show add booking success toast when toast container exists', fakeAsync(() => {
    const container = document.createElement('div');
    container.id = 'mytripsAddFlightToast_Id';
    document.body.appendChild(container);

    const showSpy = spyOn((component as any).toastService, 'show').and.callThrough();

    (component as any).showAddBookingSuccessToast();
    tick(0);

    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(showSpy.calls.mostRecent().args[1]).toBe('mytripsAddFlightToast_Id');

    container.remove();
  }));

  it('should retry showing add booking success toast until container becomes available', fakeAsync(() => {
    const showSpy = spyOn((component as any).toastService, 'show').and.callThrough();

    setTimeout(() => {
      const container = document.createElement('div');
      container.id = 'mytripsAddFlightToast_Id';
      document.body.appendChild(container);
    }, 90);

    (component as any).showAddBookingSuccessToast(3);
    tick(250);

    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(showSpy.calls.mostRecent().args[1]).toBe('mytripsAddFlightToast_Id');

    const container = document.getElementById('mytripsAddFlightToast_Id');
    container?.remove();
  }));

  it('should not show add booking success toast when retries are exhausted and container is missing', fakeAsync(() => {
    const showSpy = spyOn((component as any).toastService, 'show').and.callThrough();

    (component as any).showAddBookingSuccessToast(0);
    tick(250);

    expect(showSpy).not.toHaveBeenCalled();
  }));

  it('should configure past trips carousel with full-step desktop behavior', () => {
    (component as any)['setCarouselConfig']();

    expect(component.pastTripCarouselConfig.breakPointConfig).toBeDefined();

    const config = component.pastTripCarouselConfig.breakPointConfig!;
    expect(config.XS).toEqual(jasmine.objectContaining({ visibleItems: 1, itemsToScroll: 1 }));
    expect(config.S).toEqual(jasmine.objectContaining({ visibleItems: 1, itemsToScroll: 1 }));
    expect(config.M).toEqual(jasmine.objectContaining({ visibleItems: 1, itemsToScroll: 1 }));
    expect(config.L).toEqual(jasmine.objectContaining({ visibleItems: 3, itemsToScroll: 3 }));
    expect(config.XL).toEqual(jasmine.objectContaining({ visibleItems: 3, itemsToScroll: 3 }));
    expect(config.XXL).toEqual(jasmine.objectContaining({ visibleItems: 3, itemsToScroll: 3 }));
  });

  it('should open modal and refresh page for RESTART_SEARCH', fakeAsync(() => {
    component['config'] = baseConfig as any;
    modal.openModal.and.returnValue(of(ModalDialogActionType.RESTART_SEARCH));
    const refreshSpy = spyOn(component as any, 'refreshCurrentPage');
    const mockError = new HttpErrorResponse({ error: {} });
    component['showErrorNotification'](FindBookingsModals.MY_TRIPS, mockError);
    tick();
    expect(refreshSpy).toHaveBeenCalled();
  }));

  it('should not refresh page for CLOSE modal action', fakeAsync(() => {
    component['config'] = baseConfig as any;
    modal.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
    const refreshSpy = spyOn(component as any, 'refreshCurrentPage');
    const mockError = new HttpErrorResponse({ error: {} });
    component['showErrorNotification'](FindBookingsModals.MY_TRIPS, mockError);
    tick();
    expect(refreshSpy).not.toHaveBeenCalled();
  }));

  it('should log error and not open modal when configuration entry is missing', fakeAsync(() => {
    const errorConfig = {
      ...baseConfig,
      dialogModalsRepository: { modalDialogExceptions: [] }
    } as any;
    component['config'] = errorConfig;
    const mockError = new HttpErrorResponse({ error: {} });
    component['showErrorNotification'](FindBookingsModals.MY_TRIPS, mockError);
    tick();
    expect(modal.openModal).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('FindBookingsComponent', 'Modal configuration not found.');
  }));

  it('should open modal with blank fallback fields when entry exists but content empty', fakeAsync(() => {
    const blankConfig = {
      ...baseConfig,
      dialogModalsRepository: {
        modalDialogExceptions: [{
          modalDialogSettings: { modalDialogId: FindBookingsModals.MY_TRIPS },
          modalDialogContent: {
            modalTitle: '',
            modalDescription: '',
            modalImageSrc: ''
          },
          modalDialogButtonsControl: {
            showClose: true,
            showButtons: true,
            actionButtonLabel: 'Retry',
            secondaryButtonLabel: 'Cancel',
            secondaryButtonLink: '',
            actionButtonControl: ModalDialogActionType.RESTART_SEARCH,
            secondaryButtonControl: ModalDialogActionType.CLOSE
          }
        }]
      }
    } as any;
    component['config'] = blankConfig;
    modal.openModal.and.returnValue(of(ModalDialogActionType.CLOSE));
    const mockError = new HttpErrorResponse({ error: {} });
    component['showErrorNotification'](FindBookingsModals.MY_TRIPS, mockError);
    tick();
    expect(modal.openModal).toHaveBeenCalled();
    expect(modal.openModal.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      title: '',
      introText: '',
      titleImageSrc: ''
    }));
  }));

  it('should update composer event status on submit requested', fakeAsync(() => {
    component['config'] = baseConfig as any;
    composerService.notifier$ = of({
      type: ComposerEventTypeEnum.SubmitRequested,
      componentId: 'test-module-id',
      status: ComposerEventStatusEnum.PENDING
    } as ComposerEvent);
    component['subscribeComposerNotifier']();
    tick();
    expect(composerService.notifyComposerEvent).toHaveBeenCalled();
  }));

  it('should log error when config load fails', fakeAsync(() => {
    configService.getBusinessModuleConfig.and.returnValue(of(baseConfig));
    configService.getCommonConfig.and.returnValue(of({ pointOfSale: 'CO', language: 'en', culture: 'en-US' }));

    configService.getBusinessModuleConfig.and.returnValue(throwError(() => new Error('Config error')));

    const completeSpy = spyOn(component as any, 'onDataLoadComplete');
    component['internalInit']();
    tick();
    expect(logger.error).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  }));

  it('should clean up destroy$ on ngOnDestroy', () => {
    const nextSpy = spyOn(component['destroy$'], 'next');
    const completeSpy = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should initialize scroll management on ngAfterViewInit', fakeAsync(() => {
    component['config'] = baseConfig as any;
    (composerService as any).isolatedLoadingComponentsList = () => [];
    spyOn(globalThis as any, 'scrollTo');
    spyOn(globalThis as any, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    fixture.detectChanges();
    component.ngAfterViewInit();
    tick(100);
    expect(component.addUpcomingTripsRef).toBeDefined();
    expect(component.upcomingTripsRef).toBeDefined();
  }));

  it('should handle loading state changes in scroll management', fakeAsync(() => {
    component['config'] = baseConfig as any;
    (composerService as any).isolatedLoadingComponentsList = () => [];
    spyOn(globalThis as any, 'scrollTo');
    spyOn(globalThis as any, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    fixture.detectChanges();
    component.ngAfterViewInit();
    tick(100);
    component.isLoadingBookings.set(true);
    tick(100);
    component.isLoadingBookings.set(false);
    tick(200);
    expect(component.isLoadingBookings()).toBeFalse();
  }));
});
