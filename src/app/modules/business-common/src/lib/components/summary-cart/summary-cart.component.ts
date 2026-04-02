import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Booking as ApiBooking } from '@dcx/ui/api-layer';
import { OffCanvasBodyDirective, OffCanvasComponent, OffCanvasConfig, SkeletonComponent } from '@dcx/ui/design-system';
import {
  Booking,
  CarrierVM,
  EnumStorageKey,
  generateIdWithUUID,
  LoggerService,
  SessionData,
  StorageService,
  ViewportSizeService,
} from '@dcx/ui/libs';
import { NgbDropdown, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, map, of } from 'rxjs';

import { CarrierMapperService, CarriersRepositoryService, JourneyEnricherService } from '../../services';

import { SummaryCartButtonConfig } from './components/summary-cart-button/models/summary-cart-button.config';
import { SummaryCartButtonComponent } from './components/summary-cart-button/summary-cart-button.component';
import { SummaryCartDetailComponent } from './components/summary-cart-detail/summary-cart-detail.component';
import { SummaryCardBuilderInterface } from './interfaces/summary-cart-builder.interface';
import { SummaryCartConfig } from './models/summary-cart.config';
import { BookingMapperService } from './services/booking-mapper.service';
import { SharedSessionService } from './services/shared-session.service';
import { SUMMARY_CART_BUILDER_SERVICE } from './tokens/injection-tokens';

@Component({
  selector: 'summary-cart',
  templateUrl: './summary-cart.component.html',
  styleUrls: ['./styles/summary-cart.styles.scss'],
  host: { class: 'summary-cart' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbModule,
    SummaryCartButtonComponent,
    SummaryCartDetailComponent,
    OffCanvasBodyDirective,
    OffCanvasComponent,
    SkeletonComponent,
    A11yModule,
  ],
  standalone: true,
})
export class SummaryCartComponent implements OnInit {
  @ViewChild('summaryCartDropdown', { static: false })
  private readonly summaryCartDropdown?: NgbDropdown;

  @ViewChild('toggleButton', { static: false, read: ElementRef })
  private readonly toggleButton?: ElementRef<HTMLElement>;

  public culture = input<string>();

  public config: SummaryCartConfig = {} as SummaryCartConfig;
  public detailConfigForDesktop: SummaryCartConfig['details'] | undefined;

  public offCanvasConfig = signal<OffCanvasConfig>({} as OffCanvasConfig);
  public buttonConfig = signal<SummaryCartButtonConfig>({} as SummaryCartButtonConfig);
  public isLoaded = signal<boolean>(false);
  public isResponsive = signal<boolean>(false);
  public isOpenSummary = signal<boolean>(false);
  public readonly dropdownId = generateIdWithUUID('summaryCartDropId_');

  private carriers: CarrierVM[] = [];

