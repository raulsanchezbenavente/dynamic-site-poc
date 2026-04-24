import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit, Signal } from '@angular/core';
import { OffCanvasComponent, OffCanvasConfig, PriceCurrencyComponent } from '@dcx/ui/design-system';
import { CommonTranslationKeys, createResponsiveSignal, Fare, GenerateIdPipe, ViewportSizeService } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SelectionScheduleComponent } from '../schedules/components/selection-schedule/selection-schedule.component';
import { ScheduleService } from '../schedules/services/schedules.service';

import { FaresOptionsComponent } from './components/fares-options/fares-options.component';
import { FareOptions } from './components/fares-options/models/fare-options.model';
import { TranslationKeys } from './enums/translation-keys.enum';
import { JourneySelection } from './models/journey-selection.model';

@Component({
  selector: 'journey-selection',
  templateUrl: './journey-selection.component.html',
  styleUrls: ['./styles/journey-selection.styles.scss'],
  host: {
    class: 'journey-selection',
  },
  imports: [
    TranslateModule,
    FaresOptionsComponent,
    SelectionScheduleComponent,
    PriceCurrencyComponent,
    OffCanvasComponent,
  ],
  standalone: true,
})
export class JourneySelectionComponent implements OnInit, OnDestroy {
  protected readonly commonTranslationKeys = CommonTranslationKeys;

  @Input({ required: true }) public data!: JourneySelection;

  public translate = inject(TranslateService);
  public generateId = inject(GenerateIdPipe);

  public isOpen = false;
  public fareListId = this.generateId.transform('journeyFaresId');

  public offCanvasConfig!: OffCanvasConfig;
  public fareOptions!: FareOptions;

  public isResponsive!: Signal<boolean>;
  private destroyMediaQueryListener: () => void = () => {};

  private readonly scheduleService = inject(ScheduleService);
  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.internalInit();

    // Initial translations
    this.setOffCanvasConfig();
    this.setFareOptions();
  }

  public ngOnDestroy(): void {
    this.destroyMediaQueryListener();
  }

  public toggleFares(): void {
    this.isOpen = !this.isOpen;
  }

  protected internalInit(): void {
    this.setIsResponsive();
    this.setOffCanvasConfig();
    this.setFareOptions();
  }

  // Idempotent setter for offCanvasConfig that uses translate.instant
  protected setOffCanvasConfig(): void {
    this.offCanvasConfig = {
      offCanvasHeaderConfig: {
        title: this.translate.instant(TranslationKeys.Schedule_Compare_Fares),
      },
      panelClass: 'fares-selection-offcanvas',
    };
    this.cdr?.markForCheck?.();
  }

  // Idempotent setter for fareOptions that uses translate.instant
  protected setFareOptions(): void {
    const fares = this.data.journey.fares ?? [];
    const mapped = this.mapFaresToFareOptions(fares);
    this.fareOptions = {
      ...mapped,
      title: this.translate.instant(TranslationKeys.Schedule_Fares_Title_Vertical),
    };
    this.cdr.markForCheck?.();
  }

  private setIsResponsive(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--journey-selection-layout-breakpoint');
    const mediaQuery = `(max-width: ${breakpoint}px)`;

    [this.isResponsive, this.destroyMediaQueryListener] = createResponsiveSignal(mediaQuery);
  }

  // Helper to map fares to FareOptions without performing translations.
  protected mapFaresToFareOptions(fares: Fare[]): FareOptions {
    return {
      title: '',
      options: fares,
    };
  }

  // Returns the lowest total price among all fare options by summing the charges of each fare.
  // Falls back to 0 if no fares are available.
  get lowestFarePrice(): number {
    const amounts = this.fareOptions?.options.map((f) => f.charges.reduce((acc, c) => acc + (c.amount ?? 0), 0)) ?? [];
    return amounts.length ? Math.min(...amounts) : 0;
  }

  /**
   * Builds a descriptive and accessible label (aria-label) for screen readers,
   * summarizing the key journey details:
   * - Origin and destination airport codes
   * - Departure and arrival times (including multi-day arrival info)
   * - Number of stops
   * - Total duration of the journey
   * - Lowest available fare
   *
   * Also appends a call to action to inform users they can select the fare.
   * This helps improve accessibility for assistive technologies.
   */
  get ariaLabel(): string {
    const journey = this.data.journey;

    const origin = journey.origin?.iata ?? '';
    const destination = journey.destination?.iata ?? '';
    const departureTime = journey.schedule?.std ? formatDate(journey.schedule.std, 'HH:mm', 'en') : '';
    const arrivalTime = journey.schedule?.sta ? formatDate(journey.schedule.sta, 'HH:mm', 'en') : '';

    let totalDaysOfJourney = 0;
    if (journey) {
      totalDaysOfJourney = this.scheduleService.getTotalDays(journey);
    }

    const daySuffix = totalDaysOfJourney > 1 ? 's' : '';
    const arrivalDayNote = totalDaysOfJourney > 0 ? `(${totalDaysOfJourney} día${daySuffix})` : '';

    const duration = journey.duration ?? '';
    const stops = (journey.segments?.length ?? 1) - 1;
    const price = this.lowestFarePrice ?? 0;

    return `Origen ${origin} a destino ${destination}. Sale a las ${departureTime} y llega a las ${arrivalTime}${arrivalDayNote}. ${stops} parada${stops === 1 ? '' : 's'}. Duración total ${duration}. Precio desde $${price}. Clique para seleccionar tu tarifa.`;
  }
}
