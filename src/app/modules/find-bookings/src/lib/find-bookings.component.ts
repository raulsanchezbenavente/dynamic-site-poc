import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  runInInjectionContext,
  signal,
  viewChild,
} from '@angular/core';
import { AnalyticsService } from '@dcx/module/analytics';
import { MODULE_TRANSLATION_MAP, TranslationLoadStatusDirective } from '@dcx/module/translation';
import {
  AccountStateService,
  AnalyticsDataType,
  AnalyticsEventType,
  AnalyticsPages,
  AnalyticsUserType,
  BaseItemsMapper,
} from '@dcx/ui/business-common';
import {
  CarouselComponent,
  CarouselConfig,
  CarouselItemDirective,
  DataNotFoundComponent,
  DataNotFoundConfig,
  ModalDialogConfig,
  ModalDialogService,
  ModalDialogSize,
  PaginatorComponent,
  Toast,
  ToastContainerComponent,
  ToastService,
  ToastStatus,
} from '@dcx/ui/design-system';
import {
  ApiErrorResponse,
  AuthService,
  ButtonStyles,
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  CultureServiceEx,
  DataModule,
  LayoutSize,
  LoggerService,
  ModalDialogActionType,
} from '@dcx/ui/libs';
import { DynamicPageReadinessBase, DynamicPageReadyState } from '@dynamic-composite';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, finalize, forkJoin, Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';

import {
  AddBookingDto,
  AddBookingRequestDto,
  BookingSegment,
  FindBookingsResponse,
} from './api-models/find-bookings-response.model';
import { AddUpcomingTripsComponent } from './components/add-upcoming-trips/add-upcoming-trips.component';
import { ManageBookingCardVM } from './components/manage-booking-card/models/manage-booking-card-vm.model';
import { PastTripCardVM } from './components/past-trip-card/models/past-trip-card-vm.model';
import { PastTripCardComponent } from './components/past-trip-card/past-trip-card.component';
import { SkeletonPastTripsComponent } from './components/skeleton-past-trips/skeleton-past-trips.component';
import { SkeletonUpcomingTripsComponent } from './components/skeleton-upcoming-trips/skeleton-upcoming-trips.component';
import { UpcomingTripsComponent } from './components/upcoming-trips/upcoming-trips.component';
import { FindBookingsModals } from './enums/find-bookings-modals.enum';
import { IFindBookingsProxyService } from './interfaces/find-bookings-proxy.interface';
import { IPastTripsBuilder } from './interfaces/past-trips-builder.interface';
import { IUpcomingTripsBuilder } from './interfaces/upcoming-trips-builder.interface';
import { FindBookingsConfig } from './models/find-bookings.config';
import {
  FIND_BOOKINGS_PROXY_SERVICE,
  FIND_BOOKINGS_PROXY_SERVICE_PROVIDER,
  PAST_TRIPS_BUILDER_PROVIDER,
  PAST_TRIPS_BUILDER_SERVICE,
  UPCOMING_TRIPS_BUILDER_PROVIDER,
  UPCOMING_TRIPS_BUILDER_SERVICE,
} from './tokens/injection-tokens';

@Component({
  selector: 'FindBookings',
  templateUrl: './find-bookings.component.html',
  styleUrls: ['./styles/find-bookings.styles.scss'],
  providers: [FIND_BOOKINGS_PROXY_SERVICE_PROVIDER, UPCOMING_TRIPS_BUILDER_PROVIDER, PAST_TRIPS_BUILDER_PROVIDER],
  host: { class: 'find-bookings' },
  imports: [
    TranslateModule,
    TranslationLoadStatusDirective,
    AddUpcomingTripsComponent,
    PastTripCardComponent,
    SkeletonPastTripsComponent,
    SkeletonUpcomingTripsComponent,
    UpcomingTripsComponent,
    // common
    CarouselComponent,
    DataNotFoundComponent,
    PaginatorComponent,
    ToastContainerComponent,
    CarouselItemDirective,
  ],
  standalone: true,
})
export class FindBookingsComponent extends DynamicPageReadinessBase implements OnInit, AfterViewInit, OnDestroy {
  public baseConfig = input<{ url: string } | null>(null);
  public isLoaded = signal<boolean>(false);
  public config!: FindBookingsConfig;
  public totalUpcomingTrips = signal<number>(0);
  public totalUpcomingPages = signal<number>(1);
  public currentUpcomingPage = signal<number>(1);
  public alltrips = signal<BookingSegment[]>([]);
  public upcomingTrips = signal<ManageBookingCardVM[]>([]);
  public pastTrips = signal<PastTripCardVM[]>([]);
  public pastTripCarouselConfig!: CarouselConfig;
  public pastTripsNotFoundConfig!: DataNotFoundConfig;
  public isLoadingBookings = signal<boolean>(false);
  public allUpcomingTrips = signal<ManageBookingCardVM[]>([]);
  protected translationsReady = signal<boolean>(false);
  private readonly pageSize = 3;