  private readonly logger = inject(LoggerService);
  private readonly sharedSessionService = inject(SharedSessionService);
  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly translate = inject(TranslateService);
  private readonly summaryCartBuilderService = inject<SummaryCardBuilderInterface>(SUMMARY_CART_BUILDER_SERVICE);
  private readonly bookingMapperService = inject(BookingMapperService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageService = inject(StorageService);
  protected renderer = inject(Renderer2);
  private readonly journeyEnricherService = inject(JourneyEnricherService);
  private readonly carriersRepo = inject(CarriersRepositoryService);
  private readonly carrierMapper = inject(CarrierMapperService);

  public ngOnInit(): void {
    this.internalInit();
    this.setOffCanvasConfig();
  }

  public onClickToggle(): void {
    this.isOpenSummary.update((v) => !v);
  }

  public onDropdownOpenChange(open: boolean): void {
    this.setSummaryOpen(open);

    if (!open) {
      // Return focus to button when closing
      this.returnFocusToButton();
    }
  }

  public onOffCanvasClosed(): void {
    this.setSummaryOpen(false);
  }

  public canOpenSummary(): boolean {
    const booking = this.config?.details?.summaryTypologyConfig?.booking;
    return !!booking?.journeys?.length;
  }

  public onCloseButtonClicked(): void {
    this.summaryCartDropdown?.close();
    this.setSummaryOpen(false);
    this.returnFocusToButton();
  }

  private setSummaryOpen(open: boolean): void {
    if (open && !this.isResponsive()) {
      this.renderer.addClass(document.body, 'summary-opened');
    } else {
      this.renderer.removeClass(document.body, 'summary-opened');
    }
    this.isOpenSummary.set(open);
  }

  private returnFocusToButton(): void {
    setTimeout(() => {
      const buttonElement = this.toggleButton?.nativeElement?.querySelector('button');
      if (buttonElement) {
        buttonElement.focus();
      }
    });
  }

  private internalInit(): void {
    this.setIsResponsive();
    this.setOffCanvasConfig();
    this.getSessionData();
  }

  private setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--summary-cart-layout-breakpoint');

    const mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);
    this.isResponsive.set(mediaQuery.matches);
    mediaQuery.addEventListener('change', (event) => {
      this.isResponsive.set(event.matches);
      this.changeDetector.detectChanges();
    });
  }

  private setOffCanvasConfig(): void {
    this.offCanvasConfig.set({
      offCanvasHeaderConfig: {
        title: this.translate.instant('Basket.Book_Summary_Title'),
      },
      panelClass: 'summary-cart-offcanvas',
    });
    this.changeDetector.markForCheck();
  }

  private setButtonConfig(session: SessionData): void {
    const toggleButton = this.config.toggleButton;
    toggleButton.ariaAttributes ??= {};
    toggleButton.ariaAttributes.ariaControls = this.dropdownId;
    toggleButton.ariaAttributes.ariaExpanded = this.isOpenSummary();
    const hasJourneys = !!session.session.booking?.journeys?.length;
    toggleButton.ariaAttributes.ariaDisabled = !hasJourneys;

    this.buttonConfig.set({
      toggleButtonConfig: toggleButton,
      amount: session.session.booking.pricing.balanceDue,
      currency: session.session.booking.pricing.currency,
    });
    this.changeDetector.markForCheck();
  }

  private setBookingData(booking: Booking): void {
    this.config.details.summaryTypologyConfig.booking = booking;
  }

  private getSessionData(): void {
    this.sharedSessionService.session$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        concatMap((session) => {
          if (session?.session?.booking?.journeys?.length) {
            return this.carriersRepo.getCarriers(this.culture()).pipe(map((carriers) => ({ session, carriers })));
          }
          return of({ session, carriers: [] as CarrierVM[] });
        })
      )
      .subscribe({
        next: ({ session, carriers }) => {
          if (session?.session?.booking?.journeys?.length) {
            this.carriers = carriers;
            const sharedBooking = this.bookingMapperService.mapIfNeeded(
              session.session.booking as unknown as ApiBooking
            );
            const segmentStatus = this.storageService.getSessionStorage(EnumStorageKey.SegmentsStatusByJourney);
            const passengerStatus = this.storageService.getSessionStorage(EnumStorageKey.PaxSegmentCheckInStatus);
            if (segmentStatus && passengerStatus) {
              const journeys = this.journeyEnricherService.enrichJourneysWithStatus(
                sharedBooking.journeys,
                segmentStatus
              );
              sharedBooking.journeys = journeys;
            }

            if (this.carriers.length > 0) {
              sharedBooking.journeys.forEach((journey) => {
                journey.segments = this.carrierMapper.mapCarrierNamesInSegments(journey.segments, this.carriers);
              });
            }

            this.config = this.summaryCartBuilderService.getData({
              session: { booking: sharedBooking },
            } as SessionData);

            if (this.config?.details) {
              this.detailConfigForDesktop = {
                ...this.config.details,
                showCloseButton: true,
                summaryTypologyConfig: {
                  ...this.config.details.summaryTypologyConfig,
                  booking: { ...sharedBooking },
                },
              } as SummaryCartConfig['details'];
            }

            this.setButtonConfig(session);
            this.setBookingData(session.session.booking);
            this.isLoaded.set(true);
            this.changeDetector.detectChanges();
          }
        },
        error: (error) => {
          this.logger.error('SummaryCartComponent', 'Error getting session', error);
        },
      });
  }
}
