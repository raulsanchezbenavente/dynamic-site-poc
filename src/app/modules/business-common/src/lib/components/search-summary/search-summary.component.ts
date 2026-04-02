import { ChangeDetectorRef, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  DescriptionList,
  DescriptionListComponent,
  DescriptionListDateData,
  DescriptionListItem,
  DescriptionListLayoutType,
  DescriptionListOptionType,
  DescriptionListTextData,
} from '@dcx/ui/design-system';
import { EnumSeparators, PaxTypeCode, ViewportSizeService } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { SearchSummaryPaxs } from './models/search-summary-pax.model';
import { SearchSummaryVM } from './models/search-summary-vm.model';

@Component({
  selector: 'search-summary',
  templateUrl: './search-summary.component.html',
  styleUrls: ['./styles/search-summary.styles.scss'],
  host: {
    class: 'search-summary',
  },
  imports: [TranslateModule, DescriptionListComponent],
  standalone: true,
})
export class SearchSummaryComponent implements OnInit {
  public readonly data = input.required<SearchSummaryVM>();

  public origin = signal<string>('');
  public destination = signal<string>('');
  public readonly originAndDestination = computed(() => [this.origin(), this.destination()]);

  public showPassengerCountOnly = signal<boolean>(false);
  public passengerTypesConfig = signal<SearchSummaryPaxs[]>([]);
  public readonly infoDataDescriptionList = computed(() => this.informationData());

  private readonly translateService = inject(TranslateService);
  private readonly viewportSizeService = inject(ViewportSizeService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Store translation-dependent data
  private readonly informationData = signal<DescriptionList | null>(null);

  public ngOnInit(): void {
    this.setOriginAndDestination();
    this.setPassengerTypesConfig();
    this.watchPassengerSummaryBreakpoint();
    this.setInformationData();
  }

  /**
   * Toggle passenger summary mode (per-type breakdown ⇄ total count) based on viewport.
   *
   * Uses the SAME CSS custom-property breakpoint as Header Flow’s Summary Cart
   * (`--header-flow-summary-cart-breakpoint`) so both compact modes switch in sync.

   * Notes:
   * - Intentionally decoupled from the global Header Flow layout breakpoint; this controls only content density.
   */
  protected watchPassengerSummaryBreakpoint(): void {
    const breakpoint = this.viewportSizeService.getComponentLayoutBreakpoint('--header-flow-summary-cart-breakpoint');
    const mediaQuery = globalThis.matchMedia(`(max-width: ${breakpoint}px)`);
    if (!mediaQuery) return;

    const apply = (matches: boolean): void => {
      this.showPassengerCountOnly.set(matches);
      this.setInformationData(); // rebuild passenger strings
      this.cdr.markForCheck();
    };

    apply(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => apply(e.matches));
  }

  protected setOriginAndDestination(): void {
    const { origin, destination } = this.data().route;
    this.origin.set(origin);
    this.destination.set(destination);
  }

  protected setPassengerTypesConfig(): void {
    this.passengerTypesConfig.set(this.data().passengers ?? []);
  }

  // Idempotent setter for passenger strings using translate.instant
  protected buildPassengerStrings(): { passengersMobile: string; passengersDesktop: string } {
    const passengers = this.passengerTypesConfig();
    const total = passengers.reduce((sum, pax) => sum + pax.quantity, 0);
    const passengersMobile = `${total} ${
      total > 1 ? this.translateService.instant('Common.Passengers') : this.translateService.instant('Common.Passenger')
    }`;

    const passengerOrder = [
      PaxTypeCode.ADT,
      PaxTypeCode.TNG,
      PaxTypeCode.CHD,
      PaxTypeCode.INF,
      PaxTypeCode.EXST,
      PaxTypeCode.INS,
    ];
    const sortedPassengers = [...passengers].sort(
      (a, b) => passengerOrder.indexOf(a.code) - passengerOrder.indexOf(b.code)
    );

    const passengersDesktop = sortedPassengers
      .map(
        (pax) =>
          `${pax.quantity} ${
            pax.quantity > 1
              ? this.translateService.instant('PassengerTypes.Plural_' + pax.code)
              : this.translateService.instant('PassengerTypes.' + pax.code)
          }`
      )
      .join(`${EnumSeparators.COMMA} `);

    return { passengersMobile, passengersDesktop };
  }

  protected setInformationData(): void {
    const infoDescriptions: DescriptionListItem[] = [];
    const { departureDate, returnDate } = this.data().dates;

    infoDescriptions.push({
      term: this.translateService.instant('Common.Departure_Date') + ':',
      type: DescriptionListOptionType.DATE,
      description: {
        date: { fullFormat: 'EEE DD MMM y' },
        dateValue: this.toDisplayDate(departureDate),
        dateFormatLayoutType: DescriptionListLayoutType.DEFAULT,
      } as DescriptionListDateData,
      iconConfig: { name: 'flight-takeoff' },
    });

    if (returnDate) {
      infoDescriptions.push({
        term: this.translateService.instant('Common.Return_Date') + ':',
        type: DescriptionListOptionType.DATE,
        description: {
          date: { fullFormat: 'EEE DD MMM y' },
          dateValue: this.toDisplayDate(returnDate),
          dateFormatLayoutType: DescriptionListLayoutType.DEFAULT,
        } as DescriptionListDateData,
        iconConfig: { name: 'flight-takeoff-return' },
      });
    }

    const passengersText = this.showPassengerCountOnly()
      ? this.buildPassengerStrings().passengersMobile
      : this.buildPassengerStrings().passengersDesktop;

    infoDescriptions.push({
      term: this.translateService.instant('Common.Passengers') + ':',
      type: DescriptionListOptionType.TEXT,
      description: { text: passengersText } as DescriptionListTextData,
      iconConfig: { name: 'add-passengers' },
    });

    this.informationData.set({
      options: infoDescriptions,
      layout: DescriptionListLayoutType.INLINE,
    });

    this.cdr.markForCheck();
  }

  private toDisplayDate(value: Date): Date {
    const d = dayjs(value);
    return new Date(d.year(), d.month(), d.date(), 12);
  }
}