  public readonly addUpcomingTripsRef = viewChild<AddUpcomingTripsComponent>('addUpcomingTripsRef');
  public readonly upcomingTripsRef = viewChild<UpcomingTripsComponent>('upcomingTripsRef');

  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly accountStateService = inject(AccountStateService);
  private readonly destroy$ = new Subject<void>();

  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private readonly findBookingsProxyService = inject<IFindBookingsProxyService>(FIND_BOOKINGS_PROXY_SERVICE);
  private readonly upcomingTripsBuilderService = inject<IUpcomingTripsBuilder>(UPCOMING_TRIPS_BUILDER_SERVICE);
  private readonly pastTripsBuilderService = inject<IPastTripsBuilder>(PAST_TRIPS_BUILDER_SERVICE);
  private readonly cultureServiceEx = inject(CultureServiceEx);
  protected readonly translate = inject(TranslateService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly baseItemsMapper = inject(BaseItemsMapper);

  private readonly CMSKey = 'FindBookings';
  private readonly addFlightToastContainerId = 'mytripsAddFlightToast_Id';
  protected readonly mappedKeys = MODULE_TRANSLATION_MAP[this.CMSKey];
  private readonly http = inject(HttpClient);
  private hasInitializedInternalInit = false;

  public ngOnInit(): void {
    this.internalInit();
  }

  private readonly translationsLoadedLogEffect = effect(() => {
    const loaded = this.dynamicPageTranslationsLoaded();
    console.log(loaded);
    if (loaded && !this.hasInitializedInternalInit) {
      this.hasInitializedInternalInit = true;
      this.loadTranslations();
    }
  });

  public ngAfterViewInit(): void {
    this.initScrollManagement();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public internalInit(): void {
    forkJoin([this.initConfig(), this.getBusinessConfig()])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const isAuthenticated$ = this.authService.isAuthenticatedKeycloak$().pipe(takeUntil(this.destroy$));
          isAuthenticated$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe(() => this.handleAuthenticated());
          isAuthenticated$
            .pipe(
              filter((v) => !v),
              takeUntil(this.destroy$)
            )
            .subscribe(() => this.handleUnauthenticated());
        },
        error: (err) => {
          this.logger.error('Error loading data', err);
          this.onDataLoadComplete();
        },
      });
  }

  public loadTranslations(): void {
    this.setPastTripsNotFoundConfig();
    this.translationsReady.set(true);
  }

  private handleAuthenticated(): void {
    this.waitForKeycloakAndRetrieveBookings();
  }

  private handleUnauthenticated(): void {
    this.onDataLoadComplete();
  }

  private waitForKeycloakAndRetrieveBookings(): void {
    this.retrieveFindBookings();
  }

  private onDataLoadComplete(): void {
    this.subscribeComposerNotifier();
    this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
    this.isLoaded.set(true);
    this.emitDynamicPageReady(this.baseConfig(), 'findBookingsBlock_uiplus', DynamicPageReadyState.RENDERED);
  }

  private retrieveFindBookings(showAddToast: boolean = false): void {
    if (this.isLoadingBookings()) {
      return;
    }
    this.isLoadingBookings.set(true);

    this.findBookingsProxyService.getBookings().subscribe({
      next: (data: FindBookingsResponse) => {
        this.processAllBookings(data);
        if (showAddToast) {
          this.showAddBookingSuccessToast();
        }
      },
      error: (response) => {
        this.showErrorNotification(FindBookingsModals.MY_TRIPS, response);
        this.isLoadingBookings.set(false);
        this.onDataLoadComplete();
      },
      complete: () => {
        this.isLoadingBookings.set(false);
        this.onDataLoadComplete();
      },
    });
  }

  private processAllBookings(data: FindBookingsResponse): void {
    const currentDate = new Date();
    const currentTime = currentDate.getTime();

    this.alltrips.set(data.result?.data?.segments || []);

    const allUpcomingFromBuilder = this.upcomingTripsBuilderService.getData(data, this.config);
    const allPastFromBuilder = this.pastTripsBuilderService.getData(data, this.config);

    const upcomingTrips = allUpcomingFromBuilder
      .filter((trip) => this.getArrivalRealTime(trip.journeyVM.schedule) > currentTime)
      .sort(
        (a, b) => this.getDepartureRealTime(a.journeyVM.schedule) - this.getDepartureRealTime(b.journeyVM.schedule)
      );

    const pastTrips = allPastFromBuilder
      .filter((trip) => this.getArrivalRealTime(trip.schedule) <= currentTime)
      .sort((a, b) => this.getDepartureRealTime(b.schedule) - this.getDepartureRealTime(a.schedule));

    const upcomingCount = upcomingTrips.length;
    const totalPages = Math.ceil(upcomingCount / this.pageSize) || 1;

    this.allUpcomingTrips.set(upcomingTrips);
    this.pastTrips.set(pastTrips);
    this.totalUpcomingTrips.set(upcomingCount);
    this.totalUpcomingPages.set(totalPages);

    this.updatePaginatedUpcomingTrips();
  }

  private updatePaginatedUpcomingTrips(): void {
    const allTrips = this.allUpcomingTrips();
    const startIndex = (this.currentUpcomingPage() - 1) * this.pageSize;
    this.upcomingTrips.set(allTrips.slice(startIndex, startIndex + this.pageSize));
  }

  private getArrivalRealTime(schedule: { eta?: Date; sta?: Date }): number {
    const real = schedule?.eta instanceof Date ? schedule.eta.getTime() : undefined;
    const planned = schedule?.sta instanceof Date ? schedule.sta.getTime() : undefined;
    return real ?? planned ?? 0;
  }

  private getDepartureRealTime(schedule: { etd?: Date; std?: Date }): number {
    const real = schedule?.etd instanceof Date ? schedule.etd.getTime() : undefined;
    const planned = schedule?.std instanceof Date ? schedule.std.getTime() : undefined;
    return real ?? planned ?? 0;
  }

  protected showErrorNotification(key: FindBookingsModals, error: unknown): void {
    const response = this.getErrorResponse(error);
    if (!this.config?.dialogModalsRepository?.modalDialogExceptions) {
      this.logger.error('FindBookingsComponent', 'Dialog modals repository is not configured.');
      return;
    }
    const modalConfiguration = this.config.dialogModalsRepository.modalDialogExceptions.find((modal) => {
      return modal.modalDialogSettings.modalDialogId === key;
    });
    if (!modalConfiguration) {
      this.logger.error('FindBookingsComponent', 'Modal configuration not found.');
      return;
    }
    this.trackAnalyticsError(response);
    this.modalDialogService
      .openModal(
        {
          title: modalConfiguration?.modalDialogContent.modalTitle || '',
          introText: modalConfiguration?.modalDialogContent.modalDescription || '',
          titleImageSrc: modalConfiguration?.modalDialogContent.modalImageSrc || '',
          layoutConfig: {
            size: ModalDialogSize.SMALL,
          },
          programmaticOpen: true,
          footerButtonsConfig: {
            isVisible: true,
            actionButton: {
              label: modalConfiguration?.modalDialogButtonsControl.actionButtonLabel,
              layout: {
                size: LayoutSize.MEDIUM,
                style: ButtonStyles.ACTION,
              },
              actionPrimary: modalConfiguration?.modalDialogButtonsControl.actionButtonControl,
              actionSecondary: modalConfiguration?.modalDialogButtonsControl.secondaryButtonControl,
            },
          },
        } as ModalDialogConfig,
        undefined,
        undefined,
        true
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ModalDialogActionType) => {
          if (result === ModalDialogActionType.RESTART_SEARCH) {
            this.refreshCurrentPage();
          }
        },
      });
  }

  private showAddBookingSuccessToast(retries: number = 10): void {
    const container = document.getElementById(this.addFlightToastContainerId);
    if (!container) {
      if (retries > 0) {
        setTimeout(() => this.showAddBookingSuccessToast(retries - 1), 50);
      }
      return;
    }

    this.toastService.show(
      {
        status: ToastStatus.SUCCESS,
        message: this.translate.instant('FindBookings.AddTrip.Alert_Add_Message'),
      } as Toast,
      this.addFlightToastContainerId
    );
  }

  protected refreshCurrentPage(): void {
    globalThis.location.reload();
  }

  /**
   * Initializes the configuration of the FindBookingsComponent component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<FindBookingsConfig> {
    if (this.baseConfig()) {
      return this.http.get<FindBookingsConfig>(this.baseConfig()?.url || '').pipe(
        tap((config) => {
          this.config = config;
          this.setCarouselConfig();
          this.logger.info('FindBookingsComponent', 'Business module config', this.config);
        })
      );
    } else {
      return this.configService.getBusinessModuleConfig<FindBookingsConfig>(this.data().config).pipe(
        tap((config) => {
          this.config = config;
          this.setCarouselConfig();
          this.logger.info('FindBookingsComponent', 'Business module config', this.config);
        })
      );
    }
  }

  /**
   * Subscribes to the `notifier$` Observable of the `composer` object.
   * This function filters the events based on the type and componentId,
   * and then updates the status of the event to SUCCESS before notifying the composer.
   * @returns An Observable that completes once the subscription is set up.
   */
  private subscribeComposerNotifier(): Subscription {
    return this.composer.notifier$
      .pipe(
        filter(
          (e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data().id
        )
      )
      .subscribe((event: ComposerEvent) => {
        event.status = ComposerEventStatusEnum.SUCCESS;
        this.composer.notifyComposerEvent(event);
      });
  }

  /**
   * Retrieves the business configuration.
   * This method fetches the common business configuration using the ConfigService and logs the configuration.
   * @returns An Observable that emits the business configuration once it is retrieved.
   */
  private getBusinessConfig(): Observable<unknown> {
    return this.configService.getCommonConfig(CommonConfig.BUSINESS_CONFIG).pipe(
      tap((config) => {
        this.logger.info('FindBookingsComponent', 'Business config', config);
      })
    );
  }

  private setPastTripsNotFoundConfig(): void {
    this.pastTripsNotFoundConfig = {
      text: this.translate.instant('FindBookings.NoPastTrips'),
      secondaryText: this.translate.instant('FindBookings.PastTripsInfo'),
    };
  }

  /**
   * Handle page change for upcoming trips pagination (now local)
   * @param pageNumber The selected page number
   */
  public onUpcomingTripsPageChange(pageNumber: number): void {
    this.currentUpcomingPage.set(pageNumber);
    this.updatePaginatedUpcomingTrips();
  }

  private setCarouselConfig(): void {
    this.pastTripCarouselConfig = {
      breakPointConfig: {
        XS: { visibleItems: 1, itemsToScroll: 1 },
        S: { visibleItems: 1, itemsToScroll: 1 },
        M: { visibleItems: 1, itemsToScroll: 1 },
        L: { visibleItems: 3, itemsToScroll: 3 },
        XL: { visibleItems: 3, itemsToScroll: 3 },
        XXL: { visibleItems: 3, itemsToScroll: 3 },
      },
    };
  }

  public onAddBooking(event: AddBookingDto): void {
    const accountData = this.accountStateService.getAccountData();
    this.composer.updateIsolatedLoadingStatus(this.data().id, true);
    let existPnr = false;
    if (this.alltrips().some((trip) => trip.recordLocator.toLocaleUpperCase() === event.pnr.toLocaleUpperCase())) {
      existPnr = true;
    }

    const addBooking = {
      pnr: event.pnr,
      lastName: event.surname,
      firstName: accountData?.firstName,
      dateOfBirth: accountData?.dateOfBirth,
      loyaltyNumber: accountData?.customerNumber,
      existsPnr: existPnr,
      lastNameSession: accountData?.lastName,
    } as AddBookingRequestDto;

    this.findBookingsProxyService
      .addBooking(addBooking)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingBookings.set(false))
      )
      .subscribe({
        next: () => {
          this.retrieveFindBookings(true);
        },
        error: (err: HttpErrorResponse) => {
          this.handleAddBookingError(err);
          this.onDataLoadComplete();
        },
      });
  }

  private handleAddBookingError(err: HttpErrorResponse): void {
    const apiError = err.error as ApiErrorResponse;
    const errorCode = apiError?.error?.code;

    let keyError: FindBookingsModals;

    switch (errorCode) {
      case '36894':
      case 'TravelerNotMatchingException':
      case 'FlightStatusNotAllowedException':
        keyError = FindBookingsModals.BOOKING_NOT_FOUND_MY_TRIPS;
        break;

      case 'BookingAlreadyAddedException':
        keyError = FindBookingsModals.DUPLICATE_BOOKING;
        break;

      default:
        keyError = FindBookingsModals.MY_TRIPS;
        break;
    }

    this.showErrorNotification(keyError, err);
  }

  private initScrollManagement(): void {
    let panelTop = 0;
    let hasCompletedFirstLoad = false;
    let wasLoading = false;
    let tabPanelElement: HTMLElement | null = null;

    const getIsLoading = (): boolean =>
      this.isLoadingBookings() || this.composer.isolatedLoadingComponentsList().includes(this.data().id);

    const getPanel = (): HTMLElement | null => {
      const component = this.addUpcomingTripsRef();
      if (!component) return null;
      const hostElement = component.elementRef.nativeElement;
      return (hostElement.querySelector('panel') || hostElement) as HTMLElement;
    };

    const getPosition = (element: HTMLElement | null, position: 'top' | 'bottom'): number => {
      if (!element) return window.scrollY + (position === 'bottom' ? window.innerHeight : 0);
      const rect = element.getBoundingClientRect();
      return (position === 'bottom' ? rect.bottom : rect.top) + window.scrollY;
    };

    const getTabPanel = (): HTMLElement | null => {
      if (tabPanelElement) return tabPanelElement;
      const hostElement = this.elementRef.nativeElement;
      tabPanelElement = hostElement.closest('.tab-panel:not([aria-hidden="true"])') as HTMLElement | null;
      return tabPanelElement;
    };

    // Double RAF to ensure DOM/layout updates are fully applied
    // before measuring positions and scrolling, avoiding scroll flicker.
    const rafDouble = (fn: () => void): void => {
      requestAnimationFrame(() => requestAnimationFrame(fn));
    };

    const scrollToPanelBottom = (): void => {
      rafDouble(() => {
        if (getIsLoading()) return;
        const panelBottom = getPosition(getPanel(), 'bottom');
        const targetY = Math.max(0, panelBottom - window.innerHeight);
        if (targetY > 0) window.scrollTo({ top: targetY, behavior: 'smooth' });
        panelTop = 0;
      });
    };

    const scrollToTabPanelTop = (): void => {
      rafDouble(() => {
        if (!getIsLoading()) return;
        const tabPanelTop = getPosition(getTabPanel(), 'top');
        window.scrollTo({ top: Math.max(0, tabPanelTop), behavior: 'auto' });
      });
    };

    const handleLoadingStart = (): void => {
      panelTop = getPosition(getPanel(), 'top');
      if (hasCompletedFirstLoad) {
        scrollToTabPanelTop();
      }
    };

    const handleLoadingEnd = (): void => {
      if (!hasCompletedFirstLoad) {
        hasCompletedFirstLoad = true;
        return;
      }
      if (panelTop > 0) {
        scrollToPanelBottom();
      }
    };

    runInInjectionContext(this.injector, () => {
      effect(() => {
        const isLoading = getIsLoading();
        if (isLoading === wasLoading) return;

        if (isLoading && !wasLoading) {
          handleLoadingStart();
        } else if (!isLoading && wasLoading) {
          handleLoadingEnd();
        }

        wasLoading = isLoading;
      });
    });
  }

  private trackAnalyticsError(response: any): void {
    const accountData = this.accountStateService.getAccountData();
    this.analyticsService.trackEvent({
      eventName: AnalyticsEventType.ERROR_POPUP,
      data: {
        event_category: this.baseItemsMapper.getEventCategory(document.location.pathname),
        page_location: document.location.href,
        page_referrer: document.referrer,
        page_title: document.title,
        language: this.cultureServiceEx.getUserCulture().locale,
        screen_resolution: globalThis.screen.width + 'x' + globalThis.screen.height,
        user_type: accountData?.customerNumber ? AnalyticsUserType.LOGGED_IN : AnalyticsUserType.GUEST,
        user_id: AnalyticsDataType.NA,
        page_name: AnalyticsPages.MEMBERS,
        error_pnr: AnalyticsDataType.NA,
        error_desc: response?.message,
        error_id: response?.error?.error?.code,
      },
    });
  }

  private getErrorResponse(error: unknown): any {
    return typeof (error as any).response === 'string' &&
      ((error as any).response.startsWith('{') || (error as any).response.startsWith('['))
      ? JSON.parse((error as any).response)
      : error;
  }
}
