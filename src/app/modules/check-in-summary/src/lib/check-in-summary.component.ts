import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MODULE_TRANSLATION_MAP, TranslationLoadStatusDirective } from '@dcx/module/translation';
import { PaxCheckinService, PaxSegmentCheckinStatus, SegmentCheckIn } from '@dcx/ui/api-layer';
import type { CheckInSummaryJourneyVM, DataEventModel } from '@dcx/ui/business-common';
import {
  BOOKING_PROXY_PROVIDER,
  BOOKING_PROXY_SERVICE,
  ButtonsNavigationService,
  ButtonVisibilityService,
  CarriersRepositoryService,
  CheckedInPassengersService,
  CheckInCommonTranslationKeys,
  CheckInSummaryItemConfig,
  CheckInSummaryVM,
  NavigationGuardService,
  PageBackService,
  SEGMENTS_STATUS_PROXY_PROVIDER,
  SEGMENTS_STATUS_PROXY_SERVICE,
  SegmentsStatusByJourney,
  SharedSessionService,
  TRACK_ANALYTICS_ERROR_SERVICE_TOKEN,
} from '@dcx/ui/business-common';
import { DEFAULT_CONFIG_POPOVER, POPOVER_CONFIG } from '@dcx/ui/design-system';
import {
  AlertType,
  Booking,
  CarrierVM,
  CommonTranslationKeys,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  EnumStorageKey,
  LoggerService,
  NotificationService,
  Passenger,
  Pricing,
  SeatAssignedContext,
  SelectedPassengersByJourney,
  Service,
  SessionData,
  StorageService,
} from '@dcx/ui/libs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, concatMap, filter, finalize, forkJoin, Observable, of, Subscription, tap } from 'rxjs';

import { CheckInSummaryItemComponent } from './components/check-in-summary-item/check-in-summary-item.component';
import { TranslationKeys } from './enums/translations-keys.enum';
import { CheckInSummaryConfig } from './models/check-in-summary.config';
import { CHECK_IN_SUMMARY_BUILDER, checkInSummaryBuilderProvider } from './tokens/injection-tokens';

