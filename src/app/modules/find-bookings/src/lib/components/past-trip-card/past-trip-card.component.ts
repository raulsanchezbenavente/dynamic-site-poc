import { Component, inject, input, OnInit } from '@angular/core';
import { TransportOperatedBy, TransportOperatedByComponent } from '@dcx/ui/business-common';
import { DateDisplayComponent, DateDisplayConfig } from '@dcx/ui/design-system';
import { CultureServiceEx , CommonTranslationKeys } from '@dcx/ui/libs';
import { TranslateModule } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { PastTripCardVM } from './models/past-trip-card-vm.model';

@Component({
  selector: 'past-trip-card',
  templateUrl: './past-trip-card.component.html',
  styleUrls: ['./styles/past-trip-card.styles.scss'],
  host: {
    class: 'past-trip-card',
  },
  imports: [TranslateModule, DateDisplayComponent, TransportOperatedByComponent],
  standalone: true,
})
export class PastTripCardComponent implements OnInit {
  protected readonly commonTranslationKeys = CommonTranslationKeys;

  public readonly data = input.required<PastTripCardVM>();
  private readonly cultureServiceEx = inject(CultureServiceEx);

  public journeyDateConfig!: DateDisplayConfig;
  public operatingCarriers: TransportOperatedBy[] = [];

  public ngOnInit(): void {
    this.internalInit();
  }

  private internalInit(): void {
    this.setJourneyDateConfig();
    this.setOperatingCarriers();
  }

  private setJourneyDateConfig(): void {
    const longFormat = this.cultureServiceEx.getUserCulture?.().longDateFormat ?? 'MMM d, YYYY';
    this.journeyDateConfig = {
      date: dayjs(this.data().schedule.std),
      format: 'dddd, ' + longFormat,
    };
  }

  private setOperatingCarriers(): void {
    this.operatingCarriers = Array.from(
      new Set(this.data().segments.map((segment) => segment.transport.carrier.name))
    ).map((name) => ({ name }));
  }
}