@Component({
  selector: 'check-in-summary',
  templateUrl: './check-in-summary.component.html',
  styleUrls: ['./styles/check-in-summary.styles.scss'],
  providers: [
    BOOKING_PROXY_PROVIDER,
    SEGMENTS_STATUS_PROXY_PROVIDER,
    {
      provide: POPOVER_CONFIG,
      useValue: DEFAULT_CONFIG_POPOVER,
    },
    checkInSummaryBuilderProvider,
  ],
  host: { class: 'check-in-summary' },
  imports: [TranslateModule, TranslationLoadStatusDirective, NgbModule, CheckInSummaryItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInSummaryComponent implements OnInit {
  public isLoaded = signal<boolean>(false);
  public config = signal<CheckInSummaryConfig | null>(null);

  public summaryItemConfig = signal<CheckInSummaryItemConfig>({} as CheckInSummaryItemConfig);
  public summaryVM = signal<CheckInSummaryVM>({
    journeys: [],
  });
  public booking!: Booking;
  public segmentsStatus!: SegmentsStatusByJourney[];
  public segmentsCheckInStatus!: SegmentCheckIn[];
  private hasSelectedPassengers = false;
  private checkedPassengers!: SelectedPassengersByJourney;
  private carriers: CarrierVM[] = [];

  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);
  private readonly storageService = inject(StorageService);
  private readonly checkInService = inject(PaxCheckinService);
  private readonly changeDetection = inject(ChangeDetectorRef);
  private readonly checkInSummaryBuilder = inject(CHECK_IN_SUMMARY_BUILDER);
  private readonly pageBackService = inject(PageBackService);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly sharedSessionService = inject(SharedSessionService);
  private readonly bookingProxyService = inject(BOOKING_PROXY_SERVICE);
  private readonly segmentsStatusProxyService = inject(SEGMENTS_STATUS_PROXY_SERVICE);
  private readonly navigationService = inject(ButtonsNavigationService);
  private readonly buttonVisibilityService = inject(ButtonVisibilityService);
  private readonly checkedInPassengersService = inject(CheckedInPassengersService);
  private readonly trackAnalyticsErrorService = inject(TRACK_ANALYTICS_ERROR_SERVICE_TOKEN);
  private readonly navigationGuard = inject(NavigationGuardService);
  private readonly carriersRepository = inject(CarriersRepositoryService);

  protected readonly translateKeys = { ...CheckInCommonTranslationKeys, ...TranslationKeys } as const;

  private readonly data = signal<DataModule>(this.configService.getDataModuleId(this.elementRef));
  private readonly CMSKey = 'CheckInSummary';
  protected readonly mappedKeys = MODULE_TRANSLATION_MAP[this.CMSKey];

  public ngOnInit(): void {
    this.navigationGuard.setConfirmationPageAllowed(false);

    this.storageService.removeSessionStorage(EnumStorageKey.ConfirmationPassengersWithCheckIn);
    this.storageService.removeLocalStorage(EnumStorageKey.PaxRegulatoryDetails);
    this.pageBackService.clearSavedUrl();
  }

  public translationsLoaded(): void {
    this.subscribeToInitConfigThenLoad();
    this.changeDetection.markForCheck();
  }

  private subscribeToInitConfigThenLoad(): void {
    forkJoin([this.initConfig(), this.refreshBooking()]).subscribe(() => {
      this.loadCheckInData();
      this.setCheckInSummaryItemConfig();
      this.storeOcaEnabledInSession();
    });
  }

  private subscribeToBookingchanges(): void {
    this.sharedSessionService.session$.subscribe((session) => {
      if (session) {
        this.updateButtonVisibility(session);
      }
    });
  }

  /**
   * Evaluate PageActionButtons visibility based on overall check-in and journey availability
   */
  private updateButtonVisibility(session: SessionData): void {
    const sessionData = session as unknown as { session: { booking: Booking } };
    if (sessionData?.session?.booking) {
      const shouldHideButton = this.shouldHideContinueButton();
      this.buttonVisibilityService.setPageActionButtonsVisible(!shouldHideButton);
    }
  }

  /**
   * Handles the event when passengers are checked or unchecked.
   * It updates the checkedPassengers property and determines if there are any selected passengers.
   * Finally, it triggers change detection to update the view.
   * @param checkedPassengers - An object containing the selected passengers by journey.
   */
  public onCheckedPassengers(checkedPassengers: SelectedPassengersByJourney): void {
    const mergedPassengers = { ...this.checkedPassengers, ...checkedPassengers };

    this.checkedPassengers = Object.entries(mergedPassengers)
      .filter(([, passengers]) => passengers.length > 0)
      .reduce((acc, [journeyId, passengers]) => {
        acc[journeyId] = passengers;
        return acc;
      }, {} as SelectedPassengersByJourney);

    this.hasSelectedPassengers = Object.keys(this.checkedPassengers).length > 0;
    this.changeDetection.detectChanges();
  }

  private getCheckInStatusByJourney(booking: Booking): Record<string, string[]> {
    return this.checkedInPassengersService.getCheckInStatusByJourney(booking);
  }

  private loadCheckInData(): void {
    forkJoin([
      this.bookingProxyService.getBooking(),
      this.carriersRepository.ensureCarriersAreLoaded(this.config()?.culture),
    ])
      .pipe(
        tap(([bookingResponse]) => {
          this.booking = bookingResponse;
          if (Object.keys(this.getCheckInStatusByJourney(this.booking)).length > 0) {
            this.storageService.setSessionStorage(
              EnumStorageKey.SelectedPassengersByJourney,
              this.getCheckInStatusByJourney(this.booking)
            );
          }
        }),
        concatMap(() => this.segmentsStatusProxyService.getSegmentsStatus(this.booking)),
        tap((segmentsStatus) => {
          this.segmentsStatus = segmentsStatus;
          this.storageService.setSessionStorage(EnumStorageKey.SegmentsStatusByJourney, this.segmentsStatus);
        }),
        concatMap(() => {
          return this.checkInService.getCheckinStatus().pipe(
            tap((checkInResponse) => {
              this.segmentsCheckInStatus = checkInResponse.result.data;
              this.storageService.setSessionStorage(EnumStorageKey.PaxSegmentCheckInStatus, this.segmentsCheckInStatus);
            })
          );
        }),
        concatMap(() => this.carriersRepository.getCarriers(this.config()?.culture)),
        tap((carriers) => {
          this.carriers = carriers;
          this.setCheckInSummaryData();
        }),
        catchError((error) => {
          this.notificationService.showErrorModal(error);
          this.logger.error('CheckInSummaryComponent', 'Error loading check-in data', error);
          this.trackAnalyticsError(error.message);
          return of(null);
        }),
        finalize(() => {
          this.onDataLoadComplete();
        })
      )
      .subscribe();
  }

  private onDataLoadComplete(): void {
    this.subscribeComposerNotifier();
    this.composer.updateComposerRegisterStatus(this.data().id, ComposerStatusEnum.LOADED);
    this.isLoaded.set(true);
    this.subscribeToBookingchanges();
    this.changeDetection.detectChanges();
  }

  private setCheckInSummaryItemConfig(): void {
    this.summaryItemConfig.set({
      showRemainingTime: true,
    });
  }

  private setCheckInSummaryData(): void {
    const journeys = this.checkInSummaryBuilder.buildCheckInSummaryModel({
      booking: this.booking,
      paxSegmentCheckInStatus: this.segmentsCheckInStatus,
      segmentsStatusByJourney: this.segmentsStatus,
      carriers: this.carriers,
    });
    this.summaryVM.set({ journeys });
    const seatAssignedContext = this.buildSeatAssignedContext();
    this.storageService.setSessionStorage(EnumStorageKey.SeatAssignedContext, seatAssignedContext);
  }

  /**
   * Determines if the continue button should be hidden.
   * The button is hidden in these 3 cases:
   * 1. All passengers are checked in
   * 2. All journeys are unavailable for check-in
   * 3. Each journey is either unavailable OR has all passengers checked in
   * Note: If segmentsInfo is undefined/null, the passenger is considered as "not completed"
   */
  private shouldHideContinueButton(): boolean {
    if (this.checkedInPassengersService.areAllPassengersChecked(this.booking)) {
      return true;
    }

    if (this.summaryVM().journeys.length === 0) {
      return true;
    }

    return this.summaryVM().journeys.every((journey) => {
      if (!journey.isCheckInAvailable) {
        return true;
      }

      return journey.passengers.every(
        (pax) =>
          pax.status === PaxSegmentCheckinStatus.CHECKED_IN ||
          pax.status === PaxSegmentCheckinStatus.OVERBOOKED ||
          pax.status === PaxSegmentCheckinStatus.STAND_BY
      );
    });
  }

  private buildSeatAssignedContext(): SeatAssignedContext {
    const seatContext: SeatAssignedContext = {};

    this.initializeSegmentContexts(seatContext);
    this.populatePassengerSeatInfo(seatContext);

    return seatContext;
  }

  private initializeSegmentContexts(seatContext: SeatAssignedContext): void {
    for (const journey of this.booking.journeys) {
      for (const segment of journey.segments) {
        if (!seatContext[segment.id]) {
          seatContext[segment.id] = {};
        }
      }
    }
  }

  private populatePassengerSeatInfo(seatContext: SeatAssignedContext): void {
    for (const passenger of this.booking.pax) {
      if (passenger.segmentsInfo) {
        this.processPassengerSegments(passenger, seatContext, this.booking.pricing, this.booking.services);
      }
    }
  }

  private refreshBooking(): Observable<void> {
    return this.bookingProxyService.reloadBooking();
  }

  private processPassengerSegments(
    passenger: Passenger,
    seatContext: SeatAssignedContext,
    pricing: Pricing,
    services: Service[]
  ): void {
    let seatInServiceBooking = false;
    if (!passenger.segmentsInfo) return;
    for (const segmentInfo of passenger.segmentsInfo) {
      if (seatContext[segmentInfo.segmentId]) {
        if (segmentInfo.seat) {
          seatInServiceBooking = this.validateSeatInPriceServices(pricing, services, passenger, segmentInfo.segmentId);
        }
        const hasAssignedSeat = !!(segmentInfo.seat && segmentInfo.seat.trim() !== '');
        seatContext[segmentInfo.segmentId][passenger.id] = {
          seat: segmentInfo.seat || '',
          isConfirmed: hasAssignedSeat,
          isAutoAssigned: false,
          isSeatPendingPayment: seatInServiceBooking,
        };
      }
    }
  }

  private validateSeatInPriceServices(
    pricing: Pricing,
    services: Service[],
    passenger: Passenger,
    segmentId: string
  ): boolean {
    return pricing.breakdown.perPaxSegment.some((charge) => {
      return services.some((seat) => {
        return charge.paxId === passenger.id && segmentId === charge.segmentId && charge.referenceId === seat.id;
      });
    });
  }

  private storeCheckedPassengersInSession(): void {
    this.storageService.setSessionStorage(EnumStorageKey.SelectedPassengersByJourney, this.checkedPassengers || {});
    this.storageService.setSessionStorage(
      EnumStorageKey.ConfirmationPassengersWithCheckIn,
      this.checkedPassengers || {}
    );
  }

  /**
   * Initializes the configuration of the CheckInSummary component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<CheckInSummaryConfig> {
    this.logger.info('CheckInSummaryComponent', 'Data module', this.data());
    return this.configService.getBusinessModuleConfig<CheckInSummaryConfig>(this.data().config).pipe(
      tap((config) => {
        this.config.set(config);
        this.logger.info('CheckInSummaryComponent', 'Business module config', this.config());
      })
    );
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
        if (this.hasSelectedPassengers) {
          this.storeCheckedPassengersInSession();
          this.navigationService.clearNavigationHistory();
          event.status = ComposerEventStatusEnum.SUCCESS;
        } else {
          event.status = ComposerEventStatusEnum.ERROR;
          this.storageService.setSessionStorage(EnumStorageKey.SelectedPassengersByJourney, {});
          this.notificationService.showNotification({
            title: this.translateService.instant(TranslationKeys.CheckIn_Modal_Error_Title),
            message: this.translateService.instant(TranslationKeys.CheckIn_Modal_AtLeastOnePassengerRequired_Message),
            alertType: AlertType.ERROR,
            buttonPrimaryText: this.translateService.instant(CommonTranslationKeys.Common_OK),
          });
          this.trackAnalyticsError(
            this.translateService.instant(TranslationKeys.CheckIn_Modal_AtLeastOnePassengerRequired_Message)
          );
        }
        this.composer.notifyComposerEvent(event);
      });
  }

  /**
   * Returns the translated progress fragment (checkedPart) used inside the journey aria-label.
   *
   * Selection priority:
   * 1. total === 0                -> CheckIn.JourneyRegion.Checked_None
   * 2. checked === total (>0)     -> CheckIn.JourneyRegion.Checked_All
   * 3. total === 1 (not all)      -> CheckIn.JourneyRegion.Checked_One
   * 4. Else                       -> CheckIn.JourneyRegion.Checked_Some
   *
   * "Checked" passengers are those with status CheckedIn or Boarded.
   * Output is already localized via ngx-translate (Umbraco dictionaries).
   */
  private buildCheckedPart(journey: CheckInSummaryJourneyVM): string {
    const total = journey.passengers.length;
    const checked = journey.passengers.filter(
      (p) => p.status === PaxSegmentCheckinStatus.CHECKED_IN || p.status === PaxSegmentCheckinStatus.BOARDED
    ).length;

    if (total === 0) {
      return this.translateService.instant(TranslationKeys.CheckIn_JourneyRegion_Checked_None);
    }
    if (checked === total) {
      return this.translateService.instant(TranslationKeys.CheckIn_JourneyRegion_Checked_All);
    }
    if (total === 1) {
      return this.translateService.instant(TranslationKeys.CheckIn_JourneyRegion_Checked_One, { checked });
    }
    return this.translateService.instant(TranslationKeys.CheckIn_JourneyRegion_Checked_Some, { checked, total });
  }

  /**
   * Returns a readable city name. from IATA code or city field.
   */
  private resolveCityName(location?: { iata?: string; city?: string }): string {
    if (!location) return '';
    const iata = location.iata || location.city || '';
    if (!iata) return '';

    const key = `City.${iata}`;
    const translated = this.translateService.instant(key);
    if (translated && translated !== key) return translated;
    if (location.city && location.city !== iata) return location.city;
    return iata;
  }

  private storeOcaEnabledInSession(): void {
    this.storageService.setSessionStorage(EnumStorageKey.IsOcaEnabled, this.config()?.isOcaEnabled ?? false);
  }

  /**
   * Builds the full aria-label string for a journey region:
   * Pattern: "Check-in {{origin}} to {{dest}} – {{checkedPart}}"
   *
   * Origin/Destination: City name (falls back to IATA code).
   * checkedPart: fragment from buildCheckedPart().
   */
  public buildJourneyAriaLabel(journey: CheckInSummaryJourneyVM): string {
    const origin = this.resolveCityName(journey.origin);
    const dest = this.resolveCityName(journey.destination);

    if (!journey.isCheckInAvailable) {
      const notAvailable = this.translateService.instant(TranslationKeys.CheckIn_CheckInNotAvailable);
      return this.translateService.instant(TranslationKeys.CheckIn_JourneyRegion_AriaLabel, {
        origin,
        dest,
        checkedPart: notAvailable,
      });
    }

    const checkedPart = this.buildCheckedPart(journey);
    return this.translateService.instant(TranslationKeys.CheckIn_JourneyRegion_AriaLabel, {
      origin,
      dest,
      checkedPart,
    });
  }

  private trackAnalyticsError(message: any): void {
    const dataEvent = {
      message: message,
    } as DataEventModel;

    this.trackAnalyticsErrorService.trackAnalyticsError(dataEvent);
  }
}
